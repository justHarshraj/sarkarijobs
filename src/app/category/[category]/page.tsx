import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { CATEGORIES } from '@/lib/constants/categories';
import type { IJob } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import { ArrowLeft, Briefcase, ChevronRight, Layers } from 'lucide-react';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

  if (!cat) {
    return { title: 'Category | Sarkari Jobs' };
  }

  return {
    title: `${cat.name} Jobs 2026 - Latest Recruitment Notifications | Sarkari Jobs`,
    description: `Browse latest ${cat.name} vacancies, exam dates, syllabus, and online forms. ${cat.description}.`,
  };
}

import { connection } from 'next/server';

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
  } catch (err) {
    console.error('[CategoryPage] DB error:', err);
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{catMeta.name}</span>
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

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-200">
          <span className="bg-white/15 px-3 py-1 rounded-full">{jobs.length} Active Notifications</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
