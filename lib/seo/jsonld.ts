import { SITE, absoluteUrl } from "./config";

/**
 * Schema.org JSON-LD generators. Render via:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "AutoRepair", "LocalBusiness"],
    "@id": `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: absoluteUrl("/images/brand/logo.svg"),
    image: absoluteUrl("/og-default.jpg"),
    description: SITE.defaultDescription,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      ...SITE.address
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SITE.hours.days,
        opens: SITE.hours.open,
        closes: SITE.hours.close
      }
    ],
    sameAs: [SITE.socials.instagram, SITE.socials.youtube, SITE.socials.facebook]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.defaultDescription,
    publisher: { "@id": `${SITE.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/parts?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path)
    }))
  };
}

export type ProductSchema = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  sku: string;
  price: number;
  inStock: boolean;
  reviewCount?: number;
  averageRating?: number;
};

export function productJsonLd(p: ProductSchema) {
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((src) => absoluteUrl(src)),
    sku: p.sku,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/parts/${p.slug}`),
      priceCurrency: "INR",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE.url}#organization` }
    }
  };
  if (p.reviewCount && p.reviewCount > 0 && p.averageRating) {
    obj.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.averageRating.toFixed(1),
      reviewCount: p.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }
  return obj;
}

export type ServiceSchema = {
  slug: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

export function serviceJsonLd(s: ServiceSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.name,
    provider: { "@id": `${SITE.url}#organization` },
    description: s.description,
    areaServed: { "@type": "City", name: "Hyderabad" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/services/${s.slug}`),
      priceCurrency: "INR",
      price: s.price,
      availability: "https://schema.org/InStock"
    }
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}
