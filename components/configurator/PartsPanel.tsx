"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Plus,
  ShoppingCart,
  Volume2,
  Flame,
  Cpu,
  Wind,
  Wrench,
  Palette,
  WrenchIcon
} from "lucide-react";
import { PART_CATEGORIES, getCompatiblePartsByCategory } from "@/lib/data/parts";
import type { Part, PartCategory } from "@/lib/data/types";
import { useBuildStore } from "@/store/useBuildStore";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

const CATEGORY_ICON: Record<PartCategory, typeof Flame> = {
  Exhaust: Flame,
  "ECU Tuning": Cpu,
  "Air Filter": Wind,
  "Performance Kit": Wrench,
  Cosmetic: Palette,
  "Service Kit": WrenchIcon
};

export function PartsPanel() {
  const { brand, model, year, selectedParts, togglePart, setStep } = useBuildStore();
  const addToCart = useCartStore((s) => s.add);

  const [cat, setCat] = useState<PartCategory>("Exhaust");
  const [sort, setSort] = useState<"featured" | "hp" | "price">("featured");

  const available = useMemo(() => {
    if (!brand || !model || !year) return [];
    const list = getCompatiblePartsByCategory(brand, model, year, cat);
    const sorted = [...list];
    if (sort === "hp") sorted.sort((a, b) => (b.hpGain ?? 0) - (a.hpGain ?? 0));
    if (sort === "price") sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }, [brand, model, year, cat, sort]);

  if (!brand || !model || !year) {
    return (
      <div className="py-12 text-center text-bone/60">
        Please select year first.
        <button
          type="button"
          onClick={() => setStep(3)}
          className="ml-3 text-neon underline underline-offset-4"
        >
          Back
        </button>
      </div>
    );
  }

  const handleAddToCart = (part: Part) => {
    togglePart(part.id);
    addToCart({
      partId: part.id,
      qty: 1,
      forBuild: { brand, model, year }
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(3)}
          data-cursor="cta"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 transition-colors hover:text-neon"
        >
          <ArrowLeft className="h-3 w-3" /> Change year
        </button>
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Step 04 / Parts
        </p>
      </div>

      <h2 className="text-display text-3xl font-bold uppercase md:text-4xl">
        Compatible <span className="text-neon text-glow">Arsenal</span>
      </h2>
      <p className="mt-2 text-sm text-bone/60">
        Live-filtered for your build. Real-time updates to the preview.
      </p>

      {/* category tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/5 pb-1">
        {PART_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            data-cursor="cta"
            className={cn(
              "relative border-b-2 px-3 py-2 text-display text-[11px] uppercase tracking-[0.2em] transition-colors",
              cat === c
                ? "border-neon text-neon"
                : "border-transparent text-bone/60 hover:text-bone"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* sort + count */}
      <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <span>{available.length} compatible</span>
        <div className="flex items-center gap-1">
          <span className="mr-2">Sort</span>
          {(["featured", "hp", "price"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              data-cursor="cta"
              className={cn(
                "px-2 py-1 transition-colors",
                sort === k ? "bg-neon text-black" : "text-bone/60 hover:text-neon"
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {available.map((p) => {
            const selected = selectedParts.includes(p.id);
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "neon-edge group relative flex flex-col bg-carbon/80 p-5 transition-colors",
                  selected && "ring-1 ring-neon"
                )}
                data-active={selected}
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                <div className="flex items-start gap-3">
                  <PartThumb part={p} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">{p.brand}</p>
                        <h3 className="mt-1 text-display text-base font-bold uppercase leading-tight text-bone">
                          {p.name}
                        </h3>
                      </div>
                      <CompatibilityBadge universal={p.compatibility === "universal"} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-bone/60">{p.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em]">
                  {p.hpGain != null && p.hpGain > 0 && (
                    <span className="chip border-neon/40 text-neon">+{p.hpGain} HP</span>
                  )}
                  {p.soundDb && (
                    <span className="chip flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      <SoundMeter db={p.soundDb} />
                      {p.soundDb} dB
                    </span>
                  )}
                  {p.installMinutes != null && p.installMinutes > 0 && (
                    <span className="chip">~{p.installMinutes} min fit</span>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between pt-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">Price</div>
                    <div className="mt-1 text-stencil text-2xl text-bone">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    data-cursor="cta"
                    className={cn(
                      "group/btn inline-flex items-center gap-2 px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] transition-all",
                      selected
                        ? "bg-neon-900/40 text-neon"
                        : "bg-neon text-black hover:bg-white"
                    )}
                  >
                    {selected ? (
                      <>
                        <Check className="h-3 w-3" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Add
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {available.length === 0 && (
          <div className="col-span-full border border-dashed border-white/10 p-10 text-center text-bone/50">
            No parts currently catalogued for this bike in <span className="text-neon">{cat}</span>.
            <br />
            DM us on WhatsApp for custom sourcing.
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
        <p className="text-xs uppercase tracking-[0.3em] text-bone/60">
          {selectedParts.length} mod{selectedParts.length === 1 ? "" : "s"} locked in
        </p>
        <a
          href="/cart"
          data-cursor="cta"
          className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
        >
          <ShoppingCart className="h-4 w-4" /> View Cart
        </a>
      </div>
    </div>
  );
}

function PartThumb({ part }: { part: Part }) {
  const [ok, setOk] = useState(!!part.images?.[0]);
  const primary = part.images?.[0];
  const Icon = CATEGORY_ICON[part.category];

  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-white/10 bg-black/60">
      {primary && ok ? (
        <Image
          src={primary}
          alt={part.name}
          fill
          sizes="64px"
          className="object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <Icon className="h-6 w-6 text-neon/70" />
      )}
    </div>
  );
}

function CompatibilityBadge({ universal }: { universal: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] uppercase tracking-[0.3em]",
        universal
          ? "border-neon/40 text-neon"
          : "border-green-500/40 text-green-400"
      )}
    >
      <span className={cn("h-1.5 w-1.5", universal ? "bg-neon" : "bg-green-400")} />
      {universal ? "Universal" : "Model-specific"}
    </span>
  );
}

function SoundMeter({ db }: { db: number }) {
  const bars = Math.min(5, Math.max(1, Math.round((db - 90) / 4)));
  return (
    <span className="inline-flex items-center gap-[1px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-2 w-[2px]",
            i < bars ? "bg-neon" : "bg-white/20"
          )}
        />
      ))}
    </span>
  );
}
