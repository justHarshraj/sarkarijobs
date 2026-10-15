import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { CATEGORIES } from '@/lib/constants/categories';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    await connectDB();

    // Aggregate counts by category
    const counts = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((item) => {
      countMap.set(item._id, item.count);
    });

    const categoryData = CATEGORIES.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      displayOrder: cat.displayOrder,
      jobCount: countMap.get(cat.name) || 0,
    }));

    const response: ApiResponse<typeof categoryData> = {
      success: true,
      data: categoryData,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
