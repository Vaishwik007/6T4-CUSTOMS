import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  path: "/owner",
  title: "Arjun Rao — Owner & Head Tuner",
  description:
    "Bachupally Arjun Rao — founder of 6T4 Customs. Head tuner, TIG welder, twelve years on the bench. Performance over comfort. Always.",
  keywords: [
    "arjun rao 6t4 customs",
    "motorcycle tuner hyderabad",
    "head tuner bachupally"
  ]
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
