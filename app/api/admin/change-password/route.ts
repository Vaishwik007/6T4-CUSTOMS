import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { hashPassword, verifyPassword, passwordStrength } from "@/lib/admin/password";
import { signAdminJwt, ADMIN_COOKIE, sessionExpiry } from "@/lib/admin/session";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

const Body = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).max(200),
  newUsername: z.string().min(3).max(64).optional()
});

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  const { currentPassword, newPassword, newUsername } = parsed.data;

  const strength = passwordStrength(newPassword);
  if (!strength.ok)
    return NextResponse.json({ ok: false, error: "weak_password", reason: strength.reason }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa)
    return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data: row } = await supa.from("admin_users").select("*").eq("id", admin.sub).maybeSingle();
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const ok = await verifyPassword(currentPassword, row.password_hash);
  if (!ok)
    return NextResponse.json({ ok: false, error: "invalid_current_password" }, { status: 401 });

  const update: Record<string, unknown> = {
    password_hash: await hashPassword(newPassword),
    force_password_change: false
  };
  if (newUsername && newUsername !== row.username) {
    const { count } = await supa
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("username", newUsername);
    if ((count ?? 0) > 0)
      return NextResponse.json({ ok: false, error: "username_taken" }, { status: 409 });
    update.username = newUsername;
  }

  const { error } = await supa.from("admin_users").update(update).eq("id", row.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await logActivity({
    adminId: admin.sub,
    adminUsername: (update.username as string) ?? row.username,
    action: "password_changed",
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent")
  });

  // Re-mint JWT so `fpc` is false going forward
  const newUsernameFinal = (update.username as string) ?? row.username;
  const jwt = await signAdminJwt({
    sub: row.id,
    sid: admin.sid,
    username: newUsernameFinal,
    role: row.role,
    fpc: false
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: sessionExpiry()
  });
  return res;
}
