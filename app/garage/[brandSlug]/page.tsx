import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowRight, Gauge, Flame, Calendar } from "lucide-react";
import { BRANDS, BRANDS_BY_SLUG } from "@/lib/data/brands";
import { MODELS_BY_BRAND } from "@/lib/data/models";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/seo/config";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Brand, Model, ModelCategory } from "@/lib/data/types";

export function generateStaticParams() {
  return BRANDS.map((b) => ({ brandSlug: b.slug }));
}

export function generateMetadata({
  params
}: {
  params: { brandSlug: string };
}): Metadata {
  const brand = BRANDS_BY_SLUG[params.brandSlug];
  if (!brand) return buildMetadata({ title: "Brand Not Found", noIndex: true });

  const models = MODELS_BY_BRAND[brand.slug] ?? [];
  const subtitle = `${models.length} ${brand.name} models tuned & catalogued`;

  return buildMetadata({
    path: `/garage/${brand.slug}`,
    title: `${brand.name} Performance Parts & Tuning`,
    description: `Performance parts, ECU flashes, and dyno tunes for ${brand.name}. ${models.length} models supported — slip-ons, full systems, Stage 1 / 2 / 3 maps. Hand-mapped in Hyderabad.`,
    ogImage: absoluteUrl(
      `/api/og?title=${encodeURIComponent(brand.name)}&subtitle=${encodeURIComponent(
        subtitle
      )}&eyebrow=${encodeURIComponent("THE GARAGE")}`
    ),
    keywords: [
      `${brand.name.toLowerCase()} parts india`,
      `${brand.name.toLowerCase()} ecu flash`,
      `${brand.name.toLowerCase()} exhaust hyderabad`,
      `${brand.name.toLowerCase()} tuning`
    ]
  });
}

export default function BrandPage({ params }: { params: { brandSlug: string } }) {
  const brand = BRANDS_BY_SLUG[params.brandSlug];
  if (!brand) notFound();

  const models = [...(MODELS_BY_BRAND[brand.slug] ?? [])].sort((a, b) =>
    a.engineCc !== b.engineCc ? a.engineCc - b.engineCc : a.name.localeCompare(b.name)
  );
  const grouped = groupByCategory(models);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Garage", path: "/garage" },
          { name: brand.name, path: `/garage/${brand.slug}` }
        ])}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50"
      >
        <Link href="/" className="hover:text-neon">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/garage" className="hover:text-neon">
          Garage
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">{brand.name}</span>
      </nav>

      <BrandHero brand={brand} modelCount={models.length} />

      {models.length === 0 ? (
        <p className="mt-16 border border-dashed border-white/10 p-12 text-center text-sm text-bone/50">
          No models catalogued yet. Message us on WhatsApp for custom work on this brand.
        </p>
      ) : (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="mt-14 first:mt-14">
            <h2 className="mb-6 flex items-baseline gap-3 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <span className="h-px w-6 bg-neon" />
              {category}
              <span className="text-bone/40">/ {list.length}</span>
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((model) => (
                <ModelCard key={model.slug} brand={brand} model={model} />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

function BrandHero({ brand, modelCount }: { brand: Brand; modelCount: number }) {
  return (
    <header className="grid gap-8 border border-white/10 bg-carbon p-6 md:grid-cols-[1fr_auto] md:p-10">
      <div>
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          {brand.region} · {brand.country}
        </p>
        <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] text-bone md:text-6xl">
          {brand.name}
        </h1>
        {brand.tagline && (
          <p className="mt-3 text-sm italic text-bone/55">&ldquo;{brand.tagline}&rdquo;</p>
        )}
        <p className="mt-5 max-w-2xl text-base text-bone/70 md:text-lg">
          {modelCount} {brand.name} model{modelCount === 1 ? "" : "s"} catalogued in our garage —
          each one mapped, dyno&apos;d, or wrenched on. Pick a model to see compatible parts and
          tuning paths.
        </p>
      </div>
      <div className="flex items-center md:items-start">
        <SmartImage
          src={brand.logo}
          alt={`${brand.name} logo`}
          fill
          sizes="240px"
          wrapperClassName="!h-24 !w-48"
          className="object-contain object-left md:object-right"
          fallback={
            <span className="text-display text-2xl font-bold uppercase tracking-wide text-bone">
              {brand.name}
            </span>
          }
        />
      </div>
    </header>
  );
}

function ModelCard({ brand, model }: { brand: Brand; model: Model }) {
  const yearRange =
    model.yearEnd && model.yearEnd !== model.yearStart
      ? `${model.yearStart}–${model.yearEnd}`
      : `${model.yearStart}+`;

  return (
    <li>
      <Link
        href={`/garage/${brand.slug}/${model.slug}`}
        data-cursor="cta"
        className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon transition-colors hover:border-neon/40"
      >
        <span className="pointer-events-none absolute left-0 top-0 z-[1] h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 z-[1] h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-2 w-2 border-b border-r border-neon" />

        <div className="relative aspect-[5/4] w-full overflow-hidden bg-black/60">
          <SmartImage
            src={model.image}
            alt={`${brand.name} ${model.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={
              <div className="grid h-full place-items-center">
                <span className="text-display text-3xl uppercase tracking-[0.3em] text-neon/30">
                  {model.category.slice(0, 3)}
                </span>
              </div>
            }
          />
          <span className="absolute left-3 top-3 border border-white/15 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-bone/80 backdrop-blur-sm">
            {model.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-display text-lg font-bold uppercase leading-tight text-bone">
            {model.name}
          </h3>

          <dl className="mt-3 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-[0.25em]">
            <div>
              <dt className="inline-flex items-center gap-1 text-bone/40">
                <Flame className="h-3 w-3" /> CC
              </dt>
              <dd className="mt-1 text-stencil text-base text-bone">{model.engineCc}</dd>
            </div>
            {model.hp != null && (
              <div>
                <dt className="inline-flex items-center gap-1 text-bone/40">
                  <Gauge className="h-3 w-3" /> HP
                </dt>
                <dd className="mt-1 text-stencil text-base text-bone">{model.hp}</dd>
              </div>
            )}
            <div>
              <dt className="inline-flex items-center gap-1 text-bone/40">
                <Calendar className="h-3 w-3" /> Year
              </dt>
              <dd className="mt-1 text-stencil text-base text-bone">{yearRange}</dd>
            </div>
          </dl>

          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
            View build paths <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </li>
  );
}

function groupByCategory(models: Model[]): Record<ModelCategory, Model[]> {
  return models.reduce<Record<ModelCategory, Model[]>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {} as Record<ModelCategory, Model[]>);
}
