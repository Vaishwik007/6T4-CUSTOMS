/**
 * Asset pipeline: pulls every entry in scripts/image-sources.ts, optimises,
 * and writes to /public/images/... with a MANIFEST.json of credits.
 *
 * Run: `npm run fetch-images`
 * Force re-download: `npm run fetch-images -- --force`
 *
 * Idempotent: already-downloaded files are skipped unless --force is passed.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_SOURCES, type ImageSource } from "./image-sources";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const IMAGES = path.join(PUBLIC, "images");
const MANIFEST_PATH = path.join(IMAGES, "MANIFEST.json");

const FORCE = process.argv.includes("--force");

type ManifestEntry = {
  asset: string;
  sourceUrl: string;
  license: string;
  attribution?: string;
  fetchedAt: string;
  bytes: number;
};

type Report = {
  ok: number;
  skipped: number;
  failed: Array<{ source: ImageSource; reason: string }>;
  byType: Record<string, number>;
};

function targetPathOf(
  src: ImageSource,
  contentType?: string
): { abs: string; rel: string; ext: string } {
  const url = new URL(src.url);
  const srcExt = path.extname(url.pathname).toLowerCase();
  const isSvg = srcExt === ".svg" || (contentType?.includes("svg") ?? false);
  const ext = isSvg ? ".svg" : ".webp";
  let rel = "";
  switch (src.type) {
    case "brand-logo":
      rel = `/images/brands/${src.slug}${ext}`;
      break;
    case "brand-hero":
      rel = `/images/brands/${src.slug}-hero.webp`;
      break;
    case "bike":
      rel = `/images/bikes/${src.brand}/${src.model}.webp`;
      break;
    case "part":
      rel = `/images/parts/${src.partId}.webp`;
      break;
    case "featured":
      rel = `/images/featured/${src.buildId}-${src.variant}.webp`;
      break;
    case "hero-video":
      rel = `/video/hero-loop.mp4`;
      break;
    case "hero-poster":
      rel = `/images/hero.webp`;
      break;
  }
  const abs = path.join(PUBLIC, rel.replace(/^\//, ""));
  return { abs, rel, ext: path.extname(rel) };
}

async function download(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (6T4CUSTOMS-image-pipeline/1.0; +https://github.com/Vaishwik007/6T4-CUSTOMS)"
    },
    redirect: "follow"
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "";
  return { buf, contentType };
}

async function saveAsset(
  src: ImageSource,
  outAbs: string,
  ext: string,
  raw: Buffer
): Promise<number> {
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  if (ext === ".svg" || ext === ".mp4") {
    fs.writeFileSync(outAbs, raw);
    return raw.byteLength;
  }

  const buf = await sharp(raw)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  fs.writeFileSync(outAbs, buf);
  return buf.byteLength;
}

async function main() {
  if (IMAGE_SOURCES.length === 0) {
    console.log("⚠️  IMAGE_SOURCES is empty — nothing to fetch.");
    console.log("    Populate scripts/image-sources.ts with URLs, then re-run.");
    return;
  }

  fs.mkdirSync(IMAGES, { recursive: true });
  const report: Report = { ok: 0, skipped: 0, failed: [], byType: {} };
  const manifest: ManifestEntry[] = [];

  for (const src of IMAGE_SOURCES) {
    const typeKey = src.type;
    report.byType[typeKey] = report.byType[typeKey] ?? 0;

    // Guess path from URL extension (may be refined after download reveals
    // actual content-type — e.g. SVG served without .svg extension).
    const guess = targetPathOf(src);

    // Check both guess path and the alternate (svg <-> webp) so re-runs skip
    // correctly regardless of which path was actually written.
    const altRel = guess.rel.endsWith(".webp")
      ? guess.rel.replace(/\.webp$/, ".svg")
      : guess.rel.replace(/\.svg$/, ".webp");
    const altAbs = path.join(PUBLIC, altRel.replace(/^\//, ""));
    const existingAbs = fs.existsSync(guess.abs)
      ? guess.abs
      : fs.existsSync(altAbs)
        ? altAbs
        : null;

    if (!FORCE && existingAbs) {
      const existingRel =
        existingAbs === guess.abs ? guess.rel : altRel;
      report.skipped++;
      manifest.push({
        asset: existingRel,
        sourceUrl: src.url,
        license: src.license,
        attribution: src.attribution,
        fetchedAt: fs.statSync(existingAbs).mtime.toISOString(),
        bytes: fs.statSync(existingAbs).size
      });
      continue;
    }

    process.stdout.write(`→ ${guess.rel} ... `);
    try {
      const { buf: raw, contentType } = await download(src.url);
      const { abs, rel, ext } = targetPathOf(src, contentType);
      const bytes = await saveAsset(src, abs, ext, raw);
      report.ok++;
      report.byType[typeKey]++;
      manifest.push({
        asset: rel,
        sourceUrl: src.url,
        license: src.license,
        attribution: src.attribution,
        fetchedAt: new Date().toISOString(),
        bytes
      });
      const note = rel !== guess.rel ? ` → ${rel}` : "";
      console.log(`✓ (${(bytes / 1024).toFixed(1)} KB)${note}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      report.failed.push({ source: src, reason });
      console.log(`✗ ${reason}`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log("\n─── Report ───");
  console.log(`✓ downloaded: ${report.ok}`);
  console.log(`○ skipped (already on disk): ${report.skipped}`);
  console.log(`✗ failed: ${report.failed.length}`);
  if (report.failed.length) {
    console.log("\nFailed entries:");
    for (const f of report.failed) {
      console.log(`  • ${f.source.type} — ${f.source.url} — ${f.reason}`);
    }
  }
  console.log(`\nManifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
