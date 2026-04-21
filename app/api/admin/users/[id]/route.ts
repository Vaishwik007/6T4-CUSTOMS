import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";
import { logActivity } from "@/lib/admin/activity-log";

const Patch = z.object({
  role: z.enum(["super_admin", "admin", "staff"]).optional(),
  disabled: z.boolean().optional(),
  resetPassword: z.string().min(10).optional()
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "super_admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const update: Record<string, unknown> = {};
  if (parsed.data.role) update.role = parsed.data.role;
  if (parsed.data.disabled != null) update.disabled = parsed.data.disabled;
  if (parsed.data.resetPassword) {
    update.password_hash = await hashPassword(parsed.data.resetPassword);
    update.force_password_change = true;
  }

  const { error } = await supa.from("admin_users").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: parsed.data.resetPassword ? "admin_reset_password" : "admin_role_changed",
    targetType: "admin_user",
    targetId: params.id,
    metadata: { update: { ...parsed.data, resetPassword: parsed.data.resetPassword ? "***" : undefined } },
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "super_admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (params.id === me.sub)
    return NextResponse.json({ ok: false, error: "cannot_delete_self" }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { error } = await supa.from("admin_users").delete().eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "admin_deleted",
    targetType: "admin_user",
    targetId: params.id,
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true });
}
