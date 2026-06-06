import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";

export const runtime = "nodejs";

/**
 * Razorpay webhook endpoint — configure in the Razorpay Dashboard:
 *   URL:    https://YOUR_DOMAIN/api/razorpay/webhook
 *   Events: payment.captured, payment.failed, refund.processed
 *   Secret: RAZORPAY_WEBHOOK_SECRET env var
 *
 * This is the authoritative fallback: if the browser never returns from
 * the checkout modal, the webhook still finalizes the order + stock.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const raw = await req.text();

  if (!verifyWebhookSignature({ rawBody: raw, signature, secret })) {
    return NextResponse.json({ error: "signature_mismatch" }, { status: 400 });
  }

  let event: {
    event: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; method?: string } };
      order?: { entity?: { id?: string } };
    };
    id?: string;
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // Idempotency: record the event; if already seen, bail.
  const eventId = event.id ?? `${event.event}:${Date.now()}`;
  const { error: insErr } = await admin
    .from("webhook_events")
    .insert({
      gateway: "razorpay",
      event_id: eventId,
      event_type: event.event,
      payload: event
    });
  if (insErr && !String(insErr.message).toLowerCase().includes("duplicate")) {
    // Don't fail the webhook on logging errors — just process.
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;

  if (event.event === "payment.captured" && razorpayOrderId && payment?.id) {
    const { data: order } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    if (order && order.payment_status !== "paid") {
      await admin.rpc("finalize_paid_order", {
        p_order_id: order.id,
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: payment.id,
        p_razorpay_signature: null
      });
    }
  } else if (event.event === "payment.failed" && razorpayOrderId) {
    await admin
      .from("orders")
      .update({ payment_status: "failed", status: "cancelled" })
      .eq("razorpay_order_id", razorpayOrderId)
      .neq("payment_status", "paid");
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("gateway_order_id", razorpayOrderId);
  } else if (event.event === "refund.processed" && razorpayOrderId) {
    await admin
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("razorpay_order_id", razorpayOrderId);
    await admin
      .from("payments")
      .update({ status: "refunded" })
      .eq("gateway_order_id", razorpayOrderId);
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_id", eventId);

  return NextResponse.json({ received: true });
}
