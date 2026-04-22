"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FEATURED_BUILDS } from "@/lib/data/featured";
import type { FeaturedBuild } from "@/lib/data/types";

export function FeaturedBuilds() {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps"
  });

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="relative px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Featured Builds"
            title="Recently Off the Dyno."
            subtitle="A taste of what the bench has been chewing through."
            className="mb-0"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              data-cursor="cta"
              aria-label="Previous build"
              className="grid h-10 w-10 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              data-cursor="cta"
              aria-label="Next build"
              className="grid h-10 w-10 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="embla mt-10" ref={emblaRef}>
          <div className="embla__container gap-4">
            {FEATURED_BUILDS.map((b, i) => (
              <BuildCard key={b.id} build={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildCard({ build: b, index: i }: { build: FeaturedBuild; index: number }) {
  const [imgOk, setImgOk] = useState(!!b.afterImage);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.06 }}
      className="embla__slide group neon-edge relative w-[320px] cursor-default overflow-hidden bg-carbon md:w-[420px]"
      data-cursor="cta"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gunmetal to-black">
        {b.afterImage && imgOk ? (
          <Image
            src={b.afterImage}
            alt={b.title}
            fill
            sizes="(max-width: 768px) 320px, 420px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgOk(false)}
          />
        ) : (
          <>
            <div className="grid-bg absolute inset-0 opacity-50" />
            <div className="absolute inset-0 bg-radial-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 600 400" className="h-3/4 w-3/4 opacity-60">
                <g stroke="#ff0000" strokeWidth="2" fill="none">
                  <circle cx="160" cy="280" r="70" />
                  <circle cx="440" cy="280" r="70" />
                  <path d="M 160 280 L 280 180 L 360 180 L 420 240 L 440 280" />
                  <path d="M 280 180 L 240 130" />
                  <path d="M 360 180 L 400 140" />
                </g>
              </svg>
            </div>
          </>
        )}
        <div className="absolute right-3 top-3 z-[2] inline-flex items-center gap-1 bg-neon px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
          <Zap className="h-3 w-3" />+{b.hpGain} HP
        </div>
      </div>

      <div className="p-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">{b.bike}</p>
        <h3 className="mt-2 text-display text-2xl font-bold uppercase text-bone">{b.title}</h3>
        <ul className="mt-4 space-y-1 text-sm text-bone/60">
          {b.mods.slice(0, 4).map((mod) => (
            <li key={mod} className="flex items-start gap-2">
              <span className="mt-2 h-px w-3 bg-neon" />
              <span>{mod}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
