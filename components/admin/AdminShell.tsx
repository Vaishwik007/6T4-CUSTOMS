"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Gauge,
  Package,
  Wrench,
  Calendar,
  BarChart3,
  Users,
  ScrollText,
  Bell,
  LogOut,
  Settings,
  ShoppingCart,
  Menu,
  X,
  Shield,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/ui/BrandLogo";

const NAV = [
  { href: "/admin", label: "Overview", Icon: Gauge, exact: true },
  { href: "/admin/sales", label: "Sales", Icon: BarChart3 },
  { href: "/admin/inventory", label: "Inventory", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/bookings", label: "Bookings", Icon: Calendar },
  { href: "/admin/logs", label: "Activity", Icon: ScrollText },
  { href: "/admin/settings", label: "Settings", Icon: Settings }
];

type Admin = { username: string; role: string; forcePasswordChange: boolean };
type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  severity: string;
  read_at: string | null;
  created_at: string;
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Admin | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setMe(d.admin);
      });
  }, []);

  const fetchNotifs = async () => {
    const res = await fetch("/api/admin/notifications").then((r) => r.json());
    if (res.ok) setNotifs(res.notifications);
  };

  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, []);

  const unread = notifs.filter((n) => !n.read_at).length;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const markAll = async () => {
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true })
    });
    fetchNotifs();
  };

  return (
    <div className="min-h-screen bg-black text-bone">
      {/* Top rail */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-black/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link href="/admin" className="flex items-center" aria-label="6T4 Customs Admin">
              <BrandLogo height={28} fallbackTextSize="sm" />
            </Link>
            {/* live status pulse */}
            <span className="hidden items-center gap-2 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-green-400 md:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse bg-green-400" /> Bay Online
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
                aria-label={`Notifications (${unread} unread)`}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center bg-neon px-1 text-[9px] font-bold text-black">
                    {unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] border border-neon/40 bg-black/95 shadow-neon backdrop-blur"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <span className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                        Alerts · {unread} unread
                      </span>
                      <button
                        type="button"
                        onClick={markAll}
                        className="text-[10px] uppercase tracking-[0.2em] text-bone/60 hover:text-neon"
                      >
                        Mark all read
                      </button>
                    </div>
                    <ul className="max-h-[400px] overflow-auto">
                      {notifs.length === 0 && (
                        <li className="px-4 py-8 text-center text-xs text-bone/40">
                          No notifications yet.
                        </li>
                      )}
                      {notifs.map((n) => (
                        <li
                          key={n.id}
                          className={cn(
                            "border-b border-white/5 px-4 py-3 transition-colors",
                            !n.read_at && "bg-neon-900/10"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={cn(
                                "mt-1 h-1.5 w-1.5 shrink-0",
                                n.severity === "critical" && "bg-neon",
                                n.severity === "warning" && "bg-yellow-400",
                                n.severity === "info" && "bg-blue-400",
                                n.severity === "success" && "bg-green-400"
                              )}
                            />
                            <div className="flex-1">
                              <p className="text-display text-xs font-bold uppercase">{n.title}</p>
                              {n.body && (
                                <p className="mt-0.5 text-[11px] text-bone/60">{n.body}</p>
                              )}
                              <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-bone/30">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {me && (
              <div className="hidden items-center gap-2 border border-white/10 px-3 py-1.5 md:flex">
                <Shield className="h-3 w-3 text-neon" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-bone/80">
                  {me.username}
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-neon">
                  {me.role.replace("_", " ")}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[240px] border-r border-white/5 bg-black/95 pt-14 backdrop-blur transition-transform",
          !mobileOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                data-cursor="cta"
                data-active={active}
                className={cn(
                  "group relative flex items-center gap-3 border-l-2 px-4 py-3 text-display text-[11px] uppercase tracking-[0.2em] transition-all",
                  active
                    ? "border-l-neon bg-neon-900/20 text-neon"
                    : "border-l-transparent text-bone/70 hover:border-l-neon/50 hover:bg-white/5 hover:text-bone"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-4 border border-white/5 bg-neon-900/10 p-4 text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <p className="text-neon">6T4 Ops Console</p>
          <p className="mt-1">Performance over comfort.</p>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen pt-14 md:pl-[240px]">
        <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Supabase unconfigured banner */}
      <UnconfiguredBanner />
    </div>
  );
}

function UnconfiguredBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    fetch("/api/admin/me").then((r) => {
      if (r.status === 503) setShow(true);
    });
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-300 md:left-[260px]">
      <span className="inline-flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Supabase not configured. Admin actions will fail. Set env keys in
        <code className="mx-1 bg-black/40 px-1">.env.local</code>and apply migrations.
      </span>
    </div>
  );
}
