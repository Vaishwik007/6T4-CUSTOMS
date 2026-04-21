import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";
import { sendOtpEmail } from "@/lib/admin/email";
import { getClientIp } from "@/lib/admin/context";

const Body = z.object({ email: z.string().email() });

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  const { email } = parsed.data;
  const ip = getClientIp(req.headers);

  const supa = createAdminSupabase();
  if (!supa)
    return NextResponse.json(
      { ok: false, error: "backend_unconfigured", message: "Email OTP requires Supabase" },
      { status: 503 }
    );

  // Rate limit: max 3 sends per email per 10 minutes
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

  return NextResponse.json({
    ok: true,
    expiresIn: 300,
    devCode: process.env.NODE_ENV !== "production" && emailResult.fallback ? code : undefined
  });
}
