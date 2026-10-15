// ============================================================
// Scraper Orchestrator — High Performance, Low Latency & Efficient
// Features: In-memory differential filtering, chunked batching,
// memory-efficient Cheerio parsing, and MongoDB bulkWrite persistence.
// ============================================================

import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { Types } from 'mongoose';
import type { IJob, ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { scrapeSarkariResultListings, scrapeSarkariResultDetail } from './sarkariresult';
import { scrapeSarkariResultCmListings, scrapeSarkariResultCmDetail } from './sarkariresultcm';
import {
  normalizeTitle,
  normalizeCategory,
  normalizeState,
  normalizeQualification,
  normalizeVacancies,
  normalizeFee,
  normalizeAge,
  detectPostType,
} from '@/lib/utils/normalizer';
import { parseIndianDate } from '@/lib/utils/dateParser';
import { generateJobSlug } from '@/lib/utils/slugify';
import { generateContentHash, isDuplicateJob } from '@/lib/utils/deduplicator';
import { asyncPool } from '@/lib/utils/asyncPool';

export interface ScraperRunResult {
  source: string;
  totalFound: number;
  newJobs: number;
  updatedJobs: number;
  skipped: number;
  errors: number;
  durationMs: number;
  itemsPerSecond?: number;
}

export interface RunScraperOptions {
  maxItems?: number;
  concurrency?: number;
  chunkSize?: number;
  forceRefresh?: boolean;
  category?: PostType | 'all';
  yearFilter?: number;
  onProgress?: (processed: number, total: number, stats: ScraperRunResult) => void;
}

/**
 * Transforms scraped raw detail into normalized IJob document
 */
function normalizeScrapedJob(
  detail: ScrapedJobDetail,
  listing: ScrapedJobListing,
  sourceSite: string
): Partial<IJob> {
  const title = normalizeTitle(detail.title || listing.title);
  const organization = detail.organization || 'Government Organization';
  const postType = listing.postType || detectPostType(title);
  const category = normalizeCategory(title, organization);
  const state = normalizeState(`${title} ${organization} ${detail.shortDescription}`);

  // Parse total vacancies
  let totalVacancies = 0;
  if (detail.vacancyDetails && detail.vacancyDetails.length > 0) {
    totalVacancies = detail.vacancyDetails.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }
  if (!totalVacancies) {
    totalVacancies = normalizeVacancies(title) || normalizeVacancies(detail.shortDescription);
  }

  // Parse qualifications from vacancy details
  const eligibilityCombined = detail.vacancyDetails
    .map((v) => v.eligibility)
    .join(' ');
  const qualification = normalizeQualification(
    `${eligibilityCombined} ${title} ${detail.shortDescription}`
  );

  // Parse dates
  const startDate = detail.importantDates['applicationStartDate']
    ? parseIndianDate(detail.importantDates['applicationStartDate'])
    : null;
  const endDate = detail.importantDates['applicationEndDate']
    ? parseIndianDate(detail.importantDates['applicationEndDate'])
    : listing.lastDate
    ? parseIndianDate(listing.lastDate)
    : null;
  const feeDate = detail.importantDates['feePaymentLastDate']
    ? parseIndianDate(detail.importantDates['feePaymentLastDate'])
    : null;

  // Parse fees
  const feeGeneral = normalizeFee(detail.applicationFee['general'] || '');
  const feeOBC = normalizeFee(detail.applicationFee['obc'] || detail.applicationFee['general'] || '');
  const feeSCST = normalizeFee(detail.applicationFee['scst'] || '');
  const feeFemale = normalizeFee(detail.applicationFee['female'] || '');
  const feePH = normalizeFee(detail.applicationFee['ph'] || '');

  // Parse age limits
  const age = normalizeAge(
    `${detail.ageLimit['minimum'] || ''} ${detail.ageLimit['maximum'] || ''} ${detail.ageLimit['relaxation'] || ''}`
  );
  const ageAsOn = detail.ageLimit['asOn'] ? parseIndianDate(detail.ageLimit['asOn']) : null;

  // Compute status flags
  const now = new Date();
  const isActive = endDate ? endDate.getTime() >= now.getTime() : true;
  const daysDiff = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isEndingSoon = daysDiff !== null && daysDiff >= 0 && daysDiff <= 7;

  // Content Hash for change detection
  const hashString = `${title}|${organization}|${totalVacancies}|${endDate?.toISOString() || ''}`;
  const sourceHash = generateContentHash(hashString);

  return {
    title,
    slug: generateJobSlug(title),
    organization,
    department: '',
    shortDescription: detail.shortDescription || `${title} - Apply online for Sarkari Naukri opportunity.`,
    category,
    subCategory: '',
    state,
    qualification,
    postType,
    totalVacancies,
    vacancyBreakdown: detail.vacancyDetails || [],
    applicationStartDate: startDate,
    applicationEndDate: endDate,
    feePaymentLastDate: feeDate,
    examDate: detail.importantDates['examDate'] || 'As per Schedule',
    admitCardDate: detail.importantDates['admitCardDate'] || 'Before Exam',
    resultDate: '',
    feeGeneral,
    feeOBC,
    feeSCST,
    feeFemale,
    feePH,
    feePaymentModes: ['Online', 'Net Banking', 'Debit Card', 'Credit Card', 'UPI'],
    ageMinimum: age.min,
    ageMaximum: age.max,
    ageAsOn,
    ageRelaxation: age.relaxation,
    applyOnlineUrl: detail.applyOnlineUrl,
    notificationPdfUrl: detail.notificationPdfUrl,
    officialWebsiteUrl: detail.officialWebsiteUrl,
    additionalLinks: detail.importantLinks || [],
    sourceUrl: detail.sourceUrl,
    sourceSite,
    sourceHash,
    scrapedAt: new Date(),
    lastUpdated: new Date(),
    isActive,
    isNew: true,
    isEndingSoon,
    isFeatured: totalVacancies > 1000,
  };
}

/**
 * Runs the scraper for a specific source with chunked batching & MongoDB bulkWrite
 */
export async function runScraperForSource(
  source: 'sarkariresult.com' | 'sarkariresult.com.cm',
  maxItemsOrOptions: number | RunScraperOptions = 30
): Promise<ScraperRunResult> {
  const options: RunScraperOptions =
    typeof maxItemsOrOptions === 'number'
      ? { maxItems: maxItemsOrOptions }
      : maxItemsOrOptions;

  const maxItems = options.maxItems || 30;
  const concurrency = options.concurrency || 10;
  const chunkSize = options.chunkSize || 30;
  const forceRefresh = options.forceRefresh || false;

  const startTime = Date.now();
  await connectDB();

  // 1. Harvest listings from target source
  let listings: ScrapedJobListing[] = [];
  if (source === 'sarkariresult.com') {
    listings = await scrapeSarkariResultListings(maxItems, {
      category: options.category,
      yearFilter: options.yearFilter,
    });
  } else {
    listings = await scrapeSarkariResultCmListings(maxItems, {
      category: options.category,
      yearFilter: options.yearFilter,
    });
  }

  // Deduplicate listings by URL
  const seenListingUrls = new Set<string>();
  const uniqueListings = listings.filter((item) => {
    if (seenListingUrls.has(item.url)) return false;
    seenListingUrls.add(item.url);
    return true;
  });

  const result: ScraperRunResult = {
    source,
    totalFound: uniqueListings.length,
    newJobs: 0,
    updatedJobs: 0,
    skipped: 0,
    errors: 0,
    durationMs: 0,
    itemsPerSecond: 0,
  };

  if (uniqueListings.length === 0) {
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // 2. High-speed O(1) In-Memory Differential Filtering
  const listingUrls = uniqueListings.map((l) => l.url);
  const existingJobs = await Job.find(
    { sourceUrl: { $in: listingUrls } },
    '_id sourceUrl scrapedAt slug sourceHash applicationEndDate title'
  ).lean();

  interface ExistingJobRecord {
    _id: Types.ObjectId;
    sourceUrl: string;
    scrapedAt: Date;
    slug: string;
    sourceHash?: string;
    applicationEndDate?: Date | null;
    title?: string;
  }

  const existingMap = new Map<string, ExistingJobRecord>();
  for (const job of existingJobs) {
    existingMap.set(job.sourceUrl, job as unknown as ExistingJobRecord);
  }

  const now = Date.now();
  const freshTtlMs = 48 * 60 * 60 * 1000; // 48 hours freshness window
  const toProcess: ScrapedJobListing[] = [];

  for (const item of uniqueListings) {
    const existing = existingMap.get(item.url);

    if (existing && !forceRefresh) {
      // If job is already expired (deadline passed), permanently skip re-scraping
      if (existing.applicationEndDate) {
        const endTimestamp = new Date(existing.applicationEndDate).getTime();
        if (endTimestamp < now) {
          result.skipped++;
          continue;
        }
      }

      // If scraped recently within TTL, skip
      if (existing.scrapedAt) {
        const lastScrapedTime = new Date(existing.scrapedAt).getTime();
        if (now - lastScrapedTime < freshTtlMs) {
          result.skipped++;
          continue;
        }
      }
    }

    toProcess.push(item);
  }

  console.log(
    `[Scraper] ${source}: ${uniqueListings.length} total links | ${result.skipped} skipped (expired/fresh) | ${toProcess.length} to process.`
  );

  if (toProcess.length === 0) {
    result.durationMs = Date.now() - startTime;
    result.itemsPerSecond = 0;
    return result;
  }

  // 3. Pre-load candidate active jobs into memory for O(1) slug & duplicate check
  // Eliminates N+1 database queries entirely!
  const [existingSlugsList, activeCandidates] = await Promise.all([
    Job.find({}, 'slug').lean(),
    Job.find({ isActive: true }, 'title organization totalVacancies').lean(),
  ]);

  const existingSlugs = new Set<string>(existingSlugsList.map((j) => j.slug));
  const activeCandidateList = [...activeCandidates];

  // Helper for generating collision-free slug in 0ms without hitting the DB
  const getUniqueSlug = (baseSlug: string): string => {
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}${counter > 1 ? `-${counter}` : ''}`;
      counter++;
    }
    existingSlugs.add(slug);
    return slug;
  };

  // 4. Chunked Batch Pipeline with Adaptive Concurrency & MongoDB bulkWrite
  const totalChunks = Math.ceil(toProcess.length / chunkSize);
  let processedSoFar = 0;

  for (let c = 0; c < totalChunks; c++) {
    const chunkStart = c * chunkSize;
    const chunkItems = toProcess.slice(chunkStart, chunkStart + chunkSize);

    // Concurrently fetch detail pages for this chunk
    interface ProcessedItem {
      normalized: Partial<IJob>;
      existing: ExistingJobRecord | undefined;
    }

    const processedResults = await asyncPool(
      concurrency,
      chunkItems,
      async (item) => {
        try {
          let detail: ScrapedJobDetail | null = null;
          if (source === 'sarkariresult.com') {
            detail = await scrapeSarkariResultDetail(item.url);
          } else {
            detail = await scrapeSarkariResultCmDetail(item.url);
          }

          if (!detail || !detail.title) {
            result.errors++;
            return null;
          }

          const normalized = normalizeScrapedJob(detail, item, source);
          const existingJob = existingMap.get(item.url);

          // In-memory cross-source deduplication check (only for new jobs)
          if (!existingJob) {
            const isDup = activeCandidateList.some((candidate) =>
              isDuplicateJob(
                {
                  title: normalized.title || '',
                  organization: normalized.organization,
                  totalVacancies: normalized.totalVacancies,
                },
                {
                  title: candidate.title,
                  organization: candidate.organization,
                  totalVacancies: candidate.totalVacancies,
                }
              )
            );

            if (isDup) {
              result.skipped++;
              return null;
            }
          }

          return {
            normalized,
            existing: existingJob,
          } as ProcessedItem;
        } catch (err: unknown) {
          result.errors++;
          const message = err instanceof Error ? err.message : String(err);
          console.warn(`[Scraper] Detail fetch error on ${item.url}:`, message);
          return null;
        }
      },
      { retries: 2, taskDelayMs: 20 }
    );

    // 5. Construct atomic MongoDB bulkWrite operations for this chunk
    type BulkOperation = Parameters<typeof Job.bulkWrite>[0][number];
    const bulkOps: BulkOperation[] = [];
    const validItems = processedResults.filter((p): p is ProcessedItem => p !== null);

    for (const { normalized, existing } of validItems) {
      if (existing) {
        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: {
                ...normalized,
                slug: existing.slug,
                lastUpdated: new Date(),
              },
            },
          },
        });
        result.updatedJobs++;
      } else {
        const uniqueSlug = getUniqueSlug(normalized.slug!);
        normalized.slug = uniqueSlug;

        bulkOps.push({
          insertOne: {
            document: normalized,
          },
        });
        result.newJobs++;

        // Append to local candidates list for subsequent checks in this run
        activeCandidateList.push({
          title: normalized.title || '',
          organization: normalized.organization || '',
          totalVacancies: normalized.totalVacancies || 0,
        } as (typeof activeCandidates)[number]);
      }
    }

    // Execute bulk write in 1 roundtrip
    if (bulkOps.length > 0) {
      await Job.bulkWrite(bulkOps, { ordered: false });
    }

    processedSoFar += chunkItems.length;
    const elapsedSec = (Date.now() - startTime) / 1000;
    const currentRate = (processedSoFar / Math.max(1, elapsedSec)).toFixed(1);

    console.log(
      `[Scraper] Chunk ${c + 1}/${totalChunks}: ${processedSoFar}/${toProcess.length} items (${(
        (processedSoFar / toProcess.length) *
        100
      ).toFixed(0)}%) | Rate: ${currentRate} items/s`
    );

    if (options.onProgress) {
      options.onProgress(processedSoFar, toProcess.length, result);
    }
  }

  // 6. Fast single-sweep status flag update
  await updateJobStatusFlags();

  result.durationMs = Date.now() - startTime;
  result.itemsPerSecond = parseFloat((toProcess.length / (result.durationMs / 1000)).toFixed(2));

  console.log(
    `[Scraper] ✅ Completed ${source} in ${(result.durationMs / 1000).toFixed(2)}s (${result.itemsPerSecond} items/s):`,
    {
      newJobs: result.newJobs,
      updatedJobs: result.updatedJobs,
      skipped: result.skipped,
      errors: result.errors,
    }
  );

  return result;
}

/**
 * Runs all scrapers concurrently with batch pipeline
 */
export async function runAllScrapers(
  maxItemsOrOptions: number | RunScraperOptions = 50
): Promise<ScraperRunResult[]> {
  const options: RunScraperOptions =
    typeof maxItemsOrOptions === 'number'
      ? { maxItems: maxItemsOrOptions }
      : maxItemsOrOptions;

  const maxItems = options.maxItems || 50;
  console.log(`[Scraper Orchestrator] Running all scrapers concurrently (maxItems=${maxItems})...`);
  const startTime = Date.now();

  const settled = await Promise.allSettled([
    runScraperForSource('sarkariresult.com', options),
    runScraperForSource('sarkariresult.com.cm', options),
  ]);

  const results: ScraperRunResult[] = [];
  for (const res of settled) {
    if (res.status === 'fulfilled') {
      results.push(res.value);
    } else {
      console.error('[Scraper Orchestrator] Scraper source execution failed:', res.reason);
    }
  }

  // Single sweep to update overall flags
  await updateJobStatusFlags();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Scraper Orchestrator] All scrapers finished in ${totalTime}s.`);
  return results;
}

/**
 * Updates isActive and isEndingSoon flags based on current time
 */
export async function updateJobStatusFlags(): Promise<void> {
  await connectDB();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Mark expired jobs as inactive in 1 query
  await Job.updateMany(
    { applicationEndDate: { $lt: now }, isActive: true },
    { $set: { isActive: false, isEndingSoon: false } }
  );

  // Mark jobs ending within 7 days
  await Job.updateMany(
    {
      applicationEndDate: { $gte: now, $lte: sevenDaysFromNow },
      isActive: true,
    },
    { $set: { isEndingSoon: true } }
  );

  // Mark older jobs as not recent (older than 48 hours)
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  await Job.updateMany(
    { createdAt: { $lt: twoDaysAgo }, isRecent: true },
    { $set: { isRecent: false } }
  );
}
