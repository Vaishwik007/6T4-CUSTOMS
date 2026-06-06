import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | 6T4 Customs',
  description:
    'Complete your motorcycle parts order. In-shop fitting available at our Bachupally, Hyderabad workshop.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
