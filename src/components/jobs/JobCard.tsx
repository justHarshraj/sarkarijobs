'use client';

import React, { useState } from 'react';
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
  Share2,
  Check,
} from 'lucide-react';
import { formatDateIndian, daysUntil } from '@/lib/utils/dateParser';

interface JobCardProps {
  job: IJob;
}

export default function JobCard({ job }: JobCardProps) {
  const [copied, setCopied] = useState(false);
  const remaining = daysUntil(job.applicationEndDate);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const jobUrl = `${window.location.origin}/jobs/${job.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out ${job.title} on Sarkari Jobs Portal!`,
          url: jobUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignored
    }
  };

  return (
    <article className="job-card group bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all">
      {/* Subtle Indian tricolor accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top Header: Organization, Share Button & Badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-900 bg-blue-50/90 px-2.5 py-1 rounded-md border border-blue-100/80 min-w-0 max-w-[75%] sm:max-w-[70%]">
            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{job.organization || 'Govt of India'}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              title={copied ? 'Link Copied!' : 'Share Job'}
              aria-label="Share Job Link"
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors touch-scale"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
            <JobBadge type={job.postType} />
          </div>
        </div>

        {/* Dynamic Status Badges (Ending Soon, Recent) */}
        {(job.isEndingSoon || job.isRecent) && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {job.isEndingSoon && (
              <JobBadge isEndingSoon daysRemaining={remaining} />
            )}
            {job.isRecent && !job.isEndingSoon && (
              <JobBadge isRecent />
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 leading-snug transition-colors line-clamp-2">
          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
        </h3>

        {/* Meta Row: Category, State, Qualification */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 text-[11px] sm:text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
            {job.category}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.state || 'All India'}
          </span>
          {job.qualification && job.qualification.length > 0 && (
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium truncate max-w-[130px] sm:max-w-[160px]">
              <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{job.qualification[0]}</span>
            </span>
          )}
        </div>
      </div>

      {/* Center Highlights: Vacancies & Last Date */}
      <div className="grid grid-cols-2 gap-2 py-2.5 px-3 border-y border-slate-100 bg-slate-50/70 rounded-xl">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Vacancies
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm font-bold text-slate-900">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            <span>
              {job.totalVacancies > 0 ? job.totalVacancies.toLocaleString('en-IN') : 'Check Notice'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Last Date
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm font-bold text-slate-900">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 shrink-0" />
            <span className="truncate">
              {job.applicationEndDate ? formatDateIndian(job.applicationEndDate) : 'See Details'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <Link
          href={`/jobs/${job.slug}`}
          className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-50/90 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200/80 flex items-center justify-center gap-1.5 touch-scale group/btn min-h-[40px]"
        >
          <span>View Details & PDF</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>

        {job.applyOnlineUrl ? (
          <a
            href={job.applyOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 touch-scale min-h-[40px]"
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
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 shrink-0 touch-scale min-h-[40px]"
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
