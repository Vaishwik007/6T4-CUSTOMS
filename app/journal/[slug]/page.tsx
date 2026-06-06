import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/journal/posts";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, SITE } from "@/lib/seo/config";

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return buildMetadata({ title: "Post Not Found", noIndex: true });
  return buildMetadata({
    path: `/journal/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    ogImage: absoluteUrl(
      `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.subtitle ?? post.excerpt)}&eyebrow=${encodeURIComponent("JOURNAL · " + post.category.toUpperCase())}`
    ),
    keywords: post.tags
  });
}

export default function JournalPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` }
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage ? absoluteUrl(post.coverImage) : undefined,
          author: { "@type": "Person", name: post.author },
          publisher: { "@id": `${SITE.url}#organization` },
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          keywords: post.tags.join(", "),
          mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`)
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/journal" className="inline-flex items-center gap-2 hover:text-neon">
          <ArrowLeft className="h-3 w-3" /> Back to Journal
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          {post.category}
        </p>
        <h1 className="mt-3 text-display text-3xl font-black uppercase leading-[0.95] md:text-5xl">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-4 max-w-2xl text-base italic text-bone/65 md:text-lg">
            {post.subtitle}
          </p>
        )}
        <div className="mt-6 inline-flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-bone/40">
          <span>By {post.author}</span>
          <span className="text-bone/30">·</span>
          <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="text-bone/30">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readingTimeMinutes} min read
          </span>
        </div>
      </header>

      {post.coverImage && (
        <div className="relative mb-12 aspect-[16/9] overflow-hidden border border-white/10 bg-black/60">
          <Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none text-bone/80 prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-bone prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h3:text-lg prose-strong:text-bone prose-a:text-neon prose-a:no-underline hover:prose-a:underline">
        {renderMarkdown(post.contentMd)}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-6">
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-white/10 pt-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">More from the Journal</p>
        <Link href="/journal" className="mt-3 inline-flex items-center gap-2 text-neon hover:underline">
          See all posts <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

/**
 * Minimal MD renderer. Replace with `next-mdx-remote` when we move journal
 * content to the DB or to MD files. For now: paragraphs, headings, lists,
 * tables, and inline links — sufficient for tech writing.
 */
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.trim().split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      out.push(<h2 key={key++}>{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(<h2 key={key++}>{line.slice(2)}</h2>);
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      out.push(
        <ul key={key++}>
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").map((c) => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.every((c) => /^[-]{2,}$/.test(c))) {
          i++;
          continue;
        }
        rows.push(cells);
        i++;
      }
      if (rows.length > 0) {
        const [head, ...body] = rows;
        out.push(
          <table key={key++} className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {head.map((c, idx) => (
                  <th key={idx} className="border-b border-white/10 px-2 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-neon">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, idx) => (
                <tr key={idx}>
                  {row.map((c, jdx) => (
                    <td key={jdx} className="border-b border-white/5 px-2 py-2 text-bone/80">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    out.push(<p key={key++}>{renderInline(line)}</p>);
    i++;
  }

  return out;
}

function renderInline(s: string): React.ReactNode {
  // Bold **text**
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  while (rest.length > 0) {
    const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(rest);
    const boldMatch = /\*\*([^*]+)\*\*/.exec(rest);
    const next = [linkMatch, boldMatch].filter(Boolean).sort((a, b) => a!.index - b!.index)[0];
    if (!next) {
      parts.push(rest);
      break;
    }
    if (next.index > 0) parts.push(rest.slice(0, next.index));
    if (next === linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch![2]} target={linkMatch![2].startsWith("http") ? "_blank" : undefined} rel={linkMatch![2].startsWith("http") ? "noopener" : undefined}>
          {linkMatch![1]}
        </a>
      );
      rest = rest.slice(next.index + next[0].length);
    } else if (next === boldMatch) {
      parts.push(<strong key={key++}>{boldMatch![1]}</strong>);
      rest = rest.slice(next.index + next[0].length);
    }
  }
  return parts;
}
