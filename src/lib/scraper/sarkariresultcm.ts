// ============================================================
// Scraper for sarkariresult.com.cm
// ============================================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ScrapedJobListing, ScrapedJobDetail, PostType } from '@/types';
import { getRandomUserAgent, sleep, getRandomDelay } from '@/lib/utils/userAgents';
import { cleanText } from '@/lib/utils/normalizer';
import { parseSarkariDetailPage } from './parser';

const BASE_URL = 'https://sarkariresult.com.cm';

const LISTING_PATHS: { path: string; postType: PostType }[] = [
  { path: '/latest-jobs/', postType: 'Latest Job' },
  { path: '/admit-card/', postType: 'Admit Card' },
  { path: '/result/', postType: 'Result' },
  { path: '/answer-key/', postType: 'Answer Key' },
];

function createHttpClient() {
  return axios.create({
    timeout: 15000,
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    },
  });
}

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

/**
 * Scrapes listing page from sarkariresult.com.cm
 */
export async function scrapeSarkariResultCmListings(maxItemsPerCategory = 25): Promise<ScrapedJobListing[]> {
  const client = createHttpClient();
  const listings: ScrapedJobListing[] = [];
  const visitedUrls = new Set<string>();

  for (const { path, postType } of LISTING_PATHS) {
    const url = `${BASE_URL}${path}`;
    try {
      console.log(`[sarkariresult.com.cm] Fetching listing from: ${url}`);
      const response = await client.get(url);
      const $ = cheerio.load(response.data);

      let count = 0;
      // Target job post links inside lists, articles, or entry contents
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

        // Filter out non-job and static pages
        const isExcluded = EXCLUDED_SLUGS.some((slug) => fullUrl.endsWith(slug) || fullUrl === `${BASE_URL}/`);
        if (isExcluded || visitedUrls.has(fullUrl)) return;

        // Detail pages are usually slug-based on the domain
        if (!fullUrl.startsWith(BASE_URL)) return;

        visitedUrls.add(fullUrl);
        listings.push({
          title,
          url: fullUrl,
          postType,
        });
        count++;
      });

      await sleep(getRandomDelay(1000, 2000));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[sarkariresult.com.cm] Error scraping listing ${url}:`, message);
    }
  }

  return listings;
}

/**
 * Scrapes detail page from sarkariresult.com.cm
 */
export async function scrapeSarkariResultCmDetail(pageUrl: string): Promise<ScrapedJobDetail | null> {
  const client = createHttpClient();

  try {
    const response = await client.get(pageUrl);
    return parseSarkariDetailPage(response.data, pageUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sarkariresult.com.cm] Error scraping detail page ${pageUrl}:`, message);
    return null;
  }
}
