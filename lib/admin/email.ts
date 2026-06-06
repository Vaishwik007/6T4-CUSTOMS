import { Resend } from "resend";

export interface ContactFormPayload {
  name: string;
  phone: string;
  email?: string | "";
  service: "tuning" | "service" | "fabrication" | "parts" | "general";
  message: string;
}

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "6T4 Customs <no-reply@resend.dev>";

let client: Resend | null = null;
function getClient() {
  if (!API_KEY) return null;
  if (!client) client = new Resend(API_KEY);
  return client;
}

export async function sendOtpEmail({ to, code }: { to: string; code: string }) {
  const c = getClient();
  const subject = "6T4 Customs — verification code";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Inter,sans-serif;background:#000;color:#eee;padding:40px;max-width:540px;margin:auto;border:1px solid #2a0000">
      <h1 style="font-family:Orbitron,sans-serif;letter-spacing:.15em;margin:0 0 12px;text-transform:uppercase">6T4<span style="color:#ff0000">/</span>CUSTOMS</h1>
      <p style="color:#ff0000;letter-spacing:.4em;font-size:10px;text-transform:uppercase;margin:0 0 30px">Access Code</p>
      <p style="color:#bbb;margin:0 0 20px">Your one-time code (valid for 5 minutes):</p>
      <div style="background:#0a0a0a;border:1px solid rgba(255,0,0,0.4);padding:22px;text-align:center;margin:10px 0 24px">
        <div style="font-family:'Courier New',monospace;letter-spacing:.7em;font-size:36px;color:#ff0000;font-weight:700">${code}</div>
      </div>
      <p style="color:#666;font-size:12px;margin:0">If you didn't request this, ignore this email. No action needed.</p>
    </div>`;

  if (!c) {
    // MED-02 FIX: Never log the plaintext OTP.
    // In development, look up the hashed code in the otp_codes table.
    if (process.env.NODE_ENV === "development") {
      console.log(`[email:fallback] OTP requested for ${to} — check otp_codes table. (No RESEND_API_KEY)`);
    }
    return { ok: true, fallback: true };
  }
  try {
    await c.emails.send({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: err };
  }
}

const SERVICE_LABELS: Record<ContactFormPayload["service"], string> = {
  tuning: "Tuning / ECU Flash",
  service: "Service (Minor / Major)",
  fabrication: "Fabrication",
  parts: "Parts Order",
  general: "General Enquiry"
};

export async function sendContactEmail(
  payloadOrArgs:
    | ContactFormPayload
    | {
        from_name: string;
        from_phone: string;
        from_email?: string;
        service: string;
        message: string;
      }
) {
  const c = getClient();
  const to = process.env.GARAGE_NOTIFICATION_EMAIL || process.env.CONTACT_NOTIFY_EMAIL || process.env.RESEND_FROM || "garage@6t4customs.com";

  // Normalise both call signatures
  const from_name = "from_name" in payloadOrArgs ? payloadOrArgs.from_name : payloadOrArgs.name;
  const from_phone = "from_phone" in payloadOrArgs ? payloadOrArgs.from_phone : payloadOrArgs.phone;
  const from_email = "from_email" in payloadOrArgs
    ? payloadOrArgs.from_email
    : ("email" in payloadOrArgs ? (payloadOrArgs as ContactFormPayload).email : undefined);
  const service = payloadOrArgs.service;
  const message = payloadOrArgs.message;

  // Resolve label for legacy enum values
  const label =
    SERVICE_LABELS[service as ContactFormPayload["service"]] ?? service;

  const subject = `[6T4 Enquiry] ${label} — ${from_name}`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Inter,sans-serif;background:#000;color:#eee;padding:40px;max-width:600px;margin:auto;border:1px solid #2a0000">
      <h1 style="font-family:Orbitron,sans-serif;letter-spacing:.15em;margin:0 0 8px;text-transform:uppercase;font-size:20px">6T4<span style="color:#ff0000">/</span>CUSTOMS</h1>
      <p style="color:#ff0000;letter-spacing:.4em;font-size:10px;text-transform:uppercase;margin:0 0 28px">New Website Enquiry</p>

      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px;width:120px">Name</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px">${from_name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">Phone</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px"><a href="tel:${from_phone}" style="color:#ff0000">${from_phone}</a></td></tr>
        ${from_email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">Email</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px"><a href="mailto:${from_email}" style="color:#ff0000">${from_email}</a></td></tr>` : ""}
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">Service</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px;color:#ff0000">${label}</td></tr>
      </table>

      <div style="margin-top:24px;background:#0a0a0a;border:1px solid #2a0000;padding:16px">
        <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.2em;margin:0 0 8px">Message</p>
        <p style="font-size:14px;color:#e6e6e6;margin:0;line-height:1.6">${message.replace(/\n/g, "<br>")}</p>
      </div>

      <p style="margin-top:24px;color:#444;font-size:11px">Sent from 6t4customs.com contact form · Reply or call/WhatsApp to respond.</p>
    </div>`;

  if (!c) {
    console.log(`[email:fallback] Contact enquiry from ${from_name} (${from_phone}) — service: ${label}`);
    return { ok: true, fallback: true };
  }
  try {
    const replyTo = from_email && from_email.includes("@") ? from_email : undefined;
    await c.emails.send({ from: FROM, to, subject, html, ...(replyTo ? { replyTo } : {}) });
    return { ok: true };
  } catch (err) {
    console.error("[email] contact send failed:", err);
    return { ok: false, error: err };
  }
}

export async function sendOrderNotification({
  orderId,
  token,
  customerName,
  customerPhone,
  total,
  items
}: {
  orderId: string;
  token: string;
  customerName: string;
  customerPhone: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
}) {
  const c = getClient();
  const to = process.env.GARAGE_NOTIFICATION_EMAIL || "garage@6t4customs.com";
  const subject = `[6T4 Order] ${token} — ${customerName}`;
  const itemsHtml = items
    .map(
      (i) =>
        `<tr><td style="color:#888;padding:6px 0">${i.name}</td><td style="color:#eee">${i.qty}×</td><td style="color:#eee;text-align:right">₹${i.price.toLocaleString("en-IN")}</td></tr>`
    )
    .join("");
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Inter,sans-serif;background:#000;color:#eee;padding:40px;max-width:600px;margin:auto;border:1px solid #2a0000">
      <h1 style="font-family:Orbitron,sans-serif;letter-spacing:.15em;margin:0 0 4px;text-transform:uppercase;font-size:20px;color:#ff0000">NEW ORDER</h1>
      <p style="font-family:'Courier New',monospace;color:#ff0000;font-size:28px;margin:0 0 24px;font-weight:700;letter-spacing:.1em">${token}</p>

      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px;width:110px">Customer</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px">${customerName}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">Phone</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px"><a href="tel:${customerPhone}" style="color:#ff0000">${customerPhone}</a></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:12px">Order ID</td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:11px;color:#555">${orderId}</td></tr>
      </table>

      <table style="width:100%;margin:20px 0;border-collapse:collapse">
        <tr style="border-bottom:1px solid #222">
          <th style="text-align:left;color:#888;padding:8px 0;font-weight:normal;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Item</th>
          <th style="color:#888;font-weight:normal;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Qty</th>
          <th style="text-align:right;color:#888;font-weight:normal;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Price</th>
        </tr>
        ${itemsHtml}
        <tr style="border-top:2px solid #ff0000">
          <td colspan="2" style="color:#eee;font-weight:bold;padding:10px 0;font-size:14px">Total</td>
          <td style="color:#ff0000;font-weight:bold;text-align:right;font-size:16px">₹${total.toLocaleString("en-IN")}</td>
        </tr>
      </table>

      <p style="color:#444;font-size:11px;margin:0">Log in to the admin panel to view and manage this order.</p>
    </div>`;

  if (!c) {
    console.log(`[email:fallback] Order ${token} placed by ${customerName} — ₹${total}`);
    return { ok: true, fallback: true };
  }
  try {
    await c.emails.send({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (err) {
    console.error("[email] order notification failed:", err);
    return { ok: false, error: err };
  }
}
