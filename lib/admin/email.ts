import { Resend } from "resend";

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
    // Dev fallback — log to stdout so the developer can copy it.
    console.log(`[email:fallback] OTP for ${to} = ${code} (no RESEND_API_KEY set)`);
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
