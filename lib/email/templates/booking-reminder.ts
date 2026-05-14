import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml } from "./_layout";
import type { RenderedEmail } from "./order-confirmation";
import type { BookingForEmail } from "./booking-confirmation";

const TIME_FMT: Intl.DateTimeFormatOptions = {
  weekday: "long",
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

export function bookingReminder(booking: BookingForEmail): RenderedEmail {
  const name = (booking.customer_name ?? "").trim() || "Rider";
  const ref = booking.booking_ref ?? booking.id.slice(0, 8);
  const when = fmtWhen(booking.scheduled_for);

  const bookingUrl = absoluteUrl(`/account/bookings/${booking.id}`);

  const bodyHtml = `
    <p style="margin:0 0 16px">
      Heads up, ${escapeHtml(name)} — you're booked at ${escapeHtml(SITE.shortName)} tomorrow for
      <b style="color:#fff">${escapeHtml(booking.service_name)}</b>.
    </p>

    <div style="background:#000;border:1px solid rgba(225,5,0,0.4);padding:18px 20px;margin:6px 0 22px">
      <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:6px">When</div>
      <div style="color:#fff;font-size:18px;font-weight:700">${escapeHtml(when)} IST</div>
      ${
        booking.bay_number
          ? `<div style="margin-top:6px;color:#aaa;font-size:13px">Bay <span style="color:#eee">#${booking.bay_number}</span></div>`
          : ""
      }
      <div style="margin-top:6px;color:#aaa;font-size:13px">Ref <span style="color:#eee;font-family:'Courier New',monospace">${escapeHtml(ref)}</span></div>
    </div>

    <p style="margin:0 0 8px;color:#cfcfcf;font-size:14px">A few quick reminders:</p>
    <ul style="margin:0 0 18px;padding:0 0 0 18px;color:#bdbdbd;font-size:13px;line-height:1.7">
      <li>Top up the tank — we need fuel to dyno and tune.</li>
      <li>Bring your registration + a govt ID.</li>
      <li>Arrive 10 minutes early so we can roll the bike in clean.</li>
    </ul>

    <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6">
      Can't make it? Reply to this email or WhatsApp ${escapeHtml(SITE.whatsapp)} as early as possible —
      cancellations within 4 hours can't be accepted online.
    </p>
  `;

  const html = renderShell({
    preheader: `Tomorrow at ${when} — ${booking.service_name}.`,
    eyebrow: "Reminder",
    heading: "See you tomorrow at the shop.",
    bodyHtml,
    ctaLabel: "View booking",
    ctaHref: bookingUrl,
    footerNote: `Need to reschedule? WhatsApp ${SITE.whatsapp}.`
  });

  const text = [
    `Reminder — ${SITE.name}`,
    ``,
    `Hey ${name}, you're booked tomorrow for ${booking.service_name}.`,
    `When: ${when} IST`,
    booking.bay_number ? `Bay: #${booking.bay_number}` : "",
    `Ref: ${ref}`,
    ``,
    `Top up the tank, bring registration + ID, arrive 10 min early.`,
    ``,
    `View: ${bookingUrl}`,
    `WhatsApp: ${SITE.whatsapp}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Tomorrow at ${SITE.shortName} — ${booking.service_name}`,
    html,
    text
  };
}
