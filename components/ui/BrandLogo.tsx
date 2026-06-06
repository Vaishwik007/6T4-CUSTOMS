"use client";
import Image from "next/image";
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
 * Renders the master 6T4 Customs logo using Next.js Image for CLS prevention.
 * Uses a fill container with explicit height so the layout reserve is stable.
 * onError → falls back to the stylised "6T4 / CUSTOMS" text wordmark.
 */
export function BrandLogo({
  height,
  src = DEFAULT_SRC,
  fallbackTextSize = "base",
  className
}: Props) {
  const [ok, setOk] = useState(true);

  if (!ok) return <BrandWordmark size={fallbackTextSize} className={className} />;

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{
        height: `${height}px`,
        width: "auto",
        minWidth: `${Math.round(height * 1.5)}px`,
        maxWidth: `${height * 3}px`
      }}
    >
      <Image
        src={src}
        alt="6T4 Customs"
        fill
        sizes={`${height * 3}px`}
        className="object-contain object-left"
        onError={() => setOk(false)}
        priority={height >= 56}
        draggable={false}
      />
    </div>
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
