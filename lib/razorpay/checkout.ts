/**
 * Client-side helpers for loading Razorpay Checkout.js and invoking
 * the payment modal. Keeps the Razorpay type surface narrow so the
 * checkout page doesn't have to depend on the razorpay package.
 */

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayOptions = {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; confirm_close?: boolean; escape?: boolean };
  retry?: { enabled?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
  close: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("razorpay_script_failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("razorpay_script_failed"));
    };
    document.head.appendChild(s);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("razorpay_not_loaded");
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (payload) => {
    // Surface failures via the ondismiss path — the handler only fires on success.
    console.error("Razorpay payment failed", payload);
  });
  rzp.open();
}
