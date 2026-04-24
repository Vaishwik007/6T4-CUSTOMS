"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  Store,
  Truck,
  MapPin,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getPartById } from "@/lib/data/parts";
import { formatPrice } from "@/lib/utils/formatPrice";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";
import { useLiveStock } from "@/lib/hooks/useLiveStock";
import { openRazorpayCheckout } from "@/lib/razorpay/checkout";

const schema = z.object({
  fullName: z.string().min(2, "Required"),
  phone: z.string().regex(/^[+\d\s-]{7,}$/i, "Enter a valid phone"),
  email: z.string().email("Valid email required"),
  address1: z.string().min(4, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pin: z.string().regex(/^\d{4,6}$/i, "Postal code"),
  delivery: z.enum(["in-shop", "delivery"]),
  payment: z.enum(["razorpay", "pay-at-shop"]),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "in-shop", payment: "razorpay" }
  });

  const delivery = watch("delivery");
  const payment = watch("payment");

  const resolved = useMemo(
    () =>
      items
        .map((it) => ({ ...it, part: getPartById(it.partId) }))
        .filter((x): x is typeof x & { part: NonNullable<typeof x.part> } => !!x.part),
    [items]
  );

  const { stock: liveStock, configured: stockConfigured } = useLiveStock(
    resolved.map((r) => r.partId)
  );

  const outOfStock = resolved.filter((r) => {
    if (!stockConfigured) return false;
    const live = liveStock[r.partId];
    return !live || !live.active || live.stock < r.qty;
  });

  const subtotal = resolved.reduce((s, x) => {
    const live = liveStock[x.partId];
    const unit = live?.price ?? x.part.price;
    return s + unit * x.qty;
  }, 0);
  const delivFee = delivery === "delivery" ? 499 : 0;
  const total = subtotal + delivFee;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (resolved.length === 0) return;
    if (outOfStock.length > 0) {
      setError("Some items are out of stock. Update your cart to continue.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        items: resolved.map((r) => ({
          partId: r.partId,
          qty: r.qty,
          unitPrice: r.part.price,
          forBuild: r.forBuild ?? null
        })),
        total,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        address1: values.address1,
        city: values.city,
        state: values.state,
        pin: values.pin,
        delivery: values.delivery,
        notes: values.notes
      };

      if (values.payment === "pay-at-shop") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, payment: "pay-at-shop" })
        });
        if (!res.ok) throw new Error(`checkout_failed_${res.status}`);
        const data = (await res.json()) as { orderId: string };
        clear();
        router.push(`/order/${data.orderId}`);
        return;
      }

      // Razorpay flow
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `create_order_failed_${res.status}`);
      }
      const data = (await res.json()) as {
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
        prefill: { name: string; email: string; contact: string };
      };

      await openRazorpayCheckout({
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: "6T4 Customs",
        description: "Parts + Install",
        order_id: data.razorpayOrderId,
        prefill: data.prefill,
        theme: { color: "#ff0000" },
        modal: {
          confirm_close: true,
          escape: true,
          ondismiss: () => setBusy(false)
        },
        handler: async (resp) => {
          try {
            const vr = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature
              })
            });
            const vj = (await vr.json().catch(() => ({}))) as {
              success?: boolean;
              error?: string;
              refunded?: boolean;
            };
            if (!vr.ok || !vj.success) {
              const msg = vj.refunded
                ? "Oversold — you've been refunded automatically."
                : vj.error ?? "Payment verification failed.";
              setError(msg);
              setBusy(false);
              router.push(`/thank-you?orderId=${data.orderId}&status=failed`);
              return;
            }
            clear();
            router.push(`/thank-you?orderId=${data.orderId}`);
          } catch (err) {
            console.error(err);
            setError("Could not verify payment. If you were charged, contact us on WhatsApp.");
            setBusy(false);
          }
        }
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "unknown_error";
      setError(humanError(msg));
      setBusy(false);
    }
  });

  const canSubmit = !busy && resolved.length > 0 && outOfStock.length === 0;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <SectionHeader
        eyebrow="Checkout"
        title="Lock it in."
        subtitle="Bay slot reserved on confirmation. Owner will verify on WhatsApp."
      />

      <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Address */}
          <Section title="Address" icon={<MapPin className="h-4 w-4" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name" error={formState.errors.fullName?.message}>
                <input className="input" {...register("fullName")} />
              </Field>
              <Field label="Phone" error={formState.errors.phone?.message}>
                <input className="input" inputMode="tel" {...register("phone")} />
              </Field>
              <Field label="Email" error={formState.errors.email?.message} className="md:col-span-2">
                <input className="input" type="email" {...register("email")} />
              </Field>
              <Field
                label="Street Address"
                error={formState.errors.address1?.message}
                className="md:col-span-2"
              >
                <input className="input" {...register("address1")} />
              </Field>
              <Field label="City" error={formState.errors.city?.message}>
                <input className="input" {...register("city")} />
              </Field>
              <Field label="State" error={formState.errors.state?.message}>
                <input className="input" {...register("state")} />
              </Field>
              <Field label="Postal Code" error={formState.errors.pin?.message}>
                <input className="input" inputMode="numeric" {...register("pin")} />
              </Field>
            </div>
          </Section>

          {/* Delivery */}
          <Section title="Delivery" icon={<Truck className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              <OptionCard
                active={delivery === "in-shop"}
                onClick={() => setValue("delivery", "in-shop")}
                title="In-Shop Install"
                sub="Bring your bike. We fit and tune on bay."
                icon={<Store className="h-5 w-5" />}
                price="Free"
              />
              <OptionCard
                active={delivery === "delivery"}
                onClick={() => setValue("delivery", "delivery")}
                title="Courier Delivery"
                sub="Parts shipped. Install yourself or at a workshop."
                icon={<Truck className="h-5 w-5" />}
                price="₹499"
              />
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={<CreditCard className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              <OptionCard
                active={payment === "razorpay"}
                onClick={() => setValue("payment", "razorpay")}
                title="Pay Online"
                sub="UPI · Cards · Netbanking · Wallets (Razorpay)"
                icon={<ShieldCheck className="h-5 w-5" />}
                price="Secure"
              />
              <OptionCard
                active={payment === "pay-at-shop"}
                onClick={() => setValue("payment", "pay-at-shop")}
                title="Pay at Shop"
                sub="Settle on pickup / install day"
                icon={<Store className="h-5 w-5" />}
              />
            </div>
            {payment === "razorpay" && (
              <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
                <ShieldCheck className="h-3 w-3 text-neon" /> PCI-DSS via Razorpay · No card data touches our servers
              </p>
            )}
          </Section>

          <Section title="Notes (optional)">
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Anything the team should know — previous tuning, preferred maps, timeline."
              {...register("notes")}
            />
          </Section>
        </div>

        {/* Summary */}
        <aside className="sticky top-24 h-max">
          <div className="neon-edge relative border border-white/5 bg-carbon p-6">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

            <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">Summary</p>
            <h2 className="mt-2 text-display text-2xl font-bold uppercase">Your Build</h2>

            <ul className="mt-6 space-y-2 text-xs">
              {resolved.slice(0, 8).map((r) => {
                const live = liveStock[r.partId];
                const isOut =
                  stockConfigured && (!live || !live.active || live.stock < r.qty);
                const isLow = !isOut && stockConfigured && live?.low;
                return (
                  <li key={r.partId} className="flex items-start justify-between gap-2">
                    <span className="text-bone/70">
                      <span className="text-neon">{r.qty}×</span> {r.part.name}
                      {isOut && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Out
                        </span>
                      )}
                      {isLow && (
                        <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-amber-400">
                          Low · {live?.stock} left
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-bone/50">
                      {formatPrice((live?.price ?? r.part.price) * r.qty)}
                    </span>
                  </li>
                );
              })}
              {resolved.length > 8 && (
                <li className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
                  +{resolved.length - 8} more
                </li>
              )}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
              <Row k="Subtotal" v={formatPrice(subtotal)} />
              <Row k="Delivery" v={delivFee === 0 ? "Free" : formatPrice(delivFee)} />
              <Row k="Total" v={formatPrice(total)} big />
            </dl>

            {outOfStock.length > 0 && (
              <p className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
                <AlertTriangle className="h-3 w-3" />
                {outOfStock.length} item(s) out of stock
              </p>
            )}
            {error && (
              <p className="mt-4 border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={!canSubmit}
              data-cursor="cta"
              whileTap={canSubmit ? { scale: 0.98 } : undefined}
              className={cn(
                "mt-6 flex w-full items-center justify-center gap-2 bg-neon px-6 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all",
                !canSubmit && "cursor-not-allowed opacity-40",
                canSubmit && "hover:bg-white hover:shadow-neon-lg"
              )}
            >
              {busy
                ? "Processing…"
                : payment === "razorpay"
                  ? `Pay ${formatPrice(total)}`
                  : "Confirm & Lock In"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-bone/40">
              {payment === "razorpay"
                ? "Secure payment · Powered by Razorpay"
                : "Owner confirms on WhatsApp"}
            </p>
          </div>
        </aside>
      </form>

      {/* input style */}
      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e6e6e6;
          padding: 12px 14px;
          font-family: var(--font-inter);
          transition:
            border-color 200ms,
            box-shadow 200ms;
          outline: none;
        }
        .input:focus {
          border-color: #ff0000;
          box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.15);
        }
        .input::placeholder {
          color: rgba(230, 230, 230, 0.3);
        }
      `}</style>
    </section>
  );
}

function humanError(code: string): string {
  switch (code) {
    case "razorpay_not_configured":
      return "Online payment is temporarily unavailable. Pick 'Pay at Shop' to continue.";
    case "supabase_not_configured":
      return "Order service is warming up. Try again in a moment.";
    case "insufficient_stock":
      return "One of your items just sold out. Refresh and adjust quantities.";
    case "order_mismatch":
      return "Order mismatch detected. Start over to continue.";
    case "signature_mismatch":
      return "We couldn't verify the payment signature. Contact us on WhatsApp.";
    default:
      return "Something went wrong. Please try again or contact us on WhatsApp.";
  }
}

function Section({
  title,
  icon,
  children
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/5 bg-carbon/60 p-6">
      <h3 className="mb-5 flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[10px] text-neon">{error}</span>}
    </label>
  );
}

function OptionCard({
  active,
  onClick,
  title,
  sub,
  icon,
  price
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  icon: React.ReactNode;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="cta"
      className={cn(
        "neon-edge relative flex items-center gap-4 border p-4 text-left transition-all",
        active
          ? "border-neon bg-neon-900/20 text-bone"
          : "border-white/10 bg-black/20 text-bone/80 hover:border-neon/60"
      )}
      data-active={active}
    >
      <div
        className={cn(
          "grid h-10 w-10 place-items-center border",
          active ? "border-neon text-neon" : "border-white/10 text-bone/60"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-display text-sm font-bold uppercase tracking-wider">{title}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bone/50">{sub}</div>
      </div>
      {price && <div className="text-stencil text-sm text-neon">{price}</div>}
    </button>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn(big ? "text-display text-xs uppercase tracking-[0.3em]" : "text-bone/60")}>
        {k}
      </dt>
      <dd className={cn(big ? "text-stencil text-2xl text-neon" : "text-bone")}>{v}</dd>
    </div>
  );
}
