import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/config";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { BRANDS } from "@/lib/data/brands";
import { MODELS } from "@/lib/data/models";
import { JOURNAL_POSTS } from "@/lib/journal/posts";
import { SERVICES } from "@/lib/services/catalog";

type Entry = MetadataRoute.Sitemap[number];

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Top-level static pages (always indexable; legal docs at lower priority).
  const staticEntries: Entry[] = (
    [
      ["/", 1.0, "weekly"],
      ["/configurator", 0.9, "weekly"],
      ["/parts", 0.9, "weekly"],
      ["/services", 0.9, "weekly"],
      ["/garage", 0.9, "weekly"],
      ["/journal", 0.7, "weekly"],
      ["/book", 0.8, "weekly"],
      ["/about", 0.6, "monthly"],
      ["/why-us", 0.7, "monthly"],
      ["/owner", 0.6, "monthly"],
      ["/credits", 0.3, "yearly"],
      ["/legal/privacy", 0.3, "yearly"],
      ["/legal/terms", 0.3, "yearly"],
      ["/legal/returns", 0.3, "yearly"],
      ["/legal/warranty", 0.3, "yearly"],
      ["/legal/shipping", 0.3, "yearly"]
    ] as const
  ).map(([path, priority, changeFrequency]) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority
  }));

  // Services — one entry per service slug.
  const serviceEntries: Entry[] = SERVICES.map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8
  }));

  // Journal posts — sorted by publishedAt.
  const journalEntries: Entry[] = JOURNAL_POSTS.map((p) => ({
    url: absoluteUrl(`/journal/${p.slug}`),
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  // Garage — brand index and per-model SEO pages.
  const garageBrandEntries: Entry[] = BRANDS.map((b) => ({
    url: absoluteUrl(`/garage/${b.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));
  const garageModelEntries: Entry[] = MODELS.map((m) => ({
    url: absoluteUrl(`/garage/${m.brand}/${m.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  // Products — pulled from Supabase when available, otherwise skipped.
  const productEntries: Entry[] = [];
  const admin = createAdminSupabase();
  if (admin) {
    const { data: products } = await admin
      .from("products")
      .select("id, updated_at")
      .eq("active", true)
      .limit(1000);
    for (const p of products ?? []) {
      productEntries.push({
        url: absoluteUrl(`/parts/${p.id}`),
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7
      });
    }
  }

  return [
    ...staticEntries,
    ...serviceEntries,
    ...journalEntries,
    ...garageBrandEntries,
    ...garageModelEntries,
    ...productEntries
  ];
}
