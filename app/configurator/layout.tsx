import type { Metadata } from "next";
import { ProgressRail } from "@/components/configurator/ProgressRail";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/configurator",
  title: "Configurator — Build Your Machine",
  description:
    "Configure your motorcycle build by brand, model, and year. See live-compatible exhausts, ECU flashes, suspension, brakes, and performance kits with HP gains and install times.",
  keywords: [
    "motorcycle configurator",
    "compatible parts finder",
    "motorcycle parts by model",
    "build your bike",
    "exhaust compatibility",
    "ecu flash compatibility"
  ]
});

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-16">
      <ProgressRail />
      {children}
    </div>
  );
}
