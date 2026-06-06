import type { Metadata, Viewport } from "next";
import { Orbitron, Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ChromeProvider } from "@/components/chrome/ChromeProvider";
import { MotionProvider } from "@/components/chrome/MotionProvider";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
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
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "6T4 CUSTOMS — Built Different. Tuned Brutal.",
  description:
    "Premium motorcycle tuning, fabrication and performance engineering. Configure your machine. Precision builds.",
  metadataBase: new URL("https://6t4customs.com"),
  keywords: [
    "motorcycle tuning Hyderabad",
    "bike performance Hyderabad",
    "motorcycle workshop Hyderabad",
    "ECU flash Hyderabad",
    "custom motorcycle Hyderabad",
    "6T4 Customs",
  ],
  openGraph: {
    title: "6T4 CUSTOMS",
    description:
      "Built Different. Tuned Brutal. Premium motorcycle tuning, fabrication and performance engineering in Hyderabad.",
    type: "website",
    url: "https://6t4customs.com",
    images: [
      { url: "/images/brand/logo.jpeg", width: 800, height: 600, alt: "6T4 Customs" },
    ],
    locale: "en_IN",
    siteName: "6T4 Customs",
  },
  twitter: {
    card: "summary_large_image",
    title: "6T4 CUSTOMS — Built Different. Tuned Brutal.",
    description:
      "Premium motorcycle tuning, fabrication and performance engineering in Hyderabad.",
    images: ["/images/brand/logo.jpeg"],
  },
  alternates: { canonical: "https://6t4customs.com" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${bebas.variable} ${inter.variable}`}>
      {/* bg-ink moved to <html> in globals.css so fx layer at z-index:-1 is visible. */}
      <body className="text-bone antialiased">
        <LocalBusinessSchema />
        <MotionProvider>
          <ChromeProvider>{children}</ChromeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
