"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge,
  Wrench,
  Zap,
  Cog,
  Hammer,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { BackgroundFX } from "@/components/fx/BackgroundFX";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getWhatsAppLink } from "@/lib/data/site-info";
import { cn } from "@/lib/utils/cn";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
});

const SERVICES = [
  {
    slug: "tuning",
    Icon: Gauge,
    title: "Tuning",
    tagline: "Bench-mapped fuel + ignition. Stage 1 → Stage 3 builds.",
    accent: "Bench-flashed by hand",
    price: "From ₹8,500",
    detail: {
      intro:
        "Every tune starts on the bench — no guesswork, no half-baked street maps. Arjun hand-maps fuel and ignition tables to your bike's specific state of tune: stock, pipe-only, full-bolt-on, or built.",
      tiers: [
        {
          name: "Stage 1",
          desc: "Stock engine, aftermarket exhaust or air filter. Optimised fuel & ignition with dyno verification.",
          price: "₹8,500"
        },
        {
          name: "Stage 2",
          desc: "Exhaust + air filter combo. Aggressive remap with thermal management tweaks.",
          price: "₹12,500"
        },
        {
          name: "Stage 3",
          desc: "Full bolt-on or lightly built motor. Custom map, dyno runs, printout included.",
          price: "₹18,000+"
        }
      ],
      includes: [
        "Custom fuel map",
        "Ignition timing map",
        "Dyno run (loaded cell)",
        "Before/after HP printout",
        "Post-tune check ride"
      ]
    }
  },
  {
    slug: "service",
    Icon: Wrench,
    title: "Service",
    tagline: "Manufacturer-spec maintenance. Major + minor schedules.",
    accent: "Torqued to spec",
    price: "From ₹3,500",
    detail: {
      intro:
        "Every nut tightened to manufacturer torque spec. We use genuine OEM or OEM-equivalent fluids and filters. Nothing is reused if it's past service life.",
      tiers: [
        {
          name: "Minor Service (5,000 km)",
          desc: "Engine oil + filter, air filter inspection, chain lube & adjust, brake fluid top-up, safety check.",
          price: "₹3,500"
        },
        {
          name: "Major Service (15,000 km)",
          desc: "All minor items + throttle body sync, valve clearance check, coolant flush, spark plugs, brake fluid change.",
          price: "₹8,500"
        }
      ],
      includes: [
        "OEM-spec torque throughout",
        "Digital service report",
        "Next-service sticker",
        "Wash & detail on handover"
      ]
    }
  },
  {
    slug: "mods",
    Icon: Zap,
    title: "Mods",
    tagline: "Exhaust, suspension, brakes, ECU — sourced and fitted in-house.",
    accent: "Akrapovič / Öhlins / Brembo",
    price: "Quote on enquiry",
    detail: {
      intro:
        "We source and fit premium aftermarket upgrades across all major ICE platforms. Genuine products only — we don't touch grey-market clones.",
      categories: [
        {
          name: "Exhaust",
          items: ["Akrapovič", "SC-Project", "Yoshimura", "Arrow"]
        },
        {
          name: "Suspension",
          items: ["Öhlins front + rear", "WP Performance", "Hagon"]
        },
        {
          name: "Brakes",
          items: ["Brembo radial callipers", "Brembo master cylinders", "Galfer braided lines"]
        },
        {
          name: "Air & Fuel",
          items: ["K&N drop-in", "DNA filters", "Velocity stacks"]
        }
      ],
      includes: [
        "Genuine parts with receipts",
        "Correct fitment, no bodges",
        "Post-install setup & test",
        "Re-map if required (quoted separately)"
      ]
    }
  },
  {
    slug: "parts",
    Icon: Cog,
    title: "Parts",
    tagline: "OEM + aftermarket inventory across all major ICE platforms.",
    accent: "Genuine, traceable",
    price: "Configurator pricing",
    detail: {
      intro:
        "We stock genuine OEM parts and a curated range of premium aftermarket components. All parts are traceable and sourced from authorised distributors.",
      categories: [
        {
          name: "OEM",
          items: ["Honda", "Kawasaki", "Royal Enfield", "TVS", "Bajaj", "KTM"]
        },
        {
          name: "Aftermarket",
          items: ["NGK", "Motul", "Castrol Power1", "Renthal", "Michelin"]
        }
      ],
      includes: [
        "Invoice + warranty card",
        "Fitment by our technicians (if booked)",
        "Online ordering via Configurator"
      ]
    }
  },
  {
    slug: "fabrication",
    Icon: Hammer,
    title: "Fabrication",
    tagline: "Subframes, sliders, custom one-offs. TIG-welded by Arjun.",
    accent: "Welds are art",
    price: "Quote on project",
    detail: {
      intro:
        "Custom one-off fabrication in stainless, mild steel, and aluminium. Arjun TIG-welds everything himself — no farming out, no compromise.",
      capabilities: [
        "Custom subframes & loops",
        "Crash sliders & frame guards",
        "Exhaust header modifications",
        "Custom footpeg brackets",
        "Solo seat conversion kits",
        "Belly-pan mounting brackets",
        "Bespoke engine guards"
      ],
      includes: [
        "Design consultation",
        "CAD mock-up for complex jobs",
        "Powder coat or raw finish",
        "Fitment & alignment check"
      ]
    }
  }
];

export default function ServicesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const waBook = getWhatsAppLink("Hi 6T4 Customs — I'd like to book a service.");

  return (
    <div className="relative min-h-screen bg-ink">
      <BackgroundFX variant="mechanical" dim={0.35} />

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <motion.p {...fade(0)} className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
            Services
          </motion.p>
          <motion.h1
            {...fade(0.06)}
            className="mt-4 text-stencil text-[clamp(3rem,8vw,7rem)] uppercase leading-none tracking-tight text-bone"
          >
            Five Disciplines.
            <br />
            <span className="text-neon">One Garage.</span>
          </motion.h1>
          <motion.p {...fade(0.12)} className="mt-4 max-w-lg text-base text-bone/60">
            Every job that comes through the door is treated like a race-prep job. Even an oil change.
          </motion.p>
        </div>
      </section>

      {/* Service cards overview */}
      <section className="relative px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {SERVICES.map(({ slug, Icon, title, tagline, accent, price }, i) => (
              <motion.button
                key={slug}
                {...fade(i * 0.06)}
                onClick={() => setOpen(open === slug ? null : slug)}
                data-cursor="cta"
                className={cn(
                  "neon-edge group relative overflow-hidden p-6 text-left transition-all duration-200",
                  open === slug
                    ? "border border-neon bg-neon/5"
                    : "border border-white/5 bg-carbon/60 hover:bg-neon-900/20"
                )}
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-300 group-hover:scale-110",
                    open === slug ? "text-neon" : "text-neon"
                  )}
                />
                <h3 className="mt-6 text-display text-lg font-bold uppercase tracking-wider text-bone">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-bone/60">{tagline}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-neon/80">{accent}</p>
                <p className="mt-2 text-stencil text-base text-bone/70">{price}</p>

                <div className={cn(
                  "mt-4 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] transition-colors",
                  open === slug ? "text-neon" : "text-bone/40"
                )}>
                  {open === slug ? "Collapse" : "Details"}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", open === slug && "rotate-180")} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Detail panels */}
      <section className="relative px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <AnimatePresence mode="wait">
            {SERVICES.map(({ slug, Icon, title, detail }) => {
              if (open !== slug) return null;
              return (
                <motion.div
                  key={slug}
                  id={slug}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="neon-edge relative border border-neon/20 bg-carbon/80 p-8">
                    <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                    <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                    <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                    <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-neon" />
                      <h2 className="text-display text-xl font-bold uppercase tracking-wider text-bone">
                        {title}
                      </h2>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm text-bone/70 leading-relaxed">{detail.intro}</p>

                    <div className="mt-8 grid gap-8 md:grid-cols-2">
                      {/* Tiers / Categories */}
                      <div>
                        {"tiers" in detail && detail.tiers && (
                          <>
                            <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                              Tiers
                            </p>
                            <div className="mt-4 space-y-4">
                              {detail.tiers.map((t) => (
                                <div
                                  key={t.name}
                                  className="border border-white/5 bg-black/30 p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-display text-sm font-bold uppercase tracking-wider text-bone">
                                      {t.name}
                                    </p>
                                    <p className="shrink-0 text-stencil text-base text-neon">{t.price}</p>
                                  </div>
                                  <p className="mt-2 text-xs text-bone/60">{t.desc}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {"categories" in detail && detail.categories && (
                          <>
                            <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                              What We Carry
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {detail.categories.map((cat) => (
                                <div key={cat.name} className="border border-white/5 bg-black/30 p-3">
                                  <p className="text-display text-[10px] uppercase tracking-[0.2em] text-neon">
                                    {cat.name}
                                  </p>
                                  <ul className="mt-2 space-y-1">
                                    {cat.items.map((item) => (
                                      <li key={item} className="flex items-center gap-2 text-xs text-bone/70">
                                        <span className="h-1 w-1 bg-neon" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {"capabilities" in detail && detail.capabilities && (
                          <>
                            <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                              Capabilities
                            </p>
                            <ul className="mt-4 space-y-2">
                              {detail.capabilities.map((c) => (
                                <li key={c} className="flex items-center gap-3 text-sm text-bone/80">
                                  <CheckCircle className="h-4 w-4 shrink-0 text-neon" /> {c}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      {/* What's included */}
                      <div>
                        <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                          What&apos;s Included
                        </p>
                        <ul className="mt-4 space-y-2">
                          {detail.includes.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-bone/80">
                              <CheckCircle className="h-4 w-4 shrink-0 text-neon" /> {item}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                          <a
                            href={getWhatsAppLink(`Hi 6T4 Customs — I'd like to enquire about ${title}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="cta"
                            className="flex items-center gap-2 bg-neon px-5 py-3 text-display text-[10px] uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white"
                          >
                            <MessageCircle className="h-4 w-4" /> Book via WhatsApp
                          </a>
                          <Link
                            href="/contact"
                            data-cursor="cta"
                            className="flex items-center gap-2 border border-white/15 px-5 py-3 text-display text-[10px] uppercase tracking-[0.2em] text-bone/70 hover:border-neon hover:text-neon"
                          >
                            Contact Form <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="neon-edge relative border border-neon/20 bg-carbon/60 p-10 text-center md:p-16">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

            <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
              Ready to Book?
            </p>
            <h2 className="mt-4 text-stencil text-[clamp(2rem,5vw,4rem)] uppercase leading-none text-bone">
              Let&apos;s Get Your Bike In.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-bone/60">
              WhatsApp is the fastest route. Arjun picks up every message personally.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href={waBook}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="cta"
                className="flex items-center gap-2 bg-neon px-8 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
              >
                <MessageCircle className="h-4 w-4" /> Book via WhatsApp
              </a>
              <Link
                href="/contact"
                data-cursor="cta"
                className="flex items-center gap-2 border border-white/15 px-8 py-4 text-display text-xs uppercase tracking-[0.2em] text-bone/70 hover:border-neon hover:text-neon"
              >
                Send Enquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
