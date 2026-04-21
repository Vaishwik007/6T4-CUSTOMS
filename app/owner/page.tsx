"use client";

import { motion } from "framer-motion";
import { Calendar, Wrench, Zap, Hammer, Flame, Trophy } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const TIMELINE = [
  {
    year: "2008",
    title: "Turned a wrench at 12.",
    body: "First stripped-down 100cc in the family garage. Oil on hands, fascinated.",
    Icon: Wrench
  },
  {
    year: "2012",
    title: "First race build.",
    body: "Prepped a Pulsar 220 for grassroots drags. Outran stock 300s. Hooked.",
    Icon: Zap
  },
  {
    year: "2015",
    title: "Apprenticed with factory tuners.",
    body: "Two years with a WSBK-feeder team. Learned maps, metallurgy, madness.",
    Icon: Flame
  },
  {
    year: "2018",
    title: "Welding school + fabrication era.",
    body: "TIG certification. Started fabricating subframes, sliders, race exhausts.",
    Icon: Hammer
  },
  {
    year: "2020",
    title: "Opened the bay.",
    body: "First 6T4 CUSTOMS bay opened in Hyderabad. Dyno followed six months later.",
    Icon: Trophy
  },
  {
    year: "Now",
    title: "1,200+ bikes. Still counting.",
    body: "Full-service garage. Every build signed off by hand. No shortcuts.",
    Icon: Calendar
  }
];

export default function OwnerPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative px-4 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 md:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">
              The Owner
            </p>
            <h1 className="mt-3 text-display text-[44px] font-black uppercase leading-[0.95] md:text-[88px]">
              Bachupally
              <br />
              <span className="text-neon text-glow">Arjun.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-bone/70 md:text-lg">
              Founder. Head tuner. TIG welder. Sleep optional.
            </p>
            <blockquote className="mt-10 border-l-2 border-neon pl-5 text-lg italic text-bone/80 md:text-xl">
              "Performance over comfort. Always."
            </blockquote>
          </motion.div>

          {/* Portrait silhouette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="neon-edge relative aspect-[4/5] overflow-hidden border border-white/10 bg-gradient-to-br from-gunmetal via-carbon to-black"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-neon" />
            <div className="grid-bg absolute inset-0 opacity-30" />
            <div className="absolute inset-0 bg-radial-glow" />
            <div className="scanline absolute inset-0" />

            {/* Stylised portrait (abstract silhouette) */}
            <svg viewBox="0 0 400 500" className="absolute inset-0 m-auto h-full w-full">
              <defs>
                <linearGradient id="port" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff0000" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3d0000" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <g fill="none" stroke="url(#port)" strokeWidth="1.5">
                <ellipse cx="200" cy="170" rx="70" ry="85" />
                <path d="M 130 250 Q 200 230 270 250 L 290 450 L 110 450 Z" />
                <path d="M 160 430 L 140 490 M 240 430 L 260 490" />
                <path d="M 160 180 L 180 175 M 220 175 L 240 180" />
                <path d="M 180 210 L 220 210" />
              </g>
            </svg>
            <div className="absolute bottom-4 left-4 right-4 border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Hyderabad</p>
                  <p className="mt-0.5 text-display text-sm font-bold">Bay 01 · Dyno + Bench</p>
                </div>
                <div className="h-2 w-2 animate-pulse bg-neon" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader eyebrow="The Road" title="Timeline." align="center" />
          <ol className="relative mx-auto mt-10 max-w-3xl">
            <span className="absolute left-[22px] top-0 h-full w-px bg-gradient-to-b from-neon/80 via-neon/20 to-transparent md:left-1/2" />
            {TIMELINE.map((t, i) => {
              const left = i % 2 === 0;
              return (
                <motion.li
                  key={t.year}
                  initial={{ opacity: 0, x: left ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-10 md:grid md:grid-cols-2 md:gap-10"
                >
                  {/* dot */}
                  <span
                    className="absolute left-[16px] top-3 z-10 h-3 w-3 border border-neon bg-black shadow-neon md:left-1/2 md:-translate-x-1/2"
                    aria-hidden
                  />
                  <div
                    className={
                      left
                        ? "pl-12 md:pl-0 md:pr-10 md:text-right"
                        : "pl-12 md:col-start-2 md:pl-10"
                    }
                  >
                    <span className="text-stencil text-3xl text-neon text-glow md:text-4xl">
                      {t.year}
                    </span>
                    <h3 className="mt-2 text-display text-lg font-bold uppercase tracking-wider">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-sm text-bone/60">{t.body}</p>
                    <t.Icon className="mt-4 h-5 w-5 text-neon/70" />
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-t border-white/5 bg-carbon/40 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">
            Philosophy
          </p>
          <h2 className="mt-4 text-display text-3xl font-bold uppercase leading-tight md:text-5xl">
            Every bike leaves sharper
            <br />
            than it came in.
          </h2>
          <p className="mt-6 text-bone/60 md:text-lg">
            We don't do appointments-for-appointments. If the dyno isn't happy, the bike doesn't
            leave. That's the deal.
          </p>
        </div>
      </section>
    </>
  );
}
