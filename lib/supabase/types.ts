export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  loyalty_points: number;
  created_at: string;
};

export type DbBuild = {
  id: string;
  user_id: string;
  name: string | null;
  brand: string;
  model: string;
  year: number;
  parts: string[];
  total_price: number;
  est_hp: number | null;
  created_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string | null;
  status: "pending" | "confirmed" | "in-progress" | "ready" | "delivered" | "cancelled";
  total: number;
  delivery_mode: "in-shop" | "delivery";
  payment_method: "upi" | "card" | "pay-at-shop";
  booking_token: string;
  address: Record<string, string>;
  notes: string | null;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  part_id: string;
  qty: number;
  unit_price: number;
  for_build: { brand: string; model: string; year: number } | null;
};

export type DbBooking = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  scheduled_at: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
};

/** Accepts either the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY or the newer
 *  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Returns whichever is set. */
export function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();
  return !!url && !!key && url !== "https://YOUR_PROJECT.supabase.co";
}
