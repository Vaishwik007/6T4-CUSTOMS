import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { BRANDS } from "@/lib/data/brands";
import { MODELS_BY_BRAND } from "@/lib/data/models";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Brand, Region } from "@/lib/data/types";

export const metadata: Metadata = buildMetadata({
  path: "/garage",
  title: "The Garage — Bikes We Tune",
  description:
    "Every motorcycle brand we've put on the bench. Performance parts, ECU flashes, and dyno-proven tunes for KTM, Royal Enfield, Ducati, BMW Motorrad, Triumph, and more.",
  keywords: [
    "motorcycle tuning brands india",
    "ktm parts",
    "royal enfield tuning",
    "ducati performance",
    "bmw motorrad parts hyderabad"
  ]
});

const REGION_ORDER: Region[] = ["India", "Japan", "Europe", "USA", "Other"];

export default function GaragePage() {
  const grouped = groupByRegion(BRANDS);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Garage", path: "/garage" }
        ])}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50"
      >
        <Link href="/" className="hover:text-neon">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">Garage</span>
      </nav>

      <header className="mb-14 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          <span className="h-px w-8 bg-neon" />
          The Garage
        </p>
        <h1 className="text-display text-4xl font-black uppercase leading-[0.95] text-bone md:text-6xl">
          Every Bike We&apos;ve Tuned.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-bone/70 md:text-lg">
          {BRANDS.length} brands. {totalModelCount()} catalogued models. From the bench to the dyno —
          pick a brand to see parts and tunes we&apos;ve done for it.
        </p>
      </header>

      {REGION_ORDER.map((region) => {
        const list = grouped[region] ?? [];
        if (list.length === 0) return null;
        return (
          <div key={region} className="mb-16 last:mb-0">
            <h2 className="mb-6 flex items-baseline gap-3 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <span className="h-px w-6 bg-neon" />
              {region}
              <span className="text-bone/40">/ {list.length}</span>
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((brand) => (
                <BrandCard key={brand.slug} brand={brand} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const modelCount = MODELS_BY_BRAND[brand.slug]?.length ?? 0;
  return (
    <li>
      <Link
        href={`/garage/${brand.slug}`}
        data-cursor="cta"
        className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon p-6 transition-colors hover:border-neon/40"
        style={{ ["--brand-accent" as string]: brand.accent }}
      >
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

        <div className="flex h-16 items-center">
          <SmartImage
            src={brand.logo}
            alt={`${brand.name} logo`}
            fill
            sizes="160px"
            wrapperClassName="!h-12 !w-32"
            className="object-contain object-left transition-opacity duration-300 group-hover:opacity-90"
            fallback={
              <span className="text-display text-xl font-bold uppercase tracking-wide text-bone">
                {brand.name}
              </span>
            }
          />
        </div>

        <div className="mt-5">
          <p className="text-display text-base font-bold uppercase tracking-wide text-bone">
            {brand.name}
          </p>
          {brand.tagline && (
            <p className="mt-1 text-xs italic text-bone/45">&ldquo;{brand.tagline}&rdquo;</p>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-[10px] uppercase tracking-[0.25em]">
          <div>
            <dt className="text-bone/40">Country</dt>
            <dd className="mt-1 text-bone/80">{brand.country}</dd>
          </div>
          <div>
            <dt className="text-bone/40">Founded</dt>
            <dd className="mt-1 text-bone/80">{brand.founded}</dd>
          </div>
          <div>
            <dt className="text-bone/40">Models</dt>
            <dd className="mt-1 text-stencil text-base text-neon">{modelCount}</dd>
          </div>
        </dl>

        <span className="mt-5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
          Browse models <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </li>
  );
}

function groupByRegion(brands: Brand[]): Partial<Record<Region, Brand[]>> {
  return brands.reduce<Partial<Record<Region, Brand[]>>>((acc, b) => {
    (acc[b.region] ||= []).push(b);
    return acc;
  }, {});
}

function totalModelCount(): number {
  return Object.values(MODELS_BY_BRAND).reduce((n, list) => n + list.length, 0);
}
