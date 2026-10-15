import React from 'react';
import Link from 'next/link';
import type { IJob } from '@/types';
import { CreditCard, Award, ArrowUpRight } from 'lucide-react';

interface AdmitCardsResultsProps {
  admitCards: IJob[];
  results: IJob[];
}

export default function AdmitCardsResults({ admitCards, results }: AdmitCardsResultsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 my-10">
      {/* Column 1: Admit Cards */}
      <section
        id="admit-cards"
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs scroll-mt-20 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Admit Cards & Hall Tickets
                </h2>
                <p className="text-[11px] text-slate-500">Download official exam call letters</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80 shrink-0">
              {admitCards.length} Live
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {admitCards.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No admit cards released today.</p>
            ) : (
              admitCards.slice(0, 5).map((job) => (
                <div
                  key={job.slug}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="truncate max-w-[150px]">{job.organization}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold shrink-0">
                        {job.admitCardDate || 'Available Now'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="shrink-0 p-1.5 rounded-lg bg-slate-50 group-hover:bg-emerald-100/80 text-slate-400 group-hover:text-emerald-700 transition-colors touch-scale"
                    title="Download Admit Card"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Column 2: Results */}
      <section
        id="results"
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs scroll-mt-20 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Exam Results & Merit Lists
                </h2>
                <p className="text-[11px] text-slate-500">Check marks & selection lists</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100/80 shrink-0">
              {results.length} Declared
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {results.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No results declared today.</p>
            ) : (
              results.slice(0, 5).map((job) => (
                <div
                  key={job.slug}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-xs font-bold text-slate-800 group-hover:text-purple-700 line-clamp-1 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="truncate max-w-[150px]">{job.organization}</span>
                      <span>•</span>
                      <span className="text-purple-700 font-bold shrink-0">
                        {job.resultDate || 'Declared'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="shrink-0 p-1.5 rounded-lg bg-slate-50 group-hover:bg-purple-100/80 text-slate-400 group-hover:text-purple-700 transition-colors touch-scale"
                    title="Check Result"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
