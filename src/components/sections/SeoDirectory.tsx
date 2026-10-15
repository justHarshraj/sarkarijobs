import React from 'react';
import Link from 'next/link';
import { Sparkles, GraduationCap, MapPin, Building2, HelpCircle } from 'lucide-react';

interface SeoFaq {
  question: string;
  answer: string;
}

export const HOME_FAQS: SeoFaq[] = [
  {
    question: 'What is Sarkari Jobs and how does it deliver real-time notifications?',
    answer:
      'Sarkari Jobs is an automated 24/7 government recruitment aggregator that continuously scans official central and state government portals (including UPSC, SSC, Railway RRB, IBPS, Defence, and State PSCs) to deliver instant job alerts, authentic notification PDFs, and direct application links without middleman redirects.',
  },
  {
    question: 'How do I check the latest Sarkari Result and Admit Card 2026?',
    answer:
      'You can check live exam results and download admit cards directly from our dedicated Admit Cards & Results showcase on the homepage, or use our instant search bar to find your exam board.',
  },
  {
    question: 'Can 10th Pass, 12th Pass, and College Graduates apply for Sarkari Naukri?',
    answer:
      'Yes, hundreds of central and state government vacancies are announced specifically for 10th pass (SSC MTS, Railway Group D, Post Office GDS), 12th pass (SSC CHSL, Police Constable, Railway Clerk), and Graduates (UPSC Civil Services, SSC CGL, Bank PO). Use our category filters to find jobs tailored to your qualification.',
  },
  {
    question: 'Are the notification PDFs and online application links official?',
    answer:
      '100% yes. Every notification PDF is sourced directly from verified government domains (.gov.in, .nic.in, or autonomous PSU portals), ensuring complete authenticity and zero misleading information.',
  },
  {
    question: 'What should I do if an application deadline is ending soon?',
    answer:
      'Check our "Approaching Deadlines" alert section. Government application servers frequently experience heavy traffic in the final 48 hours, so candidates are strongly urged to complete registration and pay application fees well before the closing date.',
  },
];

export default function SeoDirectory() {
  const popularSearches = [
    { label: 'Railway RRB NTPC', href: '/category/railway' },
    { label: 'Railway Group D 2026', href: '/category/railway' },
    { label: 'SSC CGL 2026 Notification', href: '/category/ssc' },
    { label: 'SSC CHSL 10+2 Form', href: '/category/ssc' },
    { label: 'SSC GD Constable Bharti', href: '/category/ssc' },
    { label: 'UPSC Civil Services IAS/IPS', href: '/category/upsc' },
    { label: 'UPSC NDA & CDS Exam', href: '/category/upsc' },
    { label: 'IBPS PO & Clerk Recruitment', href: '/category/banking' },
    { label: 'SBI PO & Junior Associate', href: '/category/banking' },
    { label: 'Indian Army Agniveer Rally', href: '/category/defence' },
    { label: 'State Police Constable & SI', href: '/category/police' },
    { label: 'CTET & State Teacher Eligibility', href: '/category/teaching' },
  ];

  const qualificationLinks = [
    { label: '10th Pass Govt Jobs', href: '/search?q=10th' },
    { label: '12th Pass Sarkari Naukri', href: '/search?q=12th' },
    { label: 'ITI Pass Vacancies', href: '/search?q=ITI' },
    { label: 'Diploma Engineering Jobs', href: '/search?q=Diploma' },
    { label: 'Graduate Govt Jobs 2026', href: '/search?q=Graduate' },
    { label: 'Post Graduate Sarkari Form', href: '/search?q=Post+Graduate' },
    { label: 'B.Tech / Engineering Jobs', href: '/category/engineering' },
    { label: 'Medical & Nursing AIIMS Jobs', href: '/category/medical' },
  ];

  const topStates = [
    { label: 'Uttar Pradesh (UPPSC / UPSSSC)', href: '/search?q=Uttar+Pradesh' },
    { label: 'Bihar (BPSC / BSSC)', href: '/search?q=Bihar' },
    { label: 'Rajasthan (RPSC / RSMSSB)', href: '/search?q=Rajasthan' },
    { label: 'Madhya Pradesh (MPPSC)', href: '/search?q=Madhya+Pradesh' },
    { label: 'Delhi (DSSSB)', href: '/search?q=Delhi' },
    { label: 'Haryana (HPSC / HSSC)', href: '/search?q=Haryana' },
    { label: 'All India Central Govt Jobs', href: '/#latest-jobs' },
  ];

  return (
    <section className="mt-14 mb-8 space-y-10" aria-label="Sarkari Jobs SEO Directory and Knowledge Base">
      {/* Directory Linking Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Sarkari Naukri Quick Directory & Trending Searches
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          {/* Top Exams */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Trending Recruitment Exams</span>
            </h3>
            <ul className="space-y-2">
              {popularSearches.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>• {item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jobs by Qualification */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-sm">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Jobs by Qualification</span>
            </h3>
            <ul className="space-y-2">
              {qualificationLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>• {item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* State Govt Jobs */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>State Public Service Commissions</span>
            </h3>
            <ul className="space-y-2">
              {topStates.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>• {item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SEO FAQ Section with Google Rich Snippets match */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions (Sarkari Result & Govt Jobs Portal)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything you need to know about Indian government recruitment notifications and online applications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {HOME_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {faq.question}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
