"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Pre-rendered JSX element (e.g. <IndianRupee className="h-3.5 w-3.5 text-neon" />).
   *  Passing JSX avoids the RSC "functions cannot cross server→client boundary" error. */
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  delta?: number; // positive = good
  tone?: "neon" | "green" | "yellow" | "muted";
  className?: string;
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  neon: "text-neon",
  green: "text-green-400",
  yellow: "text-yellow-400",
  muted: "text-bone/70"
};

export function MetricCard({ icon, label, value, accent, delta, tone = "neon", className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("neon-edge relative overflow-hidden border border-white/5 bg-carbon p-5", className)}
    >
      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <span className="inline-flex text-neon">{icon}</span>
          {label}
        </div>
        {delta != null && (
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.2em]",
              delta >= 0 ? "text-green-400" : "text-neon"
            )}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={cn("mt-3 text-stencil text-3xl md:text-4xl", TONE[tone])}>{value}</div>
      {accent && (
        <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">{accent}</div>
      )}
    </motion.div>
  );
}
