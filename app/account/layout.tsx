import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { AccountChrome } from "@/components/account/AccountChrome";

export const metadata: Metadata = buildMetadata({
  path: "/account",
  title: "Account",
  description: "Your builds, orders, and bookings.",
  noIndex: true
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountChrome>{children}</AccountChrome>;
}
