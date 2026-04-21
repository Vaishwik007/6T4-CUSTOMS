"use client";

import { usePathname } from "next/navigation";
import { LenisProvider } from "./LenisProvider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { GrainOverlay } from "./GrainOverlay";
import { CursorGlow } from "./CursorGlow";
import { TachometerLoader } from "@/components/loading/TachometerLoader";

/**
 * Chooses the correct chrome stack based on route.
 * - Admin routes get their own AdminShell (via app/admin/layout.tsx); we render
 *   only the decorative grain overlay here and leave content raw.
 * - Every other route gets the customer chrome (Navbar, Footer, smooth scroll,
 *   tachometer loader, cursor glow).
 */
export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {children}
        <GrainOverlay />
      </>
    );
  }

  return (
    <LenisProvider>
      <TachometerLoader />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <GrainOverlay />
      <CursorGlow />
    </LenisProvider>
  );
}
