"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Admin layout:
 * - /admin/login and /admin/change-password render raw (no sidebar, no topbar —
 *   users on those pages are unauthenticated or mid-reset).
 * - Every other /admin/* route is wrapped in AdminShell (sidebar + topbar + bell).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAuthStep =
    pathname === "/admin/login" || pathname === "/admin/change-password";
  if (isAuthStep) return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
