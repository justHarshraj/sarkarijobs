import React from 'react';
import Link from 'next/link';
import type { IJob } from '@/types';
import JobBadge from './JobBadge';
import {
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  FileText,
  Building,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { formatDateIndian, daysUntil } from '@/lib/utils/dateParser';

interface JobCardProps {
  job: IJob;
}

export default function JobCard({ job }: JobCardProps) {
  const remaining = daysUntil(job.applicationEndDate);

  return (
    <article className="job-card bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 flex flex-col justify-between gap-4">
      {/* Top Header: Organization & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100">
            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[240px]">{job.organization || 'Govt of India'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {job.isEndingSoon && (
              <JobBadge isEndingSoon daysRemaining={remaining} />
            )}
            {job.isRecent && !job.isEndingSoon && (
              <JobBadge isRecent />
            )}
            <JobBadge type={job.postType} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 hover:text-blue-700 leading-snug transition-colors line-clamp-2">
          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
        </h3>

        {/* Meta Row: Category, State, Qualification */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
            {job.category}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
            <MapPin className="w-3 h-3 text-slate-500" />
            {job.state || 'All India'}
          </span>
          {job.qualification && job.qualification.length > 0 && (
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium truncate max-w-[150px]">
              <GraduationCap className="w-3 h-3 text-slate-500" />
              {job.qualification[0]}
            </span>
          )}
        </div>
      </div>

      {/* Center Highlights: Vacancies & Last Date */}
      <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 bg-slate-50/50 rounded-lg px-3">
        <div>
          <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider block">
            Total Posts
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-sm font-bold text-slate-900">
            <Users className="w-4 h-4 text-blue-600" />
            <span>
              {job.totalVacancies > 0 ? job.totalVacancies.toLocaleString('en-IN') : 'Check Notice'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider block">
            Last Date
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-sm font-bold text-slate-900">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>{job.applicationEndDate ? formatDateIndian(job.applicationEndDate) : 'See Details'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/jobs/${job.slug}`}
          className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200 flex items-center justify-center gap-1.5"
        >
          <span>View Details & PDF</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {job.applyOnlineUrl ? (
          <a
            href={job.applyOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
            title="Direct Apply Online"
          >
            <span>Apply</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : job.notificationPdfUrl ? (
          <a
            href={job.notificationPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            title="Download Notification PDF"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>PDF</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
