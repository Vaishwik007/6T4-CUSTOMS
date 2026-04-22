"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/store/useUiStore";
import { BrandLogo } from "@/components/ui/BrandLogo";

const SESSION_KEY = "6t4-loader-shown";
const PLAYBACK_RATE = 2; // 2× speed as requested
const FALLBACK_DURATION_MS = 4000; // safety net if the video never loads / ended never fires

/**
 * Loader sequence:
 *   1. video — /video/loader.mp4 plays muted @ 2× speed
 *   2. logo  — "6T4 / CUSTOMS" brand moment fades in
 *   3. glitch — RGB-shift flash transition
 *   4. done   — loader removed from DOM
 *
 * Gated by sessionStorage so it only plays once per session.
 * Honours `prefers-reduced-motion` by skipping straight to done.
 */
export function TachometerLoader() {
  const setShown = useUiStore((s) => s.setLoaderShown);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [phase, setPhase] = useState<"video" | "logo" | "glitch" | "done">("video");
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setShown(true);
      setShouldRender(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShown(true);
      setShouldRender(false);
      return;
    }

    let cancelled = false;
    const finishSequence = async () => {
      if (cancelled) return;
      setPhase("logo");
      await new Promise((r) => setTimeout(r, 1200));
      if (cancelled) return;
      setPhase("glitch");
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      setShown(true);
      setTimeout(() => {
        if (!cancelled) setShouldRender(false);
      }, 100);
    };

    // Fallback: if the video fails to load or onEnded never fires, advance anyway.
    const fallbackTimer = setTimeout(finishSequence, FALLBACK_DURATION_MS);

    const video = videoRef.current;
    if (video) {
      video.playbackRate = PLAYBACK_RATE;
      const onEnded = () => {
        clearTimeout(fallbackTimer);
        finishSequence();
      };
      const onError = () => {
        clearTimeout(fallbackTimer);
        finishSequence();
      };
      video.addEventListener("ended", onEnded);
      video.addEventListener("error", onError);
      video.play().catch(() => {
        /* autoplay blocked — fallback timer will still advance */
      });

      return () => {
        cancelled = true;
        clearTimeout(fallbackTimer);
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("error", onError);
      };
    }

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep playbackRate pinned to 2× even if the browser resets it during preload.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ensureRate = () => {
      v.playbackRate = PLAYBACK_RATE;
    };
    v.addEventListener("play", ensureRate);
    v.addEventListener("loadedmetadata", ensureRate);
    ensureRate();
    return () => {
      v.removeEventListener("play", ensureRate);
      v.removeEventListener("loadedmetadata", ensureRate);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
        >
          {/* video — always mounted so the ref exists from first render */}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              phase === "video" ? "opacity-100" : "opacity-0"
            }`}
            src="/video/loader.mp4"
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-hidden
          />

          {/* subtle vignette on the video to stay on-brand */}
          {phase === "video" && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)"
              }}
            />
          )}

          {/* brand moment — renders the master logo, falls back to wordmark */}
          {(phase === "logo" || phase === "glitch") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`relative z-10 flex max-w-[90vw] flex-col items-center text-center ${phase === "glitch" ? "animate-glitch" : ""}`}
            >
              <BrandLogo height={96} fallbackTextSize="xl" />
              <p className="mt-5 text-stencil text-lg uppercase tracking-[0.4em] text-neon/90 md:text-xl">
                Built Different. Tuned Brutal.
              </p>
            </motion.div>
          )}

          {phase === "glitch" && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[5] bg-neon/20 mix-blend-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
