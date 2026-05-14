import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products/queries";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * Lightweight product catalog feed for client-side modules (cross-sell strip,
 * search overlay, etc.). Server-side queries should call getAllProducts()
 * directly — this endpoint exists for client lazy-load.
 */
export async function GET() {
  const products = await getAllProducts();
  // Trim payload: drop fields the client doesn't need
  const trimmed = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    shortDescription: p.shortDescription,
    price: p.price,
    stock: p.stock,
    inStock: p.inStock,
    lowStock: p.lowStock,
    hpGain: p.hpGain,
    soundDb: p.soundDb,
    installMinutes: p.installMinutes,
    images: p.images.slice(0, 1),
    fitsUniversal: p.fitsUniversal,
    featured: p.featured,
    tags: p.tags
  }));
  return NextResponse.json(
    { products: trimmed },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=600" } }
  );
}
