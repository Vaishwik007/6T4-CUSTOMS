import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRazorpay, getRazorpayPublicKey, isRazorpayConfigured } from "@/lib/razorpay/client";

export const runtime = "nodejs";

const itemSchema = z.object({
  partId: z.string().min(1),
  qty: z.number().int().min(1).max(20),
  unitPrice: z.number().int().nonnegative(),
  forBuild: z
    .object({ brand: z.string(), model: z.string(), year: z.number().int() })
    .nullable()
    .optional()
});

const payloadSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  total: z.number().int().positive(),
  fullName: z.string().min(2),
  phone: z.string().regex(/^[+\d\s-]{7,}$/),
  email: z.string().email(),
  address1: z.string().min(4),
  city: z.string().min(2),
  state: z.string().min(2),
  pin: z.string().regex(/^\d{4,6}$/),
  delivery: z.enum(["in-shop", "delivery"]),
  notes: z.string().max(1000).optional()
});

const BOOKING_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function bookingToken() {
  let s = "";
  for (let i = 0; i < 6; i++) s += BOOKING_CHARS[Math.floor(Math.random() * BOOKING_CHARS.length)];
  return `6T4-${s}`;
}

type StockRow = { id: string; stock: number; price: number; active: boolean };

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "razorpay_not_configured" },
      { status: 503 }
    );
  }

  let body: z.infer<typeof payloadSchema>;
  try {
    body = payloadSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "invalid_payload", details: String(err) }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // 1. Validate stock + price for every item against live product catalog.
  const ids = Array.from(new Set(body.items.map((i) => i.partId)));
  const { data: products, error: stockErr } = await admin
    .from("products")
    .select("id, stock, price, active")
    .in("id", ids);

  if (stockErr) {
    return NextResponse.json({ error: "stock_lookup_failed" }, { status: 500 });
  }

  const byId = new Map<string, StockRow>(
    (products ?? []).map((p) => [p.id, p as StockRow])
  );
  const insufficient: string[] = [];
  for (const item of body.items) {
    const p = byId.get(item.partId);
    if (!p || !p.active) insufficient.push(item.partId);
    else if (p.stock < item.qty) insufficient.push(item.partId);
  }
  if (insufficient.length > 0) {
    return NextResponse.json(
      { error: "insufficient_stock", parts: insufficient },
      { status: 409 }
    );
  }

  // 2. Recompute total server-side to prevent client tampering.
  const deliveryFee = body.delivery === "delivery" ? 499 : 0;
  const subtotal = body.items.reduce((s, it) => {
    const p = byId.get(it.partId);
    const unit = p?.price ?? it.unitPrice;
    return s + unit * it.qty;
  }, 0);
  const total = subtotal + deliveryFee;

  // 3. Create the local order row in 'awaiting_payment' state.
  const orderId = randomUUID();
  const token = bookingToken();

  const supabase = await createServerSupabase();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };
  const userId = userData?.user?.id ?? null;

  const { error: orderErr } = await admin.from("orders").insert({
    id: orderId,
    user_id: userId,
    status: "awaiting_payment",
    payment_status: "created",
    total,
    delivery_mode: body.delivery,
    payment_method: "razorpay",
    booking_token: token,
    address: {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      address1: body.address1,
      city: body.city,
      state: body.state,
      pin: body.pin
    },
    notes: body.notes ?? null
  });
  if (orderErr) {
    return NextResponse.json({ error: "order_insert_failed" }, { status: 500 });
  }

  // Items inserted now; trigger skips decrement while status='awaiting_payment'.
  const { error: itemsErr } = await admin.from("order_items").insert(
    body.items.map((it) => ({
      order_id: orderId,
      part_id: it.partId,
      qty: it.qty,
      unit_price: byId.get(it.partId)?.price ?? it.unitPrice,
      for_build: it.forBuild ?? null
    }))
  );
  if (itemsErr) {
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json({ error: "items_insert_failed" }, { status: 500 });
  }

  // 4. Create Razorpay order.
  const rzp = getRazorpay();
  if (!rzp) {
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json({ error: "razorpay_not_configured" }, { status: 503 });
  }

  let razorpayOrder;
  try {
    razorpayOrder = await rzp.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: orderId,
      notes: {
        order_id: orderId,
        booking_token: token,
        customer_email: body.email,
        customer_phone: body.phone
      }
    });
  } catch (err) {
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json(
      { error: "razorpay_create_failed", details: String(err) },
      { status: 502 }
    );
  }

  // 5. Persist payment row + link to order.
  await admin.from("payments").insert({
    order_id: orderId,
    gateway: "razorpay",
    gateway_order_id: razorpayOrder.id,
    amount: total,
    currency: "INR",
    status: "created"
  });
  await admin
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", orderId);

  return NextResponse.json({
    orderId,
    token,
    amount: total,
    currency: "INR",
    razorpayOrderId: razorpayOrder.id,
    keyId: getRazorpayPublicKey(),
    prefill: {
      name: body.fullName,
      email: body.email,
      contact: body.phone
    }
  });
}
