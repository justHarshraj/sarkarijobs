// ============================================================
// Next.js Server Startup Lifecycle - Instrumentation
// Automatically runs scraper on website initialization & keeps 6-hour cron active
// ============================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Avoid running scrapers during static production build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    const isEnabled = process.env.SCRAPER_ENABLED !== 'false';

    if (isEnabled) {
      console.log('🚀 [Instrumentation] Website initialization detected: Starting sync engine & initial scrape...');
      const { initScraperScheduler } = await import('@/lib/scraper/scheduler');
      const { updateJobStatusFlags } = await import('@/lib/scraper');
      const cronExpr = process.env.SCRAPER_CRON || '0 * * * *';

      // 1. Initialize recurring 1-hour cron job and trigger immediate startup scrape
      initScraperScheduler(cronExpr, true);

      // 2. Perform initial startup flag update
      updateJobStatusFlags().catch((err) =>
        console.error('[Startup] Failed to update job status flags:', err)
      );
    }
  }
}

