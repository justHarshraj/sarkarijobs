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
    <section id="categories" className="my-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Browse by Department & Sector
          </h2>
          <p className="text-xs text-slate-500">
            Find government recruitments targeted to your qualification and preference
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CATEGORIES.filter((c) => c.name !== 'Other').map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Briefcase;
          const count = categoryCounts[cat.name] || 0;

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 truncate w-full">
                {cat.name}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {count > 0 ? `${count} Open` : 'View'}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
