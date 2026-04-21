import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const [orders, items, products] = await Promise.all([
    supa.from("orders").select("*").order("created_at", { ascending: false }),
    supa.from("order_items").select("*"),
    supa.from("products").select("id,name,category,cost_price")
  ]);

  return NextResponse.json({
    ok: true,
    orders: orders.data ?? [],
    items: items.data ?? [],
    products: products.data ?? []
  });
}
