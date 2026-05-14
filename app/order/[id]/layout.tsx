import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Order Details",
  description: "Your 6T4 Customs order.",
  noIndex: true
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
