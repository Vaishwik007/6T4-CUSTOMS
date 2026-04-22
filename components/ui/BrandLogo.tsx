"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Pixel height of the rendered logo. Width is auto (preserves aspect). */
  height: number;
  /** Asset path override. Defaults to the JPEG master. Pass the SVG path to use vector. */
  src?: string;
  /** Text-size scale for the fallback wordmark. */
  fallbackTextSize?: "xs" | "sm" | "base" | "lg" | "xl";
  className?: string;
};

const DEFAULT_SRC = "/images/brand/logo.jpeg";

/**
 * Renders the master 6T4 Customs logo. Defaults to the JPEG but accepts a
 * per-call `src` override so individual surfaces can opt into a different asset
 * (e.g. navbar uses SVG for crispness, everywhere else uses JPEG).
 * Uses a plain <img> so the aspect ratio doesn't need to be known up front.
 * onError → falls back to the stylised "6T4 / CUSTOMS" text wordmark.
 */
export function BrandLogo({
  height,
  src = DEFAULT_SRC,
  fallbackTextSize = "base",
  className
}: Props) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    return <BrandWordmark size={fallbackTextSize} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="6T4 Customs"
      onError={() => setOk(false)}
      draggable={false}
      className={cn("block h-auto w-auto select-none", className)}
      style={{ height: `${height}px`, width: "auto", maxWidth: "100%" }}
    />
  );
}

const TEXT_SIZE = {
  xs: "text-[10px]",
  sm: "text-xs",
  base: "text-base",
  lg: "text-lg",
  xl: "text-2xl"
} as const;

export function BrandWordmark({
  size = "base",
  className
}: {
  size?: keyof typeof TEXT_SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-display font-bold tracking-[0.18em]",
        TEXT_SIZE[size],
        className
      )}
    >
      <span className="relative inline-block h-6 w-6 border border-neon">
        <span className="absolute inset-1 bg-neon shadow-neon-sm" />
      </span>
      6T4<span className="text-neon">/</span>CUSTOMS
    </span>
  );
}
