"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";

const SESSION_KEY = "6t4-loader-shown";

export function TachometerLoader() {
  const setShown = useUiStore((s) => s.setLoaderShown);
  const soundOn = useUiStore((s) => s.soundOn);
  const toggleSound = useUiStore((s) => s.toggleSound);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phase, setPhase] = useState<"loading" | "logo" | "glitch" | "done">("loading");
  const [shouldRender, setShouldRender] = useState(true);

  const rpm = useMotionValue(0);
  const rotate = useTransform(rpm, [0, 1], [-120, 120]);
  const display = useTransform(rpm, (v) => Math.round(v * 12000));

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

    const seq = async () => {
      const controls = animate(rpm, 1, { duration: 2.2, ease: [0.7, 0, 0.84, 0] });
      await controls;
      setPhase("logo");
      await new Promise((r) => setTimeout(r, 1400));
      setPhase("glitch");
      await new Promise((r) => setTimeout(r, 600));
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      setShown(true);
      setTimeout(() => setShouldRender(false), 100);
    };
    seq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [soundOn]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <audio ref={audioRef} src="/audio/engine-rev.mp3" loop preload="none" />

          {/* sound toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Mute engine" : "Unmute engine"}
            className="absolute right-6 top-6 grid h-10 w-10 place-items-center border border-white/15 text-bone/70 transition-colors hover:border-neon hover:text-neon"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* tachometer */}
          {phase === "loading" && (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative h-[280px] w-[280px] md:h-[420px] md:w-[420px]"
            >
              <svg viewBox="0 0 200 200" className="h-full w-full">
                {/* outer ring */}
                <circle cx="100" cy="100" r="92" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                {/* arc track */}
                <path
                  d="M 30 150 A 70 70 0 1 1 170 150"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="6"
                />
                {/* progress arc */}
                <motion.path
                  d="M 30 150 A 70 70 0 1 1 170 150"
                  fill="none"
                  stroke="url(#redGrad)"
                  strokeWidth="6"
                  strokeLinecap="butt"
                  style={{ pathLength: rpm }}
                />
                {/* tick marks */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const a = -210 + (i * 240) / 12;
                  const rad = (a * Math.PI) / 180;
                  const x1 = 100 + Math.cos(rad) * 70;
                  const y1 = 100 + Math.sin(rad) * 70;
                  const x2 = 100 + Math.cos(rad) * (i >= 9 ? 60 : 64);
                  const y2 = 100 + Math.sin(rad) * (i >= 9 ? 60 : 64);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i >= 9 ? "#ff0000" : "#3a3a3a"}
                      strokeWidth={i >= 9 ? 3 : 1.5}
                    />
                  );
                })}
                {/* needle */}
                <motion.g style={{ rotate, originX: "100px", originY: "100px" }}>
                  <line x1="100" y1="100" x2="100" y2="38" stroke="#ff0000" strokeWidth="2.5" />
                  <circle cx="100" cy="100" r="6" fill="#ff0000" />
                  <circle cx="100" cy="100" r="3" fill="#000" />
                </motion.g>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3d0000" />
                    <stop offset="60%" stopColor="#ff0000" />
                    <stop offset="100%" stopColor="#ff5050" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                <motion.span className="text-stencil text-5xl text-neon md:text-6xl">
                  {display}
                </motion.span>
                <p className="text-display text-[10px] uppercase tracking-[0.4em] text-bone/50">
                  RPM
                </p>
              </div>
            </motion.div>
          )}

          {/* logo */}
          {(phase === "logo" || phase === "glitch") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative text-center ${phase === "glitch" ? "animate-glitch" : ""}`}
            >
              <h1 className="text-display text-5xl font-black tracking-[0.18em] text-bone md:text-7xl">
                6T4<span className="text-neon">/</span>CUSTOMS
              </h1>
              <p className="mt-3 text-stencil text-lg uppercase tracking-[0.4em] text-neon/90 md:text-xl">
                Built Different. Tuned Brutal.
              </p>
            </motion.div>
          )}

          {phase === "glitch" && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-neon/20 mix-blend-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
