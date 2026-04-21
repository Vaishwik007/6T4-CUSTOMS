import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/admin/password";

/**
 * First-run bootstrap — creates the default super-admin with credentials
 * 6T4CUSTOMS / 6T4CUSTOMS (force_password_change=true) if no admins exist.
 * Idempotent: no-op when an admin already exists.
 */
export async function POST() {
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

  const hash = await hashPassword("6T4CUSTOMS");
  const { error } = await supa.from("admin_users").insert({
    username: "6T4CUSTOMS",
    password_hash: hash,
    role: "super_admin",
    force_password_change: true
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, created: true });
}
