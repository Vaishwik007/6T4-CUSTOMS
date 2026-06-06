import { createHmac } from "crypto";
import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml } from "./_layout";
import type {
  OrderForEmail,
  OrderItemForEmail,
  RenderedEmail
} from "./order-confirmation";

/**
 * Build a magic review link. Uses HMAC of `orderId` with `REVIEW_LINK_SECRET`
 * so the URL is non-guessable. If the env var is missing, falls back to a
 * plain link — the caller should treat the token as a hint, not auth.
 */
export function buildReviewUrl(orderId: string, overridePath?: string): string {
  const path = overridePath ?? `/review/${orderId}`;
  const secret = process.env.REVIEW_LINK_SECRET;
  if (!secret) return absoluteUrl(path);
  try {
    const token = createHmac("sha256", secret)
      .update(orderId)
      .digest("hex")
      .slice(0, 32);
    const sep = path.includes("?") ? "&" : "?";
    return absoluteUrl(`${path}${sep}token=${token}`);
  } catch {
    return absoluteUrl(path);
  }
}

export function reviewRequest(
  order: OrderForEmail,
  items: OrderItemForEmail[],
  reviewUrl?: string
): RenderedEmail {
  const customerName = (order.address?.fullName ?? "").trim() || "Rider";
  const finalUrl = reviewUrl ?? buildReviewUrl(order.id);

  const itemList = items
    .slice(0, 6)
    .map((it) => {
      const label = (it.name && it.name.trim()) || it.part_id;
      return `<li style="margin:4px 0;color:#cfcfcf;font-size:14px">${escapeHtml(label)}</li>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 14px">
      Hey ${escapeHtml(customerName)} — hope the build is treating you right.
    </p>
    <p style="margin:0 0 18px">
      A quick favour: drop us a review. Honest feedback (good, bad, both) helps the
      next rider trust the work and keeps us sharp.
    </p>
    ${
      itemList
        ? `<div style="background:#000;border:1px solid rgba(255,255,255,0.08);padding:14px 18px;margin:12px 0 18px">
            <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:8px">What you got</div>
            <ul style="margin:0;padding:0 0 0 18px">${itemList}</ul>
          </div>`
        : ""
    }
    <p style="margin:0;color:#aaa;font-size:13px">
      Two minutes, tops. We read every one.
    </p>
  `;

  const html = renderShell({
    preheader: `Quick review for your ${SITE.shortName} build — two minutes, tops.`,
    eyebrow: "We'd love your take",
    heading: "How's the build holding up?",
    bodyHtml,
    ctaLabel: "Leave a review",
    ctaHref: finalUrl,
    footerNote: "Not interested? Ignore this email — we won't ask again on this order."
  });

  const text = [
    `Hey ${customerName}, hope the build is treating you right.`,
    ``,
    `Drop us a quick review — two minutes, tops:`,
    finalUrl,
    ``,
    items.length
      ? `What you got: ${items
          .slice(0, 6)
          .map((it) => (it.name && it.name.trim()) || it.part_id)
          .join(", ")}`
      : "",
    ``,
    `— ${SITE.name}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `How's the build? — quick review for ${SITE.shortName}`,
    html,
    text
  };
}
