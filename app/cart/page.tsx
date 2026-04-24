"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getPartById } from "@/lib/data/parts";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";
import { formatPrice } from "@/lib/utils/formatPrice";
import { estimateInstallMinutes } from "@/lib/utils/hpEstimator";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLiveStock } from "@/lib/hooks/useLiveStock";
import { cn } from "@/lib/utils/cn";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const resolved = items
    .map((it) => {
      const part = getPartById(it.partId);
      return part ? { ...it, part } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const { stock: liveStock, configured: stockConfigured } = useLiveStock(
    resolved.map((r) => r.partId)
  );

  const subtotal = resolved.reduce((s, x) => {
    const live = liveStock[x.partId];
    const unit = live?.price ?? x.part.price;
    return s + unit * x.qty;
  }, 0);
  const installMins = estimateInstallMinutes(resolved.map((r) => r.part));
  const installHours = Math.round(installMins / 60);

  const anyOutOfStock = resolved.some((r) => {
    if (!stockConfigured) return false;
    const live = liveStock[r.partId];
    return !live || !live.active || live.stock < r.qty;
  });

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <SectionHeader eyebrow="Your Cart" title="Parts Bay" subtitle="Review, adjust, dispatch." />

      {resolved.length === 0 ? (
        <div className="border border-dashed border-white/10 p-16 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-bone/30" />
          <p className="mt-6 text-bone/60">Your cart is empty. Go build a machine.</p>
          <Link
            href="/configurator"
            data-cursor="cta"
            className="mt-6 inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black"
          >
            Open Configurator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_380px]">
          <ul className="space-y-3">
            {resolved.map((it) => {
              const build = it.forBuild;
              const bikeName = build
                ? `${BRANDS_BY_SLUG[build.brand]?.name ?? build.brand} ${getModel(build.brand, build.model)?.name ?? build.model} · ${build.year}`
                : "Universal";
              const live = liveStock[it.partId];
              const isOut =
                stockConfigured && (!live || !live.active || live.stock < 1);
              const exceedsStock =
                stockConfigured && live && live.active && live.stock < it.qty;
              const isLow = !isOut && stockConfigured && live?.low;
              const effectivePrice = live?.price ?? it.part.price;
              const maxQty = stockConfigured && live ? live.stock : undefined;

              return (
                <li
                  key={it.partId}
                  className={cn(
                    "neon-edge relative grid grid-cols-[1fr_auto] items-center gap-4 border bg-carbon p-5",
                    isOut || exceedsStock ? "border-red-500/40" : "border-white/5"
                  )}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
                      {it.part.brand} · {it.part.category}
                    </p>
                    <h3 className="mt-1 text-display text-lg font-bold uppercase">
                      {it.part.name}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
                      For {bikeName}
                    </p>
                    {isOut && (
                      <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-red-400">
                        <AlertTriangle className="h-3 w-3" /> Out of stock
                      </p>
                    )}
                    {!isOut && exceedsStock && (
                      <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-red-400">
                        <AlertTriangle className="h-3 w-3" /> Only {live?.stock} left
                      </p>
                    )}
                    {!isOut && !exceedsStock && isLow && (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-amber-400">
                        Low stock · {live?.stock} left
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-white/10">
                      <button
                        type="button"
                        onClick={() => setQty(it.partId, it.qty - 1)}
                        className="grid h-9 w-9 place-items-center text-bone/70 hover:bg-neon-900/20 hover:text-neon"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-display text-sm">{it.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setQty(
                            it.partId,
                            maxQty !== undefined ? Math.min(maxQty, it.qty + 1) : it.qty + 1
                          )
                        }
                        disabled={maxQty !== undefined && it.qty >= maxQty}
                        className="grid h-9 w-9 place-items-center text-bone/70 hover:bg-neon-900/20 hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-stencil text-xl text-neon">
                        {formatPrice(effectivePrice * it.qty)}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(it.partId)}
                        data-cursor="cta"
                        className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/40 hover:text-neon"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="neon-edge sticky top-24 h-max border border-white/5 bg-carbon p-6">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

            <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">Summary</p>
            <h2 className="mt-2 text-display text-2xl font-bold uppercase">The Damage</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-bone/60">Subtotal ({resolved.length} items)</dt>
                <dd className="text-bone">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-bone/60">Install labour est.</dt>
                <dd className="text-bone">{installHours}h</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-bone/60">Taxes</dt>
                <dd className="text-bone/40">Calculated at checkout</dd>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <dt className="text-display text-xs uppercase tracking-[0.3em]">Total</dt>
                <dd className="text-stencil text-3xl text-neon">{formatPrice(subtotal)}</dd>
              </div>
            </dl>

            {anyOutOfStock && (
              <p className="mt-4 flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
                <AlertTriangle className="h-3 w-3" /> Fix stock issues above to checkout
              </p>
            )}

            <Link
              href={anyOutOfStock ? "#" : "/checkout"}
              onClick={(e) => {
                if (anyOutOfStock) e.preventDefault();
              }}
              data-cursor={anyOutOfStock ? undefined : "cta"}
              aria-disabled={anyOutOfStock}
              className={cn(
                "mt-6 flex items-center justify-center gap-2 bg-neon px-6 py-4 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all",
                anyOutOfStock
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-white hover:shadow-neon-lg"
              )}
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/configurator"
              className="mt-3 block text-center text-[10px] uppercase tracking-[0.3em] text-bone/50 hover:text-neon"
            >
              Add more mods
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
