"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** How often to re-pull data from Supabase. Default 15s. */
  intervalMs?: number;
};

/**
 * Drop this into any admin server page to make it live.
 * Triggers `router.refresh()` on an interval — Next.js re-runs the server
 * component's data fetch and streams the updated HTML in without losing scroll
 * position, hydration state, or form input focus.
 *
 * Also renders a pulsing "Live" chip with an "updated Xs ago" counter.
 */
export function DashboardRefresher({ intervalMs = 15000 }: Props) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [secsAgo, setSecsAgo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [paused, setPaused] = useState(false);

  // Pause polling when tab is hidden (saves DB requests when nobody's looking).
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Periodic refresh
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setRefreshing(true);
      router.refresh();
      setLastRefresh(Date.now());
      setTimeout(() => setRefreshing(false), 600);
    }, intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs, paused]);

  // "Xs ago" ticker
  useEffect(() => {
    const t = setInterval(() => {
      setSecsAgo(Math.max(0, Math.floor((Date.now() - lastRefresh) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [lastRefresh]);

  const manualRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setLastRefresh(Date.now());
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.3em]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            paused ? "bg-bone/40" : "animate-pulse bg-green-400"
          )}
        />
        <span className={paused ? "text-bone/50" : "text-green-400"}>
          {paused ? "Paused" : "Live"}
        </span>
        <span className="text-bone/40">·</span>
        <span className="text-bone/60">
          updated {secsAgo < 2 ? "just now" : `${secsAgo}s ago`}
        </span>
      </span>

      <button
        type="button"
        onClick={manualRefresh}
        aria-label="Refresh now"
        data-cursor="cta"
        className={cn(
          "grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon",
          refreshing && "border-neon text-neon"
        )}
        title="Refresh now"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
      </button>
    </div>
  );
}
