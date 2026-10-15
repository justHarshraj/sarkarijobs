'use client';

import React from 'react';
import type { DashboardStats } from '@/types';
import { Briefcase, AlertTriangle, Award, CreditCard } from 'lucide-react';

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
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Ending This Week',
      value: stats.endingSoonCount,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      isPulse: stats.endingSoonCount > 0,
    },
    {
      label: 'Exam Results Out',
      value: stats.resultsCount,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      label: 'Admit Cards Live',
      value: stats.admitCardCount,
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`bg-white rounded-xl border ${c.borderColor} p-4 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow`}
          >
            <div
              className={`w-11 h-11 rounded-xl ${c.bgColor} ${c.color} flex items-center justify-center shrink-0 ${
                c.isPulse ? 'animate-pulse' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {c.value.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-semibold text-slate-500">{c.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
