'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  AlertTriangle,
  CreditCard,
  Award,
  Search,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
}

export default function MobileBottomNav({ onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Jobs',
      href: '/#latest-jobs',
      icon: Briefcase,
      id: 'latest-jobs',
      isActive: pathname === '/',
    },
    {
      label: 'Deadlines',
      href: '/#ending-soon',
      icon: AlertTriangle,
      id: 'ending-soon',
      badge: 'Ending',
    },
    {
      label: 'Search',
      href: '/search',
      icon: Search,
      isSearch: true,
      isActive: pathname.startsWith('/search'),
    },
    {
      label: 'Admit Card',
      href: '/#admit-cards',
      icon: CreditCard,
      id: 'admit-cards',
    },
    {
      label: 'Results',
      href: '/#results',
      icon: Award,
      id: 'results',
    },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: (typeof navItems)[0]) => {
    if (item.id && pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(item.id);
      if (el) {
        const headerOffset = 70;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', `#${item.id}`);
      }
    } else if (item.href.startsWith('/#') && pathname !== '/') {
      e.preventDefault();
      router.push(item.href);
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.isActive;

          if (item.isSearch && onOpenSearch) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenSearch}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-blue-600 touch-scale group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center -mt-2 shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 touch-scale transition-colors ${
                isCurrent ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isCurrent ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[60px]">
                {item.label}
              </span>
              {isCurrent && (
                <span className="absolute bottom-0.5 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
