import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why Choose 6T4 Customs | Premium Motorcycle Workshop Hyderabad',
  description:
    "Genuine parts, TIG-welded fabrication, bench-mapped ECU tuning. 12+ years on the bench, 1,200+ bikes, 23 brands. Hyderabad's most precise motorcycle workshop.",
  openGraph: {
    title: 'Why 6T4 Customs? Numbers, Not Vibes.',
    description:
      'Genuine Akrapovič, Öhlins, Brembo. TIG-welded by hand. ECU-mapped on the bench. Hyderabad.',
    type: 'website',
    url: 'https://6t4customs.com/why-us',
  },
  alternates: { canonical: 'https://6t4customs.com/why-us' },
}

export default function WhyUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
