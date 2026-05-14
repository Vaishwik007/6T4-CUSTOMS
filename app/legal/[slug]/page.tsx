import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LEGAL_DOCS, LEGAL_SLUGS } from "@/lib/legal/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = LEGAL_DOCS[params.slug];
  if (!doc) return buildMetadata({ title: "Not Found", noIndex: true });
  return buildMetadata({
    path: `/legal/${doc.slug}`,
    title: doc.title,
    description: doc.intro
  });
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL_DOCS[params.slug];
  if (!doc) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Legal", path: "/legal" },
          { name: doc.title, path: `/legal/${doc.slug}` }
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-bone/40">Legal</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">{doc.title}</span>
      </nav>

      <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Legal</p>
      <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
        {doc.title}
      </h1>
      <p className="mt-6 max-w-2xl text-base text-bone/70">{doc.intro}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Last updated · {new Date(doc.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-12 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-display text-xl font-bold uppercase tracking-wider text-bone">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-bone/70 md:text-base">
              {section.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-white/10 pt-8 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Questions about this policy? Email{" "}
        <a href="mailto:hello@6t4customs.com" className="text-neon hover:underline">
          hello@6t4customs.com
        </a>
      </div>
    </article>
  );
}
