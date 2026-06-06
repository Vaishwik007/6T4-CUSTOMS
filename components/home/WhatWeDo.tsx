"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Wrench, Zap, Cog, Hammer } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ITEMS = [
  {
    Icon: Gauge,
    title: "Tuning",
    slug: "tuning",
    body: "Bench-mapped fuel + ignition. Stage 1 → Stage 3 builds.",
    accent: "Bench-flashed by hand"
  },
  {
    Icon: Wrench,
    title: "Service",
    slug: "service",
    body: "Manufacturer-spec maintenance. Major + minor schedules.",
    accent: "Torqued to spec"
  },
  {
    Icon: Zap,
    title: "Mods",
    slug: "mods",
    body: "Exhaust, suspension, brakes, ECU — sourced and fitted in-house.",
    accent: "Akrapovič / Öhlins / Brembo"
  },
  {
    Icon: Cog,
    title: "Parts",
    slug: "parts",
    body: "OEM + aftermarket inventory across all major ICE platforms.",
    accent: "Genuine, traceable"
  },
  {
    Icon: Hammer,
    title: "Fabrication",
    slug: "fabrication",
    body: "Subframes, sliders, custom one-offs. TIG-welded by Arjun.",
    accent: "Welds are art"
  }
];

export function WhatWeDo() {
  return (
    <section className="relative px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeader
          eyebrow="What We Do"
          title="Five Disciplines. One Garage."
          subtitle="Everything that comes through the door is treated like a race-prep job. Even an oil change."
        />

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map(({ Icon, title, slug, body, accent }, i) => (
            <Link
              key={title}
              href={`/services#${slug}`}
              data-cursor="cta"
              className="group neon-edge relative block overflow-hidden bg-carbon/60 p-6 transition-all duration-200 hover:bg-neon-900/20"
            >
              <motion.article
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* corner ticks */}
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                <Icon className="h-6 w-6 text-neon transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-6 text-display text-lg font-bold uppercase tracking-wider text-bone">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-bone/60">{body}</p>
                <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-neon/80">{accent}</p>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
