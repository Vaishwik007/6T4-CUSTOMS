import type { Viewport } from "next";
import { Orbitron, Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ChromeProvider } from "@/components/chrome/ChromeProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap"
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap"
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata = buildMetadata({
  path: "/",
  description:
    "Premium motorcycle tuning, fabrication and performance engineering in Hyderabad. Bench-mapped ECUs, TIG-welded by hand, honest dyno numbers.",
  keywords: [
    "motorcycle tuning hyderabad",
    "ecu flash india",
    "stage 1 stage 2 stage 3 tuning",
    "akrapovic india",
    "sc project india",
    "performance motorcycle garage",
    "dyno tuning hyderabad",
    "custom motorcycle fabrication"
  ]
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${bebas.variable} ${inter.variable}`}>
      <head>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="bg-ink text-bone antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-neon focus:px-4 focus:py-2 focus:text-display focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-black"
        >
          Skip to content
        </a>
        <ChromeProvider>{children}</ChromeProvider>
      </body>
    </html>
  );
}
