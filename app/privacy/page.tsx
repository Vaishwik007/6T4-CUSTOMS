import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | 6T4 Customs",
  description: "Privacy policy for 6T4 Customs motorcycle workshop.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-[860px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <SectionHeader eyebrow="Legal" title="Privacy Policy." />
      <div className="prose prose-invert mt-12 max-w-none text-bone/70 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-neon [&_h2]:tracking-wider [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-4">
        <p>
          <strong className="text-bone/90">Effective date:</strong> January 1, 2025
        </p>

        <h2>What We Collect</h2>
        <p>
          When you use our website we may collect: your name, phone number, email address, and
          order details you provide during checkout or contact forms. We collect basic analytics
          (page views) but do not use third-party tracking pixels or advertising cookies.
        </p>

        <h2>How We Use It</h2>
        <p>
          We use your contact details to fulfil orders, respond to service enquiries, and notify
          you of order status changes. We do not sell or share your data with third parties
          except payment processors and our email service provider (Resend) to deliver
          transactional emails.
        </p>

        <h2>Data Retention</h2>
        <p>
          Order records are retained for 7 years for accounting purposes (as required by Indian
          GST law). Contact form data is deleted after 12 months. OTP codes are purged after use.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of your personal
          data. Contact us at{" "}
          <a href="mailto:garage@6t4customs.com" className="text-neon hover:underline">
            garage@6t4customs.com
          </a>
          . We will respond within 30 days.
        </p>

        <h2>Security</h2>
        <p>
          Data is stored in Supabase (EU data centres) with row-level security policies. Passwords
          are never stored — we use email OTP authentication only. All connections are encrypted
          via HTTPS/TLS.
        </p>

        <h2>Cookies</h2>
        <p>
          We use a single session cookie for account login. No marketing or advertising cookies
          are set. You may disable cookies in your browser; this will prevent account login but
          the configurator and product pages will continue to work.
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
