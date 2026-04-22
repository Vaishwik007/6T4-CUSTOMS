"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Pixel height of the rendered logo. Width is auto (preserves aspect). */
  height: number;
  /** Text-size scale for the fallback wordmark. */
  fallbackTextSize?: "xs" | "sm" | "base" | "lg" | "xl";
  className?: string;
};

/**
 * Renders the master 6T4 Customs logo from /images/brand/logo.svg.
 * Uses a plain <img> so the aspect ratio doesn't need to be known up front —
 * browser lays it out by the SVG's intrinsic dimensions.
 * If the file is missing or fails to load, falls back to the stylised
 * "6T4 / CUSTOMS" text wordmark so the site never breaks.
 */
export function BrandLogo({ height, fallbackTextSize = "base", className }: Props) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    return <BrandWordmark size={fallbackTextSize} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/brand/logo.svg"
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
