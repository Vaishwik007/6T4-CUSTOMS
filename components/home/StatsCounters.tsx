"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STATS = [
  { label: "Bikes Tuned", value: 1247, suffix: "+", accent: "Since 2012" },
  { label: "HP Added", value: 18420, suffix: "", accent: "On the bench" },
  { label: "Years on the Bench", value: 12, suffix: "", accent: "Built brutal" },
  { label: "Brands Supported", value: 24, suffix: "", accent: "ICE only" }
];

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 2.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{n.toLocaleString()}</span>;
}

export function StatsCounters() {
  return (
    <section className="relative bg-carbon/40 py-24 md:py-32">
      <div className="grid-bg absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeader
          eyebrow="By the Numbers"
          title="Receipts."
          align="center"
        />
        <div className="grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-black p-8 text-center md:p-12"
            >
              <div className="text-stencil text-5xl text-neon text-glow md:text-7xl">
                <Counter value={s.value} />
                {s.suffix}
              </div>
              <div className="mt-3 text-display text-xs uppercase tracking-[0.3em] text-bone">
                {s.label}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
                {s.accent}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
