"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  stockLabel?: string;
  tunedLabel?: string;
  stockHp: number;
  tunedHp: number;
};

/**
 * Interactive before/after slider — stylised (no real images) with two halves
 * representing stock vs tuned. Drag the handle left/right to reveal.
 */
export function BeforeAfterSlider({
  stockLabel = "Stock",
  tunedLabel = "6T4 Tuned",
  stockHp,
  tunedHp
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);

  const onDrag = (clientX: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    const p = ((clientX - box.left) / box.width) * 100;
    setPct(Math.max(5, Math.min(95, p)));
  };

  return (
    <div
      ref={containerRef}
      className="relative isolate aspect-[16/9] w-full select-none overflow-hidden border border-white/10 bg-carbon"
      onMouseMove={(e) => e.buttons === 1 && onDrag(e.clientX)}
      onTouchMove={(e) => e.touches[0] && onDrag(e.touches[0].clientX)}
    >
      {/* STOCK (background) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gunmetal to-black">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute left-6 top-6">
          <span className="chip text-bone/70">{stockLabel}</span>
        </div>
        <div className="absolute bottom-6 left-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">Peak HP</div>
          <div className="text-stencil text-4xl text-bone/70">{stockHp}</div>
        </div>
      </div>

      {/* TUNED (clipped) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-neon-900/40 via-black to-black"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute right-6 top-6">
          <span className="chip border-neon/40 text-neon">{tunedLabel}</span>
        </div>
        <div className="absolute bottom-6 left-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-neon">Peak HP</div>
          <div className="text-stencil text-4xl text-neon text-glow">{tunedHp}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-neon">
            +{(tunedHp - stockHp).toFixed(1)} hp
          </div>
        </div>
      </div>

      {/* Handle */}
      <motion.div
        className="absolute inset-y-0 z-20 w-[2px] cursor-ew-resize bg-neon shadow-neon"
        style={{ left: `${pct}%` }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_, info) => {
          const box = containerRef.current?.getBoundingClientRect();
          if (!box) return;
          const p = ((info.point.x - box.left) / box.width) * 100;
          setPct(Math.max(5, Math.min(95, p)));
        }}
      >
        <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center border border-neon bg-black text-neon shadow-neon">
          <svg viewBox="0 0 20 20" className="h-4 w-4">
            <path d="M 6 5 L 2 10 L 6 15 M 14 5 L 18 10 L 14 15" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
