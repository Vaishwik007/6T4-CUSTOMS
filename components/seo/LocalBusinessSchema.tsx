import { JsonLd } from './JsonLd'

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRepair"],
    "name": "6T4 Customs",
    "alternateName": "6T4CUSTOMS",
    "description": "Premium motorcycle tuning, fabrication, ECU mapping, and performance engineering garage in Hyderabad.",
    "url": "https://6t4customs.com",
    "logo": "https://6t4customs.com/images/brand/logo.jpeg",
    "image": "https://6t4customs.com/images/brand/logo.jpeg",
    "telephone": "+919849000000",
    "email": "garage@6t4customs.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot 42, Nizampet Road",
      "addressLocality": "Bachupally",
      "addressRegion": "Telangana",
      "postalCode": "500090",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.5203,
      "longitude": 78.3856
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "priceRange": "₹₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, UPI, Card",
    "areaServed": { "@type": "City", "name": "Hyderabad" },
    "serviceArea": { "@type": "AdministrativeArea", "name": "Telangana" },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Motorcycle Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ECU Stage 1 Flash",
            "description": "Entry-level performance remap. Improved throttle response and power delivery."
          },
          "price": "8500",
          "priceCurrency": "INR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ECU Stage 2 Flash",
            "description": "Aggressive remap for modified bikes with intake/exhaust upgrades."
          },
          "price": "18000",
          "priceCurrency": "INR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Minor Service",
            "description": "5,000 km OEM-spec service: fluids, filter, inspection."
          },
          "price": "3500",
          "priceCurrency": "INR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Major Service",
            "description": "15,000 km full service: all consumables, detailed inspection, torque check."
          },
          "price": "8500",
          "priceCurrency": "INR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Fabrication",
            "description": "TIG-welded subframes, sliders, exhaust mods, custom brackets."
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "4",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://www.instagram.com/6t4customs",
      "https://www.youtube.com/@6t4customs"
    ]
  }

  return <JsonLd data={schema} />
}
