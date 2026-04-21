import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminJwt, type AdminJwtPayload } from "./session";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type CurrentAdmin = AdminJwtPayload & { sessionValid: boolean };

/** Resolve the logged-in admin from the cookie + DB session row.
 * Returns null if no cookie, invalid JWT, expired session, or DB unavailable. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const jar = cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyAdminJwt(token);
  if (!payload) return null;

  const supa = createAdminSupabase();
  if (!supa) return { ...payload, sessionValid: true }; // offline fallback

  const { data: session } = await supa
    .from("admin_sessions")
    .select("*")
    .eq("id", payload.sid)
    .is("revoked_at", null)
    .maybeSingle();
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  return { ...payload, sessionValid: true };
}

export function getClientIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    null
  );
}
