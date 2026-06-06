import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/reviews/submit
 *
 * Customer-facing review submission. Validates payload, optional order-token
 * for "verified purchase" flag, inserts the row as `pending` for admin
 * moderation. If `reviews` table doesn't exist yet (migration 0004 pending),
 * returns 503 cleanly so the form can show a helpful state.
 *
 * Rate-limited at 3 submissions per hour per IP to deter spam.
 */

const schema = z.object({
  productId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  orderId: z.string().uuid().optional(),
  authorName: z.string().min(2).max(80),
  bike: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(20).max(2000),
  images: z.array(z.string().url()).max(4).optional()
});

const BANNED_WORDS = ["fuck", "shit", "asshole", "bitch", "scam", "fraud"]; // light pass; main filter is admin moderation

export async function POST(req: NextRequest) {
  const ip = getClientKey(req.headers);
  if (!rateLimit(`review-submit:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many submissions. Try again in an hour." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "invalid_payload", details: String(err) }, { status: 400 });
  }
  if (!body.productId && !body.serviceId) {
    return NextResponse.json(
      { error: "missing_target", message: "Provide productId or serviceId." },
      { status: 400 }
    );
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // Optional "verified purchase" check
  let verifiedPurchase = false;
  if (body.orderId) {
    const { data: order } = await admin
      .from("orders")
      .select("payment_status")
      .eq("id", body.orderId)
      .maybeSingle();
    verifiedPurchase = order?.payment_status === "paid";
  }

  // Light content filter — submit but flag for moderation if anything suspect.
  const haystack = `${body.title ?? ""} ${body.content}`.toLowerCase();
  const flagged = BANNED_WORDS.some((w) => haystack.includes(w));

  const { error: insertErr } = await admin.from("reviews").insert({
    product_id: body.productId ?? null,
    service_id: body.serviceId ?? null,
    order_id: body.orderId ?? null,
    author_name: body.authorName,
    bike: body.bike ?? null,
    rating: body.rating,
    title: body.title ?? null,
    content: body.content,
    images: body.images ?? [],
    verified_purchase: verifiedPurchase,
    status: flagged ? "flagged" : "pending"
  });

  if (insertErr) {
    // If table doesn't exist yet, surface a friendly 503 instead of 500.
    const msg = String(insertErr.message ?? "");
    if (msg.includes("relation") && msg.includes("reviews")) {
      return NextResponse.json(
        { error: "reviews_table_pending", message: "Review system is being provisioned. Please try again in a few hours." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "insert_failed", details: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, verifiedPurchase, status: flagged ? "flagged" : "pending" });
}
