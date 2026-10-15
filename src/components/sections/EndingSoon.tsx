import React from 'react';
import Link from 'next/link';
import type { IJob } from '@/types';
import JobCard from '../jobs/JobCard';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface EndingSoonProps {
  jobs: IJob[];
}

export default function EndingSoon({ jobs }: EndingSoonProps) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <section id="ending-soon" className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Closing Soon (Next 7 Days)
            </h2>
            <p className="text-xs text-slate-500">
              Apply immediately before the application portals close
            </p>
          </div>
        </div>

        <Link
          href="/#latest-jobs"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.slice(0, 3).map((job) => (
          <JobCard key={job._id || job.slug} job={job} />
        ))}
      </div>
    </section>
  );
}
