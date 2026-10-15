// ============================================================
// Next.js Server Startup Lifecycle - Instrumentation
// Initializes the automated 6-hour cron scheduler & startup checks
// ============================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const isEnabled = process.env.SCRAPER_ENABLED !== 'false';

    if (isEnabled) {
      console.log('🚀 [Instrumentation] Initializing automated 6-hour background sync engine...');
      const { initScraperScheduler } = await import('@/lib/scraper/scheduler');
      const { updateJobStatusFlags, runAllScrapers } = await import('@/lib/scraper');
      const cronExpr = process.env.SCRAPER_CRON || '0 */6 * * *';

      // 1. Initialize recurring 6-hour cron job
      initScraperScheduler(cronExpr);

      // 2. Perform initial startup flag update
      updateJobStatusFlags().catch((err) =>
        console.error('[Startup] Failed to update job status flags:', err)
      );

      // 3. Gentle startup background check (non-blocking)
      setTimeout(async () => {
        try {
          console.log('[Startup] Performing background data check...');
          await runAllScrapers(15);
        } catch (err) {
          console.error('[Startup] Initial scraper sync warning:', err);
        }
      }, 5000);
    }
  }
}
