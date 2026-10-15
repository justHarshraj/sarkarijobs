import React from 'react';
import type { PostType } from '@/types';
import { Clock, Sparkles } from 'lucide-react';

interface JobBadgeProps {
  type?: PostType;
  isRecent?: boolean;
  isEndingSoon?: boolean;
  daysRemaining?: number | null;
  className?: string;
}

export default function JobBadge({
  type,
  isRecent,
  isEndingSoon,
  daysRemaining,
  className = '',
}: JobBadgeProps) {
  if (isEndingSoon) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse-subtle ${className}`}
      >
        <Clock className="w-3 h-3" />
        {daysRemaining !== null && daysRemaining !== undefined
          ? `${daysRemaining}d left`
          : 'Ending Soon'}
      </span>
    );
  }

  if (isRecent) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}
      >
        <Sparkles className="w-3 h-3 text-emerald-600" />
        NEW
      </span>
    );
  }

  if (type === 'Admit Card') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
      >
        Admit Card
      </span>
    );
  }

  if (type === 'Result') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
      >
        Result
      </span>
    );
  }

  if (type === 'Answer Key') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        Answer Key
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
    >
      {type || 'Job'}
    </span>
  );
}
