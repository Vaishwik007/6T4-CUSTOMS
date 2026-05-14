/**
 * Editorial blog ("Journal") content. Static MD-in-TS for v1; migrate to
 * Supabase `journal_posts` table when admin authoring lands. The shape is
 * 1:1 with the DB schema in migration 0004 so the swap is a query change.
 */

export interface JournalPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  contentMd: string;
  coverImage?: string;
  author: string;
  category: "tuning" | "service" | "fabrication" | "build" | "guide";
  tags: string[];
  publishedAt: string; // ISO
  readingTimeMinutes: number;
  relatedPartSlug?: string;
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "stage-2-ktm-390-duke-real-numbers",
    title: "Stage 2 on the KTM 390 Duke — Real Numbers",
    subtitle: "Slip-on + filter + custom map. What you actually gain in 2026.",
    excerpt:
      "Three KTM 390 Dukes came in this month for Stage 2. Same exhaust, same filter, same dyno. Three different maps. Here's what changed and why.",
    contentMd: `
The 390 Duke is the most-modded bike on our bench. Almost every owner who walks in has the same opening line: "I've done a slip-on, I'm getting a flash, what should I expect?"

Honest answer: it depends on what map's already on the ECU, what fuel you're running, and how hot it gets where you ride. But here's the data from three bikes we tuned this month.

## Bike 1: 2023 KTM 390 Duke, stock map, 91 octane

Before (stock + Akrapovič slip-on + DNA filter):
- Peak HP: 41.8
- Peak Torque: 35.4 Nm
- AFR at peak: 14.1 (lean)

After Stage 2 custom map:
- Peak HP: 45.2 (+3.4)
- Peak Torque: 37.1 Nm (+1.7)
- AFR at peak: 12.9

The biggest change wasn't the peak — it was the midrange. 4,000-6,500 RPM picked up 4 HP because the stock map runs Euro-5 lean across that zone for emissions. Throttle response in city traffic is night and day.

## Bike 2: 2022 KTM 390 Duke, third-party flash already on it, 95 octane

This is the one that surprised the customer. The previous tune was a generic "Stage 2" flash someone had bought online. Before our retune:
- Peak HP: 43.9
- AFR at peak: 11.4 (rich, leaving HP on the table)

After our custom map on 95:
- Peak HP: 46.7 (+2.8)
- AFR at peak: 12.7

The off-the-shelf flash was running 95 octane like it was 91 — drowning the engine in fuel. Custom mapping is worth it on better fuel.

## Bike 3: 2024 KTM 390 Duke (new generation, ride-by-wire), stock + filter only

Different platform, different conclusions. The new RC architecture means a lot more parameters are tunable — and a lot more can go wrong.

- Stock + filter, no map: 43.5 HP
- Filter + Stage 1 (no exhaust): 45.1 HP (+1.6)

Stage 1 alone on the new 390 is genuinely worthwhile because Pierer engineered more conservatism into the stock map. The new bike's lambda sensor also runs closed-loop more aggressively, so you can feel the change immediately at part-throttle.

## What you should book

If you have a 2017-2023 390 Duke: Stage 2 (slip-on + filter + map). Real gain ~3-5 HP at peak, much more in mid-range.

If you have a 2024+ 390 Duke: Stage 1 first (filter + map only). Add the exhaust later — the new platform extracts more from a tune than from a slip-on alone.

If you're considering a third-party online flash: don't. We undo more cheap flashes than we install fresh ones.

[Book a Stage 1](/services/stage-1-flash) · [Book a Stage 2](/services/stage-2-flash) · [Ask a question](https://wa.me/${"919999999999"})
`,
    coverImage: "/images/featured/duke-890-streetfighter-after.webp",
    author: "Arjun Rao",
    category: "tuning",
    tags: ["ktm", "390 duke", "stage 2", "ecu flash", "dyno"],
    publishedAt: "2026-05-08",
    readingTimeMinutes: 5
  },
  {
    slug: "akrapovic-vs-sc-project-panigale-v4",
    title: "Akrapovič vs SC-Project on the Panigale V4",
    subtitle: "Same bike, same day, two full systems. Numbers + sound + price.",
    excerpt:
      "A 2024 Panigale V4 S spent a Saturday with us. Owner couldn't decide between Akrapovič full Ti or SC-Project CR-T. We let him hear both.",
    contentMd: `
Side-by-side comparisons are rare because most owners commit to one system. This week's customer brought in both — borrowed an SC-Project from a friend — and asked us to give him an honest comparison before he picked.

## The contenders

**Akrapovič Full Titanium (race-only) for Panigale V4** — full system, titanium headers, titanium link, carbon end cap. List price ₹3,40,000.

**SC-Project CR-T Full Titanium for Panigale V4** — full system, titanium throughout, carbon heat shield. List price ₹2,75,000.

## The dyno numbers (Stage 2 custom map for each)

| | Akrapovič Full Ti | SC-Project CR-T |
|---|---|---|
| Peak HP | 219.4 | 217.8 |
| Peak Torque | 132.1 Nm | 130.9 Nm |
| Weight saved (vs stock) | 6.2 kg | 5.8 kg |
| Sound (5m, 6000 RPM) | 105 dB | 108 dB |

Functionally? They're inside dyno error of each other. Both wake the bike up in the same way at the same RPM band.

## What's actually different

**Akrapovič is quieter.** That sounds wrong for a race exhaust, but the resonator stack is more sophisticated — the bike pulls hard without screaming. If you ride on roads with neighbours, this matters.

**SC-Project is louder, more aggressive note.** Track-day owners will love it. Anyone living in an apartment complex will not.

**Akrapovič build quality is a notch above.** The welds, the bracketry, the fitment of the link pipe — all visibly tighter. SC's quality is fine; Akra's is just better.

**SC-Project is ₹65,000 cheaper.** And the dyno doesn't care.

## What we'd buy

Honest answer? **SC-Project CR-T if it's a trackday bike.** **Akrapovič if it's a street bike that occasionally sees track.**

The 1.6 HP difference is invisible on the road. The ₹65k saved is not.

## What the customer bought

Akrapovič. He wanted the badge. We get it.

[Browse exhausts](/parts?category=Exhaust) · [Book a Stage 2](/services/stage-2-flash)
`,
    coverImage: "/images/featured/s1000rr-streetable-after.webp",
    author: "Arjun Rao",
    category: "tuning",
    tags: ["panigale v4", "akrapovic", "sc-project", "exhaust", "comparison"],
    publishedAt: "2026-04-21",
    readingTimeMinutes: 6
  },
  {
    slug: "service-intervals-royal-enfield-650",
    title: "Service intervals that actually matter on a Royal Enfield 650",
    subtitle: "What to do every 5K, 10K, and 20K — and what you can safely skip.",
    excerpt:
      "RE service schedules are conservative, expensive, and written by accountants. Here's what actually keeps a 650 happy in Indian conditions.",
    contentMd: `
Royal Enfield's official service schedule for the 650 twins is dense. Most of it is genuinely necessary. Some of it is filler. After 50+ 650s on our bench (Interceptor, Continental GT, Super Meteor), here's what we actually do.

## Every 5,000 km (or 6 months)

- **Engine oil + filter change.** Use a proper 15W50 motorcycle oil — not car oil. Motul 7100 or Liqui Moly 4T are our default picks. Cost matters less than viscosity stability.
- **Chain clean + adjust.** RE chains stretch faster than Japanese twins. Adjust to 35-40mm play.
- **Tyre pressure check** (yes, write the date on the valve cap).

That's it. The 5K interval is genuinely just oil + chain.

## Every 10,000 km

- Everything above, plus:
- **Air filter** — clean if K&N-equivalent, replace if paper. Bangalore + Hyderabad dust kills filters faster than RE schedule assumes.
- **Brake fluid check + top-up.** DOT 4. Replace fully every 20K.
- **Spark plug inspection.** Don't replace unless visibly worn.

## Every 20,000 km

- Everything above, plus:
- **Valve clearance check.** RE 650 twins are bucket-and-shim — clearances drift. Catch it before it ticks.
- **Coolant change.** Full drain and refill with manufacturer spec.
- **Front fork oil change.** Skipped by every owner, makes a huge difference on rough roads.
- **Rear shock service** if you ride pillion regularly.

## What we skip from the official schedule

- **Throttle body cleaning at 10K.** Modern injectors stay clean for 30-40K easily.
- **"Software update".** Don't pay for it unless RE has issued an actual TSB.
- **"General inspection" line items.** Charged hourly with no specifics.

## What we add that RE doesn't list

- **Steering head bearing check.** Indian road quality kills these faster than the schedule assumes.
- **Battery terminal clean.** Corrosion is constant in coastal humidity.
- **Wheel bearing rotation check** — push-pull the wheel from 12-6 o'clock direction with the bike on a paddock stand.

## What it actually costs

Major service (20K interval) at our shop runs ₹6,500-8,500 in labour, plus parts at cost. Compare to ₹12,000-15,000 at official RE service centres for the same work. The labour difference is real because we're not paying franchise overhead.

[Book a major service](/services/major-service)
`,
    coverImage: "/images/featured/interceptor-650-cafe-after.webp",
    author: "Arjun Rao",
    category: "service",
    tags: ["royal enfield", "650", "interceptor", "continental gt", "service"],
    publishedAt: "2026-03-15",
    readingTimeMinutes: 5
  }
];

export function getPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}

export function getPublishedPosts(): JournalPost[] {
  return [...JOURNAL_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
