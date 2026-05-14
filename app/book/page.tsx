import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SERVICES, getServiceBySlug } from "@/lib/services/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { BookingForm } from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  path: "/book",
  title: "Book a Service",
  description:
    "Reserve a bay slot for a Stage flash, dyno run, major service, or custom fabrication. Owner confirms on WhatsApp within an hour.",
  noIndex: false
});

export default function BookPage({ searchParams }: { searchParams: { service?: string } }) {
  const preselected = searchParams.service ? getServiceBySlug(searchParams.service) : undefined;

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <Link href="/" className="hover:text-neon">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/services" className="hover:text-neon">Services</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neon">Book</span>
      </nav>

      <header className="mb-10">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">Bay Slot</p>
        <h1 className="mt-3 text-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
          Lock the Bench.
        </h1>
        <p className="mt-4 max-w-xl text-bone/60 md:text-lg">
          Pick a service, drop your bike details, choose a window. We confirm on WhatsApp inside an hour during business hours.
        </p>
      </header>

      <BookingForm services={SERVICES} preselectedSlug={preselected?.slug} />
    </section>
  );
}
