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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-10">
      {/* Column 1: Admit Cards */}
      <section id="admit-cards" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Admit Cards & Hall Tickets</h2>
              <p className="text-[11px] text-slate-500">Download call letters for upcoming exams</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {admitCards.length} Available
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {admitCards.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No admit cards released today.</p>
          ) : (
            admitCards.slice(0, 5).map((job) => (
              <div key={job.slug} className="py-3 flex items-center justify-between gap-3 group">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1 transition-colors"
                  >
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{job.organization}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{job.admitCardDate || 'Available Now'}</span>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="shrink-0 p-1.5 rounded-md bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition-colors"
                  title="Download Admit Card"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Column 2: Results */}
      <section id="results" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Exam Results & Merit Lists</h2>
              <p className="text-[11px] text-slate-500">Check official selection lists & marks</p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            {results.length} Declared
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {results.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No results declared today.</p>
          ) : (
            results.slice(0, 5).map((job) => (
              <div key={job.slug} className="py-3 flex items-center justify-between gap-3 group">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="text-xs font-bold text-slate-800 group-hover:text-purple-700 line-clamp-1 transition-colors"
                  >
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{job.organization}</span>
                    <span>•</span>
                    <span className="text-purple-700 font-semibold">{job.resultDate || 'Declared'}</span>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="shrink-0 p-1.5 rounded-md bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 transition-colors"
                  title="Check Result"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
