// ============================================================
// Automated Task Queue / Scheduler using node-cron
// Automatically syncs job portals every 6 hours in the background
// ============================================================

import cron, { type ScheduledTask } from 'node-cron';
import { runAllScrapers } from './index';

let isScraperRunning = false;
let cronJobInstance: ScheduledTask | null = null;
let lastRunTime: Date | null = null;
let lastRunDurationMs = 0;

/**
 * Initializes the automated scraping schedule (every 6 hours)
 * Schedule: At minute 0 past every 6th hour (00:00, 06:00, 12:00, 18:00)
 */
export function initScraperScheduler(cronExpression = '0 */6 * * *') {
  if (cronJobInstance) {
    console.log('[Scheduler] ⏰ Cron job already initialized (Every 6 hours).');
    return cronJobInstance;
  }

  console.log(`[Scheduler] ⏰ Initializing automated 6-hour scraper with schedule: "${cronExpression}"`);

  cronJobInstance = cron.schedule(cronExpression, async () => {
    if (isScraperRunning) {
      console.log('[Scheduler] Scraper already running, skipping scheduled trigger.');
      return;
    }

    isScraperRunning = true;
    const startTime = Date.now();
    console.log(`[Scheduler] ⏰ Scheduled 6-hour auto-sync triggered at: ${new Date().toISOString()}`);

    try {
      const results = await runAllScrapers();
      lastRunTime = new Date();
      lastRunDurationMs = Date.now() - startTime;
      console.log(`[Scheduler] ✅ 6-hour automated scrape completed in ${(lastRunDurationMs / 1000).toFixed(2)}s:`, results);
    } catch (err) {
      console.error('[Scheduler] ❌ Error during scheduled scrape execution:', err);
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
 * Checks if scraper is currently running and gets schedule status
 */
export function getScraperStatus() {
  if (!cronJobInstance) {
    initScraperScheduler();
  }

  return {
    isRunning: isScraperRunning,
    isScheduled: cronJobInstance !== null,
    schedule: 'Every 6 hours (0 */6 * * *)',
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : null,
    lastRunDurationMs,
    timestamp: new Date().toISOString(),
  };
}
