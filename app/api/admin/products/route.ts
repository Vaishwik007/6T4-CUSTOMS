import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

const CATEGORIES = [
  "Exhaust",
  "ECU Tuning",
  "Air Filter",
  "Performance Kit",
  "Cosmetic",
  "Service Kit"
] as const;

const Body = z.object({
  id: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/i).optional(),
  sku: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  brand: z.string().min(1).max(100),
  category: z.enum(CATEGORIES),
  description: z.string().max(2000).optional(),
  price: z.number().int().nonnegative(),
  costPrice: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  images: z.array(z.string()).default([]),
  compatibility: z.union([
    z.literal("universal"),
    z.array(
      z.object({
        brand: z.string(),
        model: z.string(),
        yearStart: z.number().int(),
        yearEnd: z.number().int().nullable()
      })
    )
  ])
});

/** GET /api/admin/products — paginated list for admin. */
export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const cat = url.searchParams.get("category");
  const lowStockOnly = url.searchParams.get("lowStock") === "1";

  let query = supa.from("products").select("*").order("updated_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  if (cat) query = query.eq("category", cat);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  let rows = data ?? [];
  if (lowStockOnly) rows = rows.filter((r) => r.stock <= r.low_stock_threshold);

  return NextResponse.json({ ok: true, products: rows });
}

/** POST /api/admin/products — create new product. */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role === "staff")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input", details: parsed.error.format() }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const id =
    parsed.data.id ?? parsed.data.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);

  const { data, error } = await supa
    .from("products")
    .insert({
      id,
      sku: parsed.data.sku,
      name: parsed.data.name,
      brand: parsed.data.brand,
      category: parsed.data.category,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      cost_price: parsed.data.costPrice,
      stock: parsed.data.stock,
      low_stock_threshold: parsed.data.lowStockThreshold,
      images: parsed.data.images,
      compatibility: parsed.data.compatibility
    })
    .select()
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  // Initial stock history
  if (parsed.data.stock > 0) {
    await supa.from("inventory_history").insert({
      product_id: id,
      change: parsed.data.stock,
      new_stock: parsed.data.stock,
      reason: "initial",
      admin_id: me.sub
    });
  }

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "product_created",
    targetType: "product",
    targetId: id,
    metadata: { sku: parsed.data.sku, name: parsed.data.name },
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true, product: data });
}
