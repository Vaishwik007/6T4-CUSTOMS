import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay/client";
import { verifyCheckoutSignature } from "@/lib/razorpay/verify";

export const runtime = "nodejs";

const schema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "razorpay_not_configured" }, { status: 503 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // 1. Cryptographically verify the client-side payment signature.
  const ok = verifyCheckoutSignature({
    razorpay_order_id: body.razorpay_order_id,
    razorpay_payment_id: body.razorpay_payment_id,
    razorpay_signature: body.razorpay_signature,
    secret
  });
  if (!ok) {
    return NextResponse.json({ error: "signature_mismatch" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // 2. Make sure the razorpay_order_id actually belongs to this order.
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, razorpay_order_id, payment_status, total")
    .eq("id", body.orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }
  if (order.razorpay_order_id && order.razorpay_order_id !== body.razorpay_order_id) {
    return NextResponse.json({ error: "order_mismatch" }, { status: 400 });
  }

  // 3. Idempotent: if already paid, treat as success.
  if (order.payment_status === "paid") {
    return NextResponse.json({ success: true, orderId: order.id, already: true });
  }

  // 4. Atomic finalize in Postgres.
  const { data: finalize, error: rpcErr } = await admin.rpc("finalize_paid_order", {
    p_order_id: body.orderId,
    p_razorpay_order_id: body.razorpay_order_id,
    p_razorpay_payment_id: body.razorpay_payment_id,
    p_razorpay_signature: body.razorpay_signature
  });

  if (rpcErr) {
    const msg = String(rpcErr.message ?? rpcErr);
    if (msg.toLowerCase().includes("insufficient_stock")) {
      // Oversold race — refund the customer automatically.
      await refundAndMarkFailed(body.razorpay_payment_id, body.orderId, order.total);
      return NextResponse.json(
        { error: "insufficient_stock", refunded: true },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "finalize_failed", details: msg }, { status: 500 });
  }

  const result = finalize as { ok: boolean; error?: string; already?: boolean } | null;
  if (!result || !result.ok) {
    return NextResponse.json(
      { error: result?.error ?? "finalize_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    orderId: body.orderId,
    already: result.already ?? false
  });
}

async function refundAndMarkFailed(
  razorpayPaymentId: string,
  orderId: string,
  amountInINR: number
) {
  const admin = createAdminSupabase();
  const rzp = getRazorpay();
  if (rzp) {
    try {
      await rzp.payments.refund(razorpayPaymentId, {
        amount: amountInINR * 100,
        speed: "optimum",
        notes: { reason: "oversold_race", order_id: orderId }
      });
    } catch {
      /* swallow — webhook will reconcile */
    }
  }
  if (admin) {
    await admin
      .from("orders")
      .update({ payment_status: "refunded", status: "cancelled" })
      .eq("id", orderId);
    await admin
      .from("payments")
      .update({ status: "refunded" })
      .eq("order_id", orderId);
  }
}
