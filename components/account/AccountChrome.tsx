"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";

/**
 * Wraps account pages with a sidebar nav.
 * Skips the chrome entirely on /account/login so the login UI keeps its
 * full-screen, centered layout.
 */
export function AccountChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/account";
  const isLogin = pathname.startsWith("/account/login");

  if (isLogin) return <>{children}</>;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-32">
      <div className="md:grid md:grid-cols-[220px_1fr] md:gap-10">
        <aside className="mb-6 md:mb-0 md:pt-24">
          <SidebarNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
