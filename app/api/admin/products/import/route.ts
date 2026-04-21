import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

const Row = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  costPrice: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative().default(5),
  description: z.string().optional().default(""),
  compatibility: z.string().optional().default("universal")
});

/** POST /api/admin/products/import — bulk CSV upload. Body: { csv: string }. */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role === "staff")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { csv } = (await req.json().catch(() => ({}))) as { csv?: string };
  if (!csv) return NextResponse.json({ ok: false, error: "missing_csv" }, { status: 400 });

  const parsed = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true
  });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const results = { inserted: 0, skipped: 0, errors: [] as { row: number; msg: string }[] };

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i];
    const row = Row.safeParse(raw);
    if (!row.success) {
      results.errors.push({ row: i + 2, msg: row.error.issues[0]?.message ?? "invalid" });
      results.skipped++;
      continue;
    }
    const id = row.data.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
    let compat: unknown = row.data.compatibility;
    if (compat !== "universal") {
      try {
        compat = JSON.parse(row.data.compatibility);
      } catch {
        compat = "universal";
      }
    }
    const { error } = await supa.from("products").upsert({
      id,
      sku: row.data.sku,
      name: row.data.name,
      brand: row.data.brand,
      category: row.data.category,
      description: row.data.description,
      price: row.data.price,
      cost_price: row.data.costPrice,
      stock: row.data.stock,
      low_stock_threshold: row.data.lowStockThreshold,
      compatibility: compat
    });
    if (error) {
      results.errors.push({ row: i + 2, msg: error.message });
      results.skipped++;
    } else {
      results.inserted++;
    }
  }

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "bulk_import",
    metadata: results,
    ip: getClientIp(req.headers)
  });

  return NextResponse.json({ ok: true, ...results });
}
