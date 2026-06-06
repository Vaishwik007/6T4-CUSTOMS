import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services | Motorcycle Tuning, Service & Fabrication | 6T4 Customs Hyderabad',
  description:
    'ECU tuning from Stage 1 to Stage 3, OEM-spec servicing, custom TIG fabrication, premium parts fitting. Motorcycle performance garage in Bachupally, Hyderabad.',
  alternates: { canonical: 'https://6t4customs.com/services' },
  keywords: [
    'motorcycle tuning Hyderabad',
    'bike performance Hyderabad',
    'ECU flash Hyderabad',
    'motorcycle fabrication Hyderabad',
    'dyno tuning Hyderabad',
  ],
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
