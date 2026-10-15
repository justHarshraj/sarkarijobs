import React from 'react';
import Link from 'next/link';
import {
  Train,
  Landmark,
  Building2,
  Award,
  Shield,
  ShieldAlert,
  GraduationCap,
  MapPin,
  Wrench,
  HeartPulse,
  BookOpen,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/constants/categories';

const ICON_MAP: Record<string, React.ElementType> = {
  Train,
  Landmark,
  Building2,
  Award,
  Shield,
  ShieldAlert,
  GraduationCap,
  MapPin,
  Wrench,
  HeartPulse,
  BookOpen,
  Briefcase,
};

interface CategoryGridProps {
  categoryCounts?: Record<string, number>;
}

export default function CategoryGrid({ categoryCounts = {} }: CategoryGridProps) {
  return (
    <section id="categories" className="my-10 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Browse by Department & Sector
          </h2>
          <p className="text-xs text-slate-500">
            Target government recruitments by industry, eligibility & cadre
          </p>
        </div>

        <Link
          href="/#latest-jobs"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0"
        >
          <span>All Jobs</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {CATEGORIES.filter((c) => c.name !== 'Other').map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Briefcase;
          const count = categoryCounts[cat.name] || 0;

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 hover:border-blue-400 hover:shadow-md hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-2 group touch-scale shadow-2xs relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors shrink-0">
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 truncate w-full">
                {cat.name}
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-blue-100/70 group-hover:text-blue-800 px-2.5 py-0.5 rounded-full transition-colors">
                {count > 0 ? `${count} Open` : 'Explore'}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
