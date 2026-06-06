import { JsonLd } from './JsonLd'

const FAQS = [
  {
    q: "What motorcycle brands do you service in Hyderabad?",
    a: "We service all major ICE motorcycle brands including Honda, Yamaha, Suzuki, Kawasaki, KTM, Ducati, BMW Motorrad, Royal Enfield, Bajaj, TVS, Triumph, Aprilia and more. We support 23+ brands through our parts configurator."
  },
  {
    q: "How much does an ECU flash cost in Hyderabad?",
    a: "Stage 1 ECU flash starts at ₹8,500 and Stage 2 (for bikes with upgraded exhaust/intake) at ₹18,000. Stage 3 race-spec maps are quoted per project."
  },
  {
    q: "Do you offer same-day service?",
    a: "Minor services and flash jobs are typically same or next day. Fabrication and major builds are quoted individually. Call or WhatsApp for availability."
  },
  {
    q: "Where is 6T4 Customs located?",
    a: "We're at Plot 42, Nizampet Road, Bachupally, Hyderabad, Telangana 500090. Open Monday–Saturday, 9 AM to 7 PM."
  },
  {
    q: "Do you offer a warranty on your work?",
    a: "All labour carries a 90-day workmanship warranty. Manufacturer warranty applies to genuine parts. ECU maps are backed for the lifetime of the fitted hardware."
  },
]

export function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  }

  return <JsonLd data={schema} />
}
