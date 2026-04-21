"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Smartphone, Store, Truck, MapPin } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getPartById } from "@/lib/data/parts";
import { formatPrice } from "@/lib/utils/formatPrice";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";

const schema = z.object({
  fullName: z.string().min(2, "Required"),
  phone: z.string().regex(/^[+\d\s-]{7,}$/i, "Enter a valid phone"),
  email: z.string().email("Valid email required"),
  address1: z.string().min(4, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pin: z.string().regex(/^\d{4,6}$/i, "Postal code"),
  delivery: z.enum(["in-shop", "delivery"]),
  payment: z.enum(["upi", "card", "pay-at-shop"]),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "in-shop", payment: "upi" }
  });

  const delivery = watch("delivery");
  const payment = watch("payment");

  const resolved = items
    .map((it) => ({ ...it, part: getPartById(it.partId) }))
    .filter((x) => x.part);
  const subtotal = resolved.reduce((s, x) => s + (x.part?.price ?? 0) * x.qty, 0);
  const delivFee = delivery === "delivery" ? 499 : 0;
  const total = subtotal + delivFee;

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resolved.map((r) => ({
            partId: r.partId,
            qty: r.qty,
            unitPrice: r.part?.price ?? 0,
            forBuild: r.forBuild ?? null
          })),
          total,
          ...values
        })
      });
      const data = (await res.json()) as { orderId: string };
      clear();
      router.push(`/order/${data.orderId}`);
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  });

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
            <div className="grid gap-3 md:grid-cols-3">
              <OptionCard
                active={payment === "upi"}
                onClick={() => setValue("payment", "upi")}
                title="UPI"
                sub="PhonePe / GPay / Paytm"
                icon={<Smartphone className="h-5 w-5" />}
              />
              <OptionCard
                active={payment === "card"}
                onClick={() => setValue("payment", "card")}
                title="Card"
                sub="Credit / Debit"
                icon={<CreditCard className="h-5 w-5" />}
              />
              <OptionCard
                active={payment === "pay-at-shop"}
                onClick={() => setValue("payment", "pay-at-shop")}
                title="Pay at Shop"
                sub="Settle on pickup"
                icon={<Store className="h-5 w-5" />}
              />
            </div>
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
              {resolved.slice(0, 8).map((r) => (
                <li key={r.partId} className="flex items-start justify-between gap-2">
                  <span className="text-bone/70">
                    <span className="text-neon">{r.qty}×</span> {r.part?.name}
                  </span>
                  <span className="shrink-0 text-bone/50">
                    {formatPrice((r.part?.price ?? 0) * r.qty)}
                  </span>
                </li>
              ))}
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

            <motion.button
              type="submit"
              disabled={busy || resolved.length === 0}
              data-cursor="cta"
              whileTap={{ scale: 0.98 }}
              className={cn(
                "mt-6 flex w-full items-center justify-center gap-2 bg-neon px-6 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all",
                (busy || resolved.length === 0) && "cursor-not-allowed opacity-40",
                !(busy || resolved.length === 0) && "hover:bg-white hover:shadow-neon-lg"
              )}
            >
              {busy ? "Locking…" : "Confirm & Lock In"} <ArrowRight className="h-4 w-4" />
            </motion.button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-bone/40">
              Owner confirms on WhatsApp
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
      <div className={cn("grid h-10 w-10 place-items-center border", active ? "border-neon text-neon" : "border-white/10 text-bone/60")}>
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
