import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { IJob } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import { Search, ArrowLeft, ChevronRight, FileQuestion } from 'lucide-react';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search Results for "${q}" | Sarkari Jobs` : 'Search Government Jobs | Sarkari Jobs',
    description: `Search results for government job recruitments matching ${q || 'latest notifications'}.`,
  };
}

import { connection } from 'next/server';

export default async function SearchPage({ searchParams }: Props) {
  await connection();
  const { q = '' } = await searchParams;
  const cleanQuery = q.trim();

  let jobs: IJob[] = [];
  if (cleanQuery) {
    try {
      await connectDB();
      const jobsDocs = await Job.find({
        $or: [
          { title: { $regex: cleanQuery, $options: 'i' } },
          { organization: { $regex: cleanQuery, $options: 'i' } },
          { shortDescription: { $regex: cleanQuery, $options: 'i' } },
          { category: { $regex: cleanQuery, $options: 'i' } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      jobs = JSON.parse(JSON.stringify(jobsDocs)) as IJob[];
    } catch (err) {
      console.error('[SearchPage] DB search query error:', err);
    }
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
        <span className="text-slate-800 font-semibold">Search</span>
        {cleanQuery && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 truncate max-w-xs">&quot;{cleanQuery}&quot;</span>
          </>
        )}
      </nav>

      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Search Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            {cleanQuery ? (
              <>
                Found <span className="font-bold text-slate-900">{jobs.length}</span> postings matching{' '}
                <span className="font-bold text-blue-700">&quot;{cleanQuery}&quot;</span>
              </>
            ) : (
              'Enter a job title, exam name, board, or organization above'
            )}
          </p>

          <form action="/search" method="GET" className="relative flex items-center">
            <input
              type="text"
              name="q"
              defaultValue={cleanQuery}
              placeholder="Search RRB, UPSC, SSC, Bank, Police, Teacher..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            We couldn&apos;t find any active vacancies matching &quot;{cleanQuery}&quot;. Try searching for general keywords like &quot;Railway&quot;, &quot;Police&quot;, &quot;Graduate&quot;, or &quot;SSC&quot;.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-block"
          >
            Back to Homepage
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
