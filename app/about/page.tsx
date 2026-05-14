import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Wrench, Activity, Hammer } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/seo/config";

export const metadata: Metadata = buildMetadata({
  path: "/about",
  title: "About",
  description:
    "6T4 Customs is a Hyderabad motorcycle tuning garage. Founded by Arjun Rao. Twelve years on the bench. Bench-mapped ECUs. TIG-welded by hand.",
  keywords: ["6t4 customs about", "arjun rao motorcycle tuner", "motorcycle garage hyderabad"]
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">About</span>
      </nav>

      <header className="mb-14 max-w-2xl">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">About 6T4</p>
        <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
          A bench. A torque wrench. Twelve years.
        </h1>
        <p className="mt-6 text-base text-bone/70 md:text-lg">
          Built different. Tuned brutal. Premium motorcycle tuning, fabrication and performance
          engineering in Hyderabad — by the people who actually ride.
        </p>
      </header>

      {/* Owner block */}
      <section className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="neon-edge relative aspect-[832/1066] overflow-hidden border border-white/10 bg-gradient-to-br from-gunmetal via-carbon to-black md:max-w-sm">
          <span className="pointer-events-none absolute left-0 top-0 z-[2] h-3 w-3 border-l-2 border-t-2 border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 z-[2] h-3 w-3 border-r-2 border-t-2 border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 z-[2] h-3 w-3 border-b-2 border-l-2 border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 z-[2] h-3 w-3 border-b-2 border-r-2 border-neon" />
          <Image
            src="/images/owner/arjun-rao.webp"
            alt="Bachupally Arjun Rao — founder of 6T4 Customs"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain"
          />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 z-[3] border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Hyderabad</p>
            <p className="mt-0.5 text-display text-sm font-bold uppercase">Bay 01 · In-House</p>
          </div>
        </div>

        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">The Owner</p>
          <h2 className="mt-2 text-display text-2xl font-bold uppercase md:text-3xl">
            Bachupally Arjun Rao
          </h2>
          <p className="mt-1 text-bone/50">Founder · Head tuner · TIG welder</p>

          <div className="mt-6 space-y-4 text-sm text-bone/75 md:text-base">
            <p>
              Arjun started on a 1998 Yamaha RX-100 he was technically not supposed to touch.
              Twelve years later, the bench he set up under a tarp in Bachupally has flashed
              over twelve hundred ECUs and welded subframes for Panigales, KTMs, and a
              Continental GT that wins shows on the regular.
            </p>
            <p>
              He doesn't have a certificate framed on a wall. He has a torque wrench he's
              owned for nine years and a Dynojet log book that goes back to 2014. Every weld
              inspected. Every map logged. Every customer's bike treated like it's his own —
              because for twenty-four to seventy-two hours, it is.
            </p>
            <p className="border-l-2 border-neon pl-5 italic text-bone/80">
              "Performance over comfort. Always."
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mt-20 border-t border-white/10 pt-12">
        <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">What We Stand For</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          <Pillar
            Icon={Activity}
            title="Premium sourcing"
            body="Direct lines to Akrapovič, SC-Project, Öhlins, Brembo, K&N. Genuine, traceable, warrantied."
          />
          <Pillar
            Icon={Hammer}
            title="Custom fabrication"
            body="TIG-welded subframes, sliders, exhaust mods, one-off brackets. Hand-built and bench-fit checked."
          />
          <Pillar
            Icon={Wrench}
            title="Calibrated tools"
            body="Dynojet, laser wheel alignment, torque plates, borescope. Maintained, respected, never improvised."
          />
        </ul>
      </section>

      {/* Location */}
      <section className="mt-20 border-t border-white/10 pt-12">
        <h2 className="text-display text-xs uppercase tracking-[0.3em] text-neon">Find Us</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 text-display text-sm uppercase tracking-wide text-bone">
              <MapPin className="h-4 w-4 text-neon" />
              {SITE.address.streetAddress}
            </p>
            <p className="mt-1 text-bone/60">
              {SITE.address.addressLocality}, {SITE.address.addressRegion} {SITE.address.postalCode}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-bone/40">
              Mon–Sat · {SITE.hours.open}–{SITE.hours.close}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone hover:border-neon hover:text-neon"
              >
                {SITE.phone}
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 bg-neon px-4 py-2 text-display text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
          <div className="border border-white/10 bg-carbon p-6 text-sm text-bone/70">
            <p>Bring your bike. Bring your build sheet (or don't — we'll start one).</p>
            <p className="mt-3">No appointment? Walk-ins welcome for diagnostics and quick fits. For tuning and major service, book a slot to guarantee bay time.</p>
            <Link
              href="/book"
              className="mt-5 inline-flex items-center gap-1 text-neon hover:underline"
            >
              Book a slot <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

function Pillar({
  Icon,
  title,
  body
}: {
  Icon: typeof Activity;
  title: string;
  body: string;
}) {
  return (
    <li className="neon-edge relative border border-white/5 bg-carbon p-6">
      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
      <Icon className="h-5 w-5 text-neon" />
      <h3 className="mt-4 text-display text-base font-bold uppercase tracking-wide">
        {title}
      </h3>
      <p className="mt-2 text-sm text-bone/60">{body}</p>
    </li>
  );
}
