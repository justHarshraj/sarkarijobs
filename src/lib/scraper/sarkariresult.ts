// ============================================================
// Scraper for sarkariresult.com
// High-performance with socket reuse, deep link harvest & auto-retry
// ============================================================

import axios, { AxiosError } from 'axios';
import http from 'http';
import https from 'https';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent } from '@/lib/utils/userAgents';
import { cleanText, detectPostType } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://www.sarkariresult.com';

export interface ListingScrapeOptions {
  category?: PostType | 'all';
  yearFilter?: number;
}

const ALL_TARGET_PAGES: { url: string; defaultType: PostType }[] = [
  { url: `${BASE_URL}/latestjob/`, defaultType: 'Latest Job' },
  { url: `${BASE_URL}/admitcard/`, defaultType: 'Admit Card' },
  { url: `${BASE_URL}/result/`, defaultType: 'Result' },
  { url: `${BASE_URL}/answerkey/`, defaultType: 'Answer Key' },
  { url: `${BASE_URL}/syllabus/`, defaultType: 'Syllabus' },
  { url: `${BASE_URL}/admission/`, defaultType: 'Admission' },
  { url: `${BASE_URL}/`, defaultType: 'Latest Job' },
];

// Persistent HTTP client with enlarged connection pool & aggressive socket reuse
const httpClient = axios.create({
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 60, keepAliveMsecs: 60000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 60, keepAliveMsecs: 60000 }),
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

// Rotate user agent per request
httpClient.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRandomUserAgent();
  return config;
});

/**
 * Executes a GET request with up to 2 retries and exponential backoff
 */
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
 * Scrapes listing pages from sarkariresult.com supporting deep pools & category filtering
 */
export async function scrapeSarkariResultListings(
  maxItems = 100,
  options: ListingScrapeOptions = {}
): Promise<ScrapedJobListing[]> {
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();
  const detailUrlRegex =
    /\/(?:20\d\d|railway|ssc|upsc|bank|bihar|delhi|up|police|defence|medical|admission)\/[a-z0-9-]+/i;

  const targetPages = options.category && options.category !== 'all'
    ? ALL_TARGET_PAGES.filter((p) => p.defaultType === options.category)
    : ALL_TARGET_PAGES;

  const pagesToScrape = targetPages.length > 0 ? targetPages : ALL_TARGET_PAGES;
  console.log(
    `[sarkariresult.com] Harvesting listing pool (target: up to ${maxItems} items across ${pagesToScrape.length} categories)...`
  );

  // Fetch listing pages in parallel
  const pagePromises = pagesToScrape.map(async ({ url, defaultType }) => {
    try {
      const html = await getWithRetry(url);
      const $ = cheerio.load(html);
      const pageListings: ScrapedJobListing[] = [];

      $('a').each((_, el) => {
        const $a = $(el);
        const title = cleanText($a.text());
        const href = $a.attr('href');

        if (!title || !href || title.length < 5) return;
        if (!detailUrlRegex.test(href)) return;

        let fullUrl = href;
        try {
          fullUrl = new URL(href, BASE_URL).toString();
        } catch {
          return;
        }

        if (fullUrl === `${BASE_URL}/`) return;

        // Year filter if requested (e.g. 2026)
        if (options.yearFilter) {
          const yearStr = String(options.yearFilter);
          if (!fullUrl.includes(yearStr) && !title.includes(yearStr)) {
            return;
          }
        }

        // Extract last date from title if present
        const dateMatch = title.match(/last\s*date\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        const lastDate = dateMatch ? dateMatch[1] : undefined;

        const postType = detectPostType(title) || defaultType;
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
      console.warn(`[sarkariresult.com] Error scraping listing ${url}:`, message);
      return [];
    }
  });

  const settled = await Promise.allSettled(pagePromises);
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      for (const item of result.value) {
        if (!visitedUrls.has(item.url)) {
          visitedUrls.add(item.url);
          listings.push(item);
          if (listings.length >= maxItems) break;
        }
      }
    }
    if (listings.length >= maxItems) break;
  }

  console.log(`[sarkariresult.com] Successfully harvested ${listings.length} candidate listings.`);
  return listings;
}

/**
 * Scrapes a single detail page from sarkariresult.com
 */
export async function scrapeSarkariResultDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  try {
    const html = await getWithRetry(pageUrl, 2);
    return parseSarkariDetailPage(html, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof AxiosError ? `${err.code || err.message}` : String(err);
    console.error(`[sarkariresult.com] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
