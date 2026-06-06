import { Resend } from "resend";

/**
 * Centralized email send wrapper. Best-effort: never throws so that an email
 * failure cannot cascade into breaking a checkout or admin flow.
 *
 * Behaviour:
 *  - If `RESEND_API_KEY` is set: send via Resend.
 *  - Otherwise: log the email to stdout (dev fallback) so the developer can
 *    inspect output locally without configuring the SDK.
 */

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "6T4 Customs <no-reply@resend.dev>";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!API_KEY) return null;
  if (!client) client = new Resend(API_KEY);
  return client;
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; id?: string; dev?: boolean }
  | { ok: false; error: string };

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const { to, subject, html, text, replyTo } = args;

  // Basic validation — silently drop if `to` is empty/invalid, never throw.
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, error: "no_recipient" };
  }

  const c = getClient();
  if (!c) {
    // Dev fallback — print to stdout for local visibility.
    // eslint-disable-next-line no-console
    console.log(
      `[email:dev] -> ${recipients.join(", ")}\n  subject: ${subject}\n  text: ${text ?? "(no text fallback)"}\n  html: ${html.length} chars`
    );
    return { ok: true, dev: true };
  }

  try {
    const res = await c.emails.send({
      from: FROM,
      to: recipients,
      subject,
      html,
      text,
      replyTo
    });
    if (res.error) {
      // eslint-disable-next-line no-console
      console.error("[email] resend api error:", res.error);
      return { ok: false, error: String(res.error.message ?? res.error) };
    }
    return { ok: true, id: res.data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[email] send failed:", msg);
    return { ok: false, error: msg };
  }
}
