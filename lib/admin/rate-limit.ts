import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * Simple DB-backed rate limiter using the `login_attempts` table.
 * Returns true if within allowed threshold; false if rate-limited.
 */
export async function checkRateLimit({
  identifier,
  kind,
  windowMinutes = 10,
  maxAttempts = 5
}: {
  identifier: string;
  kind: "admin" | "customer";
  windowMinutes?: number;
  maxAttempts?: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  const supa = createAdminSupabase();
  if (!supa) return { allowed: true, remaining: maxAttempts };
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count } = await supa
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("kind", kind)
    .eq("success", false)
    .gte("created_at", since);
  const attempts = count ?? 0;
  return { allowed: attempts < maxAttempts, remaining: Math.max(0, maxAttempts - attempts) };
}

export async function recordAttempt({
  identifier,
  kind,
  success,
  ip,
  ua
}: {
  identifier: string;
  kind: "admin" | "customer";
  success: boolean;
  ip?: string;
  ua?: string;
}) {
  const supa = createAdminSupabase();
  if (!supa) return;
  await supa.from("login_attempts").insert({ identifier, kind, success, ip, user_agent: ua });
}
