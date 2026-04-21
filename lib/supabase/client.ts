"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, getSupabasePublicKey } from "./types";

/**
 * Browser-side Supabase client. Returns null when env vars are missing
 * so UI components can fall back to localStorage / anonymous behaviour.
 */
export function createSupabaseBrowser() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!
  );
}
