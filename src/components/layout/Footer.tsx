import React from 'react';
import Link from 'next/link';
import { Briefcase, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                SARKARI<span className="text-orange-500">JOBS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s automated aggregator for central & state government recruitments, exam results, admit cards, and official notification PDFs.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Government Links & Documents</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#latest-jobs" className="hover:text-white transition-colors">
                  Latest Job Notifications
                </Link>
              </li>
              <li>
                <Link href="/#ending-soon" className="hover:text-white transition-colors">
                  Applications Ending Soon
                </Link>
              </li>
              <li>
                <Link href="/#admit-cards" className="hover:text-white transition-colors">
                  Download Admit Cards
                </Link>
              </li>
              <li>
                <Link href="/#results" className="hover:text-white transition-colors">
                  Exam Results & Cutoffs
                </Link>
              </li>
            </ul>
          </div>

          {/* Major Commissions */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Top Boards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/railway" className="hover:text-white transition-colors">
                  Railway Recruitment (RRB / RRC)
                </Link>
              </li>
              <li>
                <Link href="/category/ssc" className="hover:text-white transition-colors">
                  Staff Selection Commission (SSC)
                </Link>
              </li>
              <li>
                <Link href="/category/upsc" className="hover:text-white transition-colors">
                  Union Public Service Commission (UPSC)
                </Link>
              </li>
              <li>
                <Link href="/category/banking" className="hover:text-white transition-colors">
                  Banking Recruitments (IBPS / SBI)
                </Link>
              </li>
              <li>
                <Link href="/category/defence" className="hover:text-white transition-colors">
                  Defence & Paramilitary (Agniveer)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Disclaimer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This platform aggregates publicly announced recruitment notices for informational purposes. Candidates are strongly advised to verify all details from official notification PDFs before applying.
            </p>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Sarkari Jobs Aggregator. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Aspirants
          </p>
        </div>
      </div>
    </footer>
  );
}
