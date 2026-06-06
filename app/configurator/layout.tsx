import type { Metadata } from 'next'
import { ProgressRail } from "@/components/configurator/ProgressRail";

export const metadata: Metadata = {
  title: 'Build Your Motorcycle | Parts Configurator | 6T4 Customs',
  description:
    'Configure your custom motorcycle build online. Choose from Akrapovič exhausts, Öhlins suspension, Brembo brakes, ECU maps and 500+ parts. Ship or install at our Hyderabad bay.',
  alternates: { canonical: 'https://6t4customs.com/configurator' },
}

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-16">
      <ProgressRail />
      {children}
    </div>
  );
}
