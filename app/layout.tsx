import type { Metadata } from "next";
import "./globals.css";
import { SessionWrapper } from "./session-provider";
import CookieConsent from "@/components/CookieConsent";
import MobileNav from "@/components/MobileNav";
import AISommelier from "@/components/AISommelier";
import LiveRail from "@/components/LiveRail";

export const metadata: Metadata = {
  title: "La Couronne Cafe Bengaluru | Patisserie, Private Space & Cafe",
  description:
    "La Couronne Patisserie and Cafe on Cunningham Road, Bengaluru with desserts, beverages, dine-in details, ordering links, and private space rental booking.",
  metadataBase: new URL("https://lacouronneindia.com"),
  openGraph: {
    title: "La Couronne Cafe Bengaluru",
    description: "A warm luxury patisserie and cafe in Vasanth Nagar for French-style desserts, crafted beverages, brunch plates, and intimate private gatherings.",
    url: "https://lacouronneindia.com",
    siteName: "La Couronne Cafe",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Couronne Cafe Bengaluru",
    description: "Patisserie and cafe on Cunningham Road, Bengaluru",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <LiveRail />
        <SessionWrapper>
          <MobileNav />
          {children}
        </SessionWrapper>
        <CookieConsent />
        <AISommelier />
      </body>
    </html>
  );
}