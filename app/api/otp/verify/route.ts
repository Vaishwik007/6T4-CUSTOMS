import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/admin/password";
import { recordAttempt } from "@/lib/admin/rate-limit";
import { getClientIp } from "@/lib/admin/context";

const Body = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  const { email, code } = parsed.data;
  const ip = getClientIp(req.headers);

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data: rows } = await supa
    .from("otp_codes")
    .select("*")
    .eq("email", email.toLowerCase())
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  const row = rows?.[0];
  if (!row) {
    await recordAttempt({ identifier: email, kind: "customer", success: false, ip: ip ?? undefined });
    return NextResponse.json({ ok: false, error: "no_active_code" }, { status: 400 });
  }
  if (row.attempts >= 5) {
    return NextResponse.json({ ok: false, error: "too_many_attempts" }, { status: 429 });
  }

  const ok = await verifyPassword(code, row.code_hash);
  await supa.from("otp_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
  if (!ok) {
    await recordAttempt({ identifier: email, kind: "customer", success: false, ip: ip ?? undefined });
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
  }

  await supa.from("otp_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);
  await recordAttempt({ identifier: email, kind: "customer", success: true, ip: ip ?? undefined });

  // Ensure a customer row exists for this email.
  await supa
    .from("customers")
    .upsert({ email: email.toLowerCase() }, { onConflict: "email" });

  return NextResponse.json({ ok: true, email });
}
