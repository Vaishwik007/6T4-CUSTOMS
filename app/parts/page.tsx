import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { getFilteredProducts, getDistinctBrands, type PartsFilters } from "@/lib/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { PART_CATEGORIES } from "@/lib/data/parts";
import type { PartCategory } from "@/lib/data/types";
import { ProductGrid } from "@/components/parts/ProductGrid";
import { FiltersBar } from "@/components/parts/FiltersBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type SP = {
  brand?: string;
  category?: string;
  sort?: string;
  stock?: string;
  pmin?: string;
  pmax?: string;
};

export function generateMetadata({ searchParams }: { searchParams: SP }): Metadata {
  const filters: string[] = [];
  if (searchParams.brand) filters.push(searchParams.brand);
  if (searchParams.category) filters.push(searchParams.category);
  const titleBase = filters.length > 0 ? `${filters.join(" · ")} Parts` : "All Parts";
  return buildMetadata({
    path: "/parts",
    title: titleBase,
    description:
      "Browse premium aftermarket motorcycle parts — Akrapovič, SC-Project, Öhlins, Brembo, K&N. ECU flashes, exhausts, suspension, brakes, intake.",
    keywords: [
      "motorcycle parts india",
      "performance parts hyderabad",
      "akrapovic india",
      "sc-project india",
      "ohlins suspension",
      "brembo brakes"
    ]
  });
}

function parseFilters(sp: SP): PartsFilters {
  return {
    brand: sp.brand ? sp.brand.split(",") : undefined,
    category: sp.category ? (sp.category.split(",") as PartCategory[]) : undefined,
    inStock: sp.stock === "1",
    priceMin: sp.pmin ? Number(sp.pmin) : undefined,
    priceMax: sp.pmax ? Number(sp.pmax) : undefined,
    sort: (sp.sort as PartsFilters["sort"]) ?? "featured"
  };
}

export default async function PartsPage({ searchParams }: { searchParams: SP }) {
  const filters = parseFilters(searchParams);
  const products = await getFilteredProducts(filters);
  const allProducts = products; // for facet counts; in v2 fetch full set separately
  const brands = getDistinctBrands(allProducts);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Parts", path: "/parts" }
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">Parts</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          <span className="h-px w-8 bg-neon" />
          The Catalog
        </p>
        <h1 className="text-display text-4xl font-black uppercase leading-tight text-bone md:text-6xl">
          Parts Bay
        </h1>
        <p className="mt-4 max-w-xl text-base text-bone/60 md:text-lg">
          Filter, sort, ship. Compatibility is checked at checkout — when in doubt, hit the configurator.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <Suspense fallback={<div className="text-bone/40">Loading filters…</div>}>
          <FiltersBar
            brands={brands}
            categories={PART_CATEGORIES}
            current={filters}
          />
        </Suspense>
        <div>
          <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-bone/50">
            <span>{products.length} parts</span>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
