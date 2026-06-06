"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";
import { useIsMobile } from "@/lib/utils/useIsMobile";

/**
 * Canvas-based spark particles for the Ignition background variant.
 * - DPR-aware but capped at 1.5 on mobile to protect fill-rate.
 * - Count halves on mobile.
 * - Pauses when tab is hidden.
 * - Fully bypassed under prefers-reduced-motion.
 */
export function Sparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = isMobile ? 22 : 55;
    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      size: number;
    };
    const sparks: Spark[] = [];

    const spawn = (s: Spark) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      s.x = Math.random() * w;
      s.y = h * (0.55 + Math.random() * 0.45);
      s.vx = (Math.random() - 0.5) * 0.6;
      s.vy = -(0.6 + Math.random() * 1.4);
      s.life = 0;
      s.max = 60 + Math.random() * 120;
      s.size = 0.8 + Math.random() * 1.6;
    };
    for (let i = 0; i < count; i++) {
      const s: Spark = { x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1 };
      spawn(s);
      s.life = Math.random() * s.max; // stagger initial
      sparks.push(s);
    }

    let running = true;
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && rafRef.current === null) loop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const loop = () => {
      if (!running) {
        rafRef.current = null;
        return;
      }
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      // trail: fade rather than clear — gives the glow its tail
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      for (const s of sparks) {
        s.life++;
        if (s.life > s.max) spawn(s);
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.008; // gentle gravity
        const t = s.life / s.max;
        const alpha = Math.max(0, 1 - t);
        const hue = 0; // red
        const lum = 55 + Math.random() * 30;
        // core
        ctx.fillStyle = `hsla(${hue},100%,${lum}%,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        // halo
        ctx.fillStyle = `hsla(${hue},100%,70%,${alpha * 0.25})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, isMobile]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fx-layer"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
