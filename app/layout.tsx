import type { Metadata, Viewport } from "next";
import { Orbitron, Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ChromeProvider } from "@/components/chrome/ChromeProvider";

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

export const metadata: Metadata = {
  title: "6T4 CUSTOMS — Built Different. Tuned Brutal.",
  description:
    "Premium motorcycle tuning, fabrication and performance engineering. Configure your machine. Precision builds.",
  metadataBase: new URL("https://6t4customs.com"),
  openGraph: {
    title: "6T4 CUSTOMS",
    description: "Built Different. Tuned Brutal.",
    type: "website"
  }
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
      <body className="bg-ink text-bone antialiased">
        <ChromeProvider>{children}</ChromeProvider>
      </body>
    </html>
  );
}
