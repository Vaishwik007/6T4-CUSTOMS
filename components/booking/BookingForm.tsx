"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Loader2,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import type { Service } from "@/lib/services/catalog";
import { BRANDS, MODELS } from "@/lib/data";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics/events";

type StepId = 1 | 2 | 3 | 4 | 5;

interface BikeInfo {
  brandSlug: string;
  modelSlug: string;
  year: number;
  plate: string;
}

interface Slot {
  start: string;
  end: string;
  bay: number;
}

interface ContactInfo {
  fullName: string;
  phone: string;
  email: string;
}

interface SubmittedState {
  bookingRef: string;
  bookingId: string;
  service: Service;
  slot: Slot;
}

const STEP_LABELS: Record<StepId, string> = {
  1: "Service",
  2: "Bike",
  3: "Contact",
  4: "Date",
  5: "Slot"
};

const PHONE_RE = /^[+\d\s-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLATE_RE = /^[A-Z0-9- ]{4,20}$/i;

function todayIstKey(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return fmt.format(new Date()); // YYYY-MM-DD in IST
}

function dateKeyAddDays(baseKey: string, days: number): string {
  const [y, m, d] = baseKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

const TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata"
});

const DATE_LABEL_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kolkata"
});

function fmtSlotTime(iso: string): string {
  try {
    return TIME_FMT.format(new Date(iso));
  } catch {
    return iso;
  }
}

function fmtDateLabel(key: string): string {
  // Parse the YYYY-MM-DD as a naive IST date so the weekday matches the picker label.
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 6, 30)); // noon-ish IST
  try {
    return DATE_LABEL_FMT.format(dt);
  } catch {
    return key;
  }
}

export function BookingForm({
  services,
  preselectedSlug
}: {
  services: Service[];
  preselectedSlug?: string;
}) {
  const [step, setStep] = useState<StepId>(1);
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);

  const [serviceSlug, setServiceSlug] = useState<string>(preselectedSlug ?? "");
  const [bike, setBike] = useState<BikeInfo>({
    brandSlug: "",
    modelSlug: "",
    year: new Date().getFullYear(),
    plate: ""
  });
  const [contact, setContact] = useState<ContactInfo>({
    fullName: "",
    phone: "",
    email: ""
  });
  const [dateKey, setDateKey] = useState<string>(todayIstKey());
  const [slot, setSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState<string>("");

  const [availability, setAvailability] = useState<{
    loading: boolean;
    slots: Slot[];
    error: string | null;
  }>({ loading: false, slots: [], error: null });
  const [submitState, setSubmitState] = useState<{
    submitting: boolean;
    error: string | null;
  }>({ submitting: false, error: null });

  const selectedService = useMemo(
    () => services.find((s) => s.slug === serviceSlug) ?? null,
    [services, serviceSlug]
  );

  const modelsForBrand = useMemo(
    () => MODELS.filter((m) => m.brand === bike.brandSlug),
    [bike.brandSlug]
  );

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const out: number[] = [];
    for (let y = current + 1; y >= 1990; y--) out.push(y);
    return out;
  }, []);

  const dateOptions = useMemo(() => {
    const start = todayIstKey();
    return Array.from({ length: 14 }, (_, i) => dateKeyAddDays(start, i));
  }, []);

  // Fetch availability when the date or service changes after step 4.
  useEffect(() => {
    if (!selectedService) return;
    if (step !== 5) return;
    let cancelled = false;
    setAvailability({ loading: true, slots: [], error: null });
    setSlot(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/booking/availability?service=${encodeURIComponent(selectedService.slug)}&date=${dateKey}`,
          { cache: "no-store" }
        );
        const json = (await res.json().catch(() => ({}))) as {
          slots?: Slot[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setAvailability({
            loading: false,
            slots: [],
            error:
              json.error === "rate_limited"
                ? "Too many requests — wait a moment."
                : "Couldn't load slots. Try a different date."
          });
          return;
        }
        setAvailability({
          loading: false,
          slots: json.slots ?? [],
          error: null
        });
      } catch {
        if (cancelled) return;
        setAvailability({
          loading: false,
          slots: [],
          error: "Network error — check connection and retry."
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedService, dateKey, step]);

  // Step validation gates the Next button. Returns null when ok, or an error label.
  const stepError = useMemo(() => {
    if (step === 1) {
      return serviceSlug ? null : "Pick a service to continue.";
    }
    if (step === 2) {
      if (!bike.brandSlug) return "Pick your brand.";
      if (!bike.modelSlug) return "Pick your model.";
      if (!bike.year || bike.year < 1990) return "Choose a year.";
      if (bike.plate && !PLATE_RE.test(bike.plate)) return "Plate format looks off.";
      return null;
    }
    if (step === 3) {
      if (contact.fullName.trim().length < 2) return "Full name required.";
      if (!PHONE_RE.test(contact.phone)) return "Phone format looks off.";
      if (!EMAIL_RE.test(contact.email)) return "Email looks off.";
      return null;
    }
    if (step === 4) {
      return dateOptions.includes(dateKey) ? null : "Pick a date in the next 14 days.";
    }
    if (step === 5) {
      return slot ? null : "Pick an available slot.";
    }
    return null;
  }, [step, serviceSlug, bike, contact, dateKey, dateOptions, slot]);

  function goNext() {
    if (stepError) return;
    if (step < 5) setStep((s) => (Math.min(5, s + 1) as StepId));
  }
  function goBack() {
    if (step > 1) setStep((s) => (Math.max(1, s - 1) as StepId));
  }

  async function submitBooking() {
    if (!selectedService || !slot) return;
    setSubmitState({ submitting: true, error: null });
    try {
      const body = {
        serviceSlug: selectedService.slug,
        scheduledFor: slot.start,
        bayNumber: slot.bay,
        fullName: contact.fullName.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        bikeInfo: {
          brandSlug: bike.brandSlug,
          modelSlug: bike.modelSlug,
          year: bike.year,
          plate: bike.plate.trim() || undefined
        },
        notes: notes.trim() || undefined
      };
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        bookingId?: string;
        bookingRef?: string;
        error?: string;
        message?: string;
      };

      if (!res.ok || !json.ok || !json.bookingRef || !json.bookingId) {
        let msg = json.message ?? json.error ?? "Couldn't reserve that slot.";
        if (json.error === "slot_taken") {
          // Refresh availability so the user can re-pick without backing out.
          setSubmitState({
            submitting: false,
            error: msg
          });
          setStep(5);
          setSlot(null);
          // Re-fetch availability.
          setAvailability({ loading: true, slots: [], error: null });
          try {
            const refresh = await fetch(
              `/api/booking/availability?service=${encodeURIComponent(selectedService.slug)}&date=${dateKey}`,
              { cache: "no-store" }
            );
            const refreshJson = (await refresh.json().catch(() => ({}))) as {
              slots?: Slot[];
            };
            setAvailability({
              loading: false,
              slots: refreshJson.slots ?? [],
              error: null
            });
          } catch {
            setAvailability({
              loading: false,
              slots: [],
              error: "Refresh failed — pick another date."
            });
          }
          return;
        }
        if (json.error === "rate_limited") {
          msg = "Too many bookings from this network. Try again in an hour.";
        }
        setSubmitState({ submitting: false, error: msg });
        return;
      }

      track({
        name: "booking_submit",
        service_slug: selectedService.slug,
        ref: json.bookingRef
      });

      setSubmitted({
        bookingId: json.bookingId,
        bookingRef: json.bookingRef,
        service: selectedService,
        slot
      });
    } catch {
      setSubmitState({
        submitting: false,
        error: "Network error — try again in a moment."
      });
    }
  }

  if (submitted) {
    return (
      <ConfirmationCard
        bookingRef={submitted.bookingRef}
        service={submitted.service}
        slot={submitted.slot}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <Stepper currentStep={step} />

      {step === 1 && (
        <Section title="Pick a service">
          <ul className="grid gap-2 md:grid-cols-2">
            {services.map((s) => {
              const active = serviceSlug === s.slug;
              return (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => setServiceSlug(s.slug)}
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
                      {s.requiresQuote
                        ? "Quote"
                        : (s.priceLabel ?? formatPrice(s.basePrice))}{" "}
                      · {s.durationMinutes} min
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          {selectedService?.requiresQuote && (
            <p className="mt-3 border border-ignition/40 bg-ignition/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-ignition">
              Quote-based service. Slot lets us bench-inspect; final price agreed on WhatsApp.
            </p>
          )}
        </Section>
      )}

      {step === 2 && (
        <Section title="Your bike">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand">
              <select
                className="input"
                value={bike.brandSlug}
                onChange={(e) =>
                  setBike((b) => ({ ...b, brandSlug: e.target.value, modelSlug: "" }))
                }
              >
                <option value="">Pick a brand</option>
                {BRANDS.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Model">
              <select
                className="input"
                value={bike.modelSlug}
                onChange={(e) => setBike((b) => ({ ...b, modelSlug: e.target.value }))}
                disabled={!bike.brandSlug}
              >
                <option value="">
                  {bike.brandSlug ? "Pick a model" : "Pick brand first"}
                </option>
                {modelsForBrand.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <select
                className="input"
                value={bike.year}
                onChange={(e) => setBike((b) => ({ ...b, year: Number(e.target.value) }))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Plate (optional)">
              <input
                className="input"
                value={bike.plate}
                onChange={(e) => setBike((b) => ({ ...b, plate: e.target.value.toUpperCase() }))}
                placeholder="TS09-XX-1234"
                maxLength={20}
              />
            </Field>
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title="Contact">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <input
                className="input"
                value={contact.fullName}
                onChange={(e) =>
                  setContact((c) => ({ ...c, fullName: e.target.value }))
                }
                maxLength={120}
              />
            </Field>
            <Field label="Phone">
              <input
                className="input"
                inputMode="tel"
                value={contact.phone}
                placeholder="+91..."
                onChange={(e) =>
                  setContact((c) => ({ ...c, phone: e.target.value }))
                }
              />
            </Field>
            <Field label="Email" className="md:col-span-2">
              <input
                className="input"
                type="email"
                value={contact.email}
                onChange={(e) =>
                  setContact((c) => ({ ...c, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Notes (optional)" className="md:col-span-2">
              <textarea
                className="input min-h-[100px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know — preferred maps, parts already with you, etc."
                maxLength={2000}
              />
            </Field>
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section title="Pick a date">
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {dateOptions.map((key) => {
              const active = dateKey === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setDateKey(key)}
                    className={cn(
                      "w-full border p-3 text-center transition-colors",
                      active
                        ? "border-neon bg-neon-900/15 text-bone"
                        : "border-white/10 hover:border-white/30 bg-black/30 text-bone/80"
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">
                      {fmtDateLabel(key).split(" ")[0]}
                    </p>
                    <p className="mt-1 text-display text-sm font-bold uppercase tracking-wider">
                      {fmtDateLabel(key).split(" ").slice(1).join(" ")}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {step === 5 && (
        <Section title={`Available slots — ${fmtDateLabel(dateKey)}`}>
          {availability.loading && (
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-bone/60">
              <Loader2 className="h-3 w-3 animate-spin text-neon" /> Loading slots…
            </p>
          )}

          {!availability.loading && availability.error && (
            <p className="border border-neon/40 bg-neon-900/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-neon">
              {availability.error}
            </p>
          )}

          {!availability.loading &&
            !availability.error &&
            availability.slots.length === 0 && (
              <p className="text-[11px] uppercase tracking-[0.3em] text-bone/60">
                No bays open on that day. Try another date.
              </p>
            )}

          {!availability.loading && availability.slots.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {availability.slots.map((s) => {
                const active =
                  slot && slot.start === s.start && slot.bay === s.bay;
                return (
                  <li key={`${s.start}-${s.bay}`}>
                    <button
                      type="button"
                      onClick={() => setSlot(s)}
                      className={cn(
                        "w-full border p-3 text-left transition-colors",
                        active
                          ? "border-neon bg-neon-900/15"
                          : "border-white/10 hover:border-white/30 bg-black/30"
                      )}
                    >
                      <p className="text-display text-sm font-bold uppercase tracking-wider">
                        {fmtSlotTime(s.start)}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
                        Bay {s.bay}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {submitState.error && (
            <p className="mt-4 border border-neon/40 bg-neon-900/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-neon">
              {submitState.error}
            </p>
          )}
        </Section>
      )}

      {/* Nav controls */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <ShieldCheck className="h-3 w-3 text-neon" />
          Arjun will WhatsApp to confirm · no charge until confirmed
        </p>
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-bone hover:border-white/40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          {step < 5 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={goNext}
              disabled={Boolean(stepError)}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold transition-all",
                stepError
                  ? "bg-white/10 text-bone/40 cursor-not-allowed"
                  : "bg-neon text-black hover:bg-white hover:shadow-neon-lg"
              )}
            >
              Next <ArrowRight className="h-4 w-4" />
            </motion.button>
          )}
          {step === 5 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={submitBooking}
              disabled={Boolean(stepError) || submitState.submitting}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold transition-all",
                stepError || submitState.submitting
                  ? "bg-white/10 text-bone/40 cursor-not-allowed"
                  : "bg-neon text-black hover:bg-white hover:shadow-neon-lg"
              )}
            >
              {submitState.submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Reserving…
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" /> Reserve slot{" "}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {stepError && step !== 5 && (
        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">{stepError}</p>
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
          border-color: #e10500;
          box-shadow: 0 0 0 3px rgba(225, 5, 0, 0.15);
        }
        .input::placeholder {
          color: rgba(230, 230, 230, 0.3);
        }
        .input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: StepId }) {
  const order: StepId[] = [1, 2, 3, 4, 5];
  return (
    <ol className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
      {order.map((s, idx) => {
        const active = currentStep === s;
        const done = currentStep > s;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 min-w-7 items-center justify-center border px-2 font-bold",
                done
                  ? "border-neon bg-neon text-black"
                  : active
                    ? "border-neon text-neon"
                    : "border-white/15 text-bone/40"
              )}
            >
              {done ? <Check className="h-3 w-3" /> : s}
            </span>
            <span
              className={cn(
                "hidden md:inline",
                active ? "text-bone" : done ? "text-bone/80" : "text-bone/40"
              )}
            >
              {STEP_LABELS[s]}
            </span>
            {idx < order.length - 1 && (
              <span className="hidden h-px w-6 bg-white/10 md:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/5 bg-carbon/60 p-6">
      <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function ConfirmationCard({
  bookingRef,
  service,
  slot
}: {
  bookingRef: string;
  service: Service;
  slot: Slot;
}) {
  return (
    <div className="border border-neon/40 bg-carbon p-8 text-center">
      <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">
        Reserved
      </p>
      <h2 className="mt-2 text-display text-2xl font-bold uppercase md:text-3xl">
        Booking received
      </h2>
      <p className="mt-2 text-stencil text-3xl text-neon tracking-[0.2em]">
        {bookingRef}
      </p>
      <p className="mt-6 max-w-md mx-auto text-sm text-bone/70">
        <b className="text-bone">{service.name}</b> on{" "}
        <b className="text-bone">{fmtSlotTime(slot.start)} IST</b> — bay #{slot.bay}.
        Arjun will WhatsApp to confirm shortly during business hours.
      </p>
      <p className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <MessageCircle className="h-3 w-3 text-neon" /> Watch your phone — confirmation
        within an hour.
      </p>
    </div>
  );
}
