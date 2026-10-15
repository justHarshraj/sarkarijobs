'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { IJob } from '@/types';
import JobCard from '../jobs/JobCard';
import JobFilters from '../jobs/JobFilters';
import { Search, SlidersHorizontal, FileQuestion, X } from 'lucide-react';

interface JobExplorerProps {
  initialJobs: IJob[];
  initialTotal: number;
}

const QUICK_FILTER_PILLS = [
  { label: 'All Jobs', key: 'category', value: 'All' },
  { label: 'Railway', key: 'category', value: 'Railway' },
  { label: 'SSC', key: 'category', value: 'SSC' },
  { label: 'UPSC', key: 'category', value: 'UPSC' },
  { label: 'Banking', key: 'category', value: 'Banking' },
  { label: 'Defence', key: 'category', value: 'Defence' },
  { label: 'Police', key: 'category', value: 'Police' },
  { label: '10th Pass', key: 'qualification', value: '10th Pass' },
  { label: '12th Pass', key: 'qualification', value: '12th Pass' },
  { label: 'Graduate', key: 'qualification', value: 'Graduate' },
];

export default function JobExplorer({ initialJobs, initialTotal }: JobExplorerProps) {
  const [jobs, setJobs] = useState<IJob[]>(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [category, setCategory] = useState('All');
  const [state, setState] = useState('All');
  const [qualification, setQualification] = useState('All');
  const [postType, setPostType] = useState('All');
  const [sort, setSort] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile filters drawer open/close
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const isFirstRender = useRef(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (category !== 'All') params.set('category', category);
      if (state !== 'All') params.set('state', state);
      if (qualification !== 'All') params.set('qualification', qualification);
      if (postType !== 'All') params.set('postType', postType);
      if (sort !== 'latest') params.set('sort', sort);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        if (data.pagination) {
          setTotal(data.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch filtered jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [category, state, qualification, postType, sort, page, searchTerm]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    if (key === 'category') setCategory(value);
    if (key === 'state') setState(value);
    if (key === 'qualification') setQualification(value);
    if (key === 'postType') setPostType(value);
    if (key === 'sort') setSort(value);
  };

  const handleReset = () => {
    setCategory('All');
    setState('All');
    setQualification('All');
    setPostType('All');
    setSort('latest');
    setSearchTerm('');
    setPage(1);
  };

  const activeFilterCount =
    (category !== 'All' ? 1 : 0) +
    (state !== 'All' ? 1 : 0) +
    (qualification !== 'All' ? 1 : 0) +
    (postType !== 'All' ? 1 : 0) +
    (sort !== 'latest' ? 1 : 0);

  const totalPages = Math.ceil(total / 12);

  return (
    <div id="latest-jobs" className="my-8 scroll-mt-20">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Latest Sarkari Naukri & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing {jobs.length} of {total} verified government vacancies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 touch-scale shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Search in List */}
          <div className="relative flex-1 sm:w-64 max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search in list..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-7 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Quick-Filter Pill Chips for Mobile & Desktop */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {QUICK_FILTER_PILLS.map((pill) => {
          const isSelected =
            pill.key === 'category'
              ? category === pill.value
              : qualification === pill.value;

          return (
            <button
              key={pill.label}
              onClick={() => {
                if (pill.key === 'category') {
                  setCategory(pill.value);
                } else {
                  setQualification(pill.value);
                }
                setPage(1);
              }}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all touch-scale border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Sidebar + Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <JobFilters
            selectedCategory={category}
            selectedState={state}
            selectedQualification={qualification}
            selectedPostType={postType}
            selectedSort={sort}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Slide-down Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl animate-fade-in-up border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  Filter & Sort Jobs
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 touch-scale"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <JobFilters
                selectedCategory={category}
                selectedState={state}
                selectedQualification={qualification}
                selectedPostType={postType}
                selectedSort={sort}
                onFilterChange={(key, val) => {
                  handleFilterChange(key, val);
                }}
                onReset={handleReset}
              />

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 touch-scale"
                >
                  Apply Filters ({total} Jobs)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Jobs Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            /* Shimmer Skeleton Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-4/5" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-9 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center p-6 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No vacancies found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Try selecting a different qualification or department, or reset your search.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-scale"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job._id || job.slug} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      document.getElementById('latest-jobs')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed touch-scale shadow-2xs"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-600 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      document.getElementById('latest-jobs')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed touch-scale shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
