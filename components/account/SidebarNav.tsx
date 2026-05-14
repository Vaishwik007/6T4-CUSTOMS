"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Wrench, Bike, MapPin, Heart, LogOut } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutGrid;
  match: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/account",
    label: "Overview",
    Icon: LayoutGrid,
    match: (p) => p === "/account"
  },
  {
    href: "/account#orders",
    label: "Orders",
    Icon: Package,
    match: (p) => p === "/account"
  },
  {
    href: "/account#builds",
    label: "Builds",
    Icon: Wrench,
    match: (p) => p === "/account"
  },
  {
    href: "/account/vehicles",
    label: "Vehicles",
    Icon: Bike,
    match: (p) => p.startsWith("/account/vehicles")
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    Icon: MapPin,
    match: (p) => p.startsWith("/account/addresses")
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    Icon: Heart,
    match: (p) => p.startsWith("/account/wishlist")
  }
];

export function SidebarNav() {
  const pathname = usePathname() ?? "/account";

  const signOut = async () => {
    const supa = createSupabaseBrowser();
    if (supa) await supa.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav
      aria-label="Account navigation"
      className="md:sticky md:top-32 md:self-start"
    >
      {/* Mobile: horizontal scroll strip */}
      <ul className="flex gap-2 overflow-x-auto pb-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className="shrink-0">
            <NavLink item={item} pathname={pathname} variant="strip" />
          </li>
        ))}
        <li className="shrink-0">
          <button
            type="button"
            onClick={signOut}
            data-cursor="cta"
            className="inline-flex items-center gap-2 whitespace-nowrap border border-white/10 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-bone/70 transition-colors hover:border-neon hover:text-neon"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </li>
      </ul>

      {/* Desktop: vertical stack */}
      <ul className="hidden flex-col gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} variant="vertical" />
          </li>
        ))}
        <li className="mt-4 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={signOut}
            data-cursor="cta"
            className="flex w-full items-center gap-3 border border-white/5 bg-black/30 px-4 py-3 text-display text-[10px] uppercase tracking-[0.3em] text-bone/60 transition-colors hover:border-neon hover:text-neon"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}

function NavLink({
  item,
  pathname,
  variant
}: {
  item: NavItem;
  pathname: string;
  variant: "vertical" | "strip";
}) {
  const active = item.match(pathname);
  const base =
    "inline-flex items-center gap-2 whitespace-nowrap text-display text-[10px] uppercase tracking-[0.3em] transition-colors";
  const stripStyles = cn(
    base,
    "border px-3 py-2",
    active
      ? "border-neon bg-neon/10 text-neon"
      : "border-white/10 bg-black/40 text-bone/70 hover:border-neon/60 hover:text-neon"
  );
  const vertStyles = cn(
    base,
    "w-full gap-3 border px-4 py-3",
    active
      ? "border-neon bg-neon/10 text-neon"
      : "border-white/5 bg-black/30 text-bone/60 hover:border-white/20 hover:text-bone"
  );
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      data-cursor="cta"
      className={variant === "strip" ? stripStyles : vertStyles}
    >
      <item.Icon className="h-3.5 w-3.5" />
      {item.label}
    </Link>
  );
}
