"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ComponentProps } from "react";

type Props = {
  href?: string;
  variant?: "solid" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
} & ComponentProps<"button">;

export function NeonButton({
  href,
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  const sizes = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-6 py-3 text-xs",
    lg: "px-10 py-4 text-sm"
  } as const;

  const styles = cn(
    "group relative inline-flex items-center justify-center gap-2 text-display uppercase tracking-[0.2em] transition-all duration-200 select-none",
    sizes[size],
    variant === "solid"
      ? "bg-carbon text-bone border border-neon/40 hover:bg-neon-900/40 hover:border-neon hover:shadow-neon hover:text-white"
      : "border border-white/15 text-bone/90 hover:border-neon hover:text-neon",
    className
  );

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {/* corner accents */}
      <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute -right-px -top-px h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r border-neon" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles} data-cursor="cta">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={styles} data-cursor="cta" {...rest}>
      {inner}
    </button>
  );
}
