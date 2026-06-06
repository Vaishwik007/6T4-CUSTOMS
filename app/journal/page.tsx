import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight, Clock } from "lucide-react";
import { getPublishedPosts } from "@/lib/journal/posts";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/journal",
  title: "Journal",
  description:
    "Tuning notes, build journals, service guides. Real numbers, real bikes, written by the people on the bench.",
  keywords: [
    "motorcycle tuning blog",
    "ecu flash guide",
    "stage 2 dyno results",
    "royal enfield service",
    "panigale tuning"
  ]
});

export default function JournalIndex() {
  const posts = getPublishedPosts();
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">Journal</span>
      </nav>

      <header className="mb-12 max-w-2xl">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">Journal</p>
        <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
          Notes From The Bench
        </h1>
        <p className="mt-4 text-base text-bone/60 md:text-lg">
          Tuning numbers, build logs, service guides. Honest tech writing — no clickbait, no
          affiliate filler.
        </p>
      </header>

      <ul className="space-y-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/journal/${p.slug}`}
              data-cursor="cta"
              className="neon-edge group grid gap-6 border border-white/5 bg-carbon p-5 transition-colors hover:border-neon/40 md:grid-cols-[200px_1fr] md:p-6"
            >
              {p.coverImage ? (
                <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-black/60 md:aspect-square">
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] border border-white/10 bg-black/60 md:aspect-square" />
              )}
              <div className="flex flex-col">
                <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">
                  {p.category}
                </p>
                <h2 className="mt-2 text-display text-xl font-bold uppercase leading-tight md:text-2xl">
                  {p.title}
                </h2>
                {p.subtitle && <p className="mt-1 text-sm italic text-bone/60">{p.subtitle}</p>}
                <p className="mt-3 text-sm text-bone/70">{p.excerpt}</p>

                <div className="mt-auto flex items-center justify-between pt-4 text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  <span className="inline-flex items-center gap-2">
                    <span>{new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="text-bone/30">·</span>
                    <Clock className="h-3 w-3" />
                    <span>{p.readingTimeMinutes} min read</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-neon transition-colors group-hover:text-white">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
