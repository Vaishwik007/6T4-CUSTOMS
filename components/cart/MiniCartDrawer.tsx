"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getPartById } from "@/lib/data/parts";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";
import { useLiveStock } from "@/lib/hooks/useLiveStock";
import { formatPrice } from "@/lib/utils/formatPrice";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils/cn";

interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-over mini-cart triggered from the Navbar cart icon.
 *
 * Surfaces: thumbnail, name, brand, build context, per-line price, inline
 * quantity +/-, remove, subtotal, and dual CTAs (View cart / Checkout).
 * Reads live stock via {@link useLiveStock} so out-of-stock and low-stock
 * states match the full cart page. Closes on backdrop click, Escape, and
 * (via CartDrawerProvider) route change.
 */
export function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const resolved = useMemo(
    () =>
      items
        .map((it) => {
          const part = getPartById(it.partId);
          return part ? { ...it, part } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x),
    [items]
  );

  const partIds = useMemo(() => resolved.map((r) => r.partId), [resolved]);
  const { stock: liveStock, configured: stockConfigured } = useLiveStock(partIds);

  const subtotal = resolved.reduce((sum, x) => {
    const live = liveStock[x.partId];
    const unit = live?.price ?? x.part.price;
    return sum + unit * x.qty;
  }, 0);

  const itemCount = resolved.reduce((n, r) => n + r.qty, 0);

  const anyOutOfStock = resolved.some((r) => {
    if (!stockConfigured) return false;
    const live = liveStock[r.partId];
    return !live || !live.active || live.stock < r.qty;
  });

  // Body scroll lock + escape + focus trap (light) while open.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);

    // Move focus into the drawer after the open animation begins.
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 32);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  // Fire view_cart whenever the drawer opens (mirrors GA4 expectations).
  useEffect(() => {
    if (!open) return;
    track({ name: "view_cart", item_count: itemCount, total: subtotal });
    // Intentionally only depend on `open` — we want one event per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Mini cart">
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-carbon shadow-neon-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
                  Your Cart
                </p>
                <h2 className="mt-1 text-display text-lg font-bold uppercase">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {resolved.length === 0 ? (
                <EmptyState onClose={onClose} />
              ) : (
                <ul className="space-y-3">
                  {resolved.map((it) => {
                    const live = liveStock[it.partId];
                    const isOut = stockConfigured && (!live || !live.active || live.stock < 1);
                    const exceedsStock =
                      stockConfigured && live && live.active && live.stock < it.qty;
                    const isLow = !isOut && stockConfigured && live?.low;
                    const effectivePrice = live?.price ?? it.part.price;
                    const maxQty = stockConfigured && live ? live.stock : undefined;
                    const image = it.part.images?.[0];
                    const build = it.forBuild;
                    const bikeLabel = build
                      ? `${BRANDS_BY_SLUG[build.brand]?.name ?? build.brand} ${getModel(build.brand, build.model)?.name ?? build.model} · ${build.year}`
                      : "Universal";

                    return (
                      <li
                        key={it.partId}
                        className={cn(
                          "neon-edge relative grid grid-cols-[64px_1fr] gap-3 border bg-gunmetal/60 p-3",
                          isOut || exceedsStock ? "border-red-500/40" : "border-white/5"
                        )}
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-white/10 bg-black">
                          {image ? (
                            <Image
                              src={image}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.2em] text-bone/30">
                              {it.part.brand.slice(0, 3)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
                                {it.part.brand}
                              </p>
                              <h3 className="mt-0.5 truncate text-display text-sm font-bold uppercase">
                                {it.part.name}
                              </h3>
                              <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.3em] text-bone/40">
                                {bikeLabel}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(it.partId)}
                              className="grid h-7 w-7 shrink-0 place-items-center text-bone/40 hover:text-neon"
                              aria-label={`Remove ${it.part.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {isOut && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-red-400">
                              <AlertTriangle className="h-3 w-3" /> Out of stock
                            </p>
                          )}
                          {!isOut && exceedsStock && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-red-400">
                              <AlertTriangle className="h-3 w-3" /> Only {live?.stock} left
                            </p>
                          )}
                          {!isOut && !exceedsStock && isLow && (
                            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-amber-400">
                              Low stock · {live?.stock} left
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center border border-white/10">
                              <button
                                type="button"
                                onClick={() => setQty(it.partId, it.qty - 1)}
                                className="grid h-11 w-11 place-items-center text-bone/70 transition-colors hover:bg-neon-900/20 hover:text-neon"
                                aria-label="Decrease quantity"
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
                                className="grid h-11 w-11 place-items-center text-bone/70 transition-colors hover:bg-neon-900/20 hover:text-neon disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-stencil text-lg text-neon">
                              {formatPrice(effectivePrice * it.qty)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {resolved.length > 0 && (
              <footer className="border-t border-white/10 px-5 py-4">
                <dl className="flex items-center justify-between">
                  <dt className="text-display text-[10px] uppercase tracking-[0.3em] text-bone/60">
                    Subtotal
                  </dt>
                  <dd className="text-stencil text-2xl text-neon">{formatPrice(subtotal)}</dd>
                </dl>
                <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/30">
                  Taxes calculated at checkout
                </p>

                {anyOutOfStock && (
                  <p className="mt-3 flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
                    <AlertTriangle className="h-3 w-3" /> Fix stock issues to checkout
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex items-center justify-center border border-white/15 px-4 py-3 text-display text-[10px] uppercase tracking-[0.3em] text-bone/80 transition-colors hover:border-neon hover:text-neon"
                  >
                    View cart
                  </Link>
                  <Link
                    href={anyOutOfStock ? "/cart" : "/checkout"}
                    onClick={(e) => {
                      if (anyOutOfStock) {
                        e.preventDefault();
                        return;
                      }
                      onClose();
                    }}
                    aria-disabled={anyOutOfStock}
                    className={cn(
                      "flex items-center justify-center gap-2 bg-neon px-4 py-3 text-display text-[10px] uppercase tracking-[0.3em] font-bold text-black transition-all",
                      anyOutOfStock
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-white hover:shadow-neon-lg"
                    )}
                  >
                    Checkout <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid place-items-center px-4 py-16 text-center">
      <ShoppingCart className="h-10 w-10 text-bone/30" aria-hidden />
      <p className="mt-6 text-bone/60">Your cart is empty.</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Go build a machine.
      </p>
      <Link
        href="/configurator"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-2 bg-neon px-5 py-3 text-display text-[10px] uppercase tracking-[0.3em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
      >
        Open Configurator <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
