"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<ImageProps, "src" | "alt"> & {
  /** Primary image path. Can be undefined — SmartImage renders the fallback immediately. */
  src: string | undefined | null;
  alt: string;
  /** Fallback JSX rendered when src is missing or fails to load (e.g. SVG silhouette). */
  fallback: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
};

/**
 * Drop-in replacement for `next/image` that gracefully falls back to any JSX
 * when the file is missing on disk or the request 404s. Lets us ship the site
 * with zero real photos — everything degrades to SVG silhouettes — and light
 * up surfaces automatically as images are added to /public/images/.
 */
export function SmartImage({
  src,
  alt,
  fallback,
  className,
  wrapperClassName,
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={cn("relative h-full w-full", wrapperClassName)}
        aria-label={alt}
        role="img"
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        onError={() => setErrored(true)}
        className={className}
        {...rest}
      />
    </div>
  );
}
