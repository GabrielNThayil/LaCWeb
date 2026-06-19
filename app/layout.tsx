import type { Metadata } from "next";
import "./globals.css";
import { SessionWrapper } from "./session-provider";

export const metadata: Metadata = {
  title: "La Couronne Cafe Bengaluru | Patisserie, Private Space & Cafe",
  description:
    "La Couronne Patisserie and Cafe on Cunningham Road, Bengaluru with desserts, beverages, dine-in details, ordering links, and private space rental booking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}