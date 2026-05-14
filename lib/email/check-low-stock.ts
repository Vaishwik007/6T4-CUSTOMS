import { createAdminSupabase } from "@/lib/supabase/admin";
import { SITE } from "@/lib/seo/config";
import { sendEmail } from "./index";
import { lowStockAlert, type ProductForAlert } from "./templates/low-stock-alert";

/**
 * After a sale-side stock decrement, check whether the product is at/below
 * its low-stock threshold and, if so, alert the owner. De-duped within a
 * 24-hour window by inspecting the `notifications` table for an existing
 * `low_stock` row whose metadata.product_id matches.
 *
 * Best-effort: any failure is swallowed so checkout flows are unaffected.
 */
export async function checkAndAlertLowStock(productId: string): Promise<void> {
  if (!productId) return;
  const admin = createAdminSupabase();
  if (!admin) return;

  try {
    const { data: product, error: productErr } = await admin
      .from("products")
      .select("id, name, sku, brand, category, stock, low_stock_threshold")
      .eq("id", productId)
      .maybeSingle();
    if (productErr || !product) return;

    const currentStock = typeof product.stock === "number" ? product.stock : 0;
    const threshold =
      typeof product.low_stock_threshold === "number"
        ? product.low_stock_threshold
        : 5;

    // Only alert when at or below threshold.
    if (currentStock > threshold) return;

    // De-dupe: skip if we've already fired an alert for this SKU in the last 24h.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("type", "low_stock")
      .gte("created_at", since)
      .contains("metadata", { product_id: productId })
      .limit(1);
    if (recent && recent.length > 0) return;

    const ownerEmail = process.env.OWNER_EMAIL || SITE.email;
    const productForAlert: ProductForAlert = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category
    };
    const tpl = lowStockAlert(productForAlert, currentStock, threshold);

    // Fire email + persist admin-side notification in parallel.
    const [emailRes] = await Promise.all([
      sendEmail({
        to: ownerEmail,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text
      }),
      admin.from("notifications").insert({
        type: "low_stock",
        title: `Low stock: ${product.name ?? product.id}`,
        body: `Stock at ${currentStock} (threshold ${threshold}).`,
        severity: currentStock <= 0 ? "critical" : "warning",
        metadata: {
          product_id: productId,
          sku: product.sku ?? null,
          stock: currentStock,
          threshold
        }
      })
    ]);

    if (!emailRes.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[email] low-stock alert send failed for ${productId}: ${emailRes.error}`
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.warn(`[email] checkAndAlertLowStock failed for ${productId}: ${msg}`);
  }
}
