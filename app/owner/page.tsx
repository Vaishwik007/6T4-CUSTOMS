"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function OwnerPage() {
  const [imgOk, setImgOk] = useState(true);

  return (
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
            <span className="text-neon text-glow">Arjun Rao.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-bone/70 md:text-lg">
            Founder. Head tuner. TIG welder. Sleep optional.
          </p>
          <blockquote className="mt-10 border-l-2 border-neon pl-5 text-lg italic text-bone/80 md:text-xl">
            "Performance over comfort. Always."
          </blockquote>
        </motion.div>

        {/* Portrait — real photo with SVG silhouette fallback */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="neon-edge relative aspect-[832/1266] overflow-hidden border border-white/10 bg-gradient-to-br from-gunmetal via-carbon to-black"
        >
          <span className="pointer-events-none absolute left-0 top-0 z-20 h-3 w-3 border-l-2 border-t-2 border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 z-20 h-3 w-3 border-r-2 border-t-2 border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 z-20 h-3 w-3 border-b-2 border-l-2 border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 z-20 h-3 w-3 border-b-2 border-r-2 border-neon" />

          {imgOk ? (
            <>
              <Image
                src="/images/owner/arjun-rao.webp"
                alt="Bachupally Arjun Rao — founder of 6T4 Customs"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain"
                onError={() => setImgOk(false)}
              />
              {/* subtle duotone + bottom fade so photo blends with the design language */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%), radial-gradient(circle at 70% 40%, rgba(255,0,0,0.12) 0%, transparent 60%)"
                }}
              />
              {/* scanline overlay kept for design continuity */}
              <div className="scanline pointer-events-none absolute inset-0 z-[2]" />
            </>
          ) : (
            <>
              <div className="grid-bg absolute inset-0 opacity-30" />
              <div className="absolute inset-0 bg-radial-glow" />
              <div className="scanline absolute inset-0" />
              {/* Stylised fallback portrait */}
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
            </>
          )}

          <div className="absolute bottom-4 left-4 right-4 z-10 border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Hyderabad</p>
                <p className="mt-0.5 text-display text-sm font-bold">Bay 01 · In-House</p>
              </div>
              <div className="h-2 w-2 animate-pulse bg-neon" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
