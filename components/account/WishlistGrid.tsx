"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Flame, AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import { removeFromWishlist } from "@/app/account/wishlist/actions";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Product } from "@/lib/products/queries";

export type WishlistEntry = {
  product: Product;
  added_at: string;
};

export function WishlistGrid({ initial }: { initial: WishlistEntry[] }) {
  const [items, setItems] = useState<WishlistEntry[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRemove = (productId: string) => {
    setBusyId(productId);
    setError(null);
    startTransition(async () => {
      const res = await removeFromWishlist(productId);
      setBusyId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    });
  };

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-white/10 p-12 text-center text-sm text-bone/50">
        Nothing saved yet. Tap{" "}
        <span className="text-neon">Save to wishlist</span> on any part to stash
        it here.
        <div className="mt-4">
          <Link
            href="/parts"
            className="inline-flex items-center gap-2 border border-white/15 px-5 py-2 text-display text-[10px] uppercase tracking-[0.3em] text-bone hover:border-neon hover:text-neon"
          >
            Browse parts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((entry) => (
            <motion.li
              key={entry.product.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <Card
                entry={entry}
                onRemove={handleRemove}
                busy={busyId === entry.product.id}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function Card({
  entry,
  onRemove,
  busy
}: {
  entry: WishlistEntry;
  onRemove: (id: string) => void;
  busy: boolean;
}) {
  const p = entry.product;
  const primary = p.images[0];
  return (
    <article className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon transition-colors hover:border-neon/40">
      <span className="pointer-events-none absolute left-0 top-0 z-[1] h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 z-[1] h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-2 w-2 border-b border-r border-neon" />

      <Link
        href={`/parts/${p.slug}`}
        data-cursor="cta"
        className="relative aspect-[5/4] w-full overflow-hidden bg-black/60"
      >
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
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
          {p.brand} · {p.category}
        </p>
        <Link
          href={`/parts/${p.slug}`}
          className="mt-1 line-clamp-2 text-display text-base font-bold uppercase leading-tight text-bone hover:text-neon"
        >
          {p.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-xs text-bone/55">
          {p.shortDescription}
        </p>

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
            <p className="text-[9px] uppercase tracking-[0.3em] text-bone/40">
              Price
            </p>
            <p className="mt-1 text-stencil text-xl text-bone">
              {formatPrice(p.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(p.id)}
            disabled={busy}
            data-cursor="cta"
            className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      </div>
    </article>
  );
}
