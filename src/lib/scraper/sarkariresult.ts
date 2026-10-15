// ============================================================
// Scraper for sarkariresult.com
// High-performance with persistent HTTP keep-alive & parallel listings
// ============================================================

import axios from 'axios';
import http from 'http';
import https from 'https';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent } from '@/lib/utils/userAgents';
import { cleanText, detectPostType } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://www.sarkariresult.com';

const TARGET_PAGES: { url: string; defaultType: PostType }[] = [
  { url: `${BASE_URL}/`, defaultType: 'Latest Job' },
  { url: `${BASE_URL}/latestjob/`, defaultType: 'Latest Job' },
  { url: `${BASE_URL}/admitcard/`, defaultType: 'Admit Card' },
  { url: `${BASE_URL}/result/`, defaultType: 'Result' },
];

// Persistent HTTP client with connection pooling and socket reuse
const httpClient = axios.create({
  timeout: 12000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 15, keepAliveMsecs: 30000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 15, keepAliveMsecs: 30000 }),
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
  },
});

// Rotate user agent per request while keeping TCP/TLS connection alive
httpClient.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRandomUserAgent();
  return config;
});

/**
 * Scrapes listing pages from sarkariresult.com in parallel and returns links to detail pages
 */
export async function scrapeSarkariResultListings(maxItemsPerCategory = 25): Promise<ScrapedJobListing[]> {
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();
  const detailUrlRegex = /\/(?:20\d\d|railway|ssc|upsc|bank|bihar|delhi|up|police|defence|medical|admission)\/[a-z0-9-]+/i;

  console.log(`[sarkariresult.com] Fetching ${TARGET_PAGES.length} listing categories in parallel...`);

  const pagePromises = TARGET_PAGES.map(async ({ url, defaultType }) => {
    try {
      const response = await httpClient.get(url);
      const $ = cheerio.load(response.data);
      const pageListings: ScrapedJobListing[] = [];
      let count = 0;

      $('a').each((_, el) => {
        if (count >= maxItemsPerCategory) return false;

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

        const postType = detectPostType(title) || defaultType;
        pageListings.push({
          title,
          url: fullUrl,
          postType,
        });
        count++;
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
        }
      }
    }
  }

  return listings;
}

/**
 * Scrapes a single detail page from sarkariresult.com
 */
export async function scrapeSarkariResultDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  try {
    const response = await httpClient.get(pageUrl);
    return parseSarkariDetailPage(response.data, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sarkariresult.com] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
