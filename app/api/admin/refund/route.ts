import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay/client";

export const runtime = "nodejs";

const Body = z.object({
  orderId: z.string().uuid(),
  amount: z.number().int().positive().optional(),
  reason: z.string().max(280).optional()
});

type OrderForRefund = {
  id: string;
  status: string | null;
  payment_status: string | null;
  razorpay_payment_id: string | null;
  total: number;
};

type OrderItemRow = { part_id: string; qty: number };

type RefundOk = {
  ok: true;
  refundId: string;
  amount: number;
};

type RefundErr = {
  ok: false;
  error: string;
};

type RazorpayRefundResponse = {
  id?: string;
};

/**
 * POST /api/admin/refund
 *
 * Admin-initiated refund for a paid Razorpay order:
 *  1. Calls rzp.payments.refund() with the captured payment id.
 *  2. Marks orders.payment_status = 'refunded' and payments.status = 'refunded'.
 *  3. Reverses inventory for the order's line items (logged in inventory_history
 *     with reason='return') when the order was previously confirmed/paid.
 *  4. Writes a notification row for the admin feed.
 */
export async function POST(req: NextRequest): Promise<NextResponse<RefundOk | RefundErr>> {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const supa = createAdminSupabase();
  if (!supa) {
    return NextResponse.json(
      { ok: false, error: "backend_unconfigured" },
      { status: 503 }
    );
  }

  const rzp = getRazorpay();
  if (!rzp) {
    return NextResponse.json(
      { ok: false, error: "razorpay_not_configured" },
      { status: 503 }
    );
  }

  const { data: orderData, error: orderErr } = await supa
    .from("orders")
    .select("id, status, payment_status, razorpay_payment_id, total")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (orderErr) {
    return NextResponse.json(
      { ok: false, error: orderErr.message },
      { status: 500 }
    );
  }
  const order = orderData as OrderForRefund | null;
  if (!order) {
    return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
  }
  if (!order.razorpay_payment_id) {
    return NextResponse.json(
      { ok: false, error: "no_razorpay_payment" },
      { status: 400 }
    );
  }
  if (order.payment_status === "refunded") {
    return NextResponse.json(
      { ok: false, error: "already_refunded" },
      { status: 409 }
    );
  }
  if (order.payment_status !== "paid") {
    return NextResponse.json(
      { ok: false, error: "order_not_paid" },
      { status: 400 }
    );
  }

  // Razorpay amounts are paise; orders.total is INR.
  const amountInINR =
    parsed.data.amount !== undefined ? parsed.data.amount : order.total;
  const amountInPaise = amountInINR * 100;

  let refundId: string;
  try {
    const result = (await rzp.payments.refund(order.razorpay_payment_id, {
      amount: amountInPaise,
      speed: "optimum",
      notes: {
        reason: parsed.data.reason ?? "admin_refund",
        order_id: order.id,
        admin_id: me.sub
      }
    })) as RazorpayRefundResponse;
    refundId = String(result.id ?? "");
    if (!refundId) {
      return NextResponse.json(
        { ok: false, error: "refund_missing_id" },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "refund_failed";
    return NextResponse.json(
      { ok: false, error: `razorpay_refund_failed: ${message}` },
      { status: 502 }
    );
  }

  // Mark order + payment refunded.
  const { error: orderUpdateErr } = await supa
    .from("orders")
    .update({ payment_status: "refunded" })
    .eq("id", order.id);
  if (orderUpdateErr) {
    return NextResponse.json(
      { ok: false, error: `order_update_failed: ${orderUpdateErr.message}` },
      { status: 500 }
    );
  }
  await supa
    .from("payments")
    .update({ status: "refunded" })
    .eq("order_id", order.id);

  // Reverse inventory only if order was confirmed (stock had been decremented).
  const reverseStock = order.status === "confirmed";
  if (reverseStock) {
    const { data: itemsData } = await supa
      .from("order_items")
      .select("part_id, qty")
      .eq("order_id", order.id);
    const items = (itemsData as OrderItemRow[] | null) ?? [];

    for (const it of items) {
      const { data: prod } = await supa
        .from("products")
        .select("stock")
        .eq("id", it.part_id)
        .maybeSingle();
      const current = (prod?.stock as number | null) ?? 0;
      const newStock = current + it.qty;
      const { error: stockErr } = await supa
        .from("products")
        .update({ stock: newStock })
        .eq("id", it.part_id);
      if (stockErr) continue;
      await supa.from("inventory_history").insert({
        product_id: it.part_id,
        change: it.qty,
        new_stock: newStock,
        reason: "return",
        reference: order.id,
        admin_id: me.sub
      });
    }
  }

  // Admin notifications feed.
  await supa.from("notifications").insert({
    type: "admin_action",
    title: `Refund issued · ₹${amountInINR}`,
    body: `Order ${order.id.slice(0, 8)}… refunded by ${me.username}${
      parsed.data.reason ? ` — ${parsed.data.reason}` : ""
    }`,
    severity: "warning",
    metadata: {
      order_id: order.id,
      refund_id: refundId,
      amount: amountInINR,
      reason: parsed.data.reason ?? null,
      stock_reversed: reverseStock
    }
  });

  await supa.from("admin_activity_log").insert({
    admin_id: me.sub,
    admin_username: me.username,
    action: "order_refunded",
    target_type: "order",
    target_id: order.id,
    metadata: {
      refund_id: refundId,
      amount: amountInINR,
      reason: parsed.data.reason ?? null,
      stock_reversed: reverseStock
    },
    ip: getClientIp(req.headers)
  });

  revalidatePath("/admin/orders");

  return NextResponse.json({ ok: true, refundId, amount: amountInINR });
}
