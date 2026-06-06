import { SITE, absoluteUrl } from "@/lib/seo/config";
import { renderShell, escapeHtml } from "./_layout";
import type { RenderedEmail } from "./order-confirmation";

export interface ProductForAlert {
  id: string;
  name?: string | null;
  sku?: string | null;
  brand?: string | null;
  category?: string | null;
}

export function lowStockAlert(
  product: ProductForAlert,
  currentStock: number,
  threshold: number
): RenderedEmail {
  const name = (product.name && product.name.trim()) || product.id;
  const inventoryUrl = absoluteUrl(`/admin/inventory/${product.id}`);
  const isOut = currentStock <= 0;

  const severityLabel = isOut ? "Out of stock" : "Low stock";
  const eyebrow = isOut ? "Out of stock" : "Low stock alert";

  const bodyHtml = `
    <p style="margin:0 0 18px">
      ${isOut
        ? "A SKU just hit zero. Public listing will show out-of-stock until restock."
        : "A SKU dipped at or below its threshold. Restock before the next batch sells through."}
    </p>

    <div style="background:#000;border:1px solid rgba(225,5,0,0.4);padding:18px 20px;margin:6px 0 20px">
      <div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.36em;margin-bottom:8px">${escapeHtml(severityLabel)}</div>
      <div style="color:#fff;font-size:18px;font-weight:700;margin-bottom:6px">${escapeHtml(name)}</div>
      <div style="color:#aaa;font-size:13px;line-height:1.6">
        ${product.sku ? `SKU: <span style="color:#eee;font-family:'Courier New',monospace">${escapeHtml(product.sku)}</span><br/>` : ""}
        ${product.brand ? `Brand: <span style="color:#eee">${escapeHtml(product.brand)}</span><br/>` : ""}
        ${product.category ? `Category: <span style="color:#eee">${escapeHtml(product.category)}</span><br/>` : ""}
        Stock: <span style="color:#E10500;font-weight:700">${currentStock}</span>
        <span style="color:#666"> / threshold ${threshold}</span>
      </div>
    </div>

    <p style="margin:0;color:#aaa;font-size:13px">
      Hit the inventory dashboard to restock or pause the listing.
    </p>
  `;

  const html = renderShell({
    preheader: `${severityLabel}: ${name} (${currentStock}/${threshold})`,
    eyebrow,
    heading: isOut ? "A product just sold out." : "Stock is running low.",
    bodyHtml,
    ctaLabel: "Open inventory",
    ctaHref: inventoryUrl,
    footerNote: "You're getting this because you own the shop. No action means the listing stays live until depleted."
  });

  const text = [
    `${severityLabel} — ${SITE.name}`,
    ``,
    `${name}${product.sku ? ` (${product.sku})` : ""}`,
    `Stock: ${currentStock} / threshold ${threshold}`,
    product.brand ? `Brand: ${product.brand}` : "",
    product.category ? `Category: ${product.category}` : "",
    ``,
    `Restock: ${inventoryUrl}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `[${SITE.shortName}] ${severityLabel}: ${name}`,
    html,
    text
  };
}
