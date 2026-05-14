import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/why-us",
  title: "Why 6T4 — Numbers, Not Vibes",
  description:
    "Premium sourcing from Akrapovič, SC-Project, Öhlins, Brembo, K&N. TIG-welded custom fabrication. Calibrated tools, traceable parts, inspected welds.",
  keywords: [
    "premium motorcycle parts hyderabad",
    "akrapovic dealer india",
    "custom motorcycle fabrication"
  ]
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
