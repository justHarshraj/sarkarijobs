import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { ApiResponse, IJob } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const response: ApiResponse<IJob[]> = {
      success: true,
      data: jobs as unknown as IJob[],
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch latest jobs';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
