import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Arjun Rao — Founder & Head Tuner | 6T4 Customs Hyderabad',
  description:
    'Bachupally Arjun Rao: 12+ years porting heads, bench-mapping ECUs, and TIG-welding custom subframes. The only hand-mapped performance shop in Hyderabad.',
  alternates: { canonical: 'https://6t4customs.com/owner' },
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
