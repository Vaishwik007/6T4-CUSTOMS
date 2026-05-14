import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/seo/config";
import { createAdminSupabase } from "@/lib/supabase/admin";

type Entry = MetadataRoute.Sitemap[number];

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: Entry[] = (
    [
      ["/", 1.0, "weekly"],
      ["/configurator", 0.9, "weekly"],
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

  const dynamicEntries: Entry[] = [];

  const admin = createAdminSupabase();
  if (admin) {
    // Products (when productized/variants migration lands, swap to product_groups)
    const { data: products } = await admin
      .from("products")
      .select("id, updated_at")
      .eq("active", true)
      .limit(1000);
    for (const p of products ?? []) {
      dynamicEntries.push({
        url: absoluteUrl(`/parts/${p.id}`),
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7
      });
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
