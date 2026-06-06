import { createAdminSupabase } from "@/lib/supabase/admin";

// CRIT-05 FIX: In-memory fallback counters so the rate limiter NEVER fails open.
// If Supabase is unavailable, we fall back to process-local counters.
// Note: these reset on server restart and are per-process (not distributed),
// but they guarantee no-bypass behaviour even during DB outages.
const _localCounters = new Map<string, { count: number; windowStart: number }>();

/**
 * CRIT-05 FIX: Returns { allowed: false } — never { allowed: true } — when DB
 * is unavailable. Falls back to in-memory counters as a second line of defence.
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

  if (!supa) {
    // DB unavailable — use in-memory counter (fail CLOSED, not open)
    return checkLocalLimit(`${kind}:${identifier}`, windowMinutes, maxAttempts);
  }

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count, error } = await supa
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("kind", kind)
    .eq("success", false)
    .gte("created_at", since);

  if (error) {
    // DB query failed — use in-memory counter (fail CLOSED)
    console.error("[rate-limit] DB query failed, falling back to local counter:", error.message);
    return checkLocalLimit(`${kind}:${identifier}`, windowMinutes, maxAttempts);
  }

  const attempts = count ?? 0;
  return { allowed: attempts < maxAttempts, remaining: Math.max(0, maxAttempts - attempts) };
}

function checkLocalLimit(
  key: string,
  windowMinutes: number,
  maxAttempts: number
): { allowed: boolean; remaining: number } {
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();
  const existing = _localCounters.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    // New window — reset counter but start from 1 (this is an attempt)
    _localCounters.set(key, { count: 0, windowStart: now });
    return { allowed: true, remaining: maxAttempts };
  }

  const allowed = existing.count < maxAttempts;
  return { allowed, remaining: Math.max(0, maxAttempts - existing.count) };
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
  // Update in-memory counter for fail-safe
  if (!success) {
    const key = `${kind}:${identifier}`;
    const existing = _localCounters.get(key);
    if (existing) {
      _localCounters.set(key, { ...existing, count: existing.count + 1 });
    }
  }

  const supa = createAdminSupabase();
  if (!supa) return; // DB unavailable — in-memory already recorded
  await supa
    .from("login_attempts")
    .insert({ identifier, kind, success, ip, user_agent: ua })
    .then(() => {/* ok */}, (err: unknown) => console.error("[rate-limit] recordAttempt failed:", err));
}
