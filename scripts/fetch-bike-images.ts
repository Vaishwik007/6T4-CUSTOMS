/**
 * fetch-bike-images.ts  (verified edition)
 *
 * Pulls MODEL-ACCURATE motorcycle photos from Wikipedia + Wikimedia Commons.
 * Every candidate image is VERIFIED before download:
 *   1. The correct brand must appear in the title/filename.
 *   2. No DIFFERENT known brand may appear (cross-brand guard).
 *   3. A model token (code > name > displacement) must match.
 * Anything that can't be verified is left WITHOUT a file, so the UI shows the
 * neutral silhouette — never a wrong bike.
 *
 * Run:   npm run fetch-bikes
 * Force: npm run fetch-bikes -- --force
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { BRANDS } from "../lib/data/brands";
import { MODELS } from "../lib/data/models";
import { FEATURED_BUILDS } from "../lib/data/featured";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const FORCE = process.argv.includes("--force");
const UA = "6T4CUSTOMS-image-pipeline/2.0 (https://6t4customs.com; garage@6t4customs.com)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Extract the readable filename from a Wikimedia thumbnail URL. */
function fileFromUrl(url: string): string {
  try {
    const u = decodeURIComponent(url);
    const parts = u.split("/");
    const last = parts[parts.length - 1] ?? "";
    const prev = parts[parts.length - 2] ?? "";
    return /^\d+px-/.test(last) ? prev : last; // thumbs are "1200px-Name.jpg"
  } catch {
    return "";
  }
}

// ── Brand identity ────────────────────────────────────────────
// Distinctive brand tokens used BOTH to confirm the right brand and to block
// wrong brands. Ambiguous common words (hero, indian, triumph, tvs, jawa,
// yezdi) are matched for confirmation but NOT used to block others.
const BRAND_TOKENS: Record<string, string[]> = {
  honda: ["honda"],
  yamaha: ["yamaha"],
  suzuki: ["suzuki"],
  kawasaki: ["kawasaki"],
  ktm: ["ktm"],
  ducati: ["ducati"],
  aprilia: ["aprilia"],
  husqvarna: ["husqvarna"],
  "mv-agusta": ["mvagusta", "agusta"],
  "harley-davidson": ["harleydavidson", "harley"],
  benelli: ["benelli"],
  "moto-guzzi": ["motoguzzi", "guzzi"],
  "cf-moto": ["cfmoto"],
  keeway: ["keeway"],
  "royal-enfield": ["royalenfield", "enfield"],
  bajaj: ["bajaj"],
  "bmw-motorrad": ["bmwmotorrad", "bmw"]
};
// Ambiguous brands — confirm via these but never block other brands on them.
const AMBIGUOUS_BRAND_TOKENS: Record<string, string[]> = {
  hero: ["heromotocorp", "herohonda", "hero"],
  indian: ["indianmotorcycle", "indian"],
  triumph: ["triumph"],
  tvs: ["tvsmotor", "tvs"],
  jawa: ["jawa"],
  yezdi: ["yezdi"]
};
const ALL_BLOCK_TOKENS: Array<{ slug: string; tokens: string[] }> = Object.entries(BRAND_TOKENS).map(
  ([slug, tokens]) => ({ slug, tokens })
);

function brandConfirmTokens(slug: string): string[] {
  return BRAND_TOKENS[slug] ?? AMBIGUOUS_BRAND_TOKENS[slug] ?? [norm(slug)];
}

// ── Model token extraction ────────────────────────────────────
type Keys = { codes: string[]; names: string[]; disp: string[] };
function modelKeys(modelName: string): Keys {
  const words = modelName.split(/[\s\-/]+/).filter(Boolean);
  const names = words.filter((w) => /^[a-z]+$/i.test(w) && w.length >= 4).map(norm);
  // Engine displacement / model number — any 3-4 digit run (160R→160, 1000→1000).
  // Used as a HARD gate: a candidate must contain this number, so a 250 never
  // shows a 400, and an Xtreme 160R never shows an old CBZ Xtreme.
  const disp = modelName.match(/\d{3,4}/g) ?? [];
  // per-word alphanumeric codes len>=3 (e.g. r15, zx10r, rc390, g310r, 160r)
  const wordCodes = words
    .filter((w) => /[a-z]/i.test(w) && /\d/.test(w))
    .map(norm)
    .filter((c) => c.length >= 3);
  const full = norm(modelName); // whole compact, e.g. yzfr15v4, dominar400
  const dropLast = norm(words.slice(0, -1).join("")); // without trailing variant, e.g. yzfr15, dominar
  const codes = Array.from(
    new Set([...wordCodes, full.length >= 4 ? full : "", dropLast.length >= 4 ? dropLast : ""].filter(Boolean))
  );
  return { codes, names, disp };
}

/** Score a candidate. Returns -1 to reject, else specificity (3 code/2 name/1 number). */
function scoreCandidate(
  text: string,
  brandSlug: string,
  keys: Keys | null,
  heroMode: boolean
): number {
  const t = norm(text);

  // Cross-brand block: reject if a DIFFERENT distinctive brand appears.
  for (const { slug, tokens } of ALL_BLOCK_TOKENS) {
    if (slug === brandSlug) continue;
    // don't block on "bmw" substring collisions etc. — tokens are distinctive
    if (tokens.some((tok) => t.includes(tok))) {
      // allow if our own brand token ALSO present and is longer/more specific
      return -1;
    }
  }

  const brandOk = brandConfirmTokens(brandSlug).some((tok) => t.includes(tok));

  // Hero mode (or no model keys): any genuine bike of the brand is fine.
  if (heroMode || !keys) return brandOk ? 2 : -1;

  // HARD displacement gate: if the model has a 3-4 digit cc/number, the photo
  // MUST contain it. Stops a 250 showing a 400, or an Xtreme 160R showing a CBZ.
  if (keys.disp.length && !keys.disp.some((d) => t.includes(d))) return -1;

  const codeMatch = keys.codes.some((c) => t.includes(c));
  const nameMatch = keys.names.some((n) => t.includes(n));
  if (brandOk && codeMatch) return 3;
  if (brandOk && nameMatch) return 2;

  // Brand-less recovery: the cross-brand guard above already proved NO other
  // brand is present. So if a HIGHLY distinctive long model token (>=6 chars,
  // brand-unique like "dominar", "hypermotard", "interceptor") appears, it's
  // safe to accept even when the filename omits the brand name (e.g. "Dominar 400.jpg").
  const longName = keys.names.some((n) => n.length >= 6 && t.includes(n));
  const longCode = keys.codes.some((c) => c.length >= 6 && t.includes(c));
  if (longName || longCode) return 2;

  // Displacement-number-only matches are REJECTED — they grab the wrong
  // same-brand, same-cc sibling (e.g. a Pulsar 400 for a Dominar 400).
  return -1;
}

type Hit = { url: string; title: string };

async function wikiSearch(query: string, limit: number): Promise<Hit[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} motorcycle`,
    gsrlimit: String(limit),
    gsrnamespace: "0",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1200",
    redirects: "1",
    origin: "*"
  });
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { "User-Agent": UA } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { index?: number; title: string; thumbnail?: { source: string } }> };
    };
    return Object.values(data.query?.pages ?? {})
      .filter((p) => p.thumbnail?.source)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((p) => ({ url: p.thumbnail!.source, title: p.title }));
  } catch {
    return [];
  }
}

async function commonsSearch(query: string, limit: number): Promise<Hit[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query, // no "motorcycle" suffix — Commons files are named by bike
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "1200",
    origin: "*"
  });
  try {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "User-Agent": UA } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { index?: number; title: string; imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }> }> };
    };
    return Object.values(data.query?.pages ?? {})
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((p) => {
        const ii = p.imageinfo?.[0];
        const u = ii?.thumburl ?? ii?.url;
        if (!u || !ii?.mime || !/image\/(jpeg|png)/.test(ii.mime)) return null;
        if (/logo|icon|\.svg|map|diagram|engine|emblem/i.test(u)) return null;
        return { url: u, title: p.title };
      })
      .filter((x): x is Hit => !!x);
  } catch {
    return [];
  }
}

/** Gather candidates from both sources and return the highest-scoring verified URL. */
async function resolveVerified(
  queries: string[],
  brandSlug: string,
  keys: Keys | null,
  heroMode = false,
  want = 1
): Promise<string[]> {
  const cands: Hit[] = [];
  for (const q of queries) {
    cands.push(...(await wikiSearch(q, 6)));
    cands.push(...(await commonsSearch(q, 8)));
    if (cands.length >= 20) break;
  }

  const scored = cands
    .map((h) => ({ ...h, score: scoreCandidate(`${h.title} ${fileFromUrl(h.url)}`, brandSlug, keys, heroMode) }))
    .filter((h) => h.score >= 0)
    .sort((a, b) => b.score - a.score);

  // de-dup by url, keep order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of scored) {
    if (seen.has(h.url)) continue;
    seen.add(h.url);
    out.push(h.url);
    if (out.length >= want) break;
  }
  return out;
}

async function downloadAndSave(url: string, outAbs: string, width: number): Promise<number> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  const buf = await sharp(raw)
    .rotate()
    .resize({ width, height: Math.round(width * 0.7), fit: "cover", position: "centre", withoutEnlargement: false })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
  fs.writeFileSync(outAbs, buf);
  return buf.byteLength;
}

type Job = { kind: string; queries: string[]; brandSlug: string; keys: Keys | null; heroMode?: boolean; outRel: string; width: number; label: string };

function brandSearchName(slug: string, name: string): string {
  const map: Record<string, string> = { "bmw-motorrad": "BMW", "cf-moto": "CFMoto", "harley-davidson": "Harley-Davidson", "royal-enfield": "Royal Enfield", "moto-guzzi": "Moto Guzzi", "mv-agusta": "MV Agusta", hero: "Hero", indian: "Indian", tvs: "TVS" };
  return map[slug] ?? name;
}
const despace = (m: string) => (/^[A-Z]{1,3}\s?\d/.test(m) || /\d\s/.test(m) ? m.replace(/\s+/g, "") : m);

/** Leading alphabetic name without trailing displacement/variant.
 *  "Hypermotard 950" -> "Hypermotard", "Apache RR 310" -> "Apache RR", "MT-09" -> "". */
function coreModel(name: string): string {
  const words = name.split(/[\s\-/]+/).filter(Boolean);
  const kept: string[] = [];
  for (const w of words) {
    if (/^[a-z]+$/i.test(w)) kept.push(w);
    else break;
  }
  const core = kept.join(" ");
  return core.length >= 4 ? core : "";
}

async function debugCheck() {
  const samples: Array<[string, string, string]> = [
    ["honda", "CB350 H'ness", "CB350 H'ness"],
    ["honda", "Africa Twin", "Africa Twin"],
    ["yamaha", "YZF-R3", "YZF-R3"],
    ["suzuki", "GSX-R1000R", "GSX-R1000R"],
    ["kawasaki", "Ninja 400", "Ninja 400"],
    ["kawasaki", "Z900", "Z900"],
    ["ktm", "RC 200", "RC 200"],
    ["ktm", "250 Duke", "250 Duke"],
    ["triumph", "Speed 400", "Speed 400"],
    ["aprilia", "RS 660", "RS 660"],
    ["royal-enfield", "Interceptor 650", "Interceptor 650"],
    ["ducati", "Monster 937", "Monster 937"],
    ["bmw-motorrad", "G 310 R", "G 310 R"],
    ["harley-davidson", "Sportster S", "Sportster S"],
    ["indian", "FTR 1200", "FTR 1200"],
    ["bajaj", "Pulsar NS200", "Pulsar NS200"]
  ];
  for (const [slug, model] of samples) {
    const bn = brandSearchName(slug, slug);
    const core = coreModel(model);
    const qs = Array.from(new Set([`${bn} ${model}`, core ? `${bn} ${core}` : ""].filter(Boolean)));
    const cands: Hit[] = [];
    for (const q of qs) { cands.push(...(await wikiSearch(q, 6)), ...(await commonsSearch(q, 8))); }
    const keys = modelKeys(model);
    const scored = cands
      .map((h) => ({ ...h, score: scoreCandidate(`${h.title} ${fileFromUrl(h.url)}`, slug, keys, false) }))
      .filter((h) => h.score >= 0)
      .sort((a, b) => b.score - a.score);
    const top = scored[0];
    console.log(`${slug}/${model.padEnd(14)} → ${top ? `[${top.score}] ${top.title} | ${fileFromUrl(top.url)}` : "SILHOUETTE (no verified match)"}`);
    if (!top && cands.length) {
      // show why everything was rejected
      cands.slice(0, 4).forEach((h) => {
        const sc = scoreCandidate(`${h.title} ${fileFromUrl(h.url)}`, slug, keys, false);
        console.log(`       rej[${sc}] ${h.title} | ${fileFromUrl(h.url)}`);
      });
      console.log(`       keys: codes=${keys.codes} names=${keys.names} nums=${keys.disp}`);
    }
    await sleep(200);
  }
}

async function run() {
  if (process.argv.includes("--debug")) { await debugCheck(); return; }
  const brandName: Record<string, string> = Object.fromEntries(BRANDS.map((b) => [b.slug, b.name]));
  const jobs: Job[] = [];

  // ── Models ──────────────────────────────────────────────
  for (const mo of MODELS) {
    const bn = brandSearchName(mo.brand, brandName[mo.brand] ?? mo.brand);
    const compact = despace(mo.name);
    const core = coreModel(mo.name);
    const queries = Array.from(new Set([
      `${bn} ${mo.name}`,
      compact !== mo.name ? `${bn} ${compact}` : "",
      core ? `${bn} ${core}` : "",   // name-only variant (drops displacement that excludes valid files)
      `${brandName[mo.brand]} ${mo.name}`
    ].filter(Boolean)));
    jobs.push({
      kind: "bike",
      queries,
      brandSlug: mo.brand,
      keys: modelKeys(mo.name),
      outRel: `images/bikes/${mo.brand}/${mo.slug}.webp`,
      width: 800,
      label: `${brandName[mo.brand]} ${mo.name}`
    });
  }

  // ── Brand heroes ────────────────────────────────────────
  const FLAGSHIP: Record<string, string> = {
    "royal-enfield": "Continental GT 650", bajaj: "Dominar 400", tvs: "Apache RR 310", hero: "Karizma",
    jawa: "Jawa 42", yezdi: "Roadster", honda: "CBR1000RR", yamaha: "YZF-R1", suzuki: "Hayabusa",
    kawasaki: "Ninja H2", ktm: "1290 Super Duke R", "bmw-motorrad": "S1000RR", ducati: "Panigale V4",
    aprilia: "RSV4", triumph: "Speed Triple 1200", husqvarna: "Svartpilen 401", "mv-agusta": "Brutale 1000",
    "harley-davidson": "Sportster S", indian: "FTR 1200", benelli: "TNT 300", "moto-guzzi": "V85 TT",
    "cf-moto": "650NK", keeway: "V302C"
  };
  for (const b of BRANDS) {
    const bn = brandSearchName(b.slug, b.name);
    const flag = FLAGSHIP[b.slug] ?? "";
    jobs.push({
      kind: "brand-hero",
      queries: Array.from(new Set([`${bn} ${flag}`.trim(), `${bn} ${despace(flag)}`.trim(), `${bn} motorcycle`])),
      brandSlug: b.slug,
      keys: null,
      heroMode: true,
      outRel: `images/brands/${b.slug}-hero.webp`,
      width: 1400,
      label: `${b.name} hero`
    });
  }

  console.log(`\n${jobs.length} verified image jobs (+ featured) queued.\n`);

  let ok = 0, skip = 0, miss = 0, fail = 0;
  const missed: string[] = [];
  const CONCURRENCY = 2;

  async function processJobs(list: Job[]) {
    for (let i = 0; i < list.length; i += CONCURRENCY) {
      const batch = list.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(async (job) => {
        const outAbs = path.join(PUBLIC, job.outRel);
        if (!FORCE && fs.existsSync(outAbs)) { skip++; return; }
        try {
          let urls = await resolveVerified(job.queries, job.brandSlug, job.keys, job.heroMode, 1);
          if (!urls.length) { miss++; missed.push(job.label); return; }
          const bytes = await downloadAndSave(urls[0], outAbs, job.width);
          ok++;
          process.stdout.write(`✓ ${job.outRel} (${(bytes / 1024).toFixed(0)}KB)\n`);
        } catch (err) {
          fail++;
          process.stdout.write(`✗ ${job.label}: ${err instanceof Error ? err.message : String(err)}\n`);
        }
      }));
      await sleep(300);
    }
  }

  await processJobs(jobs);

  // ── Featured builds (verified, 2 distinct images each) ──
  for (const fb of FEATURED_BUILDS) {
    const m = fb.bike.match(/^(\S+(?:\s\S+)?)\s+(.*)$/);
    const guessBrandName = fb.bike.split(" ")[0];
    const bslug = BRANDS.find((b) => fb.bike.toLowerCase().includes(b.name.toLowerCase().split(" ")[0].toLowerCase()))?.slug ?? "ducati";
    const keys = modelKeys(fb.bike.replace(new RegExp(brandName[bslug] ?? guessBrandName, "i"), "").trim());
    const urls = await resolveVerified([fb.bike], bslug, keys, false, 2);
    const afterAbs = path.join(PUBLIC, `images/featured/${fb.id}-after.webp`);
    const beforeAbs = path.join(PUBLIC, `images/featured/${fb.id}-before.webp`);
    try {
      if (urls[0] && (FORCE || !fs.existsSync(afterAbs))) { await downloadAndSave(urls[0], afterAbs, 1200); ok++; process.stdout.write(`✓ featured/${fb.id}-after\n`); }
      const beforeUrl = urls[1] ?? urls[0];
      if (beforeUrl && (FORCE || !fs.existsSync(beforeAbs))) { await downloadAndSave(beforeUrl, beforeAbs, 1200); ok++; process.stdout.write(`✓ featured/${fb.id}-before\n`); }
      if (!urls.length) { miss++; missed.push(`${fb.title} (featured)`); }
    } catch (err) {
      fail++;
      process.stdout.write(`✗ ${fb.title}: ${err instanceof Error ? err.message : String(err)}\n`);
    }
    void m;
  }

  // ── Hero poster (any superbike) ─────────────────────────
  const heroAbs = path.join(PUBLIC, "images/hero.webp");
  if (FORCE || !fs.existsSync(heroAbs)) {
    const hp = await wikiSearch("Ducati Panigale V4 superbike", 3);
    if (hp[0]) { try { await downloadAndSave(hp[0].url, heroAbs, 2000); ok++; process.stdout.write(`✓ hero.webp\n`); } catch { /* ignore */ } }
  }

  console.log(`\n─── Done ───`);
  console.log(`✓ downloaded: ${ok}`);
  console.log(`○ skipped (exists): ${skip}`);
  console.log(`◦ unverified → silhouette: ${miss}`);
  console.log(`✗ failed: ${fail}`);
  if (missed.length) {
    console.log(`\nNo VERIFIED photo (showing silhouette):\n` + missed.map((m) => `  • ${m}`).join("\n"));
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
