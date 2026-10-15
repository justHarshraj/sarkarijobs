// ============================================================
// HTML Parser for Sarkari Job Portals using Cheerio
// ============================================================

import * as cheerio from 'cheerio';
import type { ScrapedJobDetail, VacancyBreakdown, AdditionalLink } from '@/types';
import { cleanText, normalizeVacancies } from '@/lib/utils/normalizer';

/**
 * Extracts all relevant tables, dates, fees, age, vacancies, and links from detail page
 */
export function parseSarkariDetailPage(html: string, pageUrl: string): ScrapedJobDetail {
  const $ = cheerio.load(html);

  // 1. Title & Header
  let title = $('h1').first().text() || $('h2').first().text() || $('title').text();
  title = cleanText(title);
  title = title.replace(/\s*[-–|]\s*Sarkari\s*Result.*$/i, '').trim();

  // Organization
  let organization = '';
  const orgCandidate = $('h2, h3, table b, table strong')
    .map((_, el) => $(el).text())
    .get()
    .find((text) => /recruitment|commission|board|railway|police|bank|service|department|army|navy|air force|dsssb/i.test(text));
  organization = orgCandidate ? cleanText(orgCandidate) : '';

  // Short Description / Overview
  let shortDescription = '';
  const firstParagraph = $('table td p, div.entry-content p, #content p, table p').first().text();
  shortDescription = cleanText(firstParagraph);

  // Important Dates & Application Fee
  const importantDates: Record<string, string> = {};
  const applicationFee: Record<string, string> = {};
  const ageLimit: Record<string, string> = {};

  $('table td, table th, ul li, p').each((_, el) => {
    const text = cleanText($(el).text());
    if (!text || text.length > 250) return;

    // Dates matching
    if (/application\s*begin/i.test(text)) importantDates['applicationStartDate'] = text;
    if (/last\s*date\s*for\s*apply/i.test(text) || /last\s*date\s*to\s*apply/i.test(text) || /last\s*date\s*:/i.test(text)) {
      importantDates['applicationEndDate'] = text;
    }
    if (/fee\s*payment\s*last/i.test(text) || /pay\s*exam\s*fee/i.test(text)) {
      importantDates['feePaymentLastDate'] = text;
    }
    if (/correction\s*date|correction\s*window/i.test(text)) {
      importantDates['correctionWindow'] = text;
    }
    if (/exam\s*date/i.test(text) && !importantDates['examDate']) {
      importantDates['examDate'] = text;
    }
    if (/admit\s*card/i.test(text) && !importantDates['admitCardDate'] && text.length < 80) {
      importantDates['admitCardDate'] = text;
    }

    // Fee matching: Must contain fee/currency indicators and not be educational eligibility
    const isFeeLike = /(?:₹|rs\.?|inr|\/-|fee|nil|free|exempt|zero|0\b)/i.test(text);
    const isEligibilityLike = /%|marks\b|degree\b|diploma\b|passed\b/i.test(text);

    if (isFeeLike && !isEligibilityLike) {
      if (/general\s*\/\s*obc/i.test(text) || /gen\s*\/\s*obc/i.test(text)) {
        applicationFee['general'] = text;
      } else if (/obc\b/i.test(text) && !applicationFee['obc']) {
        applicationFee['obc'] = text;
      }
      if (/sc\s*\/\s*st/i.test(text)) {
        applicationFee['scst'] = text;
      }
      if (/female/i.test(text)) {
        applicationFee['female'] = text;
      }
      if (/ph\s*\(|divyang/i.test(text)) {
        applicationFee['ph'] = text;
      }
    }

    // Age matching
    if (/minimum\s*age/i.test(text) || /min\s*age/i.test(text)) {
      ageLimit['minimum'] = text;
    }
    if (/maximum\s*age/i.test(text) || /max\s*age/i.test(text)) {
      ageLimit['maximum'] = text;
    }
    if (/age\s*as\s*on/i.test(text) || /age\s*limit\s*as\s*on/i.test(text)) {
      ageLimit['asOn'] = text;
    }
    if (/age\s*relaxation/i.test(text)) {
      ageLimit['relaxation'] = text;
    }
  });

  // Vacancy Breakdown table
  const vacancyDetails: VacancyBreakdown[] = [];
  $('table').each((_, tbl) => {
    const $tbl = $(tbl);
    const tableText = $tbl.text();
    if (!/post\s*name|eligibility|total\s*post|stream/i.test(tableText)) return;

    $tbl.find('tr').each((idx, row) => {
      if (idx === 0) return; // skip header
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const postName = cleanText($(cells[0]).text());
        const countStr = cells.length >= 3 ? cleanText($(cells[1]).text()) : cleanText($(cells[1]).text());
        const eligibility = cells.length >= 3 ? cleanText($(cells[2]).text()) : '';
        const count = normalizeVacancies(countStr);

        if (postName && (count > 0 || eligibility)) {
          vacancyDetails.push({
            postName,
            count: count || 1,
            eligibility: eligibility || postName,
          });
        }
      }
    });
  });

  // Important Links Extraction
  const importantLinks: AdditionalLink[] = [];
  let applyOnlineUrl = '';
  let notificationPdfUrl = '';
  let officialWebsiteUrl = '';

  const isAggregatorHomepage = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      if (urlStr === pageUrl) return true;
      const isAggregator = parsed.hostname.includes('sarkariresult');
      if (isAggregator && (parsed.pathname === '/' || parsed.pathname === '')) return true;
      return false;
    } catch {
      return true;
    }
  };

  // Scan table rows for context-rich link labels
  $('table tr').each((_, tr) => {
    const rowText = cleanText($(tr).text());
    const $links = $(tr).find('a');

    $links.each((_, a) => {
      const href = $(a).attr('href')?.trim();
      const rawLinkText = cleanText($(a).text());
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      let absoluteUrl = href;
      try {
        absoluteUrl = new URL(href, pageUrl).toString();
      } catch {
        return;
      }

      if (isAggregatorHomepage(absoluteUrl)) return;

      // Determine label from rowText or linkText
      const rowWithoutClickHere = rowText.replace(/click\s*here/gi, '').trim();
      const label = rowWithoutClickHere || rawLinkText || 'Official Link';

      const isPdf = /\.pdf(?:$|\?)/i.test(absoluteUrl);
      const isNotificationRow = /download\s*notification|detailed\s*notification|official\s*notice|view\s*notification/i.test(rowText);

      if (/apply\s*online|online\s*apply|registration|online\s*form/i.test(rowText)) {
        if (!applyOnlineUrl) applyOnlineUrl = absoluteUrl;
        importantLinks.push({ label: 'Apply Online', url: absoluteUrl });
      } else if (isPdf || isNotificationRow) {
        // Prefer actual PDF file if found
        if (!notificationPdfUrl || isPdf) {
          notificationPdfUrl = absoluteUrl;
        }
        importantLinks.push({ label: 'Download Notification PDF', url: absoluteUrl });
      } else if (/official\s*website/i.test(rowText)) {
        if (!officialWebsiteUrl) officialWebsiteUrl = absoluteUrl;
        importantLinks.push({ label: 'Official Website', url: absoluteUrl });
      } else if (label.length > 2 && label.length < 90) {
        importantLinks.push({ label, url: absoluteUrl });
      }
    });
  });

  // Fallback to general links if table rows didn't catch apply / PDF
  if (!applyOnlineUrl || !notificationPdfUrl) {
    $('a').each((_, a) => {
      const href = $(a).attr('href')?.trim();
      const text = cleanText($(a).text());
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      let absoluteUrl = href;
      try {
        absoluteUrl = new URL(href, pageUrl).toString();
      } catch {
        return;
      }

      if (isAggregatorHomepage(absoluteUrl)) return;

      const isPdf = /\.pdf(?:$|\?)/i.test(absoluteUrl);

      if (!applyOnlineUrl && /apply\s*online|registration/i.test(text)) {
        applyOnlineUrl = absoluteUrl;
        importantLinks.push({ label: 'Apply Online', url: absoluteUrl });
      }
      if ((!notificationPdfUrl || isPdf) && (/download\s*notification/i.test(text) || isPdf)) {
        notificationPdfUrl = absoluteUrl;
        importantLinks.push({ label: 'Download Notification PDF', url: absoluteUrl });
      }
      if (!officialWebsiteUrl && /official\s*website/i.test(text)) {
        officialWebsiteUrl = absoluteUrl;
      }
    });
  }

  return {
    title,
    organization: organization || 'Government Organization',
    shortDescription,
    importantDates,
    applicationFee,
    ageLimit,
    vacancyDetails,
    importantLinks,
    applyOnlineUrl,
    notificationPdfUrl,
    officialWebsiteUrl,
    sourceUrl: pageUrl,
  };
}
