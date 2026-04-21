import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function GlassPanel({
  className,
  children,
  variant = "default",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "red" }) {
  return (
    <div
      className={cn(
        variant === "red" ? "glass-red" : "glass",
        "relative scanline overflow-hidden",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
