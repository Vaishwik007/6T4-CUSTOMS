/**
 * Analytics event taxonomy. Fire client-side via `track(event)`. Forwards to
 * any configured providers (PostHog, GA4, dataLayer). Server-side analytics
 * for purchases lives in /api/razorpay/verify and posts a separate event.
 *
 * Add providers here without touching call sites.
 */

declare global {
  interface Window {
    posthog?: { capture: (name: string, props?: Record<string, unknown>) => void };
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type AnalyticsEvent =
  | { name: "view_home" }
  | { name: "view_parts_browse"; filters?: Record<string, unknown> }
  | { name: "view_part"; product_id: string; brand: string; category: string; price: number; in_stock: boolean }
  | { name: "view_service"; service_slug: string }
  | { name: "configurator_start" }
  | { name: "configurator_step"; step: 1 | 2 | 3 | 4; brand?: string; model?: string; year?: number }
  | { name: "configurator_complete"; brand: string; model: string; year: number; parts_count: number; total: number }
  | { name: "add_to_cart"; product_id: string; price: number; qty: number }
  | { name: "remove_from_cart"; product_id: string }
  | { name: "view_cart"; item_count: number; total: number }
  | { name: "begin_checkout"; total: number; item_count: number }
  | { name: "checkout_step_complete"; step: 1 | 2 | 3 }
  | { name: "razorpay_open"; order_id: string; total: number }
  | { name: "razorpay_success"; order_id: string; payment_id: string; total: number }
  | { name: "razorpay_failure"; order_id: string; reason?: string }
  | { name: "purchase"; order_id: string; total: number; item_count: number }
  | { name: "booking_view_service"; service_slug: string }
  | { name: "booking_submit"; service_slug: string; ref: string }
  | { name: "review_submit"; product_id?: string; rating: number }
  | { name: "whatsapp_open"; from: string }
  | { name: "search"; query: string; results_count: number }
  | { name: "filter_apply"; key: string; value: string };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const { name, ...props } = event;

  try {
    window.posthog?.capture(name, props);
  } catch {
    /* swallow */
  }
  try {
    window.gtag?.("event", name, props);
  } catch {
    /* swallow */
  }
  try {
    window.dataLayer?.push({ event: name, ...props });
  } catch {
    /* swallow */
  }
}

/**
 * Map our internal event names to GA4-canonical ecommerce events. Optional
 * but helps run paid campaigns + integrate with Meta Pixel later.
 */
export const GA4_ALIASES: Partial<Record<AnalyticsEvent["name"], string>> = {
  view_part: "view_item",
  add_to_cart: "add_to_cart",
  begin_checkout: "begin_checkout",
  purchase: "purchase"
};
