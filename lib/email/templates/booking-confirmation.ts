import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml } from "./_layout";
import type { RenderedEmail } from "./order-confirmation";

export interface BookingForEmail {
  id: string;
  booking_ref?: string | null;
  service_name: string;
  scheduled_for: string;          // ISO timestamp
  duration_minutes: number;
  bay_number?: number | null;
  customer_name: string;
  bike_info?: { brandSlug?: string; modelSlug?: string; year?: number; plate?: string } | null;
}

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

function bikeLine(info: BookingForEmail["bike_info"]): string {
  if (!info) return "";
  const parts = [info.brandSlug, info.modelSlug, info.year ? String(info.year) : null]
    .filter((p): p is string => Boolean(p))
    .map((p) => p.replace(/-/g, " "));
  if (parts.length === 0) return "";
  return parts.join(" · ");
}

export function bookingConfirmation(booking: BookingForEmail): RenderedEmail {
  const name = (booking.customer_name ?? "").trim() || "Rider";
  const ref = booking.booking_ref ?? booking.id.slice(0, 8);
  const when = fmtWhen(booking.scheduled_for);
  const bike = bikeLine(booking.bike_info);

  const bookingUrl = absoluteUrl(`/account/bookings/${booking.id}`);

  const bodyHtml = `
    <p style="margin:0 0 16px">
      Hey ${escapeHtml(name)} — your booking request is in. Arjun will
      WhatsApp inside an hour during business hours to confirm the slot.
    </p>

    <div style="background:#000;border:1px solid rgba(225,5,0,0.4);padding:18px 20px;margin:6px 0 22px">
      <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:6px">Booking ref</div>
      <div style="color:#E10500;font-family:'Courier New',monospace;letter-spacing:.3em;font-size:18px;font-weight:700">${escapeHtml(ref)}</div>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 12px">
      <tr>
        <td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.2em">Service</td>
        <td align="right" style="padding:8px 0;color:#eee;font-size:14px">${escapeHtml(booking.service_name)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.2em">When</td>
        <td align="right" style="padding:8px 0;color:#eee;font-size:14px">${escapeHtml(when)} IST</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.2em">Duration</td>
        <td align="right" style="padding:8px 0;color:#eee;font-size:14px">${booking.duration_minutes} min</td>
      </tr>
      ${
        booking.bay_number
          ? `<tr>
              <td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.2em">Bay</td>
              <td align="right" style="padding:8px 0;color:#eee;font-size:14px">#${booking.bay_number}</td>
            </tr>`
          : ""
      }
      ${
        bike
          ? `<tr>
              <td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.2em">Bike</td>
              <td align="right" style="padding:8px 0;color:#eee;font-size:14px">${escapeHtml(bike)}</td>
            </tr>`
          : ""
      }
    </table>

    <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6">
      Need to change anything? Reply to this email or WhatsApp ${escapeHtml(SITE.whatsapp)}.
    </p>
  `;

  const html = renderShell({
    preheader: `Booking ${ref} received — Arjun will WhatsApp within an hour.`,
    eyebrow: "Booking received",
    heading: "Slot reserved — confirmation pending.",
    bodyHtml,
    ctaLabel: "View booking",
    ctaHref: bookingUrl,
    footerNote: `Need to reach us sooner? WhatsApp ${SITE.whatsapp}.`
  });

  const text = [
    `Booking received — ${SITE.name}`,
    ``,
    `Hey ${name}, your booking is in. Arjun will WhatsApp within an hour during business hours.`,
    `Ref: ${ref}`,
    `Service: ${booking.service_name}`,
    `When: ${when} IST`,
    `Duration: ${booking.duration_minutes} min`,
    booking.bay_number ? `Bay: #${booking.bay_number}` : "",
    bike ? `Bike: ${bike}` : "",
    ``,
    `View: ${bookingUrl}`,
    `WhatsApp: ${SITE.whatsapp}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Booking received — ${SITE.shortName} (${ref})`,
    html,
    text
  };
}
