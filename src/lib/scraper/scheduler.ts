// ============================================================
// Automated Task Queue / Scheduler using node-cron
// Automatically syncs job portals on website initialization + every 6 hours
// ============================================================

import cron, { type ScheduledTask } from 'node-cron';
import { runAllScrapers } from './index';

let isScraperRunning = false;
let cronJobInstance: ScheduledTask | null = null;
let lastRunTime: Date | null = null;
let lastRunDurationMs = 0;
let hasInitializedScrape = false;

/**
 * Triggers a scraping run with concurrency lock
 */
export async function triggerScrape(reason = 'manual', maxItems = 150) {
  if (isScraperRunning) {
    console.log(`[Scheduler] Scraper already running, skipping trigger (${reason}).`);
    return { success: false, message: 'Scraper already in progress' };
  }

  isScraperRunning = true;
  const startTime = Date.now();
  console.log(`[Scheduler] 🚀 Scraper triggered (${reason}) at: ${new Date().toISOString()}`);

  try {
    const results = await runAllScrapers(maxItems);
    lastRunTime = new Date();
    lastRunDurationMs = Date.now() - startTime;
    hasInitializedScrape = true;
    console.log(
      `[Scheduler] ✅ Scrape completed (${reason}) in ${(lastRunDurationMs / 1000).toFixed(2)}s:`,
      results
    );
    return { success: true, results, durationMs: lastRunDurationMs };
  } catch (err) {
    console.error(`[Scheduler] ❌ Error during scrape execution (${reason}):`, err);
    throw err;
  } finally {
    isScraperRunning = false;
  }
}

/**
 * Initializes the automated scraping schedule (every 6 hours)
 * and triggers an immediate scrape on website initialization.
 * Schedule: At minute 0 past every 6th hour (00:00, 06:00, 12:00, 18:00)
 */
export function initScraperScheduler(cronExpression = '0 */6 * * *', runOnStartup = true) {
  if (cronJobInstance) {
    console.log('[Scheduler] ⏰ Cron job already active.');
    if (runOnStartup && !hasInitializedScrape && !isScraperRunning) {
      triggerScrape('website-initialization', 150).catch((err) =>
        console.error('[Scheduler] Initial startup scrape warning:', err)
      );
    }
    return cronJobInstance;
  }

  console.log(`[Scheduler] ⏰ Initializing automated 6-hour scraper with schedule: "${cronExpression}"`);

  cronJobInstance = cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] ⏰ Scheduled 6-hour auto-sync triggered at: ${new Date().toISOString()}`);
    await triggerScrape('scheduled-6h-cron', 150).catch((err) =>
      console.error('[Scheduler] Error during scheduled cron scrape:', err)
    );
  });

  // Trigger immediate scrape upon website initialization
  if (runOnStartup && !hasInitializedScrape) {
    console.log('[Scheduler] 🚀 Website initialization detected: Running immediate initial scrape...');
    triggerScrape('website-initialization', 150).catch((err) =>
      console.error('[Scheduler] Initial startup scrape warning:', err)
    );
  }

  return cronJobInstance;
}

/**
 * Stop the scheduler
 */
export function stopScraperScheduler() {
  if (cronJobInstance) {
    cronJobInstance.stop();
    cronJobInstance = null;
    console.log('[Scheduler] Cron job stopped.');
  }
}

/**
 * Checks if scraper is currently running and gets schedule status
 */
export function getScraperStatus() {
  if (!cronJobInstance) {
    initScraperScheduler();
  }

  return {
    isRunning: isScraperRunning,
    isScheduled: cronJobInstance !== null,
    schedule: 'Every 6 hours (0 */6 * * *) + on website initialization',
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : null,
    lastRunDurationMs,
    hasInitializedScrape,
    timestamp: new Date().toISOString(),
  };
}

