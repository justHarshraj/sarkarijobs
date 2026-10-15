import { connection } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { IJob, DashboardStats } from '@/types';
import StatsBar from '@/components/sections/StatsBar';
import EndingSoon from '@/components/sections/EndingSoon';
import CategoryGrid from '@/components/sections/CategoryGrid';
import JobExplorer from '@/components/sections/JobExplorer';
import AdmitCardsResults from '@/components/sections/AdmitCardsResults';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react';

export default async function HomePage() {
  await connection();
  await connectDB();

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Parallel DB queries
  const [
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-lg mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Automated 24/7 Government Job Aggregator</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Find Every <span className="text-amber-400">Sarkari Naukri</span> in One Place.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Live tracked notifications from UPSC, SSC, Railways (RRB), Public Sector Banks (IBPS), Defence, and State Public Service Commissions with official PDF downloads & direct application portals.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Official Sources</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Real-time Deadline Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Dashboard */}
      <StatsBar stats={stats} />

      {/* Approaching Deadlines */}
      <EndingSoon jobs={endingSoonJobs} />

      {/* Sector / Department Categories */}
      <CategoryGrid categoryCounts={categoryCounts} />

      {/* Admit Cards & Results Showcase */}
      <AdmitCardsResults admitCards={admitCards} results={results} />

      {/* Main Filterable Jobs Explorer */}
      <JobExplorer initialJobs={latestJobs} initialTotal={totalActiveJobs} />
    </div>
  );
}
