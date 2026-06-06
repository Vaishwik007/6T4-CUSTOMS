import { NextResponse, type NextRequest } from "next/server";
import { randomUUID, randomInt } from "crypto";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import { getClientIp } from "@/lib/admin/context";
import { sendOrderNotification } from "@/lib/admin/email";
import { PARTS_MAP } from "@/lib/data/parts-map";

// CRIT-03 FIX: Only accept item ids and qty from the client.
// Prices are always looked up server-side from the canonical parts list.
const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        partId: z.string().max(120),
        qty: z.number().int().min(1).max(100),
        forBuild: z
          .object({ brand: z.string().max(50), model: z.string().max(100), year: z.number().int() })
          .nullable()
          .optional()
      })
    )
    .min(1)
    .max(50),
  fullName: z.string().min(2).max(200),
  phone: z.string().regex(/^\+?[\d\s-]{7,20}$/, "Invalid phone"),
  email: z.string().email().max(254),
  // Address fields — required only when delivery = "delivery"
  address1: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pin: z.string().regex(/^\d{6}$/).optional(),
  delivery: z.enum(["in-shop", "delivery"]),
  payment: z.enum(["upi", "card", "pay-at-shop"]),
  notes: z.string().max(1000).optional()
}).superRefine((data, ctx) => {
  if (data.delivery === "delivery") {
    if (!data.address1?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street address required for delivery", path: ["address1"] });
    if (!data.city?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City required", path: ["city"] });
    if (!data.state?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State required", path: ["state"] });
    if (!data.pin) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "6-digit PIN required", path: ["pin"] });
  }
});

type CheckoutBody = z.infer<typeof CheckoutSchema>;

// CRIT-04 FIX token: use CSPRNG instead of Math.random()
const BOOKING_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function bookingToken(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += BOOKING_CHARS[randomInt(BOOKING_CHARS.length)];
  return `6T4-${s}`;
}

export async function POST(req: NextRequest) {
  // Rate limit checkouts: max 5 per IP per hour
  const ip = getClientIp(req.headers) ?? "unknown";
  const rl = await checkRateLimit({ identifier: ip, kind: "customer", maxAttempts: 5, windowMinutes: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // Parse and validate input
  const parsed = CheckoutSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body: CheckoutBody = parsed.data;

  // CRIT-03: Server-side price lookup — NEVER trust client prices
  const resolvedItems = body.items.map((item) => {
    const part = PARTS_MAP[item.partId];
    if (!part) return null;
    return { ...item, unitPrice: part.price, name: part.name };
  }).filter(Boolean) as { partId: string; qty: number; unitPrice: number; name: string; forBuild?: { brand: string; model: string; year: number } | null }[];

  if (resolvedItems.length === 0) {
    return NextResponse.json({ ok: false, error: "no_valid_items" }, { status: 400 });
  }

  const DELIVERY_FEE = body.delivery === "delivery" ? 499 : 0;
  const serverTotal = resolvedItems.reduce((s, it) => s + it.unitPrice * it.qty, 0) + DELIVERY_FEE;

  const orderId = randomUUID();
  const token = bookingToken();

  try {
    const supabase = await createServerSupabase();
    if (!supabase) {
      // No Supabase configured — still return a token so the customer has a reference
      return NextResponse.json({ orderId, token });
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    // Insert order
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      user_id: userId,
      status: "pending",
      total: serverTotal,
      delivery_mode: body.delivery,
      payment_method: body.payment,
      booking_token: token,
      address: {
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        address1: body.address1 ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        pin: body.pin ?? null
      },
      notes: body.notes ?? null
    });

    if (orderError) {
      console.error("[checkout] order insert failed:", orderError);
      return NextResponse.json({ ok: false, error: "order_failed" }, { status: 500 });
    }

    // Insert order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      resolvedItems.map((it) => ({
        order_id: orderId,
        part_id: it.partId,
        qty: it.qty,
        unit_price: it.unitPrice,
        for_build: it.forBuild ?? null
      }))
    );

    if (itemsError) {
      console.error("[checkout] order_items insert failed:", itemsError);
      // Order exists but items failed — mark as error and return token
      await supabase.from("orders").update({ status: "error" }).eq("id", orderId);
      return NextResponse.json({ ok: false, error: "items_failed" }, { status: 500 });
    }

    // Create admin notification (non-critical — ignore failures)
    const adminSupa = createAdminSupabase();
    if (adminSupa) {
      adminSupa.from("notifications").insert({
        type: "new_order",
        severity: "info",
        title: `New order ${token}`,
        body: `${body.fullName} · ${body.phone} · ₹${serverTotal.toLocaleString("en-IN")}`,
        metadata: { orderId, token, total: serverTotal }
      }).then(() => {/* ok */}, () => {/* non-critical — ignore */});
    }

    // Send owner email notification (non-blocking)
    sendOrderNotification({
      orderId,
      token,
      customerName: body.fullName,
      customerPhone: body.phone,
      total: serverTotal,
      items: resolvedItems.map((it) => ({ name: it.name, qty: it.qty, price: it.unitPrice }))
    }).catch(() => {/* non-critical */});

    return NextResponse.json({ orderId, token });
  } catch (err) {
    console.error("[checkout] unexpected error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
