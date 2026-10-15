import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { CATEGORIES } from '@/lib/constants/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let jobUrls: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const jobs = await Job.find({ isActive: true })
      .select('slug lastUpdated updatedAt')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    jobUrls = jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.slug}`,
      lastModified: (job.lastUpdated as Date) || (job.updatedAt as Date) || new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (err) {
    console.warn('[Sitemap] Could not fetch dynamic jobs for sitemap:', err);
  }

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.filter((c) => c.name !== 'Other').map(
    (cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...categoryUrls,
    ...jobUrls,
  ];
}
