import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/cart",
  title: "Your Cart",
  description: "Review your build before checkout.",
  noIndex: true
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
