import Link from "next/link";
import { Instagram, Youtube, MessageCircle, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5 bg-black/80">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 border border-neon">
              <span className="absolute inset-1 bg-neon shadow-neon-sm" />
            </div>
            <span className="text-display text-base font-bold tracking-[0.18em]">
              6T4<span className="text-neon">/</span>CUSTOMS
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-bone/60">
            Built Different. Tuned Brutal. Premium motorcycle tuning, fabrication and performance
            engineering.
          </p>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Garage</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/70">
            <li><Link href="/configurator" className="hover:text-neon">Configurator</Link></li>
            <li><Link href="/why-us" className="hover:text-neon">Why Us</Link></li>
            <li><Link href="/owner" className="hover:text-neon">The Owner</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Account</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/70">
            <li><Link href="/account" className="hover:text-neon">My Builds</Link></li>
            <li><Link href="/account" className="hover:text-neon">Orders</Link></li>
            <li><Link href="/admin" className="hover:text-neon">Admin</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Connect</p>
          <div className="mt-4 flex gap-3">
            {[
              { Icon: Instagram, href: "#", label: "Instagram" },
              { Icon: Youtube, href: "#", label: "YouTube" },
              { Icon: Facebook, href: "#", label: "Facebook" },
              { Icon: MessageCircle, href: "https://wa.me/", label: "WhatsApp" }
            ].map(({ Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                data-cursor="cta"
                className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-bone/40">Hyderabad, India</p>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-between gap-2 border-t border-white/5 px-4 py-6 text-xs text-bone/40 md:flex-row md:px-8">
        <span>© {new Date().getFullYear()} 6T4 CUSTOMS · Performance over comfort.</span>
        <Link href="/credits" className="hover:text-neon">
          Image credits
        </Link>
      </div>
    </footer>
  );
}
