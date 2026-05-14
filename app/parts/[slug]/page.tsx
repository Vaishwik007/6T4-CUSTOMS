import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Package, RotateCcw, Wrench } from "lucide-react";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, SITE } from "@/lib/seo/config";
import { ProductGallery } from "@/components/parts/ProductGallery";
import { AddToCartBlock } from "@/components/parts/AddToCartBlock";
import { WishlistButton } from "@/components/parts/WishlistButton";
import { ProductGrid } from "@/components/parts/ProductGrid";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Reviews, type PublishedReview } from "@/components/parts/Reviews";
import { createAdminSupabase } from "@/lib/supabase/admin";

type ProductReviews = {
  reviews: PublishedReview[];
  average: number;
  count: number;
};

async function getPublishedReviewsForProduct(productId: string): Promise<ProductReviews> {
  const empty: ProductReviews = { reviews: [], average: 0, count: 0 };
  const supa = createAdminSupabase();
  if (!supa) return empty;
  const { data, error } = await supa
    .from("reviews")
    .select(
      "id, author_name, bike, rating, title, content, verified_purchase, helpful_count, created_at"
    )
    .eq("product_id", productId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    // Table not provisioned yet — fail open, no reviews.
    return empty;
  }
  const list = (data as PublishedReview[] | null) ?? [];
  if (list.length === 0) return empty;
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return {
    reviews: list,
    average: total / list.length,
    count: list.length
  };
}

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return buildMetadata({ title: "Part Not Found", noIndex: true });
  return buildMetadata({
    path: `/parts/${p.slug}`,
    title: `${p.name} — ${p.brand}`,
    description: p.shortDescription,
    ogImage: absoluteUrl(
      `/api/og?title=${encodeURIComponent(p.name)}&subtitle=${encodeURIComponent(`${p.brand} · ${p.category}`)}&eyebrow=${encodeURIComponent(p.hpGain ? `+${p.hpGain} HP` : p.category)}`
    ),
    keywords: [p.name, p.brand, p.category, "motorcycle parts india", "performance parts hyderabad"]
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();

  const [related, productReviews] = await Promise.all([
    getRelatedProducts(p.id, 4),
    getPublishedReviewsForProduct(p.id)
  ]);

  return (
    <article className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Parts", path: "/parts" },
          { name: p.category, path: `/parts?category=${encodeURIComponent(p.category)}` },
          { name: p.name, path: `/parts/${p.slug}` }
        ])}
      />
      <JsonLd
        data={productJsonLd({
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          description: p.description,
          images: p.images,
          sku: p.id.toUpperCase(),
          price: p.price,
          inStock: p.inStock,
          reviewCount: productReviews.count > 0 ? productReviews.count : undefined,
          averageRating: productReviews.count > 0 ? productReviews.average : undefined
        })}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/parts" className="hover:text-neon">Parts</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/parts?category=${encodeURIComponent(p.category)}`} className="hover:text-neon">{p.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">{p.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={p.images} alt={p.name} category={p.category} />

        <div className="flex flex-col">
          <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
            {p.brand} · {p.category}
          </p>
          <h1 className="mt-3 text-display text-3xl font-black uppercase leading-tight md:text-5xl">
            {p.name}
          </h1>
          <p className="mt-5 text-base text-bone/70">{p.description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em]">
            {p.hpGain != null && p.hpGain > 0 && (
              <span className="chip border-neon/40 text-neon">+{p.hpGain} HP</span>
            )}
            {p.soundDb && <span className="chip">{p.soundDb} dB</span>}
            {p.installMinutes != null && p.installMinutes > 0 && (
              <span className="chip">~{p.installMinutes} min fit</span>
            )}
            {p.fitsUniversal ? (
              <span className="chip border-neon/40 text-neon">Universal fit</span>
            ) : (
              <span className="chip border-emerald-500/40 text-emerald-400">Model-specific</span>
            )}
          </div>

          {/* Price + cart */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Price</p>
            <p className="mt-1 text-stencil text-4xl text-neon">{formatPrice(p.price)}</p>
            {!p.inStock ? (
              <p className="mt-3 text-sm text-red-400">
                Out of stock — message us on WhatsApp to reserve the next batch.
              </p>
            ) : p.lowStock ? (
              <p className="mt-3 text-sm text-amber-400">
                Only {p.stock} left in stock.
              </p>
            ) : (
              <p className="mt-3 text-sm text-emerald-400">In stock · Ships in 1–3 days</p>
            )}

            <AddToCartBlock product={p} />
            <WishlistButton productId={p.id} />
          </div>

          {/* Trust strip */}
          <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 text-[10px] uppercase tracking-[0.25em] text-bone/60 md:grid-cols-4">
            <TrustCell Icon={ShieldCheck} label="Razorpay Secure" sub="UPI · Cards" />
            <TrustCell Icon={Package} label="Free shipping" sub="Above ₹5,000" />
            <TrustCell Icon={RotateCcw} label="7-day return" sub="Unopened" />
            <TrustCell Icon={Wrench} label="90-day labour" sub="On fitment" />
          </ul>

          <div className="mt-6 text-xs text-bone/50">
            Need fitment confirmation?{" "}
            <a
              href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hi 6T4 — does ${p.name} fit my bike?`
              )}`}
              className="text-neon underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Spec strip */}
      <section className="mt-20 border-t border-white/10 pt-10">
        <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">Specs</h2>
        <dl className="mt-4 grid gap-px bg-white/5 md:grid-cols-3">
          <SpecCell label="Manufacturer" value={p.brand} />
          <SpecCell label="Category" value={p.category} />
          <SpecCell label="SKU" value={p.id.toUpperCase()} mono />
          {p.hpGain != null && p.hpGain > 0 && (
            <SpecCell label="HP Gain" value={`+${p.hpGain} HP`} />
          )}
          {p.soundDb && <SpecCell label="Sound Level" value={`${p.soundDb} dB`} />}
          {p.installMinutes != null && p.installMinutes > 0 && (
            <SpecCell label="Install Time" value={`~${p.installMinutes} minutes`} />
          )}
        </dl>
      </section>

      {/* Fitment */}
      {p.compatibility !== "universal" && p.compatibility.length > 0 && (
        <section className="mt-16 border-t border-white/10 pt-10">
          <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">Fits These Bikes</h2>
          <ul className="mt-4 grid gap-2 text-sm text-bone/70 md:grid-cols-2 lg:grid-cols-3">
            {p.compatibility.map((c, i) => (
              <li
                key={i}
                className="flex items-center gap-2 border border-white/10 bg-carbon/60 px-3 py-2"
              >
                <span className="h-1.5 w-1.5 bg-neon" />
                <span className="capitalize">{c.brand}</span>
                <span className="text-bone/40">·</span>
                <span>{c.model}</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-bone/40">
                  {c.yearStart}
                  {c.yearEnd ? `–${c.yearEnd}` : "+"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reviews */}
      <Reviews
        reviews={productReviews.reviews}
        average={productReviews.average}
        count={productReviews.count}
        productName={p.name}
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-10">
          <h2 className="text-display text-xl font-bold uppercase tracking-wider text-bone md:text-2xl">
            Pairs With
          </h2>
          <p className="mt-2 text-sm text-bone/50">
            Finish the build — these mod packages are commonly fitted alongside.
          </p>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </article>
  );
}

function TrustCell({
  Icon,
  label,
  sub
}: {
  Icon: typeof ShieldCheck;
  label: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-2 bg-black p-3">
      <Icon className="h-4 w-4 text-neon" />
      <div>
        <p className="text-bone/80">{label}</p>
        <p className="mt-0.5 text-bone/40">{sub}</p>
      </div>
    </li>
  );
}

function SpecCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-black p-4">
      <dt className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{label}</dt>
      <dd className={"mt-1 text-sm text-bone" + (mono ? " font-mono" : "")}>{value}</dd>
    </div>
  );
}
