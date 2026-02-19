import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "250 Acts of Service",
  description:
    "Track and celebrate acts of service on both sides of the veil. Together we can reach 250!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-gradient-to-b from-stone-50 via-slate-50 to-stone-100 min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
