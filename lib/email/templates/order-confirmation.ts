import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml, inr } from "./_layout";

export interface OrderForEmail {
  id: string;
  total: number;
  booking_token?: string | null;
  delivery_mode?: string | null;
  payment_method?: string | null;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
  address: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    line1?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  } | null;
}

export interface OrderItemForEmail {
  part_id: string;
  qty: number;
  unit_price: number;
  name?: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function orderConfirmation(
  order: OrderForEmail,
  items: OrderItemForEmail[]
): RenderedEmail {
  const customerName =
    (order.address?.fullName ?? "").trim() || "Rider";
  const tokenLine = order.booking_token
    ? `<div style="color:#E10500;font-family:'Courier New',monospace;letter-spacing:.3em;font-size:18px;font-weight:700">${escapeHtml(order.booking_token)}</div>`
    : "";

  const itemRows = items
    .map((it) => {
      const lineTotal = it.qty * it.unit_price;
      const label = (it.name && it.name.trim()) || it.part_id;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#eee;font-size:14px">
            ${escapeHtml(label)}
            <div style="color:#888;font-size:12px;margin-top:2px">${escapeHtml(it.part_id)} &middot; qty ${it.qty}</div>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#eee;font-size:14px;white-space:nowrap">
            ${escapeHtml(inr(lineTotal))}
          </td>
        </tr>`;
    })
    .join("");

  const paymentRef = order.razorpay_payment_id
    ? `<div style="margin-top:6px;color:#777;font-size:12px">Payment ref: <span style="color:#aaa;font-family:'Courier New',monospace">${escapeHtml(order.razorpay_payment_id)}</span></div>`
    : "";

  const deliveryLabel =
    order.delivery_mode === "delivery" ? "Home delivery" : "In-shop pickup";

  const orderUrl = absoluteUrl(`/order/${order.id}`);

  const bodyHtml = `
    <p style="margin:0 0 18px">
      Thanks, ${escapeHtml(customerName)} — your order is locked in and the shop has been pinged.
      Arjun will WhatsApp you within the hour to confirm timing and next steps.
    </p>

    ${
      order.booking_token
        ? `<div style="background:#000;border:1px solid rgba(225,5,0,0.4);padding:18px 20px;margin:6px 0 22px">
            <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:6px">Booking token</div>
            ${tokenLine}
          </div>`
        : ""
    }

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 4px">
      ${itemRows}
      <tr>
        <td style="padding:14px 0 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.24em">Total</td>
        <td align="right" style="padding:14px 0 0;color:#fff;font-size:18px;font-weight:700;white-space:nowrap">${escapeHtml(inr(order.total))}</td>
      </tr>
    </table>

    <div style="margin-top:18px;color:#aaa;font-size:13px;line-height:1.6">
      <div>Mode: <span style="color:#eee">${escapeHtml(deliveryLabel)}</span></div>
      ${paymentRef}
    </div>
  `;

  const html = renderShell({
    preheader: `Order ${order.id.slice(0, 8)} confirmed — Arjun will WhatsApp within an hour.`,
    eyebrow: "Order confirmed",
    heading: "Your build is locked in.",
    bodyHtml,
    ctaLabel: "View order details",
    ctaHref: orderUrl,
    footerNote: `Need to reach us sooner? WhatsApp ${SITE.whatsapp}.`
  });

  const text = [
    `Order confirmed — ${SITE.name}`,
    ``,
    `Hey ${customerName}, your order is in. Arjun will WhatsApp within an hour.`,
    order.booking_token ? `Booking token: ${order.booking_token}` : "",
    ``,
    `Items:`,
    ...items.map(
      (it) =>
        `  - ${(it.name && it.name.trim()) || it.part_id} (qty ${it.qty}) — ${inr(it.qty * it.unit_price)}`
    ),
    ``,
    `Total: ${inr(order.total)}`,
    `Mode: ${deliveryLabel}`,
    order.razorpay_payment_id ? `Payment ref: ${order.razorpay_payment_id}` : "",
    ``,
    `View order: ${orderUrl}`,
    `Support: ${SITE.email}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Order confirmed — ${SITE.name}${order.booking_token ? ` (${order.booking_token})` : ""}`,
    html,
    text
  };
}
