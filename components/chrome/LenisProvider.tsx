"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

/**
 * Smooth-scroll wrapper.
 *
 * Lenis only initializes when:
 *   1. Viewport >= 1024px (skip phones / small tablets)
 *   2. Pointer is "fine" (skip touch — native scrolling feels better there)
 *   3. User hasn't opted in to reduced-motion
 *
 * On everything else we render `{children}` verbatim so mid-range Android +
 * iOS keep native momentum scrolling, lower paint cost, and a smaller JS
 * hot-path.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const desktopFine = useMediaQuery("(min-width: 1024px) and (pointer: fine)");

  useEffect(() => {
    if (!desktopFine) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [desktopFine]);

  return <>{children}</>;
}
