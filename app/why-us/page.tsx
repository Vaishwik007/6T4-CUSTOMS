"use client";

import { motion } from "framer-motion";
import { Activity, Target, Hammer, Quote, Star } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DynoChart } from "@/components/shared/DynoChart";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { FEATURED_BUILDS, TESTIMONIALS } from "@/lib/data/featured";

const PILLARS = [
  {
    Icon: Target,
    title: "Dyno Precision",
    body: "Every build is AFR-mapped on our in-house dyno. No seat-of-pants guesswork.",
    metric: "±0.1 AFR"
  },
  {
    Icon: Activity,
    title: "Premium Sourcing",
    body: "Direct lines to Akrapovič, SC-Project, Öhlins, Brembo, K&N. Genuine, traceable.",
    metric: "12 OEMs"
  },
  {
    Icon: Hammer,
    title: "Custom Fabrication",
    body: "TIG-welded subframes, sliders, exhaust mods, one-off brackets. Hand-built by Arjun.",
    metric: "Welds are art"
  }
];

const TOOLS = [
  "Dynojet 250iX Dyno",
  "Woolich RaceTools",
  "Motec M1",
  "Rapid Bike Evo",
  "TIG 200 AC/DC",
  "Laser Wheel Alignment",
  "Torque Plates",
  "Boroscope"
];

export default function WhyUsPage() {
  const featured = FEATURED_BUILDS.find((b) => b.dynoData && b.dynoData.length);

  return (
    <>
      {/* Hero */}
      <section className="relative px-4 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display text-[10px] uppercase tracking-[0.5em] text-neon"
          >
            Why 6T4
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-display text-[44px] font-black uppercase leading-[0.95] md:text-[96px]"
          >
            Numbers<span className="text-neon text-glow">,</span>
            <br />
            not vibes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-base text-bone/70 md:text-lg"
          >
            Every tune is measurable. Every part is traceable. Every weld is inspected. You can
            read the receipts on the dyno chart.
          </motion.p>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ Icon, title, body, metric }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="neon-edge relative overflow-hidden border border-white/5 bg-carbon p-8"
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                <Icon className="h-6 w-6 text-neon" />
                <h3 className="mt-6 text-display text-2xl font-bold uppercase tracking-wider">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-bone/60">{body}</p>
                <p className="mt-8 text-stencil text-xl text-neon">{metric}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Dyno reveal */}
      <section className="border-y border-white/5 bg-carbon/40 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px] grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeader
              eyebrow="Receipts"
              title="Read the Graph."
              subtitle="Before vs after on a real build. Peak gains + area under the curve."
              className="mb-8"
            />
            {featured && (
              <ul className="space-y-2 text-sm text-bone/70">
                <li>
                  <span className="text-neon">Bike:</span> {featured.bike}
                </li>
                <li>
                  <span className="text-neon">Mods:</span> {featured.mods.join(", ")}
                </li>
                <li>
                  <span className="text-neon">Peak HP gain:</span> +{featured.hpGain}
                </li>
              </ul>
            )}
          </div>
          <div className="neon-edge border border-white/10 bg-black p-6">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
            {featured?.dynoData && <DynoChart data={featured.dynoData} />}
          </div>
        </div>

        {/* Before / After slider */}
        <div className="mx-auto mt-16 max-w-5xl">
          <SectionHeader
            eyebrow="Before / After"
            title="Drag to Reveal."
            align="center"
            className="mb-6 text-center"
          />
          {featured?.dynoData && (
            <BeforeAfterSlider
              stockHp={Math.max(...featured.dynoData.map((d) => d.stockHp))}
              tunedHp={Math.max(...featured.dynoData.map((d) => d.tunedHp))}
            />
          )}
        </div>
      </section>

      {/* Tools */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader
            eyebrow="The Arsenal"
            title="Tools on the bench."
            subtitle="Calibrated, maintained, respected."
          />
          <ul className="grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
            {TOOLS.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 bg-black px-4 py-4 text-[11px] uppercase tracking-[0.2em] text-bone/70"
              >
                <span className="h-1.5 w-1.5 bg-neon" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 bg-carbon/30 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader eyebrow="Riders" title="What the owners say." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="neon-edge relative border border-white/5 bg-carbon p-6"
              >
                <Quote className="h-5 w-5 text-neon" />
                <p className="mt-4 text-sm text-bone/80">"{t.content}"</p>
                <footer className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <p className="text-display text-sm font-bold uppercase">{t.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neon">{t.bike}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-neon text-neon" />
                    ))}
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
