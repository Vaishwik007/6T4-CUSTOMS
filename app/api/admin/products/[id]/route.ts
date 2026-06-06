import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

const PatchBody = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
  costPrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  stockDelta: z.number().int().optional(),
  stockReason: z.enum(["restock", "adjust", "return", "damage", "sale", "initial"]).optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  // HIGH-07 FIX: replace z.any() with strict schema
  compatibility: z.union([
    z.literal("universal"),
    z.array(z.object({
      brand: z.string().max(100),
      model: z.string().max(100),
      yearStart: z.number().int().min(1900).max(2100),
      yearEnd: z.number().int().min(1900).max(2100).nullable()
    }))
  ]).optional(),
  active: z.boolean().optional()
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data: product, error } = await supa.from("products").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!product) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const { data: history } = await supa
    .from("inventory_history")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ ok: true, product, history: history ?? [] });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role === "staff")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const parsed = PatchBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data: existing } = await supa.from("products").select("*").eq("id", id).maybeSingle();
  if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const update: Record<string, unknown> = {};
  const p = parsed.data;
  if (p.name !== undefined) update.name = p.name;
  if (p.brand !== undefined) update.brand = p.brand;
  if (p.category !== undefined) update.category = p.category;
  if (p.description !== undefined) update.description = p.description;
  if (p.price !== undefined) update.price = p.price;
  if (p.costPrice !== undefined) update.cost_price = p.costPrice;
  if (p.lowStockThreshold !== undefined) update.low_stock_threshold = p.lowStockThreshold;
  if (p.images !== undefined) update.images = p.images;
  if (p.compatibility !== undefined) update.compatibility = p.compatibility;
  if (p.active !== undefined) update.active = p.active;

  // Stock handling — either absolute or delta
  let newStock: number | null = null;
  let change: number | null = null;
  if (p.stock !== undefined) {
    newStock = p.stock;
    change = p.stock - existing.stock;
  } else if (p.stockDelta !== undefined) {
    newStock = Math.max(0, existing.stock + p.stockDelta);
    change = newStock - existing.stock;
  }
  if (newStock != null) update.stock = newStock;

  const { error } = await supa.from("products").update(update).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  if (change != null && change !== 0) {
    await supa.from("inventory_history").insert({
      product_id: id,
      change,
      new_stock: newStock,
      reason: p.stockReason ?? (change > 0 ? "restock" : "adjust"),
      admin_id: me.sub
    });
    await logActivity({
      adminId: me.sub,
      adminUsername: me.username,
      action: "stock_adjusted",
      targetType: "product",
      targetId: id,
      metadata: { change, newStock, reason: p.stockReason },
      ip: getClientIp(req.headers)
    });

    // Low-stock notification
    const threshold = (update.low_stock_threshold as number) ?? existing.low_stock_threshold;
    if (newStock !== null && newStock <= threshold && newStock > 0) {
      await supa.from("notifications").insert({
        type: "low_stock",
        severity: "warning",
        title: `Low stock: ${existing.name}`,
        body: `Only ${newStock} left (threshold ${threshold}). Restock needed.`,
        metadata: { productId: id, stock: newStock }
      });
    } else if (newStock === 0) {
      await supa.from("notifications").insert({
        type: "out_of_stock",
        severity: "critical",
        title: `Out of stock: ${existing.name}`,
        body: `Product ${existing.sku} is fully depleted.`,
        metadata: { productId: id }
      });
    }
  }

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "product_updated",
    targetType: "product",
    targetId: id,
    metadata: { update },
    ip: getClientIp(req.headers)
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role === "staff")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { error } = await supa.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  await logActivity({
    adminId: me.sub,
    adminUsername: me.username,
    action: "product_deleted",
    targetType: "product",
    targetId: id,
    ip: getClientIp(req.headers)
  });

  return NextResponse.json({ ok: true });
}
