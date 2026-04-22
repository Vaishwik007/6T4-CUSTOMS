"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/ui/BrandLogo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/configurator", label: "Configurator" },
  { href: "/why-us", label: "Why Us" },
  { href: "/owner", label: "Owner" },
  { href: "/account", label: "Account" }
];

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, it) => n + it.qty, 0);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-[55] transition-all duration-300",
        scrolled
          ? "bg-black/70 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center" data-cursor="cta" aria-label="6T4 Customs — Home">
          <BrandLogo src="/images/brand/logo.svg" height={32} fallbackTextSize="base" className="md:hidden" />
          <BrandLogo src="/images/brand/logo.svg" height={40} fallbackTextSize="base" className="hidden md:block" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-cursor="cta"
              className="text-display text-xs uppercase tracking-[0.2em] text-bone/70 transition-colors hover:text-neon"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/account/login"
            data-cursor="cta"
            className="hidden h-9 w-9 items-center justify-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon md:inline-flex"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            data-cursor="cta"
            className="relative inline-flex h-9 w-9 items-center justify-center border border-white/10 text-bone/80 transition-colors hover:border-neon hover:text-neon"
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-neon px-1 text-[10px] font-bold text-black">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-bone/80 md:hidden"
            aria-label="Menu"
            data-cursor="cta"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-black/95 px-4 py-4 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-display text-sm uppercase tracking-[0.2em] text-bone/80 hover:text-neon"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
