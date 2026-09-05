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
    default: "HEYWATCHES | Time. Style. Status.",
    template: "%s | HEYWATCHES",
  },
  description:
    "Explore distinctive luxury timepieces from Rolex, Audemars Piguet, Richard Mille, Patek Philippe, Hublot, and Breitling.",
  icons: {
    icon: "/heywatches-logo.jpeg",
  },
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
