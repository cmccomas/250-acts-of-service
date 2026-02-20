import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "250 Acts of Service — Mt. Spokane Stake",
  description:
    "The Mount Spokane Stake celebrates America 250 with 250 acts of service on each side of the veil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-ivory min-h-screen antialiased text-charcoal`}
      >
        {children}
      </body>
    </html>
  );
}
