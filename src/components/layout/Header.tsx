'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Search,
  RefreshCw,
  Menu,
  X,
  CreditCard,
  Award,
  Layers,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleTriggerScraper = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setScrapeMessage('Scraper running...');
    try {
      const res = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'all', limit: 10 }),
      });
      const data = await res.json();
      if (data.success) {
        setScrapeMessage('Sync complete! Refreshing...');
        setTimeout(() => {
          setScrapeMessage(null);
          window.location.reload();
        }, 1500);
      } else {
        setScrapeMessage('Scraper failed');
        setTimeout(() => setScrapeMessage(null), 3000);
      }
    } catch {
      setScrapeMessage('Error triggering scraper');
      setTimeout(() => setScrapeMessage(null), 3000);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav shadow-xs">
      <div className="tricolor-ribbon" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-slate-900">SARKARI</span>
                <span className="text-xl font-black tracking-tight text-orange-600">JOBS</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 ml-1">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Govt Notifications, Results & Admit Cards
              </p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search RRB, UPSC, SSC, Bank, Police jobs..."
              className="w-full bg-slate-100/90 text-slate-800 placeholder-slate-400 text-sm rounded-full pl-10 pr-10 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Nav Links & Sync Action */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Link
              href="/#latest-jobs"
              className="px-3 py-1.5 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              Latest Jobs
            </Link>
            <Link
              href="/#admit-cards"
              className="px-3 py-1.5 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Admit Cards
            </Link>
            <Link
              href="/#results"
              className="px-3 py-1.5 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-purple-600" />
              Results
            </Link>
            <Link
              href="/#categories"
              className="px-3 py-1.5 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-amber-600" />
              Categories
            </Link>

            {/* Sync / Scraper Button */}
            <button
              onClick={handleTriggerScraper}
              disabled={isScraping}
              title="Trigger Live Scraper"
              className="ml-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs flex items-center gap-1.5 border border-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin text-blue-700' : ''}`} />
              <span>{scrapeMessage || 'Sync Now'}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={handleTriggerScraper}
              disabled={isScraping}
              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs flex items-center"
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-200 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full bg-slate-100 text-slate-800 text-sm rounded-lg pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/#latest-jobs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-blue-50"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                Latest Jobs
              </Link>
              <Link
                href="/#admit-cards"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Admit Cards
              </Link>
              <Link
                href="/#results"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-blue-50"
              >
                <Award className="w-4 h-4 text-purple-600" />
                Results
              </Link>
              <Link
                href="/#categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-blue-50"
              >
                <Layers className="w-4 h-4 text-amber-600" />
                Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
