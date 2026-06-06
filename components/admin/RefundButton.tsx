"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

type Props = {
  orderId: string;
  /** Order total in INR (rupees, not paise). Used as the default refund amount. */
  amount: number;
  disabled?: boolean;
  className?: string;
};

type Toast = { tone: "ok" | "err"; text: string } | null;

/**
 * Tertiary action button mounted on each paid order row. Opens a confirm
 * modal, then POSTs to /api/admin/refund. Refreshes the route on success.
 */
export function RefundButton({ orderId, amount, disabled, className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [amountInr, setAmountInr] = useState<number>(amount);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    setAmountInr(amount);
  }, [amount]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async () => {
    if (!Number.isFinite(amountInr) || amountInr <= 0) {
      setToast({ tone: "err", text: "Amount must be greater than 0." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: Math.round(amountInr),
          reason: reason.trim() || undefined
        })
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        refundId?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setToast({ tone: "err", text: json.error ?? "Refund failed" });
        setBusy(false);
        return;
      }
      setToast({
        tone: "ok",
        text: `Refunded ${formatPrice(amountInr)} — ${json.refundId ?? ""}`
      });
      setOpen(false);
      setReason("");
      router.refresh();
    } catch {
      setToast({ tone: "err", text: "Network error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label="Refund order"
        title="Refund order"
        className={cn(
          "grid h-8 w-8 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-bone/70",
          className
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm refund"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md border border-neon/40 bg-black/95 shadow-neon">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
                  Refund
                </p>
                <h2 className="mt-1 text-display text-lg font-bold uppercase">
                  Confirm refund
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5">
              <p className="text-xs text-bone/60">
                This refunds the customer via Razorpay, marks the payment as
                refunded, and reverses inventory if the order was confirmed.
                This action cannot be undone.
              </p>

              <label className="block">
                <span className="text-display text-[10px] uppercase tracking-[0.3em] text-bone/60">
                  Amount (INR)
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={amountInr}
                  onChange={(e) => setAmountInr(Number(e.target.value))}
                  className="mt-2 w-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-bone outline-none focus:border-neon"
                />
                <span className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-bone/40">
                  Order total {formatPrice(amount)}
                </span>
              </label>

              <label className="block">
                <span className="text-display text-[10px] uppercase tracking-[0.3em] text-bone/60">
                  Reason (optional)
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={280}
                  placeholder="Customer request, damaged in transit, …"
                  className="mt-2 w-full resize-none border border-white/10 bg-black/40 px-3 py-2 text-sm text-bone outline-none focus:border-neon"
                />
              </label>
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-bone/70 hover:border-bone hover:text-bone disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="border border-neon bg-neon-900/30 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-neon transition-colors hover:bg-neon hover:text-black disabled:opacity-50"
              >
                {busy ? "Refunding…" : "Confirm refund"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-4 right-4 z-50 max-w-sm border px-4 py-3 text-xs shadow-neon-sm",
            toast.tone === "ok"
              ? "border-green-500/60 bg-black/95 text-green-400"
              : "border-red-700 bg-black/95 text-red-400"
          )}
        >
          {toast.text}
        </div>
      )}
    </>
  );
}
