import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { CATEGORIES } from '@/lib/constants/categories';
import type { IJob } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import JsonLd from '@/components/common/JsonLd';
import { ArrowLeft, Briefcase, ChevronRight, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import { getBaseUrl, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const { category: slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

  if (!cat) {
    return { title: 'Category Not Found | Sarkari Jobs', robots: { index: false, follow: true } };
  }

  const categoryUrl = `${baseUrl}/category/${cat.slug}`;
  const seoTitle = `${cat.name} Jobs 2026 - Latest Sarkari Naukri, Notification & Online Form`;
  const seoDesc = `Explore all latest ${cat.name} recruitment notifications 2026. ${cat.description}. Check eligibility criteria, exam dates, admit cards, official notification PDFs, and apply online before last date.`;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: [
      `${cat.name} jobs 2026`,
      `${cat.name} recruitment 2026`,
      `${cat.name} sarkari naukri`,
      `${cat.name} notification pdf`,
      `${cat.name} online form`,
      `${cat.name} admit card`,
      `${cat.name} exam result`,
      ...cat.keywords,
      'Sarkari Jobs',
      'Govt Jobs 2026',
    ],
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: categoryUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  await connection();
  const { category: slug } = await params;

  const catMeta = CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!catMeta) {
    notFound();
  }

  let jobs: IJob[] = [];
  try {
    await connectDB();
    const jobsDocs = await Job.find({ category: catMeta.name, isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    jobs = JSON.parse(JSON.stringify(jobsDocs)) as IJob[];
  } catch {
    console.error('[CategoryPage] DB query failed safely');
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: `${catMeta.name} Jobs`, url: `/category/${catMeta.slug}` },
  ]);

  const categoryFaqs = [
    {
      question: `How can I get the latest ${catMeta.name} job notifications?`,
      answer: `You can check live ${catMeta.name} notifications directly on this portal. We continuously track official government employment portals and update new vacancies with official PDF links and online application portals within minutes of release.`,
    },
    {
      question: `What qualifications are required for ${catMeta.name} recruitments?`,
      answer: `${catMeta.name} recruitments offer opportunities for candidates with diverse educational qualifications, ranging from 10th Pass, 12th Pass, ITI, Diploma to Bachelor's and Master's Degrees. Please inspect individual vacancy notices for detailed criteria.`,
    },
    {
      question: `How do I apply online for active ${catMeta.name} vacancies?`,
      answer: `Select your desired post from the list above, review the eligibility criteria, and click "Apply Online Now" or "Download PDF" to access the official portal without intermediary redirects.`,
    },
  ];

  const faqSchema = generateFAQSchema(categoryFaqs);

  // CollectionPage / ItemList schema
  const baseUrl = getBaseUrl();
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${catMeta.name} Government Jobs 2026`,
    description: catMeta.description,
    url: `${baseUrl}/category/${catMeta.slug}`,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 10).map((job, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: job.title,
      url: `${baseUrl}/jobs/${job.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={itemListSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">{catMeta.name} Jobs</span>
        </nav>

        {/* Category Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {catMeta.name} Jobs & Recruitments 2026
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{catMeta.description}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-200">
            <span className="bg-white/15 px-3 py-1 rounded-full">{jobs.length} Active Notifications</span>
            <span className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Official Govt Links
            </span>
          </div>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No active {catMeta.name} openings right now
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              We continuously monitor {catMeta.name} official portals. Check back soon or browse other departments.
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block"
            >
              Explore All Sarkari Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {jobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        )}

        {/* SEO FAQ Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h2>Frequently Asked Questions about {catMeta.name} Recruitment</h2>
          </div>

          <div className="space-y-4 text-xs">
            {categoryFaqs.map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-1.5 text-xs sm:text-sm">
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
