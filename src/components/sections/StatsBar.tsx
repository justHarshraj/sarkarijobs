'use client';

import React from 'react';
import Link from 'next/link';
import type { DashboardStats } from '@/types';
import { Briefcase, AlertTriangle, Award, CreditCard, ArrowUpRight } from 'lucide-react';

interface StatsBarProps {
  stats: DashboardStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const cards = [
    {
      label: 'Active Govt Jobs',
      value: stats.totalActiveJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/90',
      borderColor: 'border-blue-100',
      href: '/#latest-jobs',
    },
    {
      label: 'Ending This Week',
      value: stats.endingSoonCount,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/90',
      borderColor: 'border-rose-100',
      isPulse: stats.endingSoonCount > 0,
      href: '/#ending-soon',
    },
    {
      label: 'Admit Cards Live',
      value: stats.admitCardCount,
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/90',
      borderColor: 'border-emerald-100',
      href: '/#admit-cards',
    },
    {
      label: 'Exam Results Out',
      value: stats.resultsCount,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/90',
      borderColor: 'border-purple-100',
      href: '/#results',
    },
  ];

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 72;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 my-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.label}
            href={c.href}
            onClick={(e) => handleCardClick(e, c.href)}
            className={`group bg-white rounded-2xl border ${c.borderColor} p-3 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-between gap-2.5 touch-scale relative overflow-hidden`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${c.bgColor} ${c.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  c.isPulse ? 'animate-pulse' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                  {c.value.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-500 truncate mt-0.5">
                  {c.label}
                </div>
              </div>
            </div>

            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 hidden sm:block" />
          </Link>
        );
      })}
    </div>
  );
}
