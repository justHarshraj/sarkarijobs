// ============================================================
// Scraper Orchestrator — High Performance & Efficient
// Coordinates extraction, batch pre-filtering, concurrency pooling,
// deduplication, and persistence into MongoDB.
// ============================================================

import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
import type { Types } from 'mongoose';
import type { IJob, ScrapedJobListing, ScrapedJobDetail } from '@/types';
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
import { sleep, getRandomDelay } from '@/lib/utils/userAgents';
import { asyncPool } from '@/lib/utils/asyncPool';

export interface ScraperRunResult {
  source: string;
  totalFound: number;
  newJobs: number;
  updatedJobs: number;
  skipped: number;
  errors: number;
  durationMs: number;
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

  // Parse total vacancies: either sum from breakdown or parsed from text
  let totalVacancies = 0;
  if (detail.vacancyDetails && detail.vacancyDetails.length > 0) {
    totalVacancies = detail.vacancyDetails.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }
  if (!totalVacancies) {
    totalVacancies = normalizeVacancies(title) || normalizeVacancies(detail.shortDescription);
  }

  // Parse qualifications from vacancy details eligibility
  const eligibilityCombined = detail.vacancyDetails
    .map((v) => v.eligibility)
    .join(' ');
  const qualification = normalizeQualification(`${eligibilityCombined} ${title} ${detail.shortDescription}`);

  // Parse dates
  const startDate = detail.importantDates['applicationStartDate']
    ? parseIndianDate(detail.importantDates['applicationStartDate'])
    : null;
  const endDate = detail.importantDates['applicationEndDate']
    ? parseIndianDate(detail.importantDates['applicationEndDate'])
    : null;
  const feeDate = detail.importantDates['feePaymentLastDate']
    ? parseIndianDate(detail.importantDates['feePaymentLastDate'])
    : null;

  // Parse fees
  const feeGeneral = normalizeFee(detail.applicationFee['general'] || '');
  const feeOBC = normalizeFee(detail.applicationFee['general'] || '');
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
 * Runs the scraper for a specific source with batch pre-filtering and controlled concurrency
 */
export async function runScraperForSource(
  source: 'sarkariresult.com' | 'sarkariresult.com.cm',
  maxItems = 30
): Promise<ScraperRunResult> {
  const startTime = Date.now();
  await connectDB();

  let listings: ScrapedJobListing[] = [];
  if (source === 'sarkariresult.com') {
    listings = await scrapeSarkariResultListings(maxItems);
  } else {
    listings = await scrapeSarkariResultCmListings(maxItems);
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
  };

  if (uniqueListings.length === 0) {
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // 1. Batch Query: Find existing jobs in MongoDB with a single query
  const listingUrls = uniqueListings.map((l) => l.url);
  const existingJobs = await Job.find(
    { sourceUrl: { $in: listingUrls } },
    'sourceUrl scrapedAt slug sourceHash'
  ).lean();

  interface ExistingJobRecord {
    _id: Types.ObjectId;
    sourceUrl: string;
    scrapedAt: Date;
    slug: string;
    sourceHash?: string;
  }

  const existingMap = new Map<string, ExistingJobRecord>();
  for (const job of existingJobs) {
    existingMap.set(job.sourceUrl, job as unknown as ExistingJobRecord);
  }

  // 2. Pre-filter: Separate fresh jobs (<24 hours) from jobs that need scraping
  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const toProcess: ScrapedJobListing[] = [];

  for (const item of uniqueListings) {
    const existing = existingMap.get(item.url);
    if (existing && existing.scrapedAt) {
      const lastScrapedTime = new Date(existing.scrapedAt).getTime();
      if (now - lastScrapedTime < oneDayMs) {
        result.skipped++;
        continue;
      }
    }
    toProcess.push(item);
  }

  console.log(
    `[Scraper Orchestrator] ${source}: ${uniqueListings.length} total, ${result.skipped} fresh (skipped), ${toProcess.length} to process.`
  );

  // 3. Process remaining jobs with controlled concurrency (4 workers)
  if (toProcess.length > 0) {
    const CONCURRENCY_LIMIT = 4;
    await asyncPool(CONCURRENCY_LIMIT, toProcess, async (item) => {
      try {
        // Fetch detail page using keep-alive client
        let detail: ScrapedJobDetail | null = null;
        if (source === 'sarkariresult.com') {
          detail = await scrapeSarkariResultDetail(item.url);
        } else {
          detail = await scrapeSarkariResultCmDetail(item.url);
        }

        if (!detail || !detail.title) {
          result.errors++;
          return;
        }

        // Normalize
        const normalized = normalizeScrapedJob(detail, item, source);
        const existingJob = existingMap.get(item.url);

        // Deduplication check across sources (only for new jobs)
        if (!existingJob) {
          const candidate = await Job.findOne({
            state: normalized.state,
            category: normalized.category,
          })
            .select('title organization totalVacancies sourceUrl')
            .lean();

          if (
            candidate &&
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
          ) {
            console.log(`[Deduplicator] Cross-source duplicate detected: "${normalized.title}". Skipping.`);
            result.skipped++;
            return;
          }
        }

        // Upsert into MongoDB
        if (existingJob) {
          await Job.updateOne(
            { _id: existingJob._id },
            {
              $set: {
                ...normalized,
                slug: existingJob.slug,
                lastUpdated: new Date(),
              },
            }
          );
          result.updatedJobs++;
        } else {
          let slug = normalized.slug!;
          const slugExists = await Job.findOne({ slug }).select('_id').lean();
          if (slugExists) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
            normalized.slug = slug;
          }

          await Job.create(normalized);
          result.newJobs++;
        }

        // Polite micro-jitter delay per worker (150-350ms)
        await sleep(getRandomDelay(150, 350));
      } catch (err: unknown) {
        result.errors++;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Scraper Orchestrator] Error processing ${item.url}:`, message);
      }
    });
  }

  // Update status flags
  await updateJobStatusFlags();

  result.durationMs = Date.now() - startTime;
  console.log(`[Scraper Orchestrator] Completed ${source} in ${(result.durationMs / 1000).toFixed(2)}s:`, result);
  return result;
}

/**
 * Runs all scrapers concurrently
 */
export async function runAllScrapers(maxItems = 25): Promise<ScraperRunResult[]> {
  console.log(`[Scraper Orchestrator] Running all scrapers concurrently (maxItems=${maxItems})...`);
  const startTime = Date.now();

  const settled = await Promise.allSettled([
    runScraperForSource('sarkariresult.com', maxItems),
    runScraperForSource('sarkariresult.com.cm', maxItems),
  ]);

  const results: ScraperRunResult[] = [];
  for (const res of settled) {
    if (res.status === 'fulfilled') {
      results.push(res.value);
    } else {
      console.error('[Scraper Orchestrator] Scraper source execution failed:', res.reason);
    }
  }

  // Single sweep to update overall flags after all sources complete
  await updateJobStatusFlags();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Scraper Orchestrator] All scrapers completed in ${totalTime}s.`);
  return results;
}

/**
 * Updates isActive and isEndingSoon flags based on current time
 */
export async function updateJobStatusFlags(): Promise<void> {
  await connectDB();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Mark expired jobs as inactive
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
