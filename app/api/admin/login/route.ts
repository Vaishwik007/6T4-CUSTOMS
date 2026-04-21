import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/admin/password";
import { signAdminJwt, sessionExpiry, ADMIN_COOKIE } from "@/lib/admin/session";
import { generateSessionToken } from "@/lib/admin/tokens";
import { checkRateLimit, recordAttempt } from "@/lib/admin/rate-limit";
import { logActivity } from "@/lib/admin/activity-log";
import { getClientIp } from "@/lib/admin/context";

const Body = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(1).max(200)
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ua = req.headers.get("user-agent") ?? undefined;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const { username, password } = parsed.data;

  // Rate limit (per username + IP)
  const rl = await checkRateLimit({ identifier: username, kind: "admin" });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many failed attempts. Try again later." },
      { status: 429 }
    );
  }

  const supa = createAdminSupabase();
  if (!supa) {
    return NextResponse.json(
      { ok: false, error: "backend_unconfigured", message: "Supabase is not configured. Set env keys and run migration + bootstrap." },
      { status: 503 }
    );
  }

  const { data: admin } = await supa
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!admin || admin.disabled) {
    await recordAttempt({ identifier: username, kind: "admin", success: false, ip: ip ?? undefined, ua });
    await logActivity({ adminUsername: username, action: "login_failed", metadata: { reason: "unknown_user" }, ip, userAgent: ua });
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    await recordAttempt({ identifier: username, kind: "admin", success: false, ip: ip ?? undefined, ua });
    await logActivity({ adminId: admin.id, adminUsername: username, action: "login_failed", ip, userAgent: ua });

    // After 3 failed attempts, drop a notification
    if ((await checkRateLimit({ identifier: username, kind: "admin" })).remaining <= 2) {
      await supa.from("notifications").insert({
        type: "failed_login",
        severity: "warning",
        title: `Multiple failed login attempts`,
        body: `Username ${username} from IP ${ip ?? "unknown"}`,
        metadata: { username, ip }
      });
    }

    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  // Create session
  const { hash: tokenHash } = generateSessionToken();
  const expires = sessionExpiry();
  const { data: session, error: sessErr } = await supa
    .from("admin_sessions")
    .insert({
      admin_id: admin.id,
      token_hash: tokenHash,
      ip: ip ?? null,
      user_agent: ua ?? null,
      expires_at: expires.toISOString()
    })
    .select()
    .single();
  if (sessErr || !session) {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 500 });
  }

  // Mark last_login
  await supa
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString(), last_login_ip: ip ?? null })
    .eq("id", admin.id);

  await recordAttempt({ identifier: username, kind: "admin", success: true, ip: ip ?? undefined, ua });
  await logActivity({ adminId: admin.id, adminUsername: username, action: "login", ip, userAgent: ua });

  const jwt = await signAdminJwt({
    sub: admin.id,
    sid: session.id,
    username: admin.username,
    role: admin.role,
    fpc: admin.force_password_change
  });

  const res = NextResponse.json({
    ok: true,
    forcePasswordChange: admin.force_password_change,
    role: admin.role,
    username: admin.username
  });
  res.cookies.set(ADMIN_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires
  });
  return res;
}
