"use client";

import { useEffect, useRef } from "react";

/**
 * Custom red cursor glow.
 * - Two stacked elements: solid dot + radial halo, both pointer-events:none.
 * - Position via rAF lerp for inertia.
 * - Self-disables on touch / coarse pointer / reduced motion.
 * - Hovering [data-cursor="cta"] grows + brightens the halo.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    document.body.classList.add("cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: target.x, y: target.y };
    const halo = { x: target.x, y: target.y };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const cta = el?.closest('[data-cursor="cta"]');
      targetScale = cta ? 1.8 : 1;
    };

    const tick = () => {
      dot.x += (target.x - dot.x) * 0.55;
      dot.y += (target.y - dot.y) * 0.55;
      halo.x += (target.x - halo.x) * 0.15;
      halo.y += (target.y - halo.y) * 0.15;
      scale += (targetScale - scale) * 0.18;

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${dot.x - 6}px, ${dot.y - 6}px, 0)`;
      if (haloRef.current)
        haloRef.current.style.transform = `translate3d(${halo.x - 110}px, ${halo.y - 110}px, 0) scale(${scale})`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.body.classList.remove("cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={haloRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-[220px] w-[220px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,0,0,0.35) 0%, rgba(255,0,0,0.12) 30%, rgba(255,0,0,0) 70%)",
          mixBlendMode: "screen",
          willChange: "transform"
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-3 w-3 rounded-full bg-neon shadow-neon"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
