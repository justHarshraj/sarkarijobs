import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import BackToTop from '@/components/common/BackToTop';
import JsonLd from '@/components/common/JsonLd';
import { getBaseUrl, generateWebSiteSchema, generateOrganizationSchema } from '@/lib/seo/schema';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sarkari Jobs 2026 - Sarkari Result, Latest Govt Jobs, Admit Card & Online Form',
    template: '%s | Sarkari Jobs',
  },
  description:
    'India\'s #1 automated government job aggregator. Get instant notifications for UPSC, SSC, Railway RRB, Banking IBPS, Police, Defence, State PSC recruitment, official PDF downloads, answer keys & Sarkari Result.',
  keywords: [
    'Sarkari Jobs',
    'Sarkari Result',
    'Sarkari Naukri',
    'Govt Jobs 2026',
    'Free Job Alert',
    'Rojgar Result',
    'Sarkari Exam',
    'Railway RRB NTPC Group D',
    'SSC CGL 2026',
    'SSC CHSL',
    'SSC GD Constable',
    'UPSC Civil Services Prelims',
    'Banking IBPS PO Clerk SBI',
    'Police Bharti 2026',
    'Defence Indian Army Agniveer',
    '10th Pass Govt Jobs',
    '12th Pass Sarkari Naukri',
    'Graduate Govt Jobs',
    'State PSC Recruitment UPPSC BPSC',
    'Admit Card Download',
    'Answer Key 2026',
    'Latest Online Form',
    'Government Vacancy Alert',
  ],
  authors: [{ name: 'Sarkari Jobs India', url: baseUrl }],
  creator: 'Sarkari Jobs',
  publisher: 'Sarkari Jobs Aggregator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sarkari Jobs 2026 - Sarkari Result, Latest Govt Jobs & Admit Card',
    description:
      'Explore live verified government job recruitments across UPSC, SSC, RRB, Banking, Police, and Defence with 1-click official PDF downloads and application portals.',
    url: baseUrl,
    siteName: 'Sarkari Jobs',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarkari Jobs 2026 - Sarkari Result & Latest Govt Jobs',
    description:
      'Real-time alerts for latest government jobs, Sarkari Result, Admit Cards, and official PDF notifications.',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-token',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || 'bing-verification-token',
    },
  },
  category: 'Recruitment & Employment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd data={websiteSchema} />
        <JsonLd data={organizationSchema} />
      </head>
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
