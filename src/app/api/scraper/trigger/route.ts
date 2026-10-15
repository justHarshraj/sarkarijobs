import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers, runScraperForSource } from '@/lib/scraper';
import { getScraperStatus } from '@/lib/scraper/scheduler';

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

    try {
      const body = await req.json();
      if (body.source) source = body.source;
      if (body.limit) limit = Math.min(50, Math.max(1, parseInt(body.limit, 10)));
    } catch {
      // Body is optional
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('source')) source = searchParams.get('source')!;
    if (searchParams.get('limit')) limit = parseInt(searchParams.get('limit')!, 10);

    console.log(`[Scraper Trigger] Manually invoked: source=${source}, limit=${limit}`);

    let results;
    if (source === 'sarkariresult.com' || source === 'sarkariresult.com.cm') {
      const single = await runScraperForSource(source, limit);
      results = [single];
    } else {
      results = await runAllScrapers(limit);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping run completed successfully',
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scraper execution failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
