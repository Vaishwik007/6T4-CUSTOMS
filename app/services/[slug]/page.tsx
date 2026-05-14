import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Check, Clock, Calendar, MessageCircle } from "lucide-react";
import { SERVICES, getServiceBySlug } from "@/lib/services/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, SITE } from "@/lib/seo/config";
import { formatPrice } from "@/lib/utils/formatPrice";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getServiceBySlug(params.slug);
  if (!s) return buildMetadata({ title: "Service Not Found", noIndex: true });
  return buildMetadata({
    path: `/services/${s.slug}`,
    title: s.name,
    description: s.shortDescription,
    ogImage: absoluteUrl(
      `/api/og?title=${encodeURIComponent(s.name)}&subtitle=${encodeURIComponent(s.shortDescription)}&eyebrow=${encodeURIComponent(s.category.toUpperCase())}`
    )
  });
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const s = getServiceBySlug(params.slug);
  if (!s) notFound();

  const hours = Math.round((s.durationMinutes / 60) * 10) / 10;
  const waMsg = encodeURIComponent(`Hi 6T4 — I'd like to book a ${s.name}.`);
  const waHref = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${waMsg}`;

  return (
    <article className="mx-auto max-w-4xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.name, path: `/services/${s.slug}` }
        ])}
      />
      <JsonLd
        data={serviceJsonLd({
          slug: s.slug,
          name: s.name,
          description: s.longDescription,
          price: s.basePrice,
          durationMinutes: s.durationMinutes
        })}
      />
      {s.faqs.length > 0 && <JsonLd data={faqJsonLd(s.faqs)} />}

      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/services" className="hover:text-neon">Services</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">{s.name}</span>
      </nav>

      <header className="mb-10">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">{s.category}</p>
        <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
          {s.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base text-bone/70 md:text-lg">{s.longDescription}</p>
      </header>

      {/* Price + book block */}
      <section className="grid gap-6 border border-white/10 bg-carbon p-6 md:grid-cols-3 md:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Price</p>
          <p className="mt-1 text-stencil text-3xl text-neon">
            {s.requiresQuote ? "Quote" : (s.priceLabel ?? formatPrice(s.basePrice))}
          </p>
          {!s.requiresQuote && s.priceLabel == null && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">Inclusive of GST</p>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Time on bench</p>
          <p className="mt-1 inline-flex items-center gap-2 text-display text-xl">
            <Clock className="h-4 w-4 text-neon" /> ~{hours} hour{hours === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
            Bay slot reserved on booking
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <Link
            href={`/book?service=${s.slug}`}
            data-cursor="cta"
            className="inline-flex items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
          >
            <Calendar className="h-4 w-4" /> {s.requiresQuote ? "Request Quote" : "Book Slot"}
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
      </section>

      {/* Includes / prerequisites */}
      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">What's Included</h2>
          <ul className="mt-4 space-y-2 text-sm text-bone/80">
            {s.includes.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        {s.prerequisites.length > 0 && (
          <div>
            <h2 className="text-display text-xs uppercase tracking-[0.3em] text-ignition">Prerequisites</h2>
            <ul className="mt-4 space-y-2 text-sm text-bone/80">
              {s.prerequisites.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ignition" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* FAQ */}
      {s.faqs.length > 0 && (
        <section className="mt-16 border-t border-white/10 pt-10">
          <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">FAQ</h2>
          <ul className="mt-6 space-y-6">
            {s.faqs.map((faq) => (
              <li key={faq.q}>
                <h3 className="text-display text-base font-bold uppercase tracking-wide text-bone">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-bone/70">{faq.a}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
