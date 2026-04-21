import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, getSupabasePublicKey } from "./types";

type CookieItem = { name: string; value: string; options?: CookieOptions };

/** Server component / route handler Supabase client. Returns null if env vars missing. */
export async function createServerSupabase() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* readonly context (e.g. RSC) — ignore */
          }
        }
      }
    }
  );
}
