import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/checkout",
  title: "Checkout",
  description: "Lock in your build. Bay slot reserved on confirmation.",
  noIndex: true
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
