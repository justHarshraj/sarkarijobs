'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants/categories';
import { INDIAN_STATES } from '@/lib/constants/states';
import type { PostType, Qualification } from '@/types';

interface JobFiltersProps {
  selectedCategory: string;
  selectedState: string;
  selectedQualification: string;
  selectedPostType: string;
  selectedSort: string;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function JobFilters({
  selectedCategory,
  selectedState,
  selectedQualification,
  selectedPostType,
  selectedSort,
  onFilterChange,
  onReset,
}: JobFiltersProps) {
  const qualifications: Qualification[] = [
    '10th Pass',
    '12th Pass',
    'Graduate',
    'Post Graduate',
    'ITI',
    'Diploma',
    'Engineering',
    'Medical',
    'B.Ed',
  ];

  const postTypes: PostType[] = [
    'Latest Job',
    'Admit Card',
    'Result',
    'Answer Key',
    'Admission',
  ];

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedState !== 'All' ||
    selectedQualification !== 'All' ||
    selectedPostType !== 'All' ||
    selectedSort !== 'latest';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Jobs</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          aria-label="Sort By"
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="latest">Latest Published</option>
          <option value="ending-soon">Closing Soonest</option>
          <option value="vacancies">Highest Vacancies</option>
        </select>
      </div>

      {/* Post Type */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onFilterChange('postType', 'All')}
            className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
              selectedPostType === 'All'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {postTypes.map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange('postType', type)}
              className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                selectedPostType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onFilterChange('category', e.target.value)}
          aria-label="Category"
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* State */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Location / State
        </label>
        <select
          value={selectedState}
          onChange={(e) => onFilterChange('state', e.target.value)}
          aria-label="Location / State"
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">All India & States</option>
          {INDIAN_STATES.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Qualification */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Qualification
        </label>
        <select
          value={selectedQualification}
          onChange={(e) => onFilterChange('qualification', e.target.value)}
          aria-label="Qualification"
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">Any Qualification</option>
          {qualifications.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
