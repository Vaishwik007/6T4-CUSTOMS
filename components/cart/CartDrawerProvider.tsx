"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

/**
 * MiniCartDrawer is heavy (image thumbs + live stock polling + framer motion).
 * Lazy-load with ssr:false so it never ships on first paint.
 */
const MiniCartDrawer = dynamic(
  () => import("./MiniCartDrawer").then((m) => m.MiniCartDrawer),
  { ssr: false }
);

type CartDrawerContextValue = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

/**
 * Lightweight context that controls the slide-over mini-cart.
 *
 * Lives at the chrome level so the Navbar (and anywhere else) can open the
 * drawer with a single hook call. Automatically closes the drawer on route
 * change so the page transition feels clean.
 */
export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(() => setOpen((o) => !o), []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const value = useMemo<CartDrawerContextValue>(
    () => ({ open, openDrawer, closeDrawer, toggleDrawer }),
    [open, openDrawer, closeDrawer, toggleDrawer]
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <MiniCartDrawer open={open} onClose={closeDrawer} />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used inside <CartDrawerProvider>");
  }
  return ctx;
}
