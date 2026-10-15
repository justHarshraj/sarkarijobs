import { connection } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { IJob, DashboardStats } from '@/types';
import StatsBar from '@/components/sections/StatsBar';
import EndingSoon from '@/components/sections/EndingSoon';
import CategoryGrid from '@/components/sections/CategoryGrid';
import JobExplorer from '@/components/sections/JobExplorer';
import AdmitCardsResults from '@/components/sections/AdmitCardsResults';
import ScrollReveal from '@/components/common/ScrollReveal';
import { Bell, Sparkles, ShieldCheck, ArrowDown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { sanitizeText } from '@/lib/utils/sanitizer';
import SeoDirectory, { HOME_FAQS } from '@/components/sections/SeoDirectory';
import JsonLd from '@/components/common/JsonLd';
import { generateFAQSchema } from '@/lib/seo/schema';

export default async function HomePage() {
  await connection();

  let totalActiveJobs = 0;
  let endingSoonCount = 0;
  let resultsCount = 0;
  let admitCardCount = 0;
  let latestJobsDocs: unknown[] = [];
  let endingSoonDocs: unknown[] = [];
  let admitCardsDocs: unknown[] = [];
  let resultsDocs: unknown[] = [];
  let categoryCountsAgg: { _id: string; count: number }[] = [];
  let isDbConnected = true;

  try {
    await connectDB();
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Parallel DB queries
    [
      totalActiveJobs,
      endingSoonCount,
      resultsCount,
      admitCardCount,
      latestJobsDocs,
      endingSoonDocs,
      admitCardsDocs,
      resultsDocs,
      categoryCountsAgg,
    ] = await Promise.all([
      Job.countDocuments({ isActive: true, postType: 'Latest Job' }),
      Job.countDocuments({
        isActive: true,
        applicationEndDate: { $gte: now, $lte: sevenDaysLater },
      }),
      Job.countDocuments({ postType: 'Result' }),
      Job.countDocuments({ postType: 'Admit Card' }),
      Job.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Job.find({
        isActive: true,
        applicationEndDate: { $gte: now, $lte: sevenDaysLater },
      })
        .sort({ applicationEndDate: 1 })
        .limit(6)
        .lean(),
      Job.find({ postType: 'Admit Card' })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Job.find({ postType: 'Result' })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    // If fewer than 50 active jobs on initialization, trigger background bulk scrape asynchronously
    if (totalActiveJobs < 50 && process.env.NEXT_PHASE !== 'phase-production-build') {
      import('@/lib/scraper/scheduler').then(({ triggerScrape }) => {
        triggerScrape('low-pool-initialization', 300).catch((err) =>
          console.error('[HomePage] Background startup scrape notice:', sanitizeText(err))
        );
      });
    }
  } catch (dbErr) {
    isDbConnected = false;
    console.error('[HomePage] Database query fallback (rendering safe UI):', sanitizeText(dbErr));
  }


  const stats: DashboardStats = {
    totalActiveJobs,
    endingSoonCount,
    resultsCount,
    admitCardCount,
    newJobsToday: 0,
    totalJobsScraped: totalActiveJobs + resultsCount + admitCardCount,
  };

  const categoryCounts: Record<string, number> = {};
  categoryCountsAgg.forEach((item: { _id: string; count: number }) => {
    if (item._id) {
      categoryCounts[item._id] = item.count;
    }
  });

  const latestJobs = JSON.parse(JSON.stringify(latestJobsDocs)) as IJob[];
  const endingSoonJobs = JSON.parse(JSON.stringify(endingSoonDocs)) as IJob[];
  const admitCards = JSON.parse(JSON.stringify(admitCardsDocs)) as IJob[];
  const results = JSON.parse(JSON.stringify(resultsDocs)) as IJob[];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
      {!isDbConnected && process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Development Mode Notice</p>
            <p className="text-amber-800 text-xs leading-relaxed">
              Database connection is currently establishing. Check your local database connection.
            </p>
          </div>
        </div>
      )}


      {/* Hero Banner with Smooth Floating Accents */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl mb-6 animate-fade-in border border-blue-900/40">
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Automated 24/7 Government Job Portal</span>
          </div>


          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Find Every <span className="text-amber-400">Sarkari Naukri</span> in One Place.
          </h1>

          <p className="mt-3 text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Live tracked notifications from UPSC, SSC, Railways (RRB), Public Sector Banks (IBPS), Defence, and State Public Service Commissions with official PDF downloads & direct application portals.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Official Sources</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Real-time Deadline Alerts</span>
            </div>
            <Link
              href="/#latest-jobs"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs touch-scale"
            >
              <span>Explore Vacancies</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics Dashboard */}
      <ScrollReveal delayMs={100}>
        <StatsBar stats={stats} />
      </ScrollReveal>

      {/* Approaching Deadlines */}
      <ScrollReveal delayMs={150}>
        <EndingSoon jobs={endingSoonJobs} />
      </ScrollReveal>

      {/* Sector / Department Categories */}
      <ScrollReveal delayMs={200}>
        <CategoryGrid categoryCounts={categoryCounts} />
      </ScrollReveal>

      {/* Admit Cards & Results Showcase */}
      <ScrollReveal delayMs={250}>
        <AdmitCardsResults admitCards={admitCards} results={results} />
      </ScrollReveal>

      {/* Main Filterable Jobs Explorer */}
      <ScrollReveal delayMs={300}>
        <JobExplorer initialJobs={latestJobs} initialTotal={totalActiveJobs} />
      </ScrollReveal>

      {/* SEO Knowledge Base & Trending Search Matrix */}
      <JsonLd data={generateFAQSchema(HOME_FAQS)} />
      <ScrollReveal delayMs={350}>
        <SeoDirectory />
      </ScrollReveal>
    </div>
  );
}
