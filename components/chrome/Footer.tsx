import Link from "next/link";
import { Instagram, Youtube, MessageCircle, Facebook, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SITE } from "@/lib/seo/config";

const SOCIALS = [
  { Icon: Instagram, href: SITE.socials.instagram, label: "Instagram" },
  { Icon: Youtube, href: SITE.socials.youtube, label: "YouTube" },
  { Icon: Facebook, href: SITE.socials.facebook, label: "Facebook" },
  { Icon: MessageCircle, href: `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`, label: "WhatsApp" }
];

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Parts", href: "/parts" },
      { label: "Services", href: "/services" },
      { label: "Configurator", href: "/configurator" },
      { label: "Book a Slot", href: "/book" }
    ]
  },
  {
    title: "Garage",
    links: [
      { label: "About", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Why Us", href: "/why-us" },
      { label: "The Owner", href: "/owner" }
    ]
  },
  {
    title: "Account",
    links: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/account" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}` },
      { label: "Image Credits", href: "/credits" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Returns", href: "/legal/returns" },
      { label: "Warranty", href: "/legal/warranty" },
      { label: "Shipping", href: "/legal/shipping" }
    ]
  }
];

export function Footer() {
  const waNumber = SITE.whatsapp.replace(/\D/g, "");
  return (
    <footer className="relative mt-32 border-t border-white/5 bg-black/80">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:grid-cols-12 md:px-8">
        {/* Brand + contact */}
        <div className="md:col-span-4">
          <BrandLogo height={56} fallbackTextSize="lg" />
          <p className="mt-4 max-w-xs text-sm text-bone/60">
            Built Different. Tuned Brutal. Premium motorcycle tuning, fabrication and performance engineering in Hyderabad.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-bone/70">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neon" />
              {SITE.address.streetAddress}, {SITE.address.addressLocality} {SITE.address.postalCode}
            </li>
            <li>
              <a
                href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 hover:text-neon"
              >
                <Phone className="h-4 w-4 text-neon" /> {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 hover:text-neon"
              >
                <Mail className="h-4 w-4 text-neon" /> {SITE.email}
              </a>
            </li>
            <li className="text-xs uppercase tracking-[0.2em] text-bone/40">
              Mon–Sat · {SITE.hours.open}–{SITE.hours.close}
            </li>
          </ul>

          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="cta"
                className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 transition-colors hover:border-neon hover:text-neon"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="md:col-span-8 grid grid-cols-2 gap-8 md:grid-cols-5">
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-display text-xs uppercase tracking-[0.2em] text-neon">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-bone/70">
                {col.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-neon"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="hover:text-neon">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust + payment strip */}
      <div className="relative border-t border-white/5 bg-black/50">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[10px] uppercase tracking-[0.3em] text-bone/60 md:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-neon" />
            Secure payments · Razorpay
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>UPI</span>
            <span>·</span>
            <span>Visa</span>
            <span>·</span>
            <span>Mastercard</span>
            <span>·</span>
            <span>RuPay</span>
            <span>·</span>
            <span>Net Banking</span>
            <span>·</span>
            <span>Wallets</span>
          </div>
          {SITE.gstin && (
            <div className="text-bone/40">
              GSTIN · <span className="font-mono">{SITE.gstin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="relative flex flex-col items-center justify-between gap-2 border-t border-white/5 px-4 py-6 text-xs text-bone/40 md:flex-row md:px-8">
        <span>© {new Date().getFullYear()} 6T4 CUSTOMS · Performance over comfort.</span>
        <Link href="/legal" className="hover:text-neon">
          Legal
        </Link>
      </div>
    </footer>
  );
}
