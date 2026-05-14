"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MessageCircle, ShieldCheck } from "lucide-react";
import type { Service } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import { SITE } from "@/lib/seo/config";

const schema = z.object({
  serviceSlug: z.string().min(1, "Pick a service"),
  fullName: z.string().min(2, "Required"),
  phone: z.string().regex(/^[+\d\s-]{7,}$/i, "Enter a valid phone"),
  email: z.string().email("Valid email required"),
  bike: z.string().min(2, "Tell us your bike + year"),
  preferredDate: z.string().min(1, "Pick a date"),
  preferredWindow: z.enum(["morning", "afternoon", "evening"]),
  notes: z.string().max(800).optional()
});

type FormValues = z.infer<typeof schema>;

const TODAY = new Date().toISOString().slice(0, 10);
const MAX = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

export function BookingForm({
  services,
  preselectedSlug
}: {
  services: Service[];
  preselectedSlug?: string;
}) {
  const [submitted, setSubmitted] = useState<null | {
    waHref: string;
    service: Service;
    bookingRef: string;
  }>(null);

  const { register, handleSubmit, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceSlug: preselectedSlug ?? "",
      preferredWindow: "morning",
      preferredDate: TODAY
    }
  });

  const selectedSlug = watch("serviceSlug");
  const selected = useMemo(
    () => services.find((s) => s.slug === selectedSlug),
    [services, selectedSlug]
  );

  const onSubmit = handleSubmit((values) => {
    const ref =
      "6T4-B-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const svc = services.find((s) => s.slug === values.serviceSlug)!;
    const msg = [
      `Hi 6T4 — booking request ${ref}`,
      `Service: ${svc.name}`,
      `Bike: ${values.bike}`,
      `Preferred: ${values.preferredDate} (${values.preferredWindow})`,
      `Name: ${values.fullName}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      values.notes ? `Notes: ${values.notes}` : null
    ]
      .filter(Boolean)
      .join("\n");
    const waHref = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    setSubmitted({ waHref, service: svc, bookingRef: ref });
  });

  if (submitted) {
    return (
      <div className="border border-neon/40 bg-carbon p-8 text-center">
        <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Reserved</p>
        <h2 className="mt-2 text-display text-2xl font-bold uppercase md:text-3xl">
          Confirmation Pending
        </h2>
        <p className="mt-2 text-stencil text-3xl text-neon">{submitted.bookingRef}</p>
        <p className="mt-6 max-w-md mx-auto text-sm text-bone/70">
          We've prepared your booking request. Send it through on WhatsApp and Arjun will
          confirm the exact slot for your <b className="text-bone">{submitted.service.name}</b> within
          an hour during business hours.
        </p>
        <a
          href={submitted.waHref}
          target="_blank"
          rel="noopener"
          data-cursor="cta"
          className="mt-6 inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
        >
          <MessageCircle className="h-4 w-4" /> Send on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {/* Service picker */}
      <Section title="Service">
        <ul className="grid gap-2 md:grid-cols-2">
          {services.map((s) => {
            const active = selectedSlug === s.slug;
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => setValue("serviceSlug", s.slug, { shouldValidate: true })}
                  className={cn(
                    "w-full border p-4 text-left transition-colors",
                    active
                      ? "border-neon bg-neon-900/15"
                      : "border-white/10 hover:border-white/30 bg-black/30"
                  )}
                >
                  <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                    {s.category}
                  </p>
                  <p className="mt-1 text-display text-sm font-bold uppercase tracking-wider">
                    {s.name}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
                    {s.requiresQuote ? "Quote" : (s.priceLabel ?? formatPrice(s.basePrice))}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {formState.errors.serviceSlug && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-neon">
            {formState.errors.serviceSlug.message}
          </p>
        )}
      </Section>

      {/* Bike */}
      <Section title="Bike">
        <Field label="Brand · Model · Year" error={formState.errors.bike?.message}>
          <input
            className="input"
            placeholder="e.g. KTM 390 Duke 2023"
            {...register("bike")}
          />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" error={formState.errors.fullName?.message}>
            <input className="input" {...register("fullName")} />
          </Field>
          <Field label="Phone" error={formState.errors.phone?.message}>
            <input className="input" inputMode="tel" placeholder="+91..." {...register("phone")} />
          </Field>
          <Field label="Email" error={formState.errors.email?.message} className="md:col-span-2">
            <input className="input" type="email" {...register("email")} />
          </Field>
        </div>
      </Section>

      {/* Slot */}
      <Section title="When">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Preferred Date" error={formState.errors.preferredDate?.message}>
            <input
              className="input"
              type="date"
              min={TODAY}
              max={MAX}
              {...register("preferredDate")}
            />
          </Field>
          <Field label="Window" error={formState.errors.preferredWindow?.message}>
            <select className="input" {...register("preferredWindow")}>
              <option value="morning">Morning (10am – 1pm)</option>
              <option value="afternoon">Afternoon (1pm – 5pm)</option>
              <option value="evening">Evening (5pm – 8pm)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Notes */}
      <Section title="Notes (optional)">
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder="Anything we should know — previous tunes, preferred maps, parts already with you, etc."
          {...register("notes")}
        />
      </Section>

      {/* Submit */}
      <div className="flex flex-col items-stretch gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <ShieldCheck className="h-3 w-3 text-neon" />
          We confirm on WhatsApp · no charge until confirmed
        </p>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          data-cursor="cta"
          className="inline-flex items-center justify-center gap-2 bg-neon px-8 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
        >
          <Calendar className="h-4 w-4" /> Reserve Slot <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>

      {selected && selected.requiresQuote && (
        <p className="border border-ignition/40 bg-ignition/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-ignition">
          This service is quote-based. Submit the form and we'll send a written quote on WhatsApp.
        </p>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e6e6e6;
          padding: 12px 14px;
          font-family: var(--font-inter);
          transition: border-color 200ms, box-shadow 200ms;
          outline: none;
        }
        .input:focus {
          border-color: #E10500;
          box-shadow: 0 0 0 3px rgba(225, 5, 0, 0.15);
        }
        .input::placeholder {
          color: rgba(230, 230, 230, 0.3);
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/5 bg-carbon/60 p-6">
      <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">{title}</h3>
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
