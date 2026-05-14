import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Calendar,
  Flame,
  Gauge,
  ArrowRight,
  MessageCircle,
  Wrench
} from "lucide-react";
import { BRANDS, BRANDS_BY_SLUG } from "@/lib/data/brands";
import { MODELS, getModel } from "@/lib/data/models";
import { PARTS } from "@/lib/data/parts";
import { SERVICES, getServiceBySlug } from "@/lib/services/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, SITE } from "@/lib/seo/config";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Brand, Model, Part, PartCategory } from "@/lib/data/types";

type Params = { brandSlug: string; modelSlug: string };

export function generateStaticParams(): Params[] {
  return MODELS.map((m) => ({ brandSlug: m.brand, modelSlug: m.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const brand = BRANDS_BY_SLUG[params.brandSlug];
  const model = brand ? getModel(brand.slug, params.modelSlug) : undefined;
  if (!brand || !model) return buildMetadata({ title: "Bike Not Found", noIndex: true });

  const title = `${brand.name} ${model.name} Performance Parts & Tuning`;
  const description = `Compatible exhausts, ECU flashes, air filters, and Stage 1/2/3 tuning for the ${brand.name} ${model.name} (${model.engineCc}cc${
    model.hp != null ? ` · ${model.hp} HP` : ""
  }). Bench-mapped in Hyderabad.`;

  return buildMetadata({
    path: `/garage/${brand.slug}/${model.slug}`,
    title,
    description,
    ogImage: absoluteUrl(
      `/api/og?title=${encodeURIComponent(`${brand.name} ${model.name}`)}&subtitle=${encodeURIComponent(
        `${model.engineCc}cc · ${model.hp ?? "—"} HP · ${model.category}`
      )}&eyebrow=${encodeURIComponent("THE GARAGE")}`
    ),
    keywords: [
      `${brand.name} ${model.name} parts`.toLowerCase(),
      `${brand.name} ${model.name} exhaust`.toLowerCase(),
      `${brand.name} ${model.name} ecu flash`.toLowerCase(),
      `${brand.name} ${model.name} tuning hyderabad`.toLowerCase()
    ]
  });
}

export default async function BikeModelPage({ params }: { params: Params }) {
  const brand = BRANDS_BY_SLUG[params.brandSlug];
  const model = brand ? getModel(brand.slug, params.modelSlug) : undefined;
  if (!brand || !model) notFound();

  const compatibleParts = getCompatibleParts(brand.slug, model.slug);
  const grouped = groupPartsByCategory(compatibleParts);
  const tiers = [
    getServiceBySlug("stage-1-flash"),
    getServiceBySlug("stage-2-flash"),
    getServiceBySlug("stage-3-custom")
  ].filter((s): s is NonNullable<ReturnType<typeof getServiceBySlug>> => Boolean(s));

  const testimonial = await getBikeTestimonial(brand.name, model.name);

  const yearRange =
    model.yearEnd && model.yearEnd !== model.yearStart
      ? `${model.yearStart}–${model.yearEnd}`
      : `${model.yearStart}–present`;

  const waMsg = encodeURIComponent(
    `Hi 6T4 — I'd like to know more about parts and tuning for the ${brand.name} ${model.name}.`
  );
  const waHref = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${waMsg}`;
  const bookHref = `/book?service=stage-1-flash&bike=${brand.slug}-${model.slug}`;

  return (
    <article className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Garage", path: "/garage" },
          { name: brand.name, path: `/garage/${brand.slug}` },
          { name: model.name, path: `/garage/${brand.slug}/${model.slug}` }
        ])}
      />
      <JsonLd data={vehicleJsonLd(brand, model)} />
      {compatibleParts.length > 0 && (
        <JsonLd data={partsItemListJsonLd(brand, model, compatibleParts)} />
      )}

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50"
      >
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/garage" className="hover:text-neon">Garage</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/garage/${brand.slug}`} className="hover:text-neon">{brand.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">{model.name}</span>
      </nav>

      {/* HERO */}
      <header className="grid gap-8 border border-white/10 bg-carbon p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
        <div className="flex flex-col justify-center">
          <Link
            href={`/garage/${brand.slug}`}
            className="inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-bone/70 transition-colors hover:border-neon hover:text-neon"
            style={{ ["--brand-accent" as string]: brand.accent }}
          >
            <span
              className="h-2 w-2"
              style={{ backgroundColor: brand.accent }}
              aria-hidden
            />
            {brand.name}
          </Link>
          <h1 className="mt-4 text-display text-4xl font-black uppercase leading-[0.95] text-bone md:text-6xl">
            {model.name}
          </h1>
          <p className="mt-3 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
            {model.category}
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5 text-[10px] uppercase tracking-[0.25em]">
            <Spec icon={<Flame className="h-3 w-3" />} label="Engine" value={`${model.engineCc} cc`} />
            <Spec
              icon={<Gauge className="h-3 w-3" />}
              label="Power"
              value={model.hp != null ? `${model.hp} HP` : "—"}
            />
            <Spec icon={<Calendar className="h-3 w-3" />} label="Years" value={yearRange} />
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={bookHref}
              data-cursor="cta"
              className="inline-flex items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
            >
              <Wrench className="h-4 w-4" /> Book service for this bike
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-3 text-display text-[10px] uppercase tracking-[0.2em] text-bone hover:border-neon hover:text-neon"
            >
              <MessageCircle className="h-3 w-3" /> Ask on WhatsApp
            </a>
          </div>
        </div>
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-black/60">
          <SmartImage
            src={model.image}
            alt={`${brand.name} ${model.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            fallback={
              <div className="grid h-full place-items-center">
                <span className="text-display text-5xl uppercase tracking-[0.3em] text-neon/30">
                  {model.category.slice(0, 3)}
                </span>
              </div>
            }
          />
        </div>
      </header>

      {/* STAGE PATH */}
      <section className="mt-14">
        <h2 className="mb-2 text-display text-2xl font-black uppercase text-bone md:text-3xl">
          Recommended Path
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-bone/60">
          Three stages, three honest gains. Pick the one that matches what&apos;s already on the
          bike — or message us and we&apos;ll pick for you.
        </p>
        <ol className="grid gap-4 md:grid-cols-3">
          {tiers.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                data-cursor="cta"
                className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon p-6 transition-colors hover:border-neon/40"
              >
                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

                <p className="text-stencil text-3xl text-neon/40">0{i + 1}</p>
                <p className="mt-2 text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                  Stage {s.tier ?? i + 1}
                </p>
                <h3 className="mt-2 text-display text-xl font-bold uppercase leading-tight text-bone">
                  {s.name}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-bone/65">{s.shortDescription}</p>
                <div className="mt-auto flex items-end justify-between pt-5">
                  <p className="text-stencil text-lg text-bone">
                    {s.requiresQuote ? "Quote" : s.priceLabel ?? formatPrice(s.basePrice)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
                    Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* COMPATIBLE PARTS */}
      <section className="mt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-display text-2xl font-black uppercase text-bone md:text-3xl">
              Parts That Fit
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-bone/60">
              {compatibleParts.length === 0
                ? "Nothing in our static catalog matches yet — but we source. Message us and we&apos;ll quote."
                : `${compatibleParts.length} parts in our catalog confirmed to fit the ${brand.name} ${model.name}.`}
            </p>
          </div>
          <Link
            href={`/parts?brand=${brand.slug}&model=${model.slug}`}
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone hover:border-neon hover:text-neon"
          >
            Open in parts catalog <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {compatibleParts.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-sm text-bone/50">
            Drop us a message — we sourced a bracket for a Yezdi Scrambler last month. Nothing&apos;s
            off the table.
          </div>
        ) : (
          Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="mt-10 first:mt-0">
              <h3 className="mb-4 flex items-baseline gap-3 text-display text-xs uppercase tracking-[0.3em] text-neon">
                <span className="h-px w-6 bg-neon" />
                {category}
                <span className="text-bone/40">/ {list.length}</span>
              </h3>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((part) => (
                  <PartCard key={part.id} part={part} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* TESTIMONIAL */}
      {testimonial && (
        <section className="mt-16 border border-white/10 bg-carbon p-6 md:p-10">
          <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
            From a {model.name} owner
          </p>
          <blockquote className="mt-4 text-display text-xl font-bold leading-snug text-bone md:text-2xl">
            &ldquo;{testimonial.content}&rdquo;
          </blockquote>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-bone/60">
            — {testimonial.authorName}
            {testimonial.rating ? ` · ${testimonial.rating}/5` : ""}
          </p>
        </section>
      )}

      {/* CTA */}
      <section className="mt-16 border border-neon/30 bg-gradient-to-br from-carbon to-black p-6 text-center md:p-10">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Ready to start
        </p>
        <h2 className="mt-3 text-display text-3xl font-black uppercase text-bone md:text-4xl">
          Book a slot for your {model.name}.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-bone/65">
          Bay slot confirmed on booking. PDF dyno run sheet on every tune.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={bookHref}
            data-cursor="cta"
            className="inline-flex items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
          >
            <Wrench className="h-4 w-4" /> Book Stage 1
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-3 text-display text-[10px] uppercase tracking-[0.2em] text-bone hover:border-neon hover:text-neon"
          >
            Compare all services <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </article>
  );
}

function Spec({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1 text-bone/40">
        {icon} {label}
      </dt>
      <dd className="mt-1 text-stencil text-lg text-bone">{value}</dd>
    </div>
  );
}

function PartCard({ part }: { part: Part }) {
  return (
    <li>
      <Link
        href={`/parts/${part.id}`}
        data-cursor="cta"
        className="neon-edge group relative flex h-full flex-col border border-white/5 bg-carbon p-5 transition-colors hover:border-neon/40"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

        <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
          {part.brand} · {part.category}
        </p>
        <h4 className="mt-1 line-clamp-2 text-display text-base font-bold uppercase leading-tight text-bone">
          {part.name}
        </h4>
        <p className="mt-2 line-clamp-2 text-xs text-bone/55">{part.description}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-stencil text-lg text-bone">{formatPrice(part.price)}</p>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
            {part.hpGain != null && part.hpGain > 0 ? `+${part.hpGain} HP ` : ""}
            View <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </li>
  );
}

/** Static compatibility filter — uses the in-memory PARTS catalog. */
function getCompatibleParts(brandSlug: string, modelSlug: string): Part[] {
  return PARTS.filter((p) => {
    if (p.compatibility === "universal") return true;
    return p.compatibility.some((c) => c.brand === brandSlug && c.model === modelSlug);
  });
}

function groupPartsByCategory(parts: Part[]): Record<PartCategory, Part[]> {
  return parts.reduce<Record<PartCategory, Part[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {} as Record<PartCategory, Part[]>);
}

type Testimonial = { authorName: string; content: string; rating: number };

async function getBikeTestimonial(
  brandName: string,
  modelName: string
): Promise<Testimonial | null> {
  const admin = createAdminSupabase();
  if (!admin) return null;
  try {
    const { data } = await admin
      .from("reviews")
      .select("author_name, content, rating, bike")
      .eq("status", "published")
      .or(`bike.ilike.%${modelName}%,bike.ilike.%${brandName}%`)
      .order("rating", { ascending: false })
      .limit(1);
    const row = data?.[0] as
      | { author_name: string; content: string; rating: number; bike: string | null }
      | undefined;
    if (!row) return null;
    return { authorName: row.author_name, content: row.content, rating: row.rating };
  } catch {
    return null;
  }
}

function vehicleJsonLd(brand: Brand, model: Model) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${brand.name} ${model.name}`,
    brand: { "@type": "Brand", name: brand.name },
    model: model.name,
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineDisplacement: { "@type": "QuantitativeValue", value: model.engineCc, unitCode: "CMQ" },
      ...(model.hp != null
        ? {
            enginePower: {
              "@type": "QuantitativeValue",
              value: model.hp,
              unitCode: "BHP"
            }
          }
        : {})
    },
    vehicleConfiguration: model.category,
    productionDate: String(model.yearStart),
    ...(model.yearEnd ? { vehicleModelDate: String(model.yearEnd) } : {}),
    url: absoluteUrl(`/garage/${brand.slug}/${model.slug}`)
  };
}

function partsItemListJsonLd(brand: Brand, model: Model, parts: Part[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Compatible parts for ${brand.name} ${model.name}`,
    numberOfItems: parts.length,
    itemListElement: parts.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/parts/${p.id}`),
      name: p.name
    }))
  };
}

// Allow Next to render unknown bikes at runtime to a 404 instead of build failure.
export const dynamicParams = false;

// Keep the entire array of SERVICES referenced so it isn't tree-shaken from
// future static analysis — and for parity with /services tier display.
void SERVICES;
void BRANDS;
