"use client";

import { memo } from "react";
import { useIsMobile } from "@/lib/utils/useIsMobile";
import { Sparks } from "./Sparks";

export type FxVariant =
  | "ignition"   // Home
  | "blueprint"  // Why Us
  | "flow"       // Configurator / Builds
  | "mechanical" // Admin inventory / Parts
  | "idle";      // Owner / Contact

interface Props {
  variant: FxVariant;
  /** Optional darkener over everything — use on pages with a lot of text. */
  dim?: number; // 0..1, default 0
}

/**
 * Page-scoped cinematic background layer. Render inside a `relative` parent
 * (usually the <main> wrapper) — it absolutely fills its parent and sits
 * behind all content via z-index. Pointer-events are off everywhere.
 *
 * Each variant is a layered stack of pure CSS keyframes; only "ignition"
 * mounts a canvas (for sparks, the one effect CSS can't do convincingly).
 */
export const BackgroundFX = memo(function BackgroundFX({ variant, dim = 0 }: Props) {
  return (
    <div className="fx-root" aria-hidden>
      {variant === "ignition" && <IgnitionLayer />}
      {variant === "blueprint" && <BlueprintLayer />}
      {variant === "flow" && <FlowLayer />}
      {variant === "mechanical" && <MechanicalLayer />}
      {variant === "idle" && <IdleLayer />}

      {/* universal vignette for legibility */}
      <div className="fx-layer fx-vignette" />
      {dim > 0 && (
        <div
          className="fx-layer"
          style={{ background: `rgba(0,0,0,${Math.min(Math.max(dim, 0), 1)})` }}
        />
      )}
    </div>
  );
});

/* ─────────────────────── IGNITION ─────────────────────── */
function IgnitionLayer() {
  const isMobile = useIsMobile();
  // fewer streaks on mobile
  const streakCount = isMobile ? 4 : 8;
  const streaks = Array.from({ length: streakCount });

  return (
    <>
      {/* slow camera push on the whole ambient backdrop */}
      <div className="fx-layer fx-camera-push">
        <div className="fx-layer fx-pulse" />
      </div>

      {/* horizontal light streaks */}
      {streaks.map((_, i) => {
        const top = 8 + ((i * 97) % 84); // pseudo-random but stable
        const dur = 3.8 + (i % 4) * 0.8;
        const delay = (i * 0.47) % 5;
        return (
          <span
            key={i}
            className="fx-streak"
            style={{
              top: `${top}%`,
              animationDuration: `${dur}s`,
              animationDelay: `-${delay}s`,
              opacity: 0.45 + ((i * 13) % 40) / 100
            }}
          />
        );
      })}

      {/* canvas sparks — only real-JS layer on the site */}
      <Sparks />

      {/* grain — very faint */}
      <div className="fx-layer fx-grain" />
    </>
  );
}

/* ─────────────────────── BLUEPRINT ─────────────────────── */
function BlueprintLayer() {
  return (
    <>
      <div className="fx-layer fx-blueprint-grid" />
      {/* crosshairs at stable positions */}
      <div
        className="fx-crosshair"
        style={{ left: "12%", top: "18%", width: 120, height: 120, animationDelay: "-0.3s" }}
      />
      <div
        className="fx-crosshair"
        style={{ right: "8%", top: "62%", width: 160, height: 160, animationDelay: "-1.2s" }}
      />
      <div
        className="fx-crosshair"
        style={{ left: "55%", top: "78%", width: 90, height: 90, animationDelay: "-2.1s" }}
      />

      {/* diagnostic scan sweep */}
      <div className="fx-layer">
        <span className="fx-scan-v" />
      </div>

      {/* faint red atmosphere */}
      <div
        className="fx-layer"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,0,0,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(255,0,0,0.05) 0%, transparent 55%)"
        }}
      />
    </>
  );
}

/* ─────────────────────── FLOW ─────────────────────── */
function FlowLayer() {
  const isMobile = useIsMobile();
  const count = isMobile ? 6 : 14;
  const lines = Array.from({ length: count });

  return (
    <>
      <div className="fx-layer fx-accel">
        {lines.map((_, i) => {
          const top = (i * 100) / count + ((i * 7) % 5);
          const dur = 2.6 + (i % 5) * 0.7;
          const delay = (i * 0.33) % 4;
          return (
            <span
              key={i}
              className="fx-flow-line"
              style={{
                top: `${top}%`,
                animationDuration: `${dur}s`,
                animationDelay: `-${delay}s`,
                opacity: 0.3 + ((i * 17) % 50) / 100
              }}
            />
          );
        })}
      </div>

      {/* edge glow top+bottom — fuel-channel feel */}
      <div
        className="fx-layer"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,0,0,0.08) 0%, transparent 15%, transparent 85%, rgba(255,0,0,0.08) 100%)"
        }}
      />
    </>
  );
}

/* ─────────────────────── MECHANICAL ─────────────────────── */
function MechanicalLayer() {
  return (
    <>
      <div className="fx-layer fx-carbon" />

      {/* rotating gear silhouettes */}
      <div
        className="fx-gear"
        style={{
          width: 320,
          height: 320,
          left: "-80px",
          top: "20%",
          animationDuration: "40s"
        }}
      />
      <div
        className="fx-gear"
        style={{
          width: 220,
          height: 220,
          right: "-40px",
          top: "65%",
          animationDuration: "55s",
          animationDirection: "reverse"
        }}
      />
      <div
        className="fx-gear"
        style={{
          width: 140,
          height: 140,
          right: "20%",
          top: "10%",
          animationDuration: "30s"
        }}
      />

      {/* metallic shimmer pass */}
      <div className="fx-layer" style={{ overflow: "hidden" }}>
        <div className="fx-shimmer" style={{ position: "absolute" }} />
      </div>
    </>
  );
}

/* ─────────────────────── IDLE ─────────────────────── */
function IdleLayer() {
  return (
    <>
      <div className="fx-layer fx-fog" />
      <div
        className="fx-layer fx-glow-breathe"
        style={{
          maxWidth: 900,
          maxHeight: 900,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          right: "auto",
          bottom: "auto"
        }}
      />
    </>
  );
}
