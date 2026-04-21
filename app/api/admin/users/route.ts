import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";
import { logActivity } from "@/lib/admin/activity-log";

/** GET /api/admin/users — list all admin users (super_admin only). */
export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "super_admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data, error } = await supa
    .from("admin_users")
    .select("id, username, email, role, force_password_change, last_login_at, created_at, disabled")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, users: data });
}

const CreateBody = z.object({
  username: z.string().min(3).max(64),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "admin", "staff"]),
  initialPassword: z.string().min(10)
});

/** POST /api/admin/users — create new admin (super_admin only). */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "super_admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const parsed = CreateBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const hash = await hashPassword(parsed.data.initialPassword);
  const { data, error } = await supa
    .from("admin_users")
    .insert({
      username: parsed.data.username,
      email: parsed.data.email ?? null,
      role: parsed.data.role,
      password_hash: hash,
      force_password_change: true,
      created_by: me.sub
    })
    .select()
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "admin_created",
    targetType: "admin_user",
    targetId: data.id,
    metadata: { username: data.username, role: data.role },
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true, user: { id: data.id, username: data.username } });
}
