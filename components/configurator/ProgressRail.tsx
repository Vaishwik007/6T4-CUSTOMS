"use client";

import { cn } from "@/lib/utils/cn";
import { useBuildStore, type ConfigStep } from "@/store/useBuildStore";
import { ChevronRight } from "lucide-react";

const STEPS: { id: ConfigStep; label: string; sub: string }[] = [
  { id: 1, label: "Brand", sub: "Select make" },
  { id: 2, label: "Model", sub: "Select bike" },
  { id: 3, label: "Year", sub: "Select year" },
  { id: 4, label: "Parts", sub: "Configure" }
];

export function ProgressRail() {
  const { step, brand, model, year, setStep } = useBuildStore();

  const canJumpTo = (s: ConfigStep) => {
    if (s === 1) return true;
    if (s === 2) return !!brand;
    if (s === 3) return !!brand && !!model;
    if (s === 4) return !!brand && !!model && !!year;
    return false;
  };

  return (
    <nav
      aria-label="Configuration progress"
      className="sticky top-16 z-40 border-y border-white/5 bg-black/80 backdrop-blur"
    >
      <ol className="mx-auto flex max-w-[1440px] items-stretch overflow-x-auto px-4 md:px-8">
        {STEPS.map((s, i) => {
          const active = step === s.id;
          const done = step > s.id;
          const enabled = canJumpTo(s.id);
          return (
            <li key={s.id} className="flex shrink-0 items-center">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => enabled && setStep(s.id)}
                data-cursor="cta"
                data-active={active}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-4 text-left transition-all md:px-6",
                  active && "text-neon",
                  done && "text-bone",
                  !done && !active && "text-bone/30"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center border text-display text-xs",
                    active
                      ? "border-neon bg-neon text-black shadow-neon-sm"
                      : done
                      ? "border-neon/60 bg-neon-900/30 text-neon"
                      : "border-white/10"
                  )}
                >
                  {s.id}
                </span>
                <span className="hidden md:block">
                  <span className="block text-display text-xs uppercase tracking-[0.2em]">
                    {s.label}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-bone/40">
                    {s.sub}
                  </span>
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-bone/20" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
