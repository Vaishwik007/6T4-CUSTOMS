import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, ArrowRight } from "lucide-react";
import { SERVICES, type Service } from "@/lib/services/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = buildMetadata({
  path: "/services",
  title: "Services",
  description:
    "Stage 1, 2, 3 ECU flashes. Dyno runs with printed reports. Major service. TIG-welded fabrication. Priced upfront — no surprises at the counter.",
  keywords: [
    "stage 1 ecu flash hyderabad",
    "stage 2 tune india",
    "dyno tuning hyderabad",
    "motorcycle major service",
    "tig welding motorcycle",
    "custom fabrication motorcycle"
  ]
});

const TIER_BADGE_CLASS: Record<number, string> = {
  1: "border-chrome/40 text-bone",
  2: "border-ignition/60 text-ignition",
  3: "border-neon/60 text-neon"
};

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      {SERVICES.map((s) => (
        <JsonLd
          key={s.slug}
          data={serviceJsonLd({
            slug: s.slug,
            name: s.name,
            description: s.shortDescription,
            price: s.basePrice,
            durationMinutes: s.durationMinutes
          })}
        />
      ))}

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">Services</span>
      </nav>

      <header className="mb-12 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          <span className="h-px w-8 bg-neon" />
          The Bench
        </p>
        <h1 className="text-display text-4xl font-black uppercase leading-tight text-bone md:text-6xl">
          Tuning. Service. Fabrication.
        </h1>
        <p className="mt-4 max-w-xl text-base text-bone/60 md:text-lg">
          Honest prices. Bench-flashed by hand. Bay slot reserved on booking.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </ul>

      <p className="mt-16 text-center text-sm text-bone/50">
        Not sure which service you need? <Link href="/services/stage-1-flash" className="text-neon hover:underline">Start with Stage 1</Link>{" "}
        or message us on WhatsApp.
      </p>
    </section>
  );
}

function ServiceCard({ service: s }: { service: Service }) {
  const hours = Math.round((s.durationMinutes / 60) * 10) / 10;
  return (
    <li>
      <Link
        href={`/services/${s.slug}`}
        data-cursor="cta"
        className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon p-6 transition-colors hover:border-neon/40 md:p-8"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
              {s.category}
            </p>
            <h2 className="mt-2 text-display text-2xl font-bold uppercase leading-tight">
              {s.name}
            </h2>
          </div>
          {s.tier && (
            <span
              className={cn(
                "shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.3em]",
                TIER_BADGE_CLASS[s.tier]
              )}
            >
              Stage {s.tier}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm text-bone/65">{s.shortDescription}</p>

        <div className="mt-5 flex items-end justify-between gap-4 pt-5 border-t border-white/5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-bone/40">Price</p>
            <p className="mt-1 text-stencil text-2xl text-neon">
              {s.requiresQuote ? "Quote" : (s.priceLabel ?? formatPrice(s.basePrice))}
            </p>
          </div>
          <div className="text-right">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/50">
              <Clock className="h-3 w-3" /> ~{hours}h
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
              Details <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
