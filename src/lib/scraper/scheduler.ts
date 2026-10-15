// ============================================================
// Automated Task Queue / Scheduler using node-cron
// ============================================================

import cron, { type ScheduledTask } from 'node-cron';
import { runAllScrapers } from './index';

let isScraperRunning = false;
let cronJobInstance: ScheduledTask | null = null;

/**
 * Initializes the automated scraping schedule (every 6 hours)
 */
export function initScraperScheduler(cronExpression = '0 */6 * * *') {
  if (cronJobInstance) {
    console.log('[Scheduler] Cron job already initialized.');
    return cronJobInstance;
  }

  console.log(`[Scheduler] Initializing automated scraper cron with schedule: "${cronExpression}"`);

  cronJobInstance = cron.schedule(cronExpression, async () => {
    if (isScraperRunning) {
      console.log('[Scheduler] Scraper already running, skipping scheduled trigger.');
      return;
    }

    isScraperRunning = true;
    console.log(`[Scheduler] ⏰ Cron job fired at: ${new Date().toISOString()}`);

    try {
      const results = await runAllScrapers();
      console.log('[Scheduler] Automated scrape completed successfully:', results);
    } catch (err) {
      console.error('[Scheduler] Error during scheduled scrape execution:', err);
    } finally {
      isScraperRunning = false;
    }
  });

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
 * Checks if scraper is currently running
 */
export function getScraperStatus() {
  return {
    isRunning: isScraperRunning,
    isScheduled: cronJobInstance !== null,
    timestamp: new Date().toISOString(),
  };
}
