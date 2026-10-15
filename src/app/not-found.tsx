import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, Search, Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            404 Error
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
            Notification Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            The job recruitment, admit card, or page you are looking for may have expired or been relocated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-2">
          <Link
            href="/"
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 touch-scale transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home Portal</span>
          </Link>

          <Link
            href="/search"
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 touch-scale transition-all"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search Jobs</span>
          </Link>

          <Link
            href="/#categories"
            className="col-span-1 sm:col-span-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 touch-scale transition-all"
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Browse All Job Departments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
