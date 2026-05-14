import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/account/*",
          "/cart",
          "/checkout",
          "/thank-you",
          "/order/*"
        ]
      }
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url
  };
}
