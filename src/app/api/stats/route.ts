import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { ApiResponse, DashboardStats } from '@/types';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalActiveJobs,
      endingSoonCount,
      resultsCount,
      admitCardCount,
      newJobsToday,
      totalJobsScraped,
      latestJob,
    ] = await Promise.all([
      Job.countDocuments({ isActive: true, postType: 'Latest Job' }),
      Job.countDocuments({
        isActive: true,
        applicationEndDate: { $gte: now, $lte: sevenDaysFromNow },
      }),
      Job.countDocuments({ postType: 'Result' }),
      Job.countDocuments({ postType: 'Admit Card' }),
      Job.countDocuments({ createdAt: { $gte: startOfToday } }),
      Job.countDocuments(),
      Job.findOne().sort({ scrapedAt: -1 }).select('scrapedAt').lean(),
    ]);

    const stats: DashboardStats & { lastScrapedAt: Date | null } = {
      totalActiveJobs,
      endingSoonCount,
      resultsCount,
      admitCardCount,
      newJobsToday,
      totalJobsScraped,
      lastScrapedAt: (latestJob?.scrapedAt as Date) || null,
    };

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
