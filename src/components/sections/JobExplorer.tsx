'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { IJob } from '@/types';
import JobCard from '../jobs/JobCard';
import JobFilters from '../jobs/JobFilters';
import { Search, Loader2, FileQuestion } from 'lucide-react';

interface JobExplorerProps {
  initialJobs: IJob[];
  initialTotal: number;
}

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

  const totalPages = Math.ceil(total / 12);

  return (
    <div id="latest-jobs" className="my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Latest Sarkari Naukri & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing {jobs.length} of {total} verified government vacancies
          </p>
        </div>

        {/* In-page filter search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Quick search jobs in list..."
            className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
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

        {/* Right Jobs Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading government job notices...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No jobs match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Try selecting a different qualification or state, or reset your active filters.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
