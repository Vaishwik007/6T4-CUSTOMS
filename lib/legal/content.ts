/**
 * Legal copy. Plain text with paragraph breaks. Owner/lawyer can edit here and
 * the corresponding /legal/[slug] page picks it up. Keep these reviewable —
 * the goal is plain-language compliance, not impenetrable boilerplate.
 *
 * If/when content gets long, migrate to MD files under content/legal/.
 */

export type LegalDoc = {
  slug: string;
  title: string;
  intro: string;
  updatedAt: string; // ISO date
  sections: { heading: string; body: string[] }[];
};

const COMPANY = "6T4 Customs";
const LOCATION = "Hyderabad, Telangana, India";

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    intro: `${COMPANY} ("we", "us") respects your privacy. This policy explains what we collect, why, and your rights under the Digital Personal Data Protection Act, 2023 (DPDP).`,
    updatedAt: "2026-05-01",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Identity & contact: name, email, phone, postal address — provided when you place an order, book a service, or contact us.",
          "Vehicle details: bike brand, model, year, and registration plate when you book a service.",
          "Payment data: handled entirely by Razorpay. We never store card numbers, CVVs, or UPI PINs.",
          "Usage data: anonymous analytics (pages viewed, device type, approximate location) via Vercel Analytics. No third-party ad cookies."
        ]
      },
      {
        heading: "Why we collect it",
        body: [
          "Fulfilling orders and bookings.",
          "Communicating about your build (email + WhatsApp).",
          "Compliance with tax and accounting law.",
          "Improving the site (aggregate analytics only)."
        ]
      },
      {
        heading: "Who we share it with",
        body: [
          "Razorpay (payments).",
          "Supabase (database hosting, EU/IN region).",
          "Resend (transactional email).",
          "Vercel (web hosting, edge logs).",
          "We do not sell or rent your data."
        ]
      },
      {
        heading: "How long we keep it",
        body: [
          "Orders & invoices: 7 years (tax law requirement).",
          "Customer accounts: until you ask us to delete them.",
          "Analytics: 14 months, aggregated.",
          "WhatsApp / email threads: retained as long as needed for support."
        ]
      },
      {
        heading: "Your rights (DPDP)",
        body: [
          "Access — request a copy of your personal data.",
          "Correction — fix anything inaccurate.",
          "Erasure — request deletion (except where law requires retention).",
          "Grievance — write to us at the email below; we respond within 30 days."
        ]
      },
      {
        heading: "Contact",
        body: [`Email: hello@6t4customs.com`, `Postal: ${COMPANY}, ${LOCATION}`]
      }
    ]
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    intro: `By using ${COMPANY} or placing an order, you agree to these terms. They are governed by Indian law and disputes fall under the courts of ${LOCATION}.`,
    updatedAt: "2026-05-01",
    sections: [
      {
        heading: "Orders",
        body: [
          "All prices are in INR and inclusive of GST unless stated.",
          "An order is confirmed only when payment is captured (or you confirm pay-at-shop at the counter).",
          "We reserve the right to cancel and refund any order where stock has been mis-reported or a pricing error has occurred."
        ]
      },
      {
        heading: "Services",
        body: [
          "Quoted prices for tuning and service work are estimates based on standard scope. Additional findings (e.g. seized bolts, worn parts) will be discussed and re-quoted before work proceeds.",
          "Bay slots are reserved on payment of the booking advance. No-shows forfeit the advance unless rescheduled with 24 hours' notice."
        ]
      },
      {
        heading: "Liability",
        body: [
          "Our maximum liability for any single order or booking is limited to the total amount you paid for it.",
          "We are not responsible for performance gains, fuel efficiency, or compatibility claims made by third-party manufacturers beyond what is published in their official documentation.",
          "Track use, racing, and competition use of modified vehicles is at your own risk and may void manufacturer warranties."
        ]
      },
      {
        heading: "Intellectual property",
        body: [
          "All content on this site — photos, copy, build notes, dyno data — is © 6T4 Customs unless attributed otherwise.",
          "You may share content with credit. You may not republish, scrape, or train commercial AI models on it without written permission."
        ]
      },
      {
        heading: "Governing law",
        body: [
          `These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts of ${LOCATION}.`
        ]
      }
    ]
  },
  returns: {
    slug: "returns",
    title: "Returns Policy",
    intro:
      "Performance parts are sold under the following return policy. By placing an order you accept these conditions.",
    updatedAt: "2026-05-01",
    sections: [
      {
        heading: "7-day return on unopened parts",
        body: [
          "Cosmetic and bolt-on parts may be returned within 7 days of delivery if they are unopened, in original packaging, and unused.",
          "A 10% restocking fee applies. Customer pays return shipping unless the item was sent incorrectly by us."
        ]
      },
      {
        heading: "No returns on installed or tuned parts",
        body: [
          "Once an exhaust, intake, brake, suspension or any other part has been fitted, it cannot be returned.",
          "ECU flashes and custom maps are non-refundable once the bike has been ridden.",
          "Custom-fabricated parts (subframes, sliders, brackets) are non-refundable in all cases."
        ]
      },
      {
        heading: "Defective on arrival",
        body: [
          "If a part arrives damaged or defective, contact us within 48 hours of delivery with photos.",
          "We will arrange a replacement at no cost, subject to manufacturer verification."
        ]
      },
      {
        heading: "How to start a return",
        body: ["Email hello@6t4customs.com with your order ID and reason. We respond within 1 business day."]
      }
    ]
  },
  warranty: {
    slug: "warranty",
    title: "Warranty",
    intro:
      "Manufacturer warranties pass through unchanged. We add our own workmanship warranty on every fitment.",
    updatedAt: "2026-05-01",
    sections: [
      {
        heading: "Manufacturer warranty",
        body: [
          "Akrapovič: 2 years from purchase against material defects.",
          "SC-Project: 2 years against material defects.",
          "Öhlins: 2 years on suspension internals.",
          "Brembo: 2 years on hardware.",
          "Other brands: per the manufacturer's stated terms.",
          "Manufacturer warranty is void if parts are damaged in a crash, raced on a closed circuit, or installed by a third party."
        ]
      },
      {
        heading: "6T4 workmanship warranty",
        body: [
          "Every fitment carried out at our garage is covered by a 90-day labour warranty.",
          "If a part comes loose, vibrates, leaks, or fails because of how we installed it, we redo the work at no cost.",
          "This warranty does not cover the cost of replacement parts; it covers the labour to redo the fit."
        ]
      },
      {
        heading: "ECU maps",
        body: [
          "Custom ECU maps come with a 1-year remap warranty.",
          "If the bike's hardware (filter / exhaust / fuelling) changes, the map is updated at no labour cost; only the dyno time is billed."
        ]
      },
      {
        heading: "Claims",
        body: [
          "Email hello@6t4customs.com with your order/booking ID and a short description.",
          "We respond within 1 business day and book a bay slot for inspection."
        ]
      }
    ]
  },
  shipping: {
    slug: "shipping",
    title: "Shipping",
    intro: "Domestic India shipping only. Most parts ship within 1-3 business days of payment capture.",
    updatedAt: "2026-05-01",
    sections: [
      {
        heading: "Rates",
        body: [
          "Flat ₹499 within India.",
          "Free shipping on orders above ₹5,000.",
          "Heavy or oversized parts (full exhaust systems, subframes) may incur additional courier charges, quoted before dispatch."
        ]
      },
      {
        heading: "Delivery time",
        body: [
          "Hyderabad, Bangalore, Chennai, Pune, Mumbai: 2–4 business days.",
          "Delhi NCR, Kolkata, North-East: 4–7 business days.",
          "Remote pincodes: 7–10 business days, sometimes longer for monsoon disruptions."
        ]
      },
      {
        heading: "Tracking",
        body: [
          "A tracking link is sent via email and WhatsApp on dispatch.",
          "If your order has not moved 5 business days after dispatch, message us — we open a tracer with the courier."
        ]
      },
      {
        heading: "In-shop pickup",
        body: [
          "Free, any business day during our hours.",
          "Bring your booking token and a photo ID."
        ]
      },
      {
        heading: "International",
        body: ["We do not currently ship internationally."]
      }
    ]
  }
};

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCS);
