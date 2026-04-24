import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify the Razorpay client-side checkout signature.
 * Docs: https://razorpay.com/docs/payments/server-integration/nodejs/payment-verification/
 * signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
 */
export function verifyCheckoutSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  secret: string;
}): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, secret } = params;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !secret) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  return safeEqualHex(expected, razorpay_signature);
}

/**
 * Verify a Razorpay webhook delivery.
 * signature = HMAC_SHA256(raw_body, WEBHOOK_SECRET)
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret: string;
}): boolean {
  const { rawBody, signature, secret } = params;
  if (!rawBody || !signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ab.length === 0 || ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}
