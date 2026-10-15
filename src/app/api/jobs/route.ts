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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    const qualification = searchParams.get('qualification');
    const postType = searchParams.get('postType');
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort') || 'latest';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const filter: Record<string, unknown> = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (state && state !== 'All India' && state !== 'All') {
      filter.state = state;
    }

    if (qualification && qualification !== 'All' && qualification !== 'Any') {
      filter.qualification = qualification;
    }

    if (postType && postType !== 'All') {
      filter.postType = postType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort order
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'ending-soon') {
      sortOption = { applicationEndDate: 1 };
      filter.applicationEndDate = { $gte: new Date() };
    } else if (sort === 'vacancies') {
      sortOption = { totalVacancies: -1 };
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<IJob[]> = {
      success: true,
      data: jobs as unknown as IJob[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to fetch jobs') },
      { status: 500 }
    );
  }
}

