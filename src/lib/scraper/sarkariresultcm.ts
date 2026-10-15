// ============================================================
// Scraper for sarkariresult.com.cm
// High-performance with persistent HTTP keep-alive & parallel listings
// ============================================================

import axios from 'axios';
import http from 'http';
import https from 'https';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent } from '@/lib/utils/userAgents';
import { cleanText } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://sarkariresult.com.cm';

const LISTING_PATHS: { path: string; postType: PostType }[] = [
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

// Persistent HTTP client with connection pooling and socket reuse
const httpClient = axios.create({
  timeout: 12000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 15, keepAliveMsecs: 30000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 15, keepAliveMsecs: 30000 }),
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});

httpClient.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRandomUserAgent();
  return config;
});

/**
 * Scrapes listing pages from sarkariresult.com.cm in parallel
 */
export async function scrapeSarkariResultCmListings(maxItemsPerCategory = 25): Promise<ScrapedJobListing[]> {
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();

  console.log(`[sarkariresult.com.cm] Fetching ${LISTING_PATHS.length} listing categories in parallel...`);

  const pagePromises = LISTING_PATHS.map(async ({ path, postType }) => {
    const url = `${BASE_URL}${path}`;
    try {
      const response = await httpClient.get(url);
      const $ = cheerio.load(response.data);
      const pageListings: ScrapedJobListing[] = [];
      let count = 0;

      $('ul li a, div.entry-content a, article h2 a').each((_, el) => {
        if (count >= maxItemsPerCategory) return false;

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

        const isExcluded = EXCLUDED_SLUGS.some((slug) => fullUrl.endsWith(slug) || fullUrl === `${BASE_URL}/`);
        if (isExcluded || !fullUrl.startsWith(BASE_URL)) return;

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
      console.warn(`[sarkariresult.com.cm] Error scraping listing ${url}:`, message);
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
 * Scrapes detail page from sarkariresult.com.cm
 */
export async function scrapeSarkariResultCmDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  try {
    const response = await httpClient.get(pageUrl);
    return parseSarkariDetailPage(response.data, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sarkariresult.com.cm] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
