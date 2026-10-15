// ============================================================
// Scraper for sarkariresult.com.cm
// High-performance with socket reuse, deep link harvest & auto-retry
// ============================================================

import axios, { AxiosError } from 'axios';
import http from 'http';
import https from 'https';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent } from '@/lib/utils/userAgents';
import { cleanText } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://sarkariresult.com.cm';

export interface ListingScrapeOptions {
  category?: PostType | 'all';
  yearFilter?: number;
}

const ALL_LISTING_PATHS: { path: string; postType: PostType }[] = [
  { path: '/latest-jobs/', postType: 'Latest Job' },
  { path: '/admit-card/', postType: 'Admit Card' },
  { path: '/result/', postType: 'Result' },
  { path: '/answer-key/', postType: 'Answer Key' },
];

const EXCLUDED_SLUGS = [
  '/latest-jobs/',
  '/admit-card/',
  '/result/',
  '/admission/',
  '/syllabus/',
  '/answer-key/',
  '/contact/',
  '/privacy-policy/',
  '/disclaimer/',
  '/about-us/',
];

// Persistent HTTP client with enlarged connection pool & socket reuse
const httpClient = axios.create({
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 60, keepAliveMsecs: 60000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 60, keepAliveMsecs: 60000 }),
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

httpClient.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRandomUserAgent();
  return config;
});

async function getWithRetry(url: string, retries = 2): Promise<string> {
  let attempt = 0;
  while (true) {
    try {
      const response = await httpClient.get<string>(url);
      return response.data;
    } catch (err: unknown) {
      attempt++;
      if (attempt > retries) throw err;
      const delay = attempt * 800 + Math.random() * 400;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Scrapes listing pages from sarkariresult.com.cm supporting deep pools
 */
export async function scrapeSarkariResultCmListings(
  maxItems = 100,
  options: ListingScrapeOptions = {}
): Promise<ScrapedJobListing[]> {
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();

  const targetPaths = options.category && options.category !== 'all'
    ? ALL_LISTING_PATHS.filter((p) => p.postType === options.category)
    : ALL_LISTING_PATHS;

  const pathsToScrape = targetPaths.length > 0 ? targetPaths : ALL_LISTING_PATHS;
  console.log(
    `[sarkariresult.com.cm] Harvesting listing pool (target: up to ${maxItems} items across ${pathsToScrape.length} paths)...`
  );

  const pagePromises = pathsToScrape.map(async ({ path, postType }) => {
    const url = `${BASE_URL}${path}`;
    try {
      const html = await getWithRetry(url);
      const $ = cheerio.load(html);
      const pageListings: ScrapedJobListing[] = [];

      $('ul li a, div.entry-content a, article h2 a').each((_, el) => {
        const $a = $(el);
        const title = cleanText($a.text());
        const href = $a.attr('href');

        if (!title || !href || title.length < 5) return;

        let fullUrl = href;
        try {
          fullUrl = new URL(href, BASE_URL).toString();
        } catch {
          return;
        }

        const isExcluded = EXCLUDED_SLUGS.some(
          (slug) => fullUrl.endsWith(slug) || fullUrl === `${BASE_URL}/`
        );
        if (isExcluded || !fullUrl.startsWith(BASE_URL)) return;

        if (options.yearFilter) {
          const yearStr = String(options.yearFilter);
          if (!fullUrl.includes(yearStr) && !title.includes(yearStr)) {
            return;
          }
        }

        const dateMatch = title.match(/last\s*date\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        const lastDate = dateMatch ? dateMatch[1] : undefined;

        pageListings.push({
          title,
          url: fullUrl,
          postType,
          lastDate,
        });
      });

      return pageListings;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[sarkariresult.com.cm] Error scraping listing ${url}:`, message);
      return [];
    }
  });

  const settled = await Promise.allSettled(pagePromises);
  const categoryPools: ScrapedJobListing[][] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      categoryPools.push(result.value);
    }
  }

  // Interleave across categories so Admit Card, Result, etc. get fair quota
  const perCategoryQuota = Math.max(30, Math.ceil(maxItems / Math.max(1, categoryPools.length)));

  for (const pool of categoryPools) {
    let addedForCategory = 0;
    for (const item of pool) {
      if (addedForCategory >= perCategoryQuota) break;
      if (!visitedUrls.has(item.url)) {
        visitedUrls.add(item.url);
        listings.push(item);
        addedForCategory++;
        if (listings.length >= maxItems) break;
      }
    }
    if (listings.length >= maxItems) break;
  }

  // Fill remainder if any
  if (listings.length < maxItems) {
    for (const pool of categoryPools) {
      for (const item of pool) {
        if (!visitedUrls.has(item.url)) {
          visitedUrls.add(item.url);
          listings.push(item);
          if (listings.length >= maxItems) break;
        }
      }
      if (listings.length >= maxItems) break;
    }
  }

  console.log(`[sarkariresult.com.cm] Successfully harvested ${listings.length} candidate listings.`);
  return listings;
}

/**
 * Scrapes detail page from sarkariresult.com.cm
 */
export async function scrapeSarkariResultCmDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  try {
    const html = await getWithRetry(pageUrl, 2);
    return parseSarkariDetailPage(html, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof AxiosError ? `${err.code || err.message}` : String(err);
    console.error(`[sarkariresult.com.cm] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
