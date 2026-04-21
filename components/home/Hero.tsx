"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Activity } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden">
      {/* layered backdrop */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black via-black to-carbon" />
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />
      <div className="absolute inset-0 -z-10 bg-radial-glow" />
      {/* large background bike silhouette via SVG */}
      <svg
        className="absolute right-[-10%] top-1/2 -z-10 h-[120%] w-[80%] -translate-y-1/2 opacity-20 mix-blend-screen"
        viewBox="0 0 600 400"
        fill="none"
      >
        <defs>
          <linearGradient id="bikeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#3d0000" />
          </linearGradient>
        </defs>
        {/* Stylised motorcycle silhouette */}
        <g stroke="url(#bikeGrad)" strokeWidth="1.5" fill="none">
          <circle cx="140" cy="280" r="80" />
          <circle cx="460" cy="280" r="80" />
          <path d="M 140 280 L 280 180 L 360 180 L 420 240 L 460 280" />
          <path d="M 280 180 L 230 130 L 290 110" />
          <path d="M 360 180 L 410 140 L 450 150" />
          <path d="M 250 200 L 220 240 L 180 260" />
        </g>
      </svg>

      {/* red flicker */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-flicker bg-radial-glow opacity-60" />

      {/* scanline */}
      <div className="scanline pointer-events-none absolute inset-0 -z-10" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-32 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2 border border-neon/40 bg-neon-900/20 px-3 py-1 text-display text-[10px] uppercase tracking-[0.4em] text-neon"
        >
          <span className="h-1.5 w-1.5 animate-pulse bg-neon" />
          Garage Active · Hyderabad
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-display text-[44px] font-black uppercase leading-[0.95] tracking-tight text-bone md:text-[96px]"
        >
          Built <span className="text-neon text-glow">Different.</span>
          <br />
          Tuned <span className="text-neon text-glow">Brutal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 max-w-xl text-base text-bone/70 md:text-lg"
        >
          Premium motorcycle tuning, fabrication and performance engineering. Walk in with a bike,
          ride out with a machine.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/configurator"
            data-cursor="cta"
            className="group relative inline-flex items-center gap-3 bg-neon px-8 py-4 text-display text-sm font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg"
          >
            Build Your Machine
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="pointer-events-none absolute -right-2 -top-2 h-2 w-2 bg-neon" />
          </Link>
          <Link
            href="/why-us"
            data-cursor="cta"
            className="group inline-flex items-center gap-2 border border-white/20 px-6 py-4 text-display text-sm uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
          >
            <Activity className="h-4 w-4" />
            See the Dyno
          </Link>
        </motion.div>

        {/* stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid max-w-3xl grid-cols-3 border border-white/10 bg-black/30 backdrop-blur"
        >
          {[
            { v: "1,200+", l: "Bikes Tuned" },
            { v: "+18,400", l: "Total HP Gained" },
            { v: "12", l: "Years On The Dyno" }
          ].map((s) => (
            <div key={s.l} className="border-r border-white/10 px-4 py-5 last:border-r-0 md:px-6">
              <div className="text-stencil text-2xl text-neon md:text-4xl">{s.v}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bone/50 md:text-xs">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
    </section>
  );
}
