"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft, Check } from "lucide-react";
import { getYearsForModel, getModel } from "@/lib/data/models";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { useBuildStore } from "@/store/useBuildStore";
import { cn } from "@/lib/utils/cn";

export function YearSelect() {
  const { brand, model, year, setYear, setStep } = useBuildStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const years = brand && model ? getYearsForModel(brand, model) : [];
  const bikeMeta = brand && model ? getModel(brand, model) : null;
  const brandMeta = brand ? BRANDS_BY_SLUG[brand] : null;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!brand || !model || !bikeMeta || !brandMeta) {
    return (
      <div className="py-12 text-center text-bone/60">
        Please select a model first.
        <button
          type="button"
          onClick={() => setStep(2)}
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
          onClick={() => setStep(2)}
          data-cursor="cta"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 transition-colors hover:text-neon"
        >
          <ArrowLeft className="h-3 w-3" /> Change model
        </button>
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Step 03 / Year
        </p>
      </div>

      <h1 className="text-display text-4xl font-bold uppercase leading-tight md:text-6xl">
        Which <span className="text-neon text-glow">Vintage?</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-bone/60 md:text-base">
        {brandMeta.name} {bikeMeta.name} · produced {bikeMeta.yearStart}–{bikeMeta.yearEnd ?? "now"}.
        Year affects compatibility.
      </p>

      <div ref={ref} className="relative mt-10 max-w-md">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="cta"
          className={cn(
            "neon-edge group relative flex w-full items-center justify-between border border-white/10 bg-carbon px-6 py-5 text-left transition-all",
            open && "border-neon"
          )}
        >
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">Year</div>
            <div className="mt-1 text-display text-3xl font-bold text-bone">
              {year ?? "— Select —"}
            </div>
          </div>
          <ChevronDown
            className={cn("h-5 w-5 text-neon transition-transform", open && "rotate-180")}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto border border-neon/40 bg-black/95 shadow-neon backdrop-blur"
            >
              {years.map((y) => (
                <li key={y}>
                  <button
                    type="button"
                    onClick={() => {
                      setYear(y);
                      setOpen(false);
                    }}
                    data-cursor="cta"
                    className={cn(
                      "flex w-full items-center justify-between border-l-2 border-transparent px-6 py-3 text-left text-display text-sm uppercase tracking-widest transition-all",
                      year === y
                        ? "border-l-neon bg-neon-900/30 text-neon"
                        : "text-bone hover:border-l-neon hover:bg-neon-900/20 hover:text-neon"
                    )}
                  >
                    {y}
                    {year === y && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!year}
          onClick={() => setStep(4)}
          data-cursor="cta"
          className={cn(
            "group relative inline-flex items-center gap-3 bg-neon px-8 py-4 text-display text-sm font-bold uppercase tracking-[0.2em] text-black transition-all",
            !year && "cursor-not-allowed opacity-40",
            year && "hover:bg-white hover:shadow-neon-lg"
          )}
        >
          Lock & Continue
        </button>
      </div>
    </div>
  );
}
