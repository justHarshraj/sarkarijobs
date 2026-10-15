import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import { getBaseUrl } from '@/lib/seo/schema';

export async function GET() {
  const baseUrl = getBaseUrl();

  let jobs: Array<{
    title: string;
    slug: string;
    shortDescription?: string;
    organization: string;
    category: string;
    createdAt: Date | string;
  }> = [];

  try {
    await connectDB();
    jobs = await Job.find({ isActive: true })
      .select('title slug shortDescription organization category createdAt')
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();
  } catch (err) {
    console.error('[Feed] Failed to generate RSS feed:', err);
  }

  const itemsXml = jobs
    .map(
      (job) => `
    <item>
      <title><![CDATA[${job.title} - ${job.organization}]]></title>
      <link>${baseUrl}/jobs/${job.slug}</link>
      <guid isPermaLink="true">${baseUrl}/jobs/${job.slug}</guid>
      <description><![CDATA[${job.shortDescription || `${job.title} recruitment announced by ${job.organization}. Apply online.`}]]></description>
      <category><![CDATA[${job.category}]]></category>
      <pubDate>${new Date(job.createdAt).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sarkari Jobs - Latest Government Job Notifications</title>
    <link>${baseUrl}</link>
    <description>Fastest automated Indian government jobs, Sarkari Result, UPSC, SSC, Railway RRB, Banking IBPS, Police, and State PSC notifications.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
