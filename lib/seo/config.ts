/**
 * Centralized SEO + site identity constants. Every metadata builder, JSON-LD
 * generator, sitemap entry, and OG image route reads from here.
 */
export const SITE = {
  name: "6T4 Customs",
  shortName: "6T4",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://6t4customs.com",
  defaultDescription:
    "Premium motorcycle tuning, fabrication and performance engineering in Hyderabad. Bench-mapped ECUs, TIG-welded by hand, honest dyno numbers.",
  defaultTitle: "6T4 Customs — Built Different. Tuned Brutal.",
  locale: "en_IN",
  twitter: "@6t4customs",
  email: "hello@6t4customs.com",
  phone: process.env.NEXT_PUBLIC_OWNER_PHONE ?? "+91-9999999999",
  whatsapp: process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "+91-9999999999",
  address: {
    streetAddress: "Bachupally, Hyderabad",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500090",
    addressCountry: "IN"
  },
  geo: { latitude: 17.5128, longitude: 78.3215 },
  hours: { open: "10:00", close: "20:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
  socials: {
    instagram: "https://instagram.com/6t4customs",
    youtube: "https://youtube.com/@6t4customs",
    facebook: "https://facebook.com/6t4customs"
  },
  gstin: process.env.NEXT_PUBLIC_GSTIN ?? "" // Surface when issued
} as const;

export type SiteConfig = typeof SITE;

export function absoluteUrl(path: string = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
