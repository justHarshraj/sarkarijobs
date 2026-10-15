import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ScrollProgressBar from "@/components/common/ScrollProgressBar";
import BackToTop from "@/components/common/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarkari Jobs - Automated Indian Govt Job Scraper & Aggregator",
  description:
    "Find all latest Sarkari Naukri, UPSC, SSC, Railway RRB, Banking IBPS, Police, and Defence notifications, official PDF downloads, admit cards, and results.",
  keywords: [
    "Sarkari Jobs",
    "Sarkari Naukri",
    "Sarkari Result",
    "Govt Jobs 2026",
    "Railway RRB",
    "SSC CGL",
    "UPSC Prelims",
    "Banking IBPS",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <ScrollProgressBar />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <BackToTop />
      </body>
    </html>
  );
}
