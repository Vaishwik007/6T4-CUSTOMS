import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type ManifestEntry = {
  asset: string;
  sourceUrl: string;
  license: string;
  attribution?: string;
  fetchedAt: string;
  bytes: number;
};

function readManifest(): ManifestEntry[] {
  const p = path.join(process.cwd(), "public", "images", "MANIFEST.json");
  try {
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8")) as ManifestEntry[];
  } catch {
    return [];
  }
}

const LICENSE_LABEL: Record<string, string> = {
  "cc0": "CC0 / Public Domain",
  "cc-by": "CC Attribution",
  "cc-by-sa": "CC BY-SA",
  "press-kit": "Press kit · editorial use",
  "product-page": "Product page · nominative fair use",
  "simple-icons": "Simple Icons (MIT)",
  wikimedia: "Wikimedia Commons"
};

export const metadata = {
  title: "Image Credits — 6T4 CUSTOMS",
  description: "Attribution for imagery used on 6T4 CUSTOMS."
};

export default function CreditsPage() {
  const manifest = readManifest();

  // Group by license for cleaner presentation
  const grouped = manifest.reduce<Record<string, ManifestEntry[]>>((acc, m) => {
    (acc[m.license] ||= []).push(m);
    return acc;
  }, {});

  const licenses = Object.keys(grouped).sort();

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
      >
        <ChevronLeft className="h-3 w-3" /> Back to home
      </Link>

      <SectionHeader
        eyebrow="Attribution"
        title="Image Credits"
        subtitle="6T4 CUSTOMS uses motorcycle imagery under nominative fair use and per each manufacturer's press / brand guidelines. Images remain property of their respective owners."
      />

      {manifest.length === 0 ? (
        <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center text-bone/60">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <p className="text-sm">No images currently in use.</p>
          <p className="mt-2 text-xs text-bone/40">
            The site is running on SVG silhouettes. When real photography is added, this page
            auto-populates from the image pipeline manifest.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {licenses.map((lic) => (
            <div key={lic}>
              <h3 className="mb-3 text-display text-xs uppercase tracking-[0.3em] text-neon">
                {LICENSE_LABEL[lic] ?? lic} · {grouped[lic].length}
              </h3>
              <div className="overflow-x-auto border border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-black/40 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Attribution</th>
                      <th className="px-4 py-3">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[lic].map((m) => (
                      <tr key={m.asset} className="border-t border-white/5">
                        <td className="px-4 py-3 text-[11px] text-bone/80">
                          <code className="text-neon/80">{m.asset}</code>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-bone/70">
                          {m.attribution ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={m.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View source
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-white/5 pt-6 text-[11px] text-bone/50">
        <p>
          All motorcycle brand names, logos, and trademarks are the property of their respective
          owners. Use on this site is for identification and editorial purposes (nominative fair
          use). If you are a rights-holder and wish to discuss usage or request removal, contact us
          via the WhatsApp link in the site footer.
        </p>
      </div>
    </section>
  );
}
