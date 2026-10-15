'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Briefcase,
  Search,
  Clock,
  Menu,
  X,
  CreditCard,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  onSearchOpen?: () => void;
}

export default function Header({}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const popularSearches = ['Railway', 'UPSC', 'SSC CGL', 'Police', 'Banking', '10th Pass'];

  const navLinks = [
    {
      id: 'latest-jobs',
      label: 'Jobs',
      href: '/#latest-jobs',
      icon: Briefcase,
      color: 'text-blue-600',
      activeClass: 'bg-blue-50 text-blue-700 shadow-2xs font-bold',
      hoverClass: 'hover:text-blue-700 hover:bg-slate-100/80',
    },
    {
      id: 'ending-soon',
      label: 'Deadlines',
      href: '/#ending-soon',
      icon: Sparkles,
      color: 'text-rose-500',
      activeClass: 'bg-rose-50 text-rose-700 shadow-2xs font-bold',
      hoverClass: 'hover:text-rose-700 hover:bg-rose-50/80',
    },
    {
      id: 'admit-cards',
      label: 'Admit Cards',
      href: '/#admit-cards',
      icon: CreditCard,
      color: 'text-emerald-600',
      activeClass: 'bg-emerald-50 text-emerald-700 shadow-2xs font-bold',
      hoverClass: 'hover:text-emerald-700 hover:bg-emerald-50/80',
    },
    {
      id: 'results',
      label: 'Results',
      href: '/#results',
      icon: Award,
      color: 'text-purple-600',
      activeClass: 'bg-purple-50 text-purple-700 shadow-2xs font-bold',
      hoverClass: 'hover:text-purple-700 hover:bg-purple-50/80',
    },
    {
      id: 'categories',
      label: 'Categories',
      href: '/#categories',
      icon: Layers,
      color: 'text-amber-600',
      activeClass: 'bg-amber-50 text-amber-700 shadow-2xs font-bold',
      hoverClass: 'hover:text-amber-700 hover:bg-amber-50/80',
    },
  ];

  // Smooth scroll to element by ID with header offset
  const scrollToElement = (targetId: string) => {
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
      setActiveSection(targetId);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname === '/') {
      scrollToElement(targetId);
    } else {
      router.push(`/#${targetId}`);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', '/');
      setActiveSection('');
    }
  };

  // Scrollspy: update active nav item as user scrolls down the page
  useEffect(() => {
    if (pathname !== '/') return;

    const sectionIds = ['categories', 'results', 'admit-cards', 'ending-soon', 'latest-jobs'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Handle URL hash on initial page load / route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToElement(hash);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-nav shadow-xs">
        <div className="tricolor-ribbon" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Logo & Brand */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group touch-scale"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">SARKARI</span>
                  <span className="text-lg sm:text-xl font-black tracking-tight text-orange-600">JOBS</span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 ml-1">
                    PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Central & State Government Recruitments
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
                placeholder="Search Railway, UPSC, SSC, Bank, Police jobs..."
                className="w-full bg-slate-100/90 text-slate-800 placeholder-slate-400 text-sm rounded-full pl-10 pr-10 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 touch-scale"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Quick Nav Links & Automated Sync Status - Desktop */}
            <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer touch-scale ${
                      isActive ? item.activeClass : item.hoverClass
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Automated 6-Hour Background Sync Status Badge */}
              <div
                title="Automated 24/7 background sync every 6 hours"
                className="ml-2 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 font-bold text-xs flex items-center gap-2 shadow-2xs select-none cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Sync (6h)</span>
              </div>
            </div>

            {/* Mobile Controls (Search trigger, Automated 6h indicator, Hamburger) */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Open search dialog"
                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 touch-scale"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Auto-Sync Status Badge */}
              <div
                title="Automated sync active every 6 hours"
                className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5 select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>6h Sync</span>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 touch-scale"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 border-t border-slate-200/80 animate-fade-in-down space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 transition-all touch-scale shadow-2xs ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                          : 'bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Sync Active (Every 6 Hours)
                </span>
                <Link
                  href="/#categories"
                  onClick={(e) => handleNavClick(e, 'categories')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  All Sectors &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Fullscreen Mobile Search Dialog */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col p-4 animate-fade-in lg:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-lg mx-auto border border-slate-200 animate-fade-in-down">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-600" />
                Quick Search
              </span>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 touch-scale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Railway, SSC, UPSC, Bank..."
                className="w-full bg-slate-100 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium touch-scale transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
