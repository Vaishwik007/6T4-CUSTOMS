/**
 * Hand-curated inventory of image URLs for the site's asset pipeline.
 *
 * Each entry maps a site asset slot → a source URL + licence tag.
 * `scripts/fetch-images.ts` reads this file, downloads each entry, optimises
 * to WebP (or keeps SVG as-is), and writes to `/public/images/...`.
 *
 * Rules for populating this file:
 * 1. Only use publicly-accessible URLs (no login walls).
 * 2. Tag every entry with the `license` you verified on the source site.
 * 3. Preferred licence order: `cc0` > `cc-by` > `press-kit` (nominative fair use)
 *    > `product-page` (grey area, flag for manual review).
 * 4. When in doubt, SKIP the entry — SVG silhouette fallback is acceptable.
 *
 * Re-runs of `pnpm fetch-images` are idempotent (skips existing files unless
 * `--force`). The generated /public/images/MANIFEST.json tells the /credits
 * page where each asset came from.
 */

export type SourceLicense =
  | "cc0" // public domain / Creative Commons Zero
  | "cc-by" // CC Attribution (requires credit)
  | "cc-by-sa" // CC Attribution ShareAlike
  | "press-kit" // official manufacturer press/brand-guidelines (editorial/identification use)
  | "product-page" // pulled from public product page (grey area — nominative fair use argued)
  | "simple-icons" // simpleicons.org (MIT)
  | "wikimedia"; // wikimedia commons (various CC licences)

export type BrandLogoSource = {
  type: "brand-logo";
  slug: string;
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type BrandHeroSource = {
  type: "brand-hero";
  slug: string;
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type BikeSource = {
  type: "bike";
  brand: string;
  model: string;
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type PartSource = {
  type: "part";
  partId: string;
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type FeaturedSource = {
  type: "featured";
  /** buildId from lib/data/featured.ts */
  buildId: string;
  variant: "before" | "after";
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type HeroSource = {
  type: "hero-video" | "hero-poster";
  url: string;
  license: SourceLicense;
  attribution?: string;
};

export type ImageSource =
  | BrandLogoSource
  | BrandHeroSource
  | BikeSource
  | PartSource
  | FeaturedSource
  | HeroSource;

/**
 * BRAND LOGOS — from Simple Icons (simpleicons.org) where available.
 * Licence: MIT/CC0. Simple Icons hosts clean SVGs of major global brand marks.
 * CDN pattern: https://cdn.simpleicons.org/<slug>/<hex-colour>
 * For brands not on Simple Icons, fallback to Wikimedia Commons SVG.
 */
const BRAND_LOGOS: BrandLogoSource[] = [
  // JAPAN — all on Simple Icons
  { type: "brand-logo", slug: "honda", url: "https://cdn.simpleicons.org/honda/cc0000", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "yamaha", url: "https://cdn.simpleicons.org/yamahamotorcorporation/0033a0", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "suzuki", url: "https://cdn.simpleicons.org/suzuki/0a3d91", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "kawasaki", url: "https://cdn.simpleicons.org/kawasaki/3aaa35", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  // EUROPE
  { type: "brand-logo", slug: "ktm", url: "https://cdn.simpleicons.org/ktm/ff6600", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "bmw-motorrad", url: "https://cdn.simpleicons.org/bmw/0066b1", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "ducati", url: "https://cdn.simpleicons.org/ducati/cc0000", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "aprilia", url: "https://cdn.simpleicons.org/aprilia/000000", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "triumph", url: "https://cdn.simpleicons.org/triumph/1a1a1a", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "husqvarna", url: "https://cdn.simpleicons.org/husqvarna/2864b8", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "mv-agusta", url: "https://cdn.simpleicons.org/mvagusta/a90000", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  // USA
  { type: "brand-logo", slug: "harley-davidson", url: "https://cdn.simpleicons.org/harleydavidson/f47b20", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  // INDIA
  { type: "brand-logo", slug: "royal-enfield", url: "https://cdn.simpleicons.org/royalenfield/7a0a0a", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  { type: "brand-logo", slug: "bajaj", url: "https://cdn.simpleicons.org/bajajauto/0066cc", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  // ITALY OTHER
  { type: "brand-logo", slug: "moto-guzzi", url: "https://cdn.simpleicons.org/motoguzzi/8b0000", license: "simple-icons", attribution: "Simple Icons (MIT)" },
  // NOTE: Brands with no Simple Icons coverage (tvs, hero, jawa, yezdi, indian,
  // benelli, cf-moto, keeway) fall back to wordmark rendering in the UI.
  // Drop their official logo SVGs at /public/images/brands/<slug>.svg to override.
];

/**
 * BRAND HERO IMAGES — one representative bike per brand for carousel bg.
 * Empty for now; drop files at /public/images/brands/<slug>-hero.webp or
 * add sources here to auto-fetch.
 */
const BRAND_HEROES: BrandHeroSource[] = [];

/**
 * BIKE IMAGES — per-model. Empty by default; UI falls back to SVG silhouette.
 * To add: find a publicly-accessible URL (manufacturer product page, press
 * kit, CC-licensed Wikimedia), add an entry, run `pnpm fetch-images`.
 *
 * Example entry (commented out — fill in with URLs you've verified):
 * { type: "bike", brand: "ducati", model: "panigale-v4", url: "https://.../v4.jpg", license: "press-kit", attribution: "Ducati" },
 */
const BIKES: BikeSource[] = [];

/**
 * PART IMAGES — per-part. Empty by default; UI falls back to category icon.
 */
const PARTS: PartSource[] = [];

/**
 * FEATURED BUILD before/after shots. Empty by default; UI falls back to SVG.
 */
const FEATURED: FeaturedSource[] = [];

/**
 * HOME HERO — cinematic video loop + poster image.
 * Empty by default; UI falls back to procedural SVG hero.
 * Recommended sources: pexels.com/videos/?q=motorcycle (CC0).
 */
const HERO: HeroSource[] = [];

export const IMAGE_SOURCES: ImageSource[] = [
  ...BRAND_LOGOS,
  ...BRAND_HEROES,
  ...BIKES,
  ...PARTS,
  ...FEATURED,
  ...HERO
];
