import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { randomInt } from "crypto"; // HIGH-03 FIX: CSPRNG, not Math.random()
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";
import { sendOtpEmail } from "@/lib/admin/email";
import { getClientIp } from "@/lib/admin/context";
import { checkRateLimit } from "@/lib/admin/rate-limit";

const Body = z.object({ email: z.string().email().max(254) });

/** HIGH-03 FIX: Use Node.js crypto.randomInt — cryptographically secure PRNG */
function generateCode(): string {
  return String(randomInt(100000, 1000000)).padStart(6, "0");
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  const { email } = parsed.data;
  const ip = getClientIp(req.headers) ?? "unknown";

  // MED-07 FIX: IP-level rate limit on the send endpoint too
  const ipRl = await checkRateLimit({ identifier: ip, kind: "customer", maxAttempts: 10, windowMinutes: 10 });
  if (!ipRl.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const supa = createAdminSupabase();
  if (!supa)
    return NextResponse.json(
      { ok: false, error: "backend_unconfigured", message: "Email OTP requires Supabase" },
      { status: 503 }
    );

  // Per-email rate limit: max 3 sends per 10 minutes
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supa
    .from("otp_codes")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase())
    .gte("created_at", since);
  if ((count ?? 0) >= 3)
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many codes requested. Try again in 10 minutes." },
      { status: 429 }
    );

  const code = generateCode();
  const codeHash = await hashPassword(code);
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supa.from("otp_codes").insert({
    email: email.toLowerCase(),
    code_hash: codeHash,
    expires_at: expires,
    ip: ip ?? null
  });

  const emailResult = await sendOtpEmail({ to: email, code });

  // MED-01 FIX: Never return devCode in the response body.
  // Developers should check server logs when RESEND_API_KEY is not set.
  // The plaintext code is logged to stdout only in development (see lib/admin/email.ts).
  return NextResponse.json({
    ok: true,
    expiresIn: 300
    // devCode intentionally removed — check server logs instead
  });
}
