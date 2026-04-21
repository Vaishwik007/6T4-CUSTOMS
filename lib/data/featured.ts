import type { FeaturedBuild } from "./types";

export const FEATURED_BUILDS: FeaturedBuild[] = [
  {
    id: "panigale-v4-track",
    title: "Trackday Razor",
    bike: "Ducati Panigale V4 S",
    mods: ["Akrapovič Full Ti", "Öhlins NIX30", "Brembo Stylema", "ECU Race Map"],
    hpGain: 18,
    dynoData: [
      { rpm: 4000, stockHp: 78, tunedHp: 84 },
      { rpm: 6000, stockHp: 122, tunedHp: 138 },
      { rpm: 8000, stockHp: 168, tunedHp: 184 },
      { rpm: 10000, stockHp: 195, tunedHp: 210 },
      { rpm: 12000, stockHp: 215, tunedHp: 233 },
      { rpm: 13500, stockHp: 210, tunedHp: 228 }
    ]
  },
  {
    id: "duke-890-streetfighter",
    title: "Street Brawler",
    bike: "KTM 890 Duke R",
    mods: ["SC-Project CR-T", "DNA Stage 2", "Stage 2 Flash", "Frame Sliders"],
    hpGain: 11,
    dynoData: [
      { rpm: 3000, stockHp: 42, tunedHp: 48 },
      { rpm: 5000, stockHp: 78, tunedHp: 88 },
      { rpm: 7000, stockHp: 105, tunedHp: 116 },
      { rpm: 9000, stockHp: 121, tunedHp: 132 },
      { rpm: 10500, stockHp: 118, tunedHp: 128 }
    ]
  },
  {
    id: "interceptor-650-cafe",
    title: "Boutique Café",
    bike: "Royal Enfield Continental GT 650",
    mods: ["S&S Slip-On", "K&N Filter", "Clip-Ons", "Custom Seat"],
    hpGain: 6,
    dynoData: [
      { rpm: 2500, stockHp: 22, tunedHp: 26 },
      { rpm: 4000, stockHp: 35, tunedHp: 41 },
      { rpm: 5500, stockHp: 44, tunedHp: 51 },
      { rpm: 7000, stockHp: 47, tunedHp: 53 }
    ]
  },
  {
    id: "s1000rr-streetable",
    title: "Streetable Superbike",
    bike: "BMW S 1000 RR",
    mods: ["Akrapovič Slip-On", "ECU Flash", "Öhlins TTX", "Carbon Fairings"],
    hpGain: 14,
    dynoData: [
      { rpm: 4000, stockHp: 72, tunedHp: 80 },
      { rpm: 7000, stockHp: 138, tunedHp: 152 },
      { rpm: 10000, stockHp: 188, tunedHp: 204 },
      { rpm: 12000, stockHp: 207, tunedHp: 224 },
      { rpm: 13800, stockHp: 200, tunedHp: 218 }
    ]
  },
  {
    id: "himalayan-overland",
    title: "Continental Tourer",
    bike: "Royal Enfield Himalayan 450",
    mods: ["Givi Outback Panniers", "Barkbusters", "Scotts Stabilizer", "Tall Screen"],
    hpGain: 0,
    dynoData: []
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
