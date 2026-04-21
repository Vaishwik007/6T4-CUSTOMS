import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

const Body = z.object({
  status: z.enum(["pending", "confirmed", "in-progress", "ready", "delivered", "cancelled"])
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { error } = await supa
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "order_status_changed",
    targetType: "order",
    targetId: params.id,
    metadata: { status: parsed.data.status },
    ip: getClientIp(req.headers)
  });

  return NextResponse.json({ ok: true });
}
