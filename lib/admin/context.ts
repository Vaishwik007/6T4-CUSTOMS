import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminJwt, type AdminJwtPayload } from "./session";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type CurrentAdmin = AdminJwtPayload & { sessionValid: boolean };

/**
 * Resolve the logged-in admin from the cookie + DB session row.
 *
 * HIGH-06 FIX: No longer fails open when Supabase is unavailable.
 * If the DB cannot be reached we return null — a revoked session must not
 * be trusted even during an outage.
 *
 * Returns null if:
 *   - No cookie present
 *   - JWT invalid or expired
 *   - DB unavailable (fail closed)
 *   - Session revoked (revoked_at set)
 *   - Session expired in DB
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const jar = await cookies(); // Next.js 15+: cookies() is async
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAdminJwt(token);
  if (!payload) return null;

  const supa = createAdminSupabase();
  // HIGH-06 FIX: Fail closed — no DB means no valid session
  if (!supa) {
    console.warn("[admin/context] Supabase unavailable — denying admin access (fail closed).");
    return null;
  }

  const { data: session, error } = await supa
    .from("admin_sessions")
    .select("*")
    .eq("id", payload.sid)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  return { ...payload, sessionValid: true };
}

export function getClientIp(headers: Headers): string | null {
  // LOW-04 NOTE: x-forwarded-for is user-controllable unless your reverse proxy
  // strips and re-sets it. For Vercel deployments, x-real-ip is the authoritative
  // source. The IP here is used only for logging, not for security decisions.
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    null
  );
}
