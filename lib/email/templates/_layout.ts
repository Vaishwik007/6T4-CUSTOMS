import { SITE } from "@/lib/seo/config";

/**
 * Shared email shell — single-column 600px max width, dark surface with
 * neon `#E10500` accents, system fonts, inline styles only. Avoids external
 * assets so the message renders consistently across clients.
 */

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function inr(amountInRupees: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amountInRupees);
  } catch {
    return `Rs. ${amountInRupees}`;
  }
}

export interface ShellArgs {
  preheader?: string;
  eyebrow?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}

export function renderShell(args: ShellArgs): string {
  const {
    preheader = "",
    eyebrow = "",
    heading,
    bodyHtml,
    ctaLabel,
    ctaHref,
    footerNote
  } = args;

  const cta =
    ctaLabel && ctaHref
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px">
          <tr>
            <td bgcolor="#E10500" style="border-radius:2px">
              <a href="${escapeHtml(ctaHref)}"
                 style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#fff;text-decoration:none">
                ${escapeHtml(ctaLabel)}
              </a>
            </td>
          </tr>
        </table>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#000;color:#eee;font-family:${FONT_STACK}">
  <span style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(preheader)}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#000">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#0a0a0a;border:1px solid rgba(225,5,0,0.22)">
          <tr>
            <td style="padding:32px 32px 8px">
              <div style="font-family:${FONT_STACK};font-weight:800;letter-spacing:.18em;font-size:18px;text-transform:uppercase;color:#fff">
                6T4<span style="color:#E10500">/</span>CUSTOMS
              </div>
              ${
                eyebrow
                  ? `<div style="color:#E10500;letter-spacing:.36em;font-size:10px;text-transform:uppercase;margin-top:18px">${escapeHtml(eyebrow)}</div>`
                  : ""
              }
              <h1 style="margin:8px 0 16px;font-family:${FONT_STACK};font-size:24px;line-height:1.25;color:#fff;font-weight:700">
                ${escapeHtml(heading)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;color:#cfcfcf;font-size:15px;line-height:1.6;font-family:${FONT_STACK}">
              ${bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);color:#666;font-size:12px;line-height:1.6;font-family:${FONT_STACK}">
              ${
                footerNote
                  ? `<div style="margin-bottom:14px;color:#888">${footerNote}</div>`
                  : ""
              }
              <div>${escapeHtml(SITE.name)} &middot; ${escapeHtml(SITE.address.streetAddress)}, ${escapeHtml(SITE.address.addressLocality)}</div>
              <div>Support: <a href="mailto:${escapeHtml(SITE.email)}" style="color:#E10500;text-decoration:none">${escapeHtml(SITE.email)}</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
