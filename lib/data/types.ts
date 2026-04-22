export type Region = "India" | "Japan" | "Europe" | "USA" | "Other";

export type Brand = {
  slug: string;
  name: string;
  country: string;
  region: Region;
  founded: number;
  accent: string;
  tagline?: string;
  /** /images/brands/<slug>.svg — official logo. Falls back to wordmark. */
  logo?: string;
  /** /images/brands/<slug>-hero.webp — representative bike photo for carousel card bg. */
  heroImage?: string;
};

export type ModelCategory =
  | "Naked"
  | "Supersport"
  | "Cruiser"
  | "Touring"
  | "ADV"
  | "Scrambler"
  | "Cafe Racer"
  | "Commuter"
  | "Modern Classic";

export type Model = {
  slug: string;
  brand: string;
  name: string;
  category: ModelCategory;
  engineCc: number;
  hp?: number;
  yearStart: number;
  yearEnd: number | null;
  /** /images/bikes/<brand>/<model>.webp — studio shot. Falls back to SVG silhouette. */
  image?: string;
};

export type PartCategory =
  | "Exhaust"
  | "ECU Tuning"
  | "Air Filter"
  | "Performance Kit"
  | "Cosmetic"
  | "Service Kit";

export type CompatibilityRule = {
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number | null;
};

export type Part = {
  id: string;
  name: string;
  brand: string; /* manufacturer of the part, not the bike */
  category: PartCategory;
  description: string;
  price: number;
  hpGain?: number;
  soundDb?: number;
  installMinutes?: number;
  compatibility: CompatibilityRule[] | "universal";
  /** /images/parts/<id>.webp — primary image is first element. */
  images?: string[];
};

export type CartItem = {
  partId: string;
  qty: number;
  forBuild?: { brand: string; model: string; year: number };
};

export type FeaturedBuild = {
  id: string;
  title: string;
  bike: string;
  mods: string[];
  hpGain: number;
  beforeImage?: string;
  afterImage?: string;
};
