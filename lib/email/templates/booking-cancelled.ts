import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml } from "./_layout";
import type { RenderedEmail } from "./order-confirmation";
import type { BookingForEmail } from "./booking-confirmation";

const TIME_FMT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata"
};

function fmtWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", TIME_FMT).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function bookingCancelled(
  booking: BookingForEmail,
  reason?: string | null
): RenderedEmail {
  const name = (booking.customer_name ?? "").trim() || "Rider";
  const ref = booking.booking_ref ?? booking.id.slice(0, 8);
  const when = fmtWhen(booking.scheduled_for);

  const rebookUrl = absoluteUrl("/book");

  const bodyHtml = `
    <p style="margin:0 0 16px">
      Hey ${escapeHtml(name)} — your booking for
      <b style="color:#fff">${escapeHtml(booking.service_name)}</b> on
      <b style="color:#fff">${escapeHtml(when)} IST</b> has been cancelled.
    </p>

    <div style="background:#000;border:1px solid rgba(255,255,255,0.08);padding:14px 18px;margin:6px 0 18px">
      <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:6px">Ref</div>
      <div style="color:#eee;font-family:'Courier New',monospace;letter-spacing:.3em;font-size:14px">${escapeHtml(ref)}</div>
      ${
        reason
          ? `<div style="margin-top:10px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.24em">Reason</div>
             <div style="color:#cfcfcf;font-size:13px">${escapeHtml(reason)}</div>`
          : ""
      }
    </div>

    <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6">
      No charges applied. Want another slot? Pick a new time and we'll line it up.
    </p>
  `;

  const html = renderShell({
    preheader: `Booking ${ref} cancelled — no charges applied.`,
    eyebrow: "Cancelled",
    heading: "Booking cancelled.",
    bodyHtml,
    ctaLabel: "Book another slot",
    ctaHref: rebookUrl,
    footerNote: `Questions? WhatsApp ${SITE.whatsapp}.`
  });

  const text = [
    `Booking cancelled — ${SITE.name}`,
    ``,
    `Hey ${name}, your booking for ${booking.service_name} on ${when} IST has been cancelled.`,
    `Ref: ${ref}`,
    reason ? `Reason: ${reason}` : "",
    ``,
    `No charges applied. Re-book: ${rebookUrl}`,
    `WhatsApp: ${SITE.whatsapp}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Booking cancelled — ${SITE.shortName} (${ref})`,
    html,
    text
  };
}
