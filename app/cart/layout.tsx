import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Build Cart | 6T4 Customs',
  description:
    'Review your selected motorcycle parts and mods. Proceed to checkout for in-shop fitting or delivery.',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
