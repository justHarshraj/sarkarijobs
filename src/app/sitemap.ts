import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { CATEGORIES } from '@/lib/constants/categories';
import { getBaseUrl } from '@/lib/seo/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  let jobUrls: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const jobs = await Job.find({ isActive: true })
      .select('slug updatedAt lastUpdated createdAt isEndingSoon')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(2000)
      .lean();

    jobUrls = jobs.map((job) => {
      const lastMod =
        (job.updatedAt as Date) ||
        (job.lastUpdated as Date) ||
        (job.createdAt as Date) ||
        new Date();

      return {
        url: `${baseUrl}/jobs/${job.slug}`,
        lastModified: new Date(lastMod),
        changeFrequency: job.isEndingSoon ? ('hourly' as const) : ('daily' as const),
        priority: job.isEndingSoon ? 0.85 : 0.8,
      };
    });
  } catch (err) {
    console.warn('[Sitemap] Dynamic jobs fetch fallback:', err);
  }

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    ...categoryUrls,
    ...jobUrls,
  ];
}
