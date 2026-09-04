import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { getAllBrands } from "@/lib/products-data";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Royal Luxury Watches | Fine Timepieces",
    template: "%s | Royal Luxury Watches",
  },
  description:
    "A curated house of fine timepieces across our in-house collections. Inspected craftsmanship, delivered worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brands = getAllBrands().map(({ name, slug }) => ({ name, slug }));

  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="bg-obsidian text-parchment font-body antialiased">
        <Header brands={brands} />
        {children}
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
