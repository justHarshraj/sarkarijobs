export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.SCRAPER_ENABLED === 'true') {
      const { initScraperScheduler } = await import('@/lib/scraper/scheduler');
      const { updateJobStatusFlags } = await import('@/lib/scraper');
      const cronExpr = process.env.SCRAPER_CRON || '0 */6 * * *';
      initScraperScheduler(cronExpr);
      updateJobStatusFlags().catch((err) => console.error('[Startup] Failed to update job flags:', err));
    }
  }
}
