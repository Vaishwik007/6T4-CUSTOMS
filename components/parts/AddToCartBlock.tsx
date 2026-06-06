"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/products/queries";
import { track } from "@/lib/analytics/events";

export function AddToCartBlock({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const maxQty = product.stock > 0 ? product.stock : 1;

  const handleAdd = (then?: "view-cart" | "checkout") => {
    if (!product.inStock) return;
    setAdding(true);
    add({ partId: product.id, qty });
    track({ name: "add_to_cart", product_id: product.id, price: product.price, qty });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (then === "view-cart") router.push("/cart");
    if (then === "checkout") {
      track({ name: "begin_checkout", total: product.price * qty, item_count: qty });
      router.push("/checkout");
    }
  };

  const disabled = !product.inStock;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center border border-white/15">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={disabled || qty <= 1}
            aria-label="Decrease quantity"
            className="grid h-12 w-12 place-items-center text-bone/80 transition-colors hover:bg-neon-900/20 hover:text-neon disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="grid w-10 place-items-center text-display text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={disabled || qty >= maxQty}
            aria-label="Increase quantity"
            className="grid h-12 w-12 place-items-center text-bone/80 transition-colors hover:bg-neon-900/20 hover:text-neon disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <motion.button
          type="button"
          onClick={() => handleAdd()}
          disabled={disabled || adding}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          data-cursor={disabled ? undefined : "cta"}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-6 text-display text-xs uppercase tracking-[0.2em] font-bold transition-all",
            disabled
              ? "cursor-not-allowed bg-white/5 text-bone/40"
              : added
                ? "bg-emerald-500 text-black"
                : "bg-neon text-black hover:bg-white hover:shadow-neon-lg"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {disabled ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
        </motion.button>
      </div>

      <button
        type="button"
        onClick={() => handleAdd("checkout")}
        disabled={disabled}
        data-cursor={disabled ? undefined : "cta"}
        className={cn(
          "flex w-full items-center justify-center gap-2 border px-6 py-3 text-display text-xs uppercase tracking-[0.2em] transition-all",
          disabled
            ? "cursor-not-allowed border-white/5 text-bone/30"
            : "border-white/20 text-bone hover:border-neon hover:text-neon"
        )}
      >
        Buy Now <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
