// ============================================================
// Scraper Orchestrator — Coordinates extraction, normalization,
// deduplication, and persistence into MongoDB.
// ============================================================

import { connectDB } from '@/lib/db/connect';
import Job from '@/lib/db/models/Job';
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
 * Runs the scraper for a specific source
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

  const result: ScraperRunResult = {
    source,
    totalFound: listings.length,
    newJobs: 0,
    updatedJobs: 0,
    skipped: 0,
    errors: 0,
    durationMs: 0,
  };

  console.log(`[Scraper Orchestrator] ${source}: Found ${listings.length} listings. Beginning processing...`);

  for (const item of listings) {
    try {
      // 1. Check if job already exists by sourceUrl
      const existingJob = await Job.findOne({ sourceUrl: item.url });

      // If exists and scraped recently (within 24 hours), skip to be polite
      if (existingJob) {
        const lastScraped = new Date(existingJob.scrapedAt).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - lastScraped < oneDay) {
          result.skipped++;
          continue;
        }
      }

      // 2. Fetch detail page
      let detail: ScrapedJobDetail | null = null;
      if (source === 'sarkariresult.com') {
        detail = await scrapeSarkariResultDetail(item.url);
      } else {
        detail = await scrapeSarkariResultCmDetail(item.url);
      }

      if (!detail || !detail.title) {
        result.errors++;
        continue;
      }

      // 3. Normalize data
      const normalized = normalizeScrapedJob(detail, item, source);

      // 4. Deduplication Check against existing jobs from OTHER sources
      if (!existingJob) {
        const candidate = await Job.findOne({
          state: normalized.state,
          category: normalized.category,
        }).select('title organization totalVacancies sourceUrl');

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
          console.log(`[Deduplicator] Job already exists across sources: "${normalized.title}" matches "${candidate.title}". Linking.`);
          result.skipped++;
          continue;
        }
      }

      // 5. Upsert Job into MongoDB
      if (existingJob) {
        // Only update if sourceHash changed or refreshing status
        await Job.updateOne(
          { _id: existingJob._id },
          {
            $set: {
              ...normalized,
              slug: existingJob.slug, // preserve existing slug
              lastUpdated: new Date(),
            },
          }
        );
        result.updatedJobs++;
      } else {
        // Ensure slug uniqueness
        let slug = normalized.slug!;
        const slugExists = await Job.findOne({ slug });
        if (slugExists) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
          normalized.slug = slug;
        }

        await Job.create(normalized);
        result.newJobs++;
      }

      // Polite delay between detail requests
      await sleep(getRandomDelay(1500, 3000));
    } catch (err: unknown) {
      result.errors++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Scraper Orchestrator] Error processing ${item.url}:`, message);
    }
  }

  // Update overall flags (isActive, isEndingSoon) for all jobs in database
  await updateJobStatusFlags();

  result.durationMs = Date.now() - startTime;
  console.log(`[Scraper Orchestrator] Completed ${source}:`, result);
  return result;
}

/**
 * Runs all scrapers sequentially
 */
export async function runAllScrapers(maxItems = 25): Promise<ScraperRunResult[]> {
  const results: ScraperRunResult[] = [];
  try {
    const res1 = await runScraperForSource('sarkariresult.com', maxItems);
    results.push(res1);
  } catch (err) {
    console.error('Error running sarkariresult.com scraper:', err);
  }

  try {
    const res2 = await runScraperForSource('sarkariresult.com.cm', maxItems);
    results.push(res2);
  } catch (err) {
    console.error('Error running sarkariresult.com.cm scraper:', err);
  }

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
