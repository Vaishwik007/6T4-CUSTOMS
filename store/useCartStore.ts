"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/data/types";

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (partId: string) => void;
  setQty: (partId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.partId === item.partId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.partId === item.partId ? { ...i, qty: i.qty + item.qty } : i
              )
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (partId) => set((s) => ({ items: s.items.filter((i) => i.partId !== partId) })),
      setQty: (partId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.partId === partId ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0)
        })),
      clear: () => set({ items: [] })
    }),
    { name: "6t4-cart-v1" }
  )
);
