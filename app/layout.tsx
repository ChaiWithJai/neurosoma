import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroSoma | MedGemma-Powered Pain Education + Breathwork",
  description:
    "Understand your symptoms with AI-powered education from MedGemma, then get a personalized breathwork protocol. Built for the MedGemma Impact Challenge.",
  keywords: [
    "MedGemma",
    "chronic pain",
    "breathwork",
    "patient education",
    "HAI-DEF",
    "health AI",
  ],
  authors: [{ name: "Chai with Jai" }],
  openGraph: {
    title: "NeuroSoma | AI-Powered Pain Education + Breathwork",
    description:
      "Understand your symptoms, prepare for doctor visits, and learn breathing techniques for pain management.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
