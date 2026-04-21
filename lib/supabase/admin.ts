import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only use in server actions / API routes
 * where caller is verified (e.g. admin dashboard mutations).
 */
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url === "https://YOUR_PROJECT.supabase.co") return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
