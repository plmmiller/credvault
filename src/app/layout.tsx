import type { Metadata } from "next";
import { Source_Sans_3, Merriweather } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HelpButton from "@/components/HelpButton";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CredVault — The Institutes Knowledge Group",
  description: "Verifiable digital credentials for Institutes designations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} bg-white text-navy-800`}>
        <SiteHeader />
        <div className="min-h-[calc(100vh-200px)]">{children}</div>
        <SiteFooter />
        <HelpButton />
      </body>
    </html>
  );
}
