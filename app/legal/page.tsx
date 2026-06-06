import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { LEGAL_DOCS } from "@/lib/legal/content";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/legal",
  title: "Legal",
  description: "Privacy, terms, returns, warranty, and shipping policies for 6T4 Customs."
});

export default function LegalIndex() {
  const docs = Object.values(LEGAL_DOCS);
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Legal</p>
      <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
        The Fine Print
      </h1>
      <p className="mt-6 max-w-2xl text-base text-bone/70">
        Plain language. No surprises. Read these before placing an order or booking a service.
      </p>

      <ul className="mt-12 divide-y divide-white/5 border-y border-white/5">
        {docs.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/legal/${d.slug}`}
              data-cursor="cta"
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-neon" />
                <div>
                  <p className="text-display text-base font-bold uppercase tracking-wide">
                    {d.title}
                  </p>
                  <p className="mt-1 text-xs text-bone/50 line-clamp-1">{d.intro}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-bone/50 transition-transform group-hover:translate-x-1 group-hover:text-neon" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
