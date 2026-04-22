"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { BRANDS } from "@/lib/data/brands";
import { useBuildStore } from "@/store/useBuildStore";
import { cn } from "@/lib/utils/cn";

export function BrandCarousel() {
  const setBrand = useBuildStore((s) => s.setBrand);
  const current = useBuildStore((s) => s.brand);

  const autoplay = Autoplay({ delay: 2600, stopOnInteraction: true, stopOnMouseEnter: true });
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", dragFree: false, containScroll: "trimSnaps", skipSnaps: false },
    [autoplay]
  );

  const onSelect = useCallback(
    (slug: string) => {
      autoplay.stop();
      setBrand(slug);
    },
    [autoplay, setBrand]
  );

  useEffect(() => {
    if (!embla) return;
    const idx = BRANDS.findIndex((b) => b.slug === current);
    if (idx >= 0) embla.scrollTo(idx, false);
  }, [embla, current]);

  return (
    <div className="relative">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Step 01 / Brand
        </p>
        <p className="hidden text-[10px] uppercase tracking-[0.2em] text-bone/40 md:block">
          {BRANDS.length} manufacturers · ICE only
        </p>
      </div>

      <h1 className="text-display text-4xl font-bold uppercase leading-tight text-bone md:text-6xl">
        Pick Your <span className="text-neon text-glow">Make.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-bone/60 md:text-base">
        Scroll, drag, or tap to lock a manufacturer. Auto-scroll pauses on hover.
      </p>

      <div className="embla mt-10 select-none" ref={emblaRef}>
        <div className="embla__container gap-4">
          {BRANDS.map((b, i) => (
            <BrandCard
              key={b.slug}
              brand={b}
              index={i}
              active={current === b.slug}
              onPick={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandCard({
  brand: b,
  index,
  active,
  onPick
}: {
  brand: (typeof BRANDS)[number];
  index: number;
  active: boolean;
  onPick: (slug: string) => void;
}) {
  const [logoOk, setLogoOk] = useState(!!b.logo);
  const [heroOk, setHeroOk] = useState(!!b.heroImage);

  return (
    <motion.button
      type="button"
      onClick={() => onPick(b.slug)}
      data-cursor="cta"
      className={cn(
        "embla__slide neon-edge group relative flex w-[220px] flex-col justify-between overflow-hidden bg-carbon p-5 text-left transition-all duration-200 md:w-[260px]",
        active && "ring-1 ring-neon"
      )}
      style={{ height: 240 }}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
    >
      {/* corner ticks */}
      <span className="pointer-events-none absolute left-0 top-0 z-10 h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 z-10 h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 z-10 h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 z-10 h-2 w-2 border-b border-r border-neon" />

      {/* hero bg image (if available) */}
      {b.heroImage && heroOk && (
        <Image
          src={b.heroImage}
          alt=""
          fill
          sizes="260px"
          className="object-cover opacity-25 transition-opacity duration-300 group-hover:opacity-40"
          onError={() => setHeroOk(false)}
        />
      )}

      {/* accent gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${b.accent}66 0%, transparent 60%), linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.85) 100%)`
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/60">
          <MapPin className="h-3 w-3" />
          {b.country}
        </div>
        {b.logo && logoOk && (
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src={b.logo}
              alt={`${b.name} logo`}
              fill
              sizes="32px"
              className="object-contain brightness-0 invert"
              onError={() => setLogoOk(false)}
            />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="mt-4 text-display text-[28px] font-black uppercase leading-none text-bone md:text-[34px]">
          {b.name}
        </div>
        {b.tagline && (
          <div className="mt-2 text-[11px] italic text-bone/60">"{b.tagline}"</div>
        )}
      </div>
      <div className="relative z-10 flex items-end justify-between">
        <div className="text-stencil text-xl text-neon">{b.founded}</div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{b.region}</div>
      </div>
    </motion.button>
  );
}
