"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge, Zap } from "lucide-react";
import { getModelsByBrand } from "@/lib/data/models";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { useBuildStore } from "@/store/useBuildStore";
import { cn } from "@/lib/utils/cn";

export function ModelCarousel() {
  const { brand, setModel, setStep } = useBuildStore();
  const models = brand ? getModelsByBrand(brand) : [];
  const brandMeta = brand ? BRANDS_BY_SLUG[brand] : null;

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps"
  });

  const onPick = useCallback(
    (slug: string) => {
      setModel(slug);
    },
    [setModel]
  );

  if (!brand || !brandMeta) {
    return (
      <div className="py-12 text-center text-bone/60">
        Please select a brand first.
        <button
          type="button"
          onClick={() => setStep(1)}
          className="ml-3 text-neon underline underline-offset-4"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          data-cursor="cta"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 transition-colors hover:text-neon"
        >
          <ArrowLeft className="h-3 w-3" /> Change brand
        </button>
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Step 02 / Model
        </p>
      </div>

      <h1 className="text-display text-4xl font-bold uppercase leading-tight md:text-6xl">
        {brandMeta.name} <span className="text-neon text-glow">Lineup</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-bone/60 md:text-base">
        {models.length} production models supported. Swipe through, tap to lock.
      </p>

      <div className="embla mt-10" ref={emblaRef}>
        <div className="embla__container gap-4">
          {models.map((model, i) => (
            <motion.button
              key={model.slug}
              type="button"
              onClick={() => onPick(model.slug)}
              data-cursor="cta"
              className={cn(
                "embla__slide group neon-edge relative flex w-[280px] flex-col overflow-hidden bg-carbon p-0 text-left transition-all md:w-[320px]"
              )}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.015 }}
              whileHover={{ y: -4 }}
            >
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gunmetal to-black">
                <div className="grid-bg absolute inset-0 opacity-40" />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-60"
                  style={{
                    background: `radial-gradient(circle at 50% 70%, ${brandMeta.accent}, transparent 70%)`
                  }}
                />
                <BikeGlyph category={model.category} />
                <div className="absolute left-3 top-3 chip">{model.category}</div>
              </div>

              <div className="p-5">
                <h3 className="text-display text-lg font-bold uppercase leading-tight text-bone group-hover:text-neon md:text-xl">
                  {model.name}
                </h3>
                <div className="mt-4 flex items-center gap-4 text-xs text-bone/60">
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-neon" /> {model.engineCc} cc
                  </span>
                  {model.hp && (
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3 w-3 text-neon" /> {model.hp} HP
                    </span>
                  )}
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-bone/40">
                  {model.yearStart} – {model.yearEnd ?? "Present"}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Stylised SVG silhouette varies per category */
function BikeGlyph({ category }: { category: string }) {
  // single glyph that works across categories, slight rotation per type for visual variety
  const rot =
    category === "Cruiser" ? -4 : category === "Supersport" ? 2 : category === "ADV" ? 0 : 0;
  return (
    <svg
      className="absolute inset-0 m-auto h-4/5 w-4/5 opacity-70"
      viewBox="0 0 600 400"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <g stroke="#ff0000" strokeWidth="2" fill="none">
        <circle cx="160" cy="280" r="70" />
        <circle cx="440" cy="280" r="70" />
        <path d="M 160 280 L 290 180 L 360 180 L 420 240 L 440 280" />
        <path d="M 290 180 L 250 130 L 320 120" />
        <path d="M 360 180 L 400 140 L 440 150" />
        <path d="M 240 210 L 210 240 L 180 260" />
      </g>
    </svg>
  );
}
