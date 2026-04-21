import type { Brand } from "./types";

export const BRANDS: Brand[] = [
  // INDIA
  { slug: "royal-enfield", name: "Royal Enfield", country: "India", region: "India", founded: 1901, accent: "#7a0a0a", tagline: "Pure Motorcycling" },
  { slug: "bajaj", name: "Bajaj", country: "India", region: "India", founded: 1945, accent: "#0066cc", tagline: "Distinctly Ahead" },
  { slug: "tvs", name: "TVS", country: "India", region: "India", founded: 1978, accent: "#005baa", tagline: "Racing DNA" },
  { slug: "hero", name: "Hero MotoCorp", country: "India", region: "India", founded: 1984, accent: "#cc0000", tagline: "Hum Mein Hai Hero" },
  { slug: "jawa", name: "Jawa", country: "India", region: "India", founded: 1929, accent: "#3a3a3a", tagline: "Forever" },
  { slug: "yezdi", name: "Yezdi", country: "India", region: "India", founded: 1960, accent: "#222222", tagline: "Ride Maximum" },

  // JAPAN
  { slug: "honda", name: "Honda", country: "Japan", region: "Japan", founded: 1948, accent: "#cc0000", tagline: "The Power of Dreams" },
  { slug: "yamaha", name: "Yamaha", country: "Japan", region: "Japan", founded: 1955, accent: "#0033a0", tagline: "Revs Your Heart" },
  { slug: "suzuki", name: "Suzuki", country: "Japan", region: "Japan", founded: 1909, accent: "#0a3d91", tagline: "Way of Life" },
  { slug: "kawasaki", name: "Kawasaki", country: "Japan", region: "Japan", founded: 1896, accent: "#3aaa35", tagline: "Let the Good Times Roll" },

  // EUROPE
  { slug: "ktm", name: "KTM", country: "Austria", region: "Europe", founded: 1934, accent: "#ff6600", tagline: "Ready to Race" },
  { slug: "bmw-motorrad", name: "BMW Motorrad", country: "Germany", region: "Europe", founded: 1923, accent: "#0066b1", tagline: "Make Life a Ride" },
  { slug: "ducati", name: "Ducati", country: "Italy", region: "Europe", founded: 1926, accent: "#cc0000", tagline: "Forever Forward" },
  { slug: "aprilia", name: "Aprilia", country: "Italy", region: "Europe", founded: 1945, accent: "#000000", tagline: "Be a Racer" },
  { slug: "triumph", name: "Triumph", country: "United Kingdom", region: "Europe", founded: 1902, accent: "#1a1a1a", tagline: "For the Ride" },
  { slug: "husqvarna", name: "Husqvarna", country: "Sweden", region: "Europe", founded: 1903, accent: "#2864b8", tagline: "Pioneering" },
  { slug: "mv-agusta", name: "MV Agusta", country: "Italy", region: "Europe", founded: 1945, accent: "#a90000", tagline: "Motorcycle Art" },

  // USA
  { slug: "harley-davidson", name: "Harley-Davidson", country: "USA", region: "USA", founded: 1903, accent: "#f47b20", tagline: "All for Freedom" },
  { slug: "indian", name: "Indian Motorcycle", country: "USA", region: "USA", founded: 1901, accent: "#bf0a30", tagline: "Choice of Champions" },

  // OTHER
  { slug: "benelli", name: "Benelli", country: "Italy/China", region: "Other", founded: 1911, accent: "#15572b", tagline: "Italian Heart" },
  { slug: "moto-guzzi", name: "Moto Guzzi", country: "Italy", region: "Other", founded: 1921, accent: "#8b0000", tagline: "The Eagle" },
  { slug: "cf-moto", name: "CF Moto", country: "China", region: "Other", founded: 1989, accent: "#003d7a", tagline: "Adventure Awaits" },
  { slug: "keeway", name: "Keeway", country: "Hungary/China", region: "Other", founded: 1999, accent: "#0a0a0a", tagline: "Ride the Future" }
];

export const BRANDS_BY_SLUG: Record<string, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.slug, b])
);
