"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const CATEGORY_FALLBACK_LABEL: Record<string, string> = {
  Exhaust: "EXH",
  "ECU Tuning": "ECU",
  "Air Filter": "AIR",
  "Performance Kit": "KIT",
  Cosmetic: "CSM",
  "Service Kit": "SVC"
};

export function ProductGallery({
  images,
  alt,
  category
}: {
  images: string[];
  alt: string;
  category: string;
}) {
  const valid = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const hasImages = valid.length > 0;

  return (
    <div className="space-y-3">
      <div className="neon-edge relative aspect-square w-full overflow-hidden border border-white/10 bg-black/60">
        <span className="pointer-events-none absolute left-0 top-0 z-[1] h-3 w-3 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 z-[1] h-3 w-3 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-3 w-3 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-3 w-3 border-b border-r border-neon" />

        {hasImages ? (
          <Image
            src={valid[active]}
            alt={alt}
            fill
            priority={active === 0}
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <p className="text-stencil text-7xl text-neon/40">
                {CATEGORY_FALLBACK_LABEL[category] ?? "6T4"}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-bone/40">
                Photography coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {valid.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {valid.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border transition-colors",
                  active === i ? "border-neon" : "border-white/10 hover:border-white/30"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
