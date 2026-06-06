"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, Phone, Mail, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { SITE_INFO, getWhatsAppLink } from "@/lib/data/site-info";
import { BackgroundFX } from "@/components/fx/BackgroundFX";
import { SectionHeader } from "@/components/ui/SectionHeader";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[+\d\s-]{7,}$/i, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  service: z.enum(["tuning", "service", "fabrication", "parts", "general"]),
  message: z.string().min(10, "Tell us a bit more (10 chars min)")
});

type FormValues = z.infer<typeof schema>;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
});

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: "general" }
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try WhatsApp or call us directly.");
    } finally {
      setBusy(false);
    }
  });

  const waLink = getWhatsAppLink("Hi 6T4 Customs — I'd like to get in touch.");

  return (
    <div className="relative min-h-screen bg-ink">
      <BackgroundFX variant="idle" dim={0.3} />

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <motion.p
            {...fade(0)}
            className="text-display text-[10px] uppercase tracking-[0.4em] text-neon"
          >
            Contact
          </motion.p>
          <motion.h1
            {...fade(0.06)}
            className="mt-4 text-stencil text-[clamp(3rem,8vw,7rem)] uppercase leading-none tracking-tight text-bone"
          >
            Come Find Us.
          </motion.h1>
          <motion.p
            {...fade(0.12)}
            className="mt-4 max-w-lg text-base text-bone/60"
          >
            Workshop in Bachupally, Hyderabad. Walk-ins welcome — appointments preferred for
            service and tuning jobs.
          </motion.p>
        </div>
      </section>

      {/* Info grid */}
      <section className="relative px-4 py-16 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Address */}
            <motion.div {...fade(0)} className="neon-edge relative border border-white/5 bg-carbon/80 p-6">
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
              <MapPin className="h-5 w-5 text-neon" />
              <p className="mt-4 text-display text-xs uppercase tracking-[0.2em] text-neon">
                Workshop
              </p>
              <p className="mt-2 text-sm text-bone/80">{SITE_INFO.address.street}</p>
              <p className="text-sm text-bone/80">{SITE_INFO.address.area}</p>
              <p className="text-sm text-bone/80">
                {SITE_INFO.address.city}, {SITE_INFO.address.state} {SITE_INFO.address.pin}
              </p>
              <a
                href={SITE_INFO.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neon hover:underline"
              >
                Open in Maps <ArrowRight className="h-3 w-3" />
              </a>
            </motion.div>

            {/* Hours */}
            <motion.div {...fade(0.06)} className="neon-edge relative border border-white/5 bg-carbon/80 p-6">
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
              <Clock className="h-5 w-5 text-neon" />
              <p className="mt-4 text-display text-xs uppercase tracking-[0.2em] text-neon">
                Hours
              </p>
              <p className="mt-2 text-sm text-bone/80">{SITE_INFO.hours.weekdays}</p>
              <p className="mt-1 text-sm text-bone/50">{SITE_INFO.hours.weekend}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-bone/40">
                {SITE_INFO.hours.note}
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div {...fade(0.12)} className="neon-edge relative border border-white/5 bg-carbon/80 p-6">
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
              <MessageCircle className="h-5 w-5 text-neon" />
              <p className="mt-4 text-display text-xs uppercase tracking-[0.2em] text-neon">
                Reach Us
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 bg-neon px-4 py-2 text-display text-[10px] uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp Us
              </a>
              <a
                href={`tel:${SITE_INFO.phone.replace(/\s/g, "")}`}
                className="mt-2 flex items-center gap-2 text-sm text-bone/70 hover:text-neon"
              >
                <Phone className="h-3 w-3 text-neon" /> {SITE_INFO.phone}
              </a>
              <a
                href={`mailto:${SITE_INFO.email}`}
                className="mt-2 flex items-center gap-2 text-sm text-bone/70 hover:text-neon"
              >
                <Mail className="h-3 w-3 text-neon" /> {SITE_INFO.email}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map embed */}
      <section className="relative px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative h-[320px] w-full overflow-hidden border border-white/5">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE_INFO.address.full)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="6T4 Customs workshop location"
            />
            <div className="pointer-events-none absolute inset-0 border border-neon/10" />
          </div>
          <a
            href={SITE_INFO.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/40 hover:text-neon"
          >
            {SITE_INFO.address.full} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Contact form */}
      <section className="relative px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader
            eyebrow="Enquiry"
            title="Drop Us a Message."
            subtitle="For service bookings, tuning queries, parts orders, or anything else — fill this out and we'll get back on WhatsApp."
          />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neon-edge relative mx-auto max-w-lg border border-neon/30 bg-neon-900/10 p-10 text-center"
            >
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
              <CheckCircle className="mx-auto h-10 w-10 text-neon" />
              <h3 className="mt-6 text-display text-xl font-bold uppercase text-bone">
                Message Sent.
              </h3>
              <p className="mt-2 text-sm text-bone/60">
                Arjun will be in touch via WhatsApp within 24 hours.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-bone/70 hover:border-neon hover:text-neon"
              >
                Back to Garage
              </Link>
            </motion.div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto max-w-2xl space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full Name *" error={formState.errors.name?.message}>
                  <input className="input" placeholder="Ravi Kumar" {...register("name")} />
                </Field>
                <Field label="Phone *" error={formState.errors.phone?.message}>
                  <input
                    className="input"
                    inputMode="tel"
                    placeholder="+91 98765 43210"
                    {...register("phone")}
                  />
                </Field>
                <Field label="Email (optional)" error={formState.errors.email?.message} className="md:col-span-2">
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                </Field>
                <Field label="Service Type" error={formState.errors.service?.message} className="md:col-span-2">
                  <select className="input" {...register("service")}>
                    <option value="tuning">Tuning / ECU Flash</option>
                    <option value="service">Service (Minor / Major)</option>
                    <option value="fabrication">Fabrication</option>
                    <option value="parts">Parts Order</option>
                    <option value="general">General Enquiry</option>
                  </select>
                </Field>
                <Field label="Message *" error={formState.errors.message?.message} className="md:col-span-2">
                  <textarea
                    className="input min-h-[120px] resize-y"
                    placeholder="Tell us your bike, what you need, and any timeline."
                    {...register("message")}
                  />
                </Field>
              </div>

              {submitError && (
                <p className="text-sm text-neon">
                  {submitError}{" "}
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline">
                    WhatsApp instead
                  </a>
                  .
                </p>
              )}

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={{ scale: 0.98 }}
                data-cursor="cta"
                className={cn(
                  "flex items-center gap-2 bg-neon px-8 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all",
                  busy ? "cursor-not-allowed opacity-50" : "hover:bg-white hover:shadow-neon-lg"
                )}
              >
                {busy ? "Sending…" : "Send Enquiry"} <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
          )}
        </div>
      </section>

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
          border-color: #ff0000;
          box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.15);
        }
        .input::placeholder {
          color: rgba(230, 230, 230, 0.3);
        }
        select.input option {
          background: #0a0a0a;
          color: #e6e6e6;
        }
      `}</style>
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
