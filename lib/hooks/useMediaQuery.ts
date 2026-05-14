"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a media query and return its current match state.
 *
 * SSR-safe: returns `false` on the server and during the initial client render,
 * then re-renders once after mount so callers can opt-in to desktop/coarse
 * branches without hydration mismatches. The opt-in is intentional — components
 * that need the desktop-only branch should render the mobile/baseline branch
 * by default and progressively enhance.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Safari <14 fallback
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
