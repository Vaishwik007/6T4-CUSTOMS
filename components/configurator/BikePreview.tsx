"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Zap, Gauge, IndianRupee, Clock } from "lucide-react";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";
import { getPartById } from "@/lib/data/parts";
import { useBuildStore } from "@/store/useBuildStore";
import { estimateTotalHpGain, estimateInstallMinutes } from "@/lib/utils/hpEstimator";
import { formatPrice } from "@/lib/utils/formatPrice";

export function BikePreview() {
  const { brand, model, year, selectedParts } = useBuildStore();
  const brandMeta = brand ? BRANDS_BY_SLUG[brand] : null;
  const modelMeta = brand && model ? getModel(brand, model) : null;

  const parts = selectedParts.map(getPartById).filter((p): p is NonNullable<ReturnType<typeof getPartById>> => !!p);
  const totalPrice = parts.reduce((s, p) => s + p.price, 0);
  const hpGain = estimateTotalHpGain(parts);
  const installMins = estimateInstallMinutes(parts);

  const baseHp = modelMeta?.hp ?? 0;
  const totalHp = baseHp + hpGain;

  // mouse tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-50, 50], [6, -6]), { stiffness: 100, damping: 20 });
  const ry = useSpring(useTransform(mx, [-50, 50], [-6, 6]), { stiffness: 100, damping: 20 });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [imgOk, setImgOk] = useState(true);
  useEffect(() => setImgOk(!!modelMeta?.image), [modelMeta?.image]);

  return (
    <div className="flex min-h-[400px] flex-col md:sticky md:top-40">
      <p className="mb-2 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
        Live Preview
      </p>
      <h2 className="text-display text-2xl font-bold uppercase text-bone md:text-3xl">
        {brandMeta?.name ?? "—"} <span className="text-neon">{modelMeta?.name ?? ""}</span>
      </h2>
      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-bone/40">
        {year ? `Vintage ${year}` : "Select year"} · {modelMeta?.category ?? ""}
      </p>

      {/* bike preview frame */}
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - rect.left - rect.width / 2);
          my.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={mounted ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 } : undefined}
        className="neon-edge relative mt-6 aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gunmetal via-carbon to-black"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-neon" />

        <div className="grid-bg absolute inset-0 opacity-40" />
        {brandMeta && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 60%, ${brandMeta.accent} 0%, transparent 60%)`
            }}
          />
        )}

        {/* bike imagery — real photo if available, else SVG silhouette */}
        {modelMeta?.image && imgOk ? (
          <Image
            src={modelMeta.image}
            alt={`${brandMeta?.name ?? ""} ${modelMeta.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="relative z-[1] object-contain p-4"
            onError={() => setImgOk(false)}
            priority
          />
        ) : (
          <svg className="absolute inset-0 m-auto h-4/5 w-4/5" viewBox="0 0 600 400">
            <defs>
              <linearGradient id="bikeStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff6060" />
                <stop offset="100%" stopColor="#a00000" />
              </linearGradient>
            </defs>
            <g stroke="url(#bikeStroke)" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <circle cx="160" cy="280" r="75" />
              <circle cx="440" cy="280" r="75" />
              <circle cx="160" cy="280" r="35" />
              <circle cx="440" cy="280" r="35" />
              <path d="M 160 280 L 290 170 L 370 170 L 425 240 L 440 280" />
              <path d="M 290 170 L 250 120 L 320 110" />
              <path d="M 370 170 L 405 135 L 445 145" />
              <path d="M 240 200 L 210 235 L 180 260" />
              <path d="M 305 175 Q 310 200 360 200 Q 380 200 388 175" strokeWidth="4" />
            </g>
          </svg>
        )}

        {/* scanline */}
        <div className="scanline pointer-events-none absolute inset-0" />
        {/* live RPM badge */}
        <div className="absolute bottom-3 left-3 border border-white/10 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-neon backdrop-blur">
          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse bg-neon" />
          Config · Live
        </div>
      </motion.div>

      {/* live stats overlay */}
      <div className="mt-4 grid grid-cols-2 gap-px bg-white/5">
        <Stat
          icon={<Gauge className="h-4 w-4" />}
          label="Est. Peak HP"
          value={totalHp > 0 ? `${totalHp.toFixed(1)}` : "—"}
          accent={hpGain > 0 ? `+${hpGain} gain` : "stock"}
        />
        <Stat
          icon={<Zap className="h-4 w-4" />}
          label="Mods Selected"
          value={parts.length.toString()}
          accent={parts.length > 0 ? "tuned" : "none"}
        />
        <Stat
          icon={<IndianRupee className="h-4 w-4" />}
          label="Parts Total"
          value={formatPrice(totalPrice)}
          accent={parts.length > 0 ? "ex. fitment" : ""}
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Install Time"
          value={installMins > 0 ? `${Math.round(installMins / 60)}h ${installMins % 60}m` : "—"}
          accent="Bay slot"
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-black p-4">
      <div className="flex items-center gap-2 text-bone/50">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.3em]">{label}</span>
      </div>
      <div className="mt-2 text-stencil text-2xl text-neon md:text-3xl">{value}</div>
      {accent && (
        <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">{accent}</div>
      )}
    </div>
  );
}
