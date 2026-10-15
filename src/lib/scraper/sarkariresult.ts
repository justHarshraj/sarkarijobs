// ============================================================
// Scraper for sarkariresult.com
// ============================================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent, sleep, getRandomDelay } from '@/lib/utils/userAgents';
import { cleanText, detectPostType } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://www.sarkariresult.com';

const TARGET_PAGES: { url: string; defaultType: PostType }[] = [
  { url: `${BASE_URL}/`, defaultType: 'Latest Job' },
  { url: `${BASE_URL}/latestjob/`, defaultType: 'Latest Job' },
  { url: `${BASE_URL}/admitcard/`, defaultType: 'Admit Card' },
  { url: `${BASE_URL}/result/`, defaultType: 'Result' },
];

function createHttpClient() {
  return axios.create({
    timeout: 15000,
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Scrapes listing page from sarkariresult.com and returns links to detail pages
 */
export async function scrapeSarkariResultListings(maxItemsPerCategory = 25): Promise<ScrapedJobListing[]> {
  const client = createHttpClient();
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();

  const detailUrlRegex = /\/(?:20\d\d|railway|ssc|upsc|bank|bihar|delhi|up|police|defence|medical|admission)\/[a-z0-9-]+/i;

  for (const { url, defaultType } of TARGET_PAGES) {
    try {
      console.log(`[sarkariresult.com] Fetching listing from: ${url}`);
      const response = await client.get(url);
      const $ = cheerio.load(response.data);

      let count = 0;
      $('a').each((_, el) => {
        if (count >= maxItemsPerCategory) return false;

        const $a = $(el);
        const title = cleanText($a.text());
        const href = $a.attr('href');

        if (!title || !href || title.length < 5) return;

        // Skip non-detail links
        if (!detailUrlRegex.test(href)) return;

        let fullUrl = href;
        try {
          fullUrl = new URL(href, BASE_URL).toString();
        } catch {
          return;
        }

        // Avoid index pages or duplicates
        if (visitedUrls.has(fullUrl) || fullUrl === `${BASE_URL}/`) {
          return;
        }

        visitedUrls.add(fullUrl);

        // Detect postType from title or defaultType
        const postType = detectPostType(title) || defaultType;

        listings.push({
          title,
          url: fullUrl,
          postType,
        });
        count++;
      });

      await sleep(getRandomDelay(800, 1500));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[sarkariresult.com] Error scraping listing ${url}:`, message);
    }
  }

  return listings;
}

/**
 * Scrapes a single detail page from sarkariresult.com
 */
export async function scrapeSarkariResultDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  const client = createHttpClient();

  try {
    const response = await client.get(pageUrl);
    return parseSarkariDetailPage(response.data, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sarkariresult.com] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
