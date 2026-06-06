import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";
import { randomBytes } from "crypto";

/**
 * CRIT-02 FIX: Bootstrap is now protected by BOOTSTRAP_SECRET env var.
 * In production (NODE_ENV=production) the endpoint is disabled entirely
 * unless ALLOW_BOOTSTRAP=true is also set — this prevents accidental
 * exposure in deployed environments.
 *
 * Usage (dev/staging only):
 *   curl -X POST /api/admin/bootstrap \
 *        -H "X-Bootstrap-Secret: <BOOTSTRAP_SECRET>"
 *
 * The initial password is randomly generated and printed to server logs ONCE.
 * The admin must change it on first login (force_password_change = true).
 */
export async function POST(req: NextRequest) {
  // Block in production unless explicitly allowed
  const isProduction = process.env.NODE_ENV === "production";
  const allowInProd = process.env.ALLOW_BOOTSTRAP === "true";
  if (isProduction && !allowInProd) {
    return NextResponse.json(
      { ok: false, error: "bootstrap_disabled", message: "Bootstrap is disabled in production." },
      { status: 403 }
    );
  }

  // Require the bootstrap secret header
  const expectedSecret = process.env.BOOTSTRAP_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "bootstrap_not_configured", message: "BOOTSTRAP_SECRET env var must be set." },
      { status: 503 }
    );
  }
  const providedSecret = req.headers.get("x-bootstrap-secret");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const supa = createAdminSupabase();
  if (!supa) {
    return NextResponse.json({ ok: false, error: "supabase_unconfigured" }, { status: 503 });
  }

  const { count } = await supa
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    return NextResponse.json({ ok: true, alreadyBootstrapped: true });
  }

  // Generate a random initial password — NEVER use a known default
  const initialPassword = randomBytes(12).toString("base64url");
  const hash = await hashPassword(initialPassword);

  const { error } = await supa.from("admin_users").insert({
    username: "admin",
    password_hash: hash,
    role: "super_admin",
    force_password_change: true
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Log the one-time password to server stdout (never to the response body)
  console.log("=".repeat(60));
  console.log("[6T4 BOOTSTRAP] Admin account created.");
  console.log("[6T4 BOOTSTRAP] Username: admin");
  console.log(`[6T4 BOOTSTRAP] Password: ${initialPassword}`);
  console.log("[6T4 BOOTSTRAP] CHANGE THIS PASSWORD ON FIRST LOGIN.");
  console.log("=".repeat(60));

  return NextResponse.json({ ok: true, created: true, message: "Check server logs for credentials." });
}
