#!/usr/bin/env tsx
// ============================================================
// Sarkari Jobs — Large Pool Scraper CLI
// High-performance bulk ingestion with adaptive concurrency
// ============================================================

import { runAllScrapers, runScraperForSource, cleanupNotNeededJobs } from '../src/lib/scraper';
import type { PostType } from '../src/types';

interface CliArgs {
  limit: number;
  concurrency: number;
  source: 'all' | 'sarkariresult.com' | 'sarkariresult.com.cm';
  category?: PostType | 'all';
  year?: number;
  force: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    limit: 100,
    concurrency: 12,
    source: 'all',
    category: 'all',
    year: undefined,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' || arg === '-l') {
      result.limit = parseInt(args[++i], 10) || 100;
    } else if (arg === '--concurrency' || arg === '-c') {
      result.concurrency = parseInt(args[++i], 10) || 12;
    } else if (arg === '--source' || arg === '-s') {
      const src = args[++i];
      if (src === 'sarkariresult.com' || src === 'sarkariresult.com.cm' || src === 'all') {
        result.source = src;
      }
    } else if (arg === '--category') {
      result.category = args[++i] as PostType | 'all';
    } else if (arg === '--year' || arg === '-y') {
      result.year = parseInt(args[++i], 10);
    } else if (arg === '--force' || arg === '-f') {
      result.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
🚀 Sarkari Jobs — High-Performance Large Pool Scraper

Usage:
  npx tsx scripts/scrape-pool.ts [options]
  npm run scrape:pool -- [options]

Options:
  -l, --limit <num>        Maximum listings to harvest per source (default: 100)
  -c, --concurrency <num>  Concurrent detail page workers (default: 12)
  -s, --source <name>      Source site: "sarkariresult.com", "sarkariresult.com.cm", or "all" (default: all)
      --category <type>    Category filter: "Latest Job", "Admit Card", "Result", or "all" (default: all)
  -y, --year <year>        Filter links by year (e.g. 2026)
  -f, --force              Bypass freshness cache and re-scrape all existing records
  -h, --help               Show this help message

Examples:
  npm run scrape:pool -- --limit 200 --concurrency 15
  npm run scrape:pool -- --source sarkariresult.com --category "Latest Job" --year 2026
      `);
      process.exit(0);
    }
  }

  return result;
}

async function main() {
  const args = parseArgs();

  console.log('\n======================================================');
  console.log('⚡  SARKARI JOBS — HIGH SPEED POOL SCRAPER');
  console.log('======================================================');
  console.log(`• Target Pool Limit : ${args.limit} items per source`);
  console.log(`• Concurrency       : ${args.concurrency} parallel workers`);
  console.log(`• Target Source     : ${args.source}`);
  console.log(`• Category Filter   : ${args.category || 'all'}`);
  console.log(`• Year Filter       : ${args.year ? args.year : 'all years'}`);
  console.log(`• Force Refresh     : ${args.force ? 'YES (Bypassing cache)' : 'NO (Smart differential skipping)'}`);
  console.log('======================================================\n');

  const startTime = Date.now();

  const options = {
    maxItems: args.limit,
    concurrency: args.concurrency,
    forceRefresh: args.force,
    category: args.category,
    yearFilter: args.year,
  };

  try {
    let results;
    if (args.source === 'sarkariresult.com' || args.source === 'sarkariresult.com.cm') {
      const single = await runScraperForSource(args.source, options);
      results = [single];
    } else {
      results = await runAllScrapers(options);
    }

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    let totalHarvested = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const r of results) {
      totalHarvested += r.totalFound;
      totalNew += r.newJobs;
      totalUpdated += r.updatedJobs;
      totalSkipped += r.skipped;
      totalErrors += r.errors;
    }

    const cleanup = await cleanupNotNeededJobs();

    console.log('\n======================================================');
    console.log('🎉  POOL SCRAPE & MAINTENANCE COMPLETE');
    console.log('======================================================');
    console.log(`• Total Elapsed Time : ${elapsedSeconds}s`);
    console.log(`• Listings Harvested : ${totalHarvested}`);
    console.log(`• New Jobs Added     : ${totalNew}`);
    console.log(`• Existing Updated   : ${totalUpdated}`);
    console.log(`• Skipped (Fresh/Old): ${totalSkipped}`);
    console.log(`• Pruned (Not Needed): ${cleanup.totalDeleted}`);
    console.log(`• Errors / Misses    : ${totalErrors}`);
    console.log(
      `• Overall Throughput : ${(
        (totalNew + totalUpdated + totalSkipped) /
        Math.max(1, parseFloat(elapsedSeconds))
      ).toFixed(1)} items/second`
    );
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error during scraper execution:', err);
    process.exit(1);
  }
}

main();
