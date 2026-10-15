import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers, runScraperForSource } from '@/lib/scraper';
import { getScraperStatus } from '@/lib/scraper/scheduler';
import { getSafeErrorMessage } from '@/lib/utils/sanitizer';
import type { PostType } from '@/types';

export async function GET() {
  return NextResponse.json({
    success: true,
    status: getScraperStatus(),
  });
}

export async function POST(req: NextRequest) {
  try {
    let source = 'all';
    let limit = 20;
    let concurrency = 10;
    let forceRefresh = false;
    let category: PostType | 'all' | undefined = undefined;

    try {
      const body = await req.json();
      if (body.source) source = body.source;
      if (body.limit) limit = Math.min(500, Math.max(1, parseInt(body.limit, 10)));
      if (body.concurrency) concurrency = Math.min(25, Math.max(1, parseInt(body.concurrency, 10)));
      if (body.forceRefresh !== undefined) forceRefresh = Boolean(body.forceRefresh);
      if (body.category) category = body.category;
    } catch {
      // Body is optional
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('source')) source = searchParams.get('source')!;
    if (searchParams.get('limit')) limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit')!, 10)));
    if (searchParams.get('concurrency')) concurrency = Math.min(25, Math.max(1, parseInt(searchParams.get('concurrency')!, 10)));
    if (searchParams.get('forceRefresh')) forceRefresh = searchParams.get('forceRefresh') === 'true';
    if (searchParams.get('category')) {
      category = searchParams.get('category') as PostType | 'all';
    }

    console.log(`[Scraper Trigger] Invoked: source=${source}, limit=${limit}, concurrency=${concurrency}`);

    const scraperOpts = {
      maxItems: limit,
      concurrency,
      forceRefresh,
      category,
    };

    let results;
    if (source === 'sarkariresult.com' || source === 'sarkariresult.com.cm') {
      const single = await runScraperForSource(source, scraperOpts);
      results = [single];
    } else {
      results = await runAllScrapers(scraperOpts);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping run completed successfully',
      results,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Scraper execution failed') },
      { status: 500 }
    );
  }
}

