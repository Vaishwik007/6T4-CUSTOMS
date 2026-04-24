import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stock?ids=abc,def,ghi
 * Returns live stock + price for a comma-separated list of part IDs.
 * Used by the cart, checkout, and product detail pages to block
 * out-of-stock purchases and display live availability.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") ?? "";
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  ).slice(0, 200);

  if (ids.length === 0) {
    return NextResponse.json({ stock: {} });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    // When Supabase isn't configured (local dev without env), return "unknown"
    // so UI can fall back to the static catalog.
    return NextResponse.json({ stock: {}, configured: false });
  }

  const { data, error } = await admin
    .from("products")
    .select("id, stock, price, active, low_stock_threshold")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }

  const stock: Record<
    string,
    { stock: number; price: number; active: boolean; low: boolean }
  > = {};
  for (const row of data ?? []) {
    stock[row.id] = {
      stock: row.stock ?? 0,
      price: row.price ?? 0,
      active: row.active ?? false,
      low: (row.stock ?? 0) > 0 && (row.stock ?? 0) <= (row.low_stock_threshold ?? 5)
    };
  }

  return NextResponse.json(
    { stock, configured: true },
    {
      headers: {
        // Short cache; this is live data.
        "Cache-Control": "no-store"
      }
    }
  );
}
