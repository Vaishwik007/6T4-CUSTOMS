import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | 6T4 Customs — Motorcycle Garage Bachupally Hyderabad',
  description:
    'Visit 6T4 Customs in Bachupally, Hyderabad. WhatsApp, phone or contact form for tuning, service and fabrication enquiries. Open Mon–Sat 9am–7pm.',
  alternates: { canonical: 'https://6t4customs.com/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
