"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getCrossSellsSync } from "@/lib/cart/cross-sell";
import type { Product } from "@/lib/products/queries";
import { track } from "@/lib/analytics/events";

/**
 * Reads the cart, asks the cross-sell engine, renders a horizontal strip
 * of "also consider" cards. Mounts client-side only — the catalog is
 * already loaded server-side for /parts so this strip can use that data
 * via window.__products if we add a hydration pass, but for now it does
 * one client fetch.
 */
export function CrossSellStrip() {
  const cartItems = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => {
        if (!cancelled) setProducts(d.products ?? []);
      })
      .catch(() => setProducts([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!products || products.length === 0 || cartItems.length === 0) return null;

  const recommendations = getCrossSellsSync(
    cartItems.map((it) => it.partId),
    products,
    3
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-12 border-t border-white/5 pt-8">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Pairs With Your Build
        </p>
        <Link href="/parts" className="text-[10px] uppercase tracking-[0.3em] text-bone/50 hover:text-neon">
          Browse all parts →
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map(({ product: p, reason }) => (
          <li key={p.id} className="neon-edge flex gap-3 border border-white/5 bg-carbon p-3">
            <Link
              href={`/parts/${p.slug}`}
              className="relative aspect-square w-20 shrink-0 overflow-hidden border border-white/10 bg-black/60"
            >
              {p.images[0] ? (
                <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-[10px] uppercase tracking-[0.2em] text-neon/40">
                  {p.category.slice(0, 3)}
                </span>
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-neon">{reason}</p>
                <Link
                  href={`/parts/${p.slug}`}
                  className="mt-0.5 line-clamp-2 text-display text-xs font-bold uppercase leading-tight hover:text-neon"
                >
                  {p.name}
                </Link>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-stencil text-base text-bone">{formatPrice(p.price)}</span>
                <button
                  type="button"
                  onClick={() => {
                    add({ partId: p.id, qty: 1 });
                    track({ name: "add_to_cart", product_id: p.id, price: p.price, qty: 1 });
                  }}
                  data-cursor="cta"
                  aria-label={`Add ${p.name}`}
                  className="grid h-8 w-8 place-items-center border border-neon/50 text-neon transition-colors hover:bg-neon hover:text-black"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
