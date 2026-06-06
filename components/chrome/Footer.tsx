import Link from "next/link";
import { Instagram, Youtube, MessageCircle, Facebook, Phone, Mail } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SITE_INFO, getWhatsAppLink } from "@/lib/data/site-info";

export function Footer() {
  const waLink = getWhatsAppLink("Hi 6T4 Customs");

  return (
    <footer className="relative mt-32 border-t border-white/5 bg-black/80">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <BrandLogo height={56} fallbackTextSize="lg" />
          <p className="mt-4 max-w-xs text-sm text-bone/60">
            {SITE_INFO.tagline} Premium motorcycle tuning, fabrication and performance engineering.
          </p>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Garage</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/70">
            <li><Link href="/services" className="hover:text-neon">Services</Link></li>
            <li><Link href="/configurator" className="hover:text-neon">Configurator</Link></li>
            <li><Link href="/why-us" className="hover:text-neon">Why Us</Link></li>
            <li><Link href="/owner" className="hover:text-neon">The Owner</Link></li>
            <li><Link href="/contact" className="hover:text-neon">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Account</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/70">
            <li><Link href="/account" className="hover:text-neon">My Builds</Link></li>
            <li><Link href="/account" className="hover:text-neon">Orders</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">Connect</p>
          <div className="mt-4 flex gap-3">
            {[
              { Icon: Instagram, href: SITE_INFO.social.instagram, label: "Instagram" },
              { Icon: Youtube, href: SITE_INFO.social.youtube, label: "YouTube" },
              { Icon: Facebook, href: SITE_INFO.social.facebook, label: "Facebook" },
              { Icon: MessageCircle, href: waLink, label: "WhatsApp" }
            ].map(({ Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                data-cursor="cta"
                className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <div className="mt-4 space-y-1">
            <a
              href={`tel:${SITE_INFO.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-xs text-bone/50 hover:text-neon"
            >
              <Phone className="h-3 w-3 text-neon/60" /> {SITE_INFO.phone}
            </a>
            <a
              href={`mailto:${SITE_INFO.email}`}
              className="flex items-center gap-2 text-xs text-bone/50 hover:text-neon"
            >
              <Mail className="h-3 w-3 text-neon/60" /> {SITE_INFO.email}
            </a>
          </div>
          <p className="mt-4 text-xs text-bone/60">{SITE_INFO.address.full}</p>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-between gap-2 border-t border-white/5 px-4 py-6 text-xs text-bone/60 md:flex-row md:px-8">
        <span>© {new Date().getFullYear()} 6T4 CUSTOMS · Performance over comfort.</span>
        <div className="flex items-center gap-4">
          <Link href="/credits" className="hover:text-neon">
            Image credits
          </Link>
          <Link href="/privacy" className="hover:text-neon">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neon">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
