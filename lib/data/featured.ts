import type { FeaturedBuild } from "./types";

export const FEATURED_BUILDS: FeaturedBuild[] = [
  {
    id: "panigale-v4-track",
    title: "Trackday Razor",
    bike: "Ducati Panigale V4 S",
    mods: ["Akrapovič Full Ti", "Öhlins NIX30", "Brembo Stylema", "ECU Race Map"],
    hpGain: 18,
    beforeImage: "/images/featured/panigale-v4-track-before.webp",
    afterImage: "/images/featured/panigale-v4-track-after.webp"
  },
  {
    id: "duke-890-streetfighter",
    title: "Street Brawler",
    bike: "KTM 890 Duke R",
    mods: ["SC-Project CR-T", "DNA Stage 2", "Stage 2 Flash", "Frame Sliders"],
    hpGain: 11,
    beforeImage: "/images/featured/duke-890-streetfighter-before.webp",
    afterImage: "/images/featured/duke-890-streetfighter-after.webp"
  },
  {
    id: "interceptor-650-cafe",
    title: "Boutique Café",
    bike: "Royal Enfield Continental GT 650",
    mods: ["S&S Slip-On", "K&N Filter", "Clip-Ons", "Custom Seat"],
    hpGain: 6,
    beforeImage: "/images/featured/interceptor-650-cafe-before.webp",
    afterImage: "/images/featured/interceptor-650-cafe-after.webp"
  },
  {
    id: "s1000rr-streetable",
    title: "Streetable Superbike",
    bike: "BMW S 1000 RR",
    mods: ["Akrapovič Slip-On", "ECU Flash", "Öhlins TTX", "Carbon Fairings"],
    hpGain: 14,
    beforeImage: "/images/featured/s1000rr-streetable-before.webp",
    afterImage: "/images/featured/s1000rr-streetable-after.webp"
  },
  {
    id: "himalayan-overland",
    title: "Continental Tourer",
    bike: "Royal Enfield Himalayan 450",
    mods: ["Givi Outback Panniers", "Barkbusters", "Scotts Stabilizer", "Tall Screen"],
    hpGain: 0,
    beforeImage: "/images/featured/himalayan-overland-before.webp",
    afterImage: "/images/featured/himalayan-overland-after.webp"
  }
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Vivek N.",
    bike: "Ducati Panigale V2",
    content: "They mapped my V2 properly for the first time in two years. Throttle response is a different planet.",
    rating: 5
  },
  {
    id: "t2",
    name: "Karthik R.",
    bike: "KTM 390 Duke",
    content: "Took my Duke from sluggish to scary. Stage 2 flash + slip-on + filter — back in two days.",
    rating: 5
  },
  {
    id: "t3",
    name: "Aishwarya S.",
    bike: "BMW R 1250 GS",
    content: "Annual major service done with surgical care. Even the bolts were torqued in spec.",
    rating: 5
  },
  {
    id: "t4",
    name: "Rahul M.",
    bike: "Royal Enfield Continental GT 650",
    content: "Fabricated me a custom subframe for my café build. Welds are art.",
    rating: 5
  }
];
