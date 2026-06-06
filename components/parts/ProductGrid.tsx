"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Volume2, Flame, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Product } from "@/lib/products/queries";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-white/10 p-12 text-center text-sm text-bone/50">
        No parts match these filters. Try widening your search or message us on WhatsApp for custom sourcing.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03 }}
        >
          <ProductCard product={p} />
        </motion.li>
      ))}
    </ul>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const primary = p.images[0];
  return (
    <Link
      href={`/parts/${p.slug}`}
      data-cursor="cta"
      className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon transition-colors hover:border-neon/40"
    >
      <span className="pointer-events-none absolute left-0 top-0 z-[1] h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 z-[1] h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-2 w-2 border-b border-r border-neon" />

      <div className="relative aspect-[5/4] w-full overflow-hidden bg-black/60">
        {primary ? (
          <Image
            src={primary}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="text-display text-2xl uppercase tracking-[0.3em] text-neon/30">
              {p.category.slice(0, 3)}
            </span>
          </div>
        )}
        {p.hpGain != null && p.hpGain > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-neon px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
            <Flame className="h-3 w-3" />+{p.hpGain} HP
          </span>
        )}
        {!p.inStock && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 border border-red-500/40 bg-red-500/15 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300">
            <AlertTriangle className="h-3 w-3" /> Sold out
          </span>
        )}
        {p.inStock && p.lowStock && (
          <span className="absolute right-3 top-3 border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-300">
            Low · {p.stock} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
          {p.brand} · {p.category}
        </p>
        <h3 className="mt-1 line-clamp-2 text-display text-base font-bold uppercase leading-tight text-bone">
          {p.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs text-bone/55">{p.shortDescription}</p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.25em]">
          {p.soundDb && (
            <span className="chip flex items-center gap-1">
              <Volume2 className="h-2.5 w-2.5" />
              {p.soundDb} dB
            </span>
          )}
          {p.installMinutes != null && p.installMinutes > 0 && (
            <span className="chip">~{p.installMinutes} min fit</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-bone/40">Price</p>
            <p className="mt-1 text-stencil text-xl text-bone">{formatPrice(p.price)}</p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
