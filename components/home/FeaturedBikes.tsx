import Link from "next/link";
import { ArrowRight, Flame, Gauge } from "lucide-react";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Brand, Model } from "@/lib/data/types";

/**
 * Top four most-modded bikes on the bench. Slugs are validated against the
 * static MODELS catalog at module load — entries with missing models are
 * silently dropped so the home page never renders a broken link.
 */
const FEATURED_SLUGS: Array<{ brand: string; model: string }> = [
  { brand: "ktm", model: "duke-390" },
  { brand: "royal-enfield", model: "continental-gt-650" },
  { brand: "ducati", model: "panigale-v4" },
  { brand: "bmw-motorrad", model: "s1000rr" }
];

type FeaturedBike = { brand: Brand; model: Model };

function resolveFeaturedBikes(): FeaturedBike[] {
  const out: FeaturedBike[] = [];
  for (const { brand, model } of FEATURED_SLUGS) {
    const b = BRANDS_BY_SLUG[brand];
    const m = b ? getModel(brand, model) : undefined;
    if (b && m) out.push({ brand: b, model: m });
  }
  return out;
}

export function FeaturedBikes() {
  const bikes = resolveFeaturedBikes();
  if (bikes.length === 0) return null;

  return (
    <section className="relative px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="The Garage"
            title="Most-Modded Bikes."
            subtitle="The bikes that walk onto the bench most often. Tap one to see compatible parts and the tuning path we recommend."
            className="mb-0"
          />
          <Link
            href="/garage"
            data-cursor="cta"
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone transition-colors hover:border-neon hover:text-neon"
          >
            All brands <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bikes.map(({ brand, model }) => (
            <li key={`${brand.slug}-${model.slug}`}>
              <Link
                href={`/garage/${brand.slug}/${model.slug}`}
                data-cursor="cta"
                className="neon-edge group relative flex h-full flex-col overflow-hidden border border-white/5 bg-carbon transition-colors hover:border-neon/40"
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fallback={
                      <div className="grid h-full place-items-center">
                        <span className="text-display text-3xl uppercase tracking-[0.3em] text-neon/30">
                          {model.category.slice(0, 3)}
                        </span>
                      </div>
                    }
                  />
                  <span
                    className="absolute left-3 top-3 border border-white/15 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-bone/80 backdrop-blur-sm"
                  >
                    {brand.name}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-display text-base font-bold uppercase leading-tight text-bone">
                    {model.name}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-neon">
                    {model.category}
                  </p>

                  <dl className="mt-3 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.25em]">
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
                  </dl>

                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[10px] uppercase tracking-[0.3em] text-neon transition-colors group-hover:text-white">
                    View build paths <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
