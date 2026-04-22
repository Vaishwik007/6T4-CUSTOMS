import type { Brand } from "./types";

/** Build image paths from slug. Fetch script materialises files at these paths;
 *  when a file is missing, UI components fall back to wordmark/silhouette. */
const logoOf = (slug: string) => `/images/brands/${slug}.svg`;
const heroOf = (slug: string) => `/images/brands/${slug}-hero.webp`;

export const BRANDS: Brand[] = [
  // INDIA
  { slug: "royal-enfield", name: "Royal Enfield", country: "India", region: "India", founded: 1901, accent: "#7a0a0a", tagline: "Pure Motorcycling", logo: logoOf("royal-enfield"), heroImage: heroOf("royal-enfield") },
  { slug: "bajaj", name: "Bajaj", country: "India", region: "India", founded: 1945, accent: "#0066cc", tagline: "Distinctly Ahead", logo: logoOf("bajaj"), heroImage: heroOf("bajaj") },
  { slug: "tvs", name: "TVS", country: "India", region: "India", founded: 1978, accent: "#005baa", tagline: "Racing DNA", logo: logoOf("tvs"), heroImage: heroOf("tvs") },
  { slug: "hero", name: "Hero MotoCorp", country: "India", region: "India", founded: 1984, accent: "#cc0000", tagline: "Hum Mein Hai Hero", logo: logoOf("hero"), heroImage: heroOf("hero") },
  { slug: "jawa", name: "Jawa", country: "India", region: "India", founded: 1929, accent: "#3a3a3a", tagline: "Forever", logo: logoOf("jawa"), heroImage: heroOf("jawa") },
  { slug: "yezdi", name: "Yezdi", country: "India", region: "India", founded: 1960, accent: "#222222", tagline: "Ride Maximum", logo: logoOf("yezdi"), heroImage: heroOf("yezdi") },

  // JAPAN
  { slug: "honda", name: "Honda", country: "Japan", region: "Japan", founded: 1948, accent: "#cc0000", tagline: "The Power of Dreams", logo: logoOf("honda"), heroImage: heroOf("honda") },
  { slug: "yamaha", name: "Yamaha", country: "Japan", region: "Japan", founded: 1955, accent: "#0033a0", tagline: "Revs Your Heart", logo: logoOf("yamaha"), heroImage: heroOf("yamaha") },
  { slug: "suzuki", name: "Suzuki", country: "Japan", region: "Japan", founded: 1909, accent: "#0a3d91", tagline: "Way of Life", logo: logoOf("suzuki"), heroImage: heroOf("suzuki") },
  { slug: "kawasaki", name: "Kawasaki", country: "Japan", region: "Japan", founded: 1896, accent: "#3aaa35", tagline: "Let the Good Times Roll", logo: logoOf("kawasaki"), heroImage: heroOf("kawasaki") },

  // EUROPE
  { slug: "ktm", name: "KTM", country: "Austria", region: "Europe", founded: 1934, accent: "#ff6600", tagline: "Ready to Race", logo: logoOf("ktm"), heroImage: heroOf("ktm") },
  { slug: "bmw-motorrad", name: "BMW Motorrad", country: "Germany", region: "Europe", founded: 1923, accent: "#0066b1", tagline: "Make Life a Ride", logo: logoOf("bmw-motorrad"), heroImage: heroOf("bmw-motorrad") },
  { slug: "ducati", name: "Ducati", country: "Italy", region: "Europe", founded: 1926, accent: "#cc0000", tagline: "Forever Forward", logo: logoOf("ducati"), heroImage: heroOf("ducati") },
  { slug: "aprilia", name: "Aprilia", country: "Italy", region: "Europe", founded: 1945, accent: "#000000", tagline: "Be a Racer", logo: logoOf("aprilia"), heroImage: heroOf("aprilia") },
  { slug: "triumph", name: "Triumph", country: "United Kingdom", region: "Europe", founded: 1902, accent: "#1a1a1a", tagline: "For the Ride", logo: logoOf("triumph"), heroImage: heroOf("triumph") },
  { slug: "husqvarna", name: "Husqvarna", country: "Sweden", region: "Europe", founded: 1903, accent: "#2864b8", tagline: "Pioneering", logo: logoOf("husqvarna"), heroImage: heroOf("husqvarna") },
  { slug: "mv-agusta", name: "MV Agusta", country: "Italy", region: "Europe", founded: 1945, accent: "#a90000", tagline: "Motorcycle Art", logo: logoOf("mv-agusta"), heroImage: heroOf("mv-agusta") },

  // USA
  { slug: "harley-davidson", name: "Harley-Davidson", country: "USA", region: "USA", founded: 1903, accent: "#f47b20", tagline: "All for Freedom", logo: logoOf("harley-davidson"), heroImage: heroOf("harley-davidson") },
  { slug: "indian", name: "Indian Motorcycle", country: "USA", region: "USA", founded: 1901, accent: "#bf0a30", tagline: "Choice of Champions", logo: logoOf("indian"), heroImage: heroOf("indian") },

  // OTHER
  { slug: "benelli", name: "Benelli", country: "Italy/China", region: "Other", founded: 1911, accent: "#15572b", tagline: "Italian Heart", logo: logoOf("benelli"), heroImage: heroOf("benelli") },
  { slug: "moto-guzzi", name: "Moto Guzzi", country: "Italy", region: "Other", founded: 1921, accent: "#8b0000", tagline: "The Eagle", logo: logoOf("moto-guzzi"), heroImage: heroOf("moto-guzzi") },
  { slug: "cf-moto", name: "CF Moto", country: "China", region: "Other", founded: 1989, accent: "#003d7a", tagline: "Adventure Awaits", logo: logoOf("cf-moto"), heroImage: heroOf("cf-moto") },
  { slug: "keeway", name: "Keeway", country: "Hungary/China", region: "Other", founded: 1999, accent: "#0a0a0a", tagline: "Ride the Future", logo: logoOf("keeway"), heroImage: heroOf("keeway") }
];

export const BRANDS_BY_SLUG: Record<string, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.slug, b])
);
