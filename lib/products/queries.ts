import { createAdminSupabase } from "@/lib/supabase/admin";
import { PARTS, getPartById } from "@/lib/data/parts";
import type { Part, PartCategory } from "@/lib/data/types";

/**
 * Unified product type — merges the static catalog (definitive for compat
 * + descriptions + HP gain) with the live Supabase row (definitive for
 * stock + price).
 */
export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: PartCategory;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
  hpGain?: number;
  soundDb?: number;
  installMinutes?: number;
  images: string[];
  compatibility: Part["compatibility"];
  fitsUniversal: boolean;
  featured: boolean;
  tags: string[];
};

type ProductRow = {
  id: string;
  sku?: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  low_stock_threshold?: number;
  images?: string[];
  active?: boolean;
  slug?: string | null;
  short_description?: string | null;
  hp_gain?: number | null;
  sound_db?: number | null;
  install_minutes?: number | null;
  fits_universal?: boolean | null;
  featured?: boolean | null;
  tags?: string[] | null;
};

const STATIC_BY_SLUG = new Map<string, Part>(PARTS.map((p) => [p.id, p]));

function mergeProduct(staticPart: Part, db?: ProductRow | null): Product {
  const stock = db?.stock ?? 0;
  const lowThreshold = db?.low_stock_threshold ?? 5;
  return {
    id: staticPart.id,
    slug: db?.slug ?? staticPart.id,
    name: db?.name ?? staticPart.name,
    brand: db?.brand ?? staticPart.brand,
    category: (db?.category as PartCategory) ?? staticPart.category,
    description: db?.description ?? staticPart.description,
    shortDescription:
      db?.short_description ??
      staticPart.description.split(/[.!?]/)[0]?.trim().slice(0, 160) ??
      staticPart.description.slice(0, 160),
    price: db?.price ?? staticPart.price,
    stock,
    inStock: db ? stock > 0 : true, // when DB row is missing we assume "in stock" — keep UX flowing
    lowStock: stock > 0 && stock <= lowThreshold,
    hpGain: staticPart.hpGain ?? db?.hp_gain ?? undefined,
    soundDb: staticPart.soundDb ?? db?.sound_db ?? undefined,
    installMinutes: staticPart.installMinutes ?? db?.install_minutes ?? undefined,
    images: (db?.images && db.images.length > 0 ? db.images : staticPart.images) ?? [],
    compatibility: staticPart.compatibility,
    fitsUniversal:
      db?.fits_universal ?? (staticPart.compatibility === "universal"),
    featured: db?.featured ?? false,
    tags: db?.tags ?? []
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  // Static catalog is the source of truth for SEO surfaces — every part has a slug
  // even if it isn't mirrored in Supabase yet.
  return PARTS.map((p) => p.id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const staticPart = STATIC_BY_SLUG.get(slug);
  if (!staticPart) return null;

  const admin = createAdminSupabase();
  if (!admin) return mergeProduct(staticPart, null);

  const { data } = await admin
    .from("products")
    .select(
      "id, sku, name, brand, category, description, price, stock, low_stock_threshold, images, active, slug, short_description, hp_gain, sound_db, install_minutes, fits_universal, featured, tags"
    )
    .or(`id.eq.${slug},slug.eq.${slug}`)
    .maybeSingle();

  return mergeProduct(staticPart, data as ProductRow | null);
}

export async function getAllProducts(): Promise<Product[]> {
  const admin = createAdminSupabase();
  if (!admin) return PARTS.map((p) => mergeProduct(p, null));

  const { data } = await admin
    .from("products")
    .select(
      "id, sku, name, brand, category, description, price, stock, low_stock_threshold, images, active, slug, short_description, hp_gain, sound_db, install_minutes, fits_universal, featured, tags"
    )
    .eq("active", true);

  const dbById = new Map<string, ProductRow>(
    (data ?? []).map((row) => [row.id as string, row as ProductRow])
  );

  return PARTS.map((p) => mergeProduct(p, dbById.get(p.id) ?? null));
}

export type PartsFilters = {
  brand?: string[];
  category?: PartCategory[];
  stage?: number;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "hp-desc" | "newest";
  bike?: { brandSlug: string; modelSlug: string; year?: number };
};

export async function getFilteredProducts(filters: PartsFilters): Promise<Product[]> {
  let products = await getAllProducts();

  if (filters.brand?.length) {
    const set = new Set(filters.brand.map((b) => b.toLowerCase()));
    products = products.filter((p) => set.has(p.brand.toLowerCase()));
  }
  if (filters.category?.length) {
    const set = new Set(filters.category);
    products = products.filter((p) => set.has(p.category));
  }
  if (filters.priceMin != null) products = products.filter((p) => p.price >= filters.priceMin!);
  if (filters.priceMax != null) products = products.filter((p) => p.price <= filters.priceMax!);
  if (filters.inStock) products = products.filter((p) => p.inStock);

  if (filters.bike) {
    const { brandSlug, modelSlug, year } = filters.bike;
    products = products.filter((p) => {
      if (p.fitsUniversal) return true;
      if (p.compatibility === "universal") return true;
      return p.compatibility.some(
        (c) =>
          c.brand === brandSlug &&
          c.model === modelSlug &&
          (year == null ||
            (year >= c.yearStart && (c.yearEnd == null || year <= c.yearEnd)))
      );
    });
  }

  switch (filters.sort ?? "featured") {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "hp-desc":
      products.sort((a, b) => (b.hpGain ?? 0) - (a.hpGain ?? 0));
      break;
    case "newest":
      products.reverse();
      break;
    case "featured":
    default:
      products.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.inStock) - Number(a.inStock)
      );
  }

  return products;
}

export function getProductByIdStatic(id: string): Product | null {
  const p = getPartById(id);
  return p ? mergeProduct(p, null) : null;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const source = getPartById(productId);
  if (!source) return [];
  const all = await getAllProducts();
  const compatibleCategories: Record<PartCategory, PartCategory[]> = {
    Exhaust: ["ECU Tuning", "Air Filter"],
    "ECU Tuning": ["Exhaust", "Air Filter"],
    "Air Filter": ["Exhaust", "ECU Tuning"],
    "Performance Kit": ["ECU Tuning", "Exhaust"],
    Cosmetic: ["Cosmetic"],
    "Service Kit": ["Service Kit"]
  };
  const targetCats = new Set(compatibleCategories[source.category] ?? []);
  return all
    .filter((p) => p.id !== productId && targetCats.has(p.category))
    .slice(0, limit);
}

export function getDistinctBrands(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.brand))].sort();
}
