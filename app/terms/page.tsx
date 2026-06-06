import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Terms of Service | 6T4 Customs",
  description: "Terms and conditions for 6T4 Customs motorcycle workshop.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-[860px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <SectionHeader eyebrow="Legal" title="Terms of Service." />
      <div className="prose prose-invert mt-12 max-w-none text-bone/70 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-neon [&_h2]:tracking-wider [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-4">
        <p>
          <strong className="text-bone/90">Effective date:</strong> January 1, 2025
        </p>

        <h2>Service Agreement</h2>
        <p>
          By placing an order or visiting our workshop, you agree to these terms. 6T4 Customs
          provides motorcycle tuning, servicing, parts supply, and fabrication services from
          our Hyderabad garage.
        </p>

        <h2>Orders &amp; Parts</h2>
        <p>
          Parts orders are confirmed upon payment. In-shop service jobs are confirmed via our
          WhatsApp booking token. We reserve the right to cancel orders if a part becomes
          unavailable, with a full refund issued within 5–7 business days to the original payment
          method.
        </p>

        <h2>Warranty</h2>
        <p>
          All labour carries a 90-day workmanship warranty. If a repair or modification fails
          due to our workmanship within 90 days, we will rectify it at no charge. Manufacturer
          warranty applies to genuine OEM or brand-new parts. ECU maps are backed for the
          lifetime of the fitted hardware combination.
        </p>

        <h2>Refund Policy</h2>
        <p>
          Unused, unopened parts in original packaging may be returned within 14 days of purchase
          for a full refund, excluding shipping charges. Installed parts or custom orders
          (including ECU maps and fabrication work) are non-refundable once fitted or commenced.
          Service labour is non-refundable once work has begun. UPI and card payments are refunded
          to the original payment method within 5–7 business days.
        </p>

        <h2>Liability</h2>
        <p>
          6T4 Customs is not liable for damage arising from modifications that void the
          manufacturer&apos;s warranty, pre-existing mechanical faults not disclosed at drop-off,
          or rider actions post-service. All performance modifications — including ECU remapping,
          exhaust work, and suspension changes — are carried out at the owner&apos;s risk and in
          full knowledge that they may affect road legality. It is the owner&apos;s responsibility
          to comply with applicable regulations.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of Telangana, India. Any disputes will be subject
          to the exclusive jurisdiction of competent courts in Hyderabad.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of our services after
          changes are posted constitutes acceptance of the revised terms. The effective date
          above will be updated accordingly.
        </p>

        <h2>Contact</h2>
        <p>
          6T4 Customs · Plot 42, Nizampet Road, Bachupally, Hyderabad 500090 ·{" "}
          <a href="mailto:garage@6t4customs.com" className="text-neon hover:underline">
            garage@6t4customs.com
          </a>
        </p>
      </div>
    </section>
  );
}
