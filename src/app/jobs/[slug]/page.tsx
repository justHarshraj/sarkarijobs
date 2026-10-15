import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { IJob } from '@/types';
import {
  Calendar,
  Users,
  CreditCard,
  UserCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { formatDateIndian, daysUntil } from '@/lib/utils/dateParser';
import JobCard from '@/components/jobs/JobCard';
import JsonLd from '@/components/common/JsonLd';
import {
  getBaseUrl,
  generateJobPostingSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  try {
    await connectDB();
    const { slug } = await params;
    const job = await Job.findOne({ slug }).lean();

    if (!job) {
      return {
        title: 'Job Not Found | Sarkari Jobs',
        robots: { index: false, follow: true },
      };
    }

    const vacancyText =
      job.totalVacancies > 0
        ? ` (${job.totalVacancies.toLocaleString('en-IN')} Posts)`
        : '';
    const lastDateText = job.applicationEndDate
      ? ` | Last Date: ${formatDateIndian(job.applicationEndDate)}`
      : '';

    const seoTitle =
      job.metaTitle ||
      `${job.title} 2026: Apply Online${vacancyText}${lastDateText}`;

    const seoDescription =
      job.metaDescription ||
      `${job.title} Recruitment 2026 announced by ${job.organization}. Total Vacancies: ${
        job.totalVacancies > 0 ? job.totalVacancies : 'Multiple'
      }. Check eligibility, age limit, application fee, last date to apply online, and download official notification PDF.`;

    const jobUrl = `${baseUrl}/jobs/${slug}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        job.title,
        `${job.organization} Recruitment 2026`,
        `${job.category} Jobs 2026`,
        `${job.title} Notification PDF`,
        `${job.title} Apply Online Form`,
        `${job.title} Eligibility Criteria`,
        `${job.title} Last Date`,
        `${job.title} Salary Syllabus`,
        'Sarkari Result 2026',
        'Govt Jobs India',
      ],
      alternates: {
        canonical: jobUrl,
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: jobUrl,
        type: 'article',
        publishedTime: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
        modifiedTime: job.updatedAt ? new Date(job.updatedAt).toISOString() : undefined,
        section: job.category,
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
      },
    };
  } catch {
    return {
      title: 'Job Details | Sarkari Jobs',
    };
  }
}

export default async function JobDetailPage({ params }: Props) {
  await connection();
  const { slug } = await params;

  let jobDoc: unknown = null;
  try {
    await connectDB();
    jobDoc = await Job.findOne({ slug }).lean();
  } catch {
    console.error('[JobDetailPage] DB query error');
    notFound();
  }

  if (!jobDoc) {
    notFound();
  }

  const job = JSON.parse(JSON.stringify(jobDoc)) as IJob;
  const remainingDays = daysUntil(job.applicationEndDate);

  // Fetch related jobs in same category
  const relatedJobsDocs = await Job.find({
    category: job.category,
    slug: { $ne: job.slug },
    isActive: true,
  })
    .limit(3)
    .lean();
  const relatedJobs = JSON.parse(JSON.stringify(relatedJobsDocs)) as IJob[];

  // SEO Schemas
  const jobPostingSchema = generateJobPostingSchema(job);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: `${job.category} Jobs`, url: `/category/${job.category.toLowerCase()}` },
    { name: job.title, url: `/jobs/${job.slug}` },
  ]);

  const faqs = [
    {
      question: `What is the last date to apply online for ${job.title}?`,
      answer: job.applicationEndDate
        ? `The last date to submit the online application for ${job.title} is ${formatDateIndian(job.applicationEndDate)}. Candidates are advised to apply well before the deadline to avoid server rush.`
        : `The closing date for ${job.title} is as announced in the official notification. Please verify the official PDF.`,
    },
    {
      question: `How many vacancies are available in ${job.title} recruitment?`,
      answer:
        job.totalVacancies > 0
          ? `There are a total of ${job.totalVacancies.toLocaleString('en-IN')} vacancies released for ${job.title} across various categories.`
          : `The exact number of vacancies for ${job.title} is detailed in the recruitment notice. Check the vacancy breakdown table.`,
    },
    {
      question: `What is the educational eligibility criteria for ${job.title}?`,
      answer:
        job.qualification && job.qualification.length > 0
          ? `Candidates possessing ${job.qualification.join(', ')} from a recognized Board or University in India are eligible to apply.`
          : `Candidates with educational qualifications from recognized institutions as specified in the recruitment rules can apply.`,
    },
    {
      question: `What is the application fee for ${job.title}?`,
      answer: `Application fee for General/OBC/EWS is ${job.feeGeneral !== null ? `₹${job.feeGeneral}/-` : 'as per rules'}, and for SC/ST candidates is ${job.feeSCST !== null ? `₹${job.feeSCST}/-` : 'Exempted / Nil'}. Payment can be made online via Debit Card, Credit Card, UPI, or Net Banking.`,
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* Search Engine Rich Snippet Schemas */}
      <JsonLd data={jobPostingSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/category/${job.category.toLowerCase()}`} className="hover:text-blue-600 font-medium">
            {job.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{job.title}</span>
        </nav>

        {/* Main Job Hero Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              {job.organization}
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              {job.category}
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {job.state || 'All India'}
            </span>
            {remainingDays !== null && remainingDays <= 7 && remainingDays >= 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                {remainingDays} Days Left to Apply
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
            {job.title}
          </h1>

          {job.shortDescription && (
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {job.shortDescription}
            </p>
          )}

          {/* Action CTAs: Apply Now & Download PDF */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
            {job.applyOnlineUrl ? (
              <a
                href={job.applyOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all touch-scale"
              >
                <span>Apply Online Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}

            {job.notificationPdfUrl ? (
              <a
                href={job.notificationPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all touch-scale"
              >
                <FileText className="w-4 h-4" />
                <span>Download Official PDF</span>
              </a>
            ) : null}

            {job.officialWebsiteUrl ? (
              <a
                href={job.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors touch-scale"
              >
                <span>Official Website</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Grid: Important Dates & Application Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Important Dates Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2>Important Dates</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Application Begins:</span>
                <span className="font-bold text-slate-800">
                  {job.applicationStartDate ? formatDateIndian(job.applicationStartDate) : 'Check Notice'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Last Date to Apply:</span>
                <span className="font-bold text-rose-600">
                  {job.applicationEndDate ? formatDateIndian(job.applicationEndDate) : 'See Details'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Pay Exam Fee Last Date:</span>
                <span className="font-bold text-slate-800">
                  {job.feePaymentLastDate ? formatDateIndian(job.feePaymentLastDate) : 'With Application'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Exam Date:</span>
                <span className="font-bold text-slate-800">{job.examDate || 'As per Schedule'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Admit Card Date:</span>
                <span className="font-bold text-slate-800">{job.admitCardDate || 'Before Exam'}</span>
              </div>
            </div>
          </div>

          {/* Application Fee Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2>Application Fee Details</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">General / OBC / EWS:</span>
                <span className="font-bold text-slate-800">
                  {job.feeGeneral !== null ? `₹${job.feeGeneral}/-` : 'As per rules'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">SC / ST:</span>
                <span className="font-bold text-slate-800">
                  {job.feeSCST !== null ? `₹${job.feeSCST}/-` : 'Exempted / Nil'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Female (All Category):</span>
                <span className="font-bold text-slate-800">
                  {job.feeFemale !== null ? `₹${job.feeFemale}/-` : 'Exempted / Nil'}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">Payment Modes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {job.feePaymentModes && job.feePaymentModes.length > 0 ? (
                    job.feePaymentModes.map((mode) => (
                      <span
                        key={mode}
                        className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                      >
                        {mode}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600 text-xs">Online Debit / Credit Card / UPI / Net Banking</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Age Limit Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <h2>
              Age Limit Criteria {job.ageAsOn ? `(As on ${formatDateIndian(job.ageAsOn)})` : ''}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-1">Minimum Age:</span>
              <span className="text-base font-bold text-slate-900">
                {job.ageMinimum ? `${job.ageMinimum} Years` : '18 Years'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-1">Maximum Age:</span>
              <span className="text-base font-bold text-slate-900">
                {job.ageMaximum ? `${job.ageMaximum} Years` : '35 Years'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-1">
              <span className="text-slate-500 block mb-1">Age Relaxation:</span>
              <span className="text-xs font-medium text-slate-700">
                {job.ageRelaxation || 'Age relaxation extra as per recruitment board rules.'}
              </span>
            </div>
          </div>
        </div>

        {/* Vacancy Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users className="w-4 h-4 text-blue-600" />
              <h2>Vacancy Details & Eligibility Qualification</h2>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              Total {job.totalVacancies > 0 ? job.totalVacancies.toLocaleString('en-IN') : 'Check Notice'} Posts
            </span>
          </div>

          {job.vacancyBreakdown && job.vacancyBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Post Name</th>
                    <th className="p-3 text-center">Total Post</th>
                    <th className="p-3">Eligibility Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.vacancyBreakdown.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{v.postName}</td>
                      <td className="p-3 text-center font-bold text-blue-700">
                        {v.count > 0 ? v.count.toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="p-3 text-slate-600">{v.eligibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Candidates holding qualification ({job.qualification?.join(', ') || 'Degree'}) from a recognized institution are eligible.
              </p>
              <p>
                Please download the official notification PDF below for category-wise (UR/OBC/EWS/SC/ST) reservation details.
              </p>
            </div>
          )}
        </div>

        {/* Important Links Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <h2>Official Useful Links & PDF Download</h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {job.applyOnlineUrl && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="font-bold text-slate-800">Apply Online (Registration & Login)</span>
                <a
                  href={job.applyOnlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Click Here</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {job.notificationPdfUrl && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="font-bold text-slate-800">Download Detailed Notification PDF</span>
                <a
                  href={job.notificationPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            )}

            {job.additionalLinks &&
              job.additionalLinks.map((link, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-700">{link.label}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              ))}

            {job.officialWebsiteUrl && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="font-medium text-slate-700">Official Organization Website</span>
                <a
                  href={job.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* How to Apply Guide */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8 text-xs text-slate-700">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Step-by-Step Instructions to Fill Application Form</span>
          </h2>
          <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
            <li>Read the official notification PDF thoroughly before filling out the application form.</li>
            <li>Ensure all required documents (Handwriting sample, Photo, Signature, ID Proof, and Educational Certificates) are scanned in the prescribed size and format.</li>
            <li>Visit the official application portal using the &quot;Apply Online&quot; link above.</li>
            <li>Fill in all mandatory details carefully: Candidate Name, Father&apos;s Name, Date of Birth, and Mobile Number.</li>
            <li>Preview and verify all details in the application preview window before final submission.</li>
            <li>Pay the requisite application fee via Debit Card, Credit Card, UPI, or Net Banking.</li>
            <li>Take a final printout of the submitted application form for future reference.</li>
          </ol>
        </div>

        {/* Frequently Asked Questions (FAQ) Section - Google Rich Snippets */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h2>Frequently Asked Questions ({job.organization} Recruitment)</h2>
          </div>

          <div className="space-y-4 text-xs">
            {faqs.map((faq, idx) => (
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

        {/* Related Jobs Section */}
        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              More {job.category} Recruitments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedJobs.map((r) => (
                <JobCard key={r.slug} job={r} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom Action Bar */}
        {(job.applyOnlineUrl || job.notificationPdfUrl) && (
          <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 shadow-lg flex items-center gap-2">
            {job.applyOnlineUrl && (
              <a
                href={job.applyOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs touch-scale"
              >
                <span>Apply Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {job.notificationPdfUrl && (
              <a
                href={job.notificationPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-slate-200 touch-scale"
              >
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>PDF</span>
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
