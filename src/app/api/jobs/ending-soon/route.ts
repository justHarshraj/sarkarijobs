import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { ApiResponse, IJob } from '@/types';
import { getSafeErrorMessage } from '@/lib/utils/sanitizer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const now = new Date();
    const jobs = await Job.find({
      isActive: true,
      applicationEndDate: { $gte: now },
    })
      .sort({ applicationEndDate: 1 })
      .limit(limit)
      .lean();

    const response: ApiResponse<IJob[]> = {
      success: true,
      data: jobs as unknown as IJob[],
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to fetch ending soon jobs') },
      { status: 500 }
    );
  }
}

