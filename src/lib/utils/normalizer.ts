// ============================================================
// Data Normalizer — Cleans and standardizes scraped job data
// ============================================================

import type { JobCategory, Qualification, PostType } from '@/types';
import { CATEGORIES } from '@/lib/constants/categories';
import { INDIAN_STATES } from '@/lib/constants/states';

/**
 * Cleans raw string: removes multiple spaces, line breaks, zero-width chars
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standardizes raw job title
 */
export function normalizeTitle(rawTitle: string): string {
  let title = cleanText(rawTitle);

  // Remove trailing "Apply Online", "Online Form", date hints if in title
  title = title.replace(/\s*-\s*Apply\s+Online.*$/i, '');
  title = title.replace(/\s*\(\s*Last\s+Date\s*:\s*.*?\)/i, '');

  return title.trim();
}

/**
 * Detects PostType from title / context
 */
export function detectPostType(text: string): PostType {
  const lower = text.toLowerCase();
  if (lower.includes('result') || lower.includes('marks') || lower.includes('score card')) {
    return 'Result';
  }
  if (lower.includes('admit card') || lower.includes('hall ticket') || lower.includes('call letter')) {
    return 'Admit Card';
  }
  if (lower.includes('answer key') || lower.includes('objection')) {
    return 'Answer Key';
  }
  if (lower.includes('admission') || lower.includes('entrance') || lower.includes('counseling')) {
    return 'Admission';
  }
  if (lower.includes('syllabus') || lower.includes('exam pattern')) {
    return 'Syllabus';
  }
  return 'Latest Job';
}

/**
 * Auto-categorizes based on title and organization keywords
 */
export function normalizeCategory(title: string, organization = ''): JobCategory {
  const combined = `${title} ${organization}`.toLowerCase();

  for (const cat of CATEGORIES) {
    if (cat.name === 'Other') continue;
    for (const kw of cat.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(combined)) {
        return cat.name;
      }
    }
  }

  return 'Other';
}

/**
 * Detects state from title, organization, or location string
 */
export function normalizeState(text: string): string {
  const lower = text.toLowerCase();

  for (const state of INDIAN_STATES) {
    if (state.name === 'All India') continue;
    // Check state name or aliases
    for (const alias of state.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lower)) {
        return state.name;
      }
    }
  }

  return 'All India';
}

/**
 * Extracts qualifications from eligibility text
 */
export function normalizeQualification(text: string): Qualification[] {
  if (!text) return ['Any'];
  const lower = text.toLowerCase();
  const quals = new Set<Qualification>();

  if (/10th|matric|high school|sslc/i.test(lower)) quals.add('10th Pass');
  if (/12th|intermediate|10\+2|higher secondary/i.test(lower)) quals.add('12th Pass');
  if (/iti\b/i.test(lower)) quals.add('ITI');
  if (/diploma/i.test(lower)) quals.add('Diploma');
  if (/b\.?e\.?|b\.?tech|engineering|m\.?tech/i.test(lower)) quals.add('Engineering');
  if (/mbbs|bds|bams|bhms|nursing|gnm|pharma|medical/i.test(lower)) quals.add('Medical');
  if (/llb|llm|law/i.test(lower)) quals.add('Law');
  if (/b\.?ed|d\.?el\.?ed|btc/i.test(lower)) quals.add('B.Ed');
  if (/master|m\.?a|m\.?sc|m\.?com|post\s*graduate|pg\b/i.test(lower)) quals.add('Post Graduate');
  if (/bachelor|degree|graduate|b\.?a|b\.?sc|b\.?com/i.test(lower)) quals.add('Graduate');
  if (/8th|middle pass/i.test(lower)) quals.add('8th Pass');

  if (quals.size === 0) quals.add('Any');
  return Array.from(quals);
}

/**
 * Extracts total vacancies from vacancy string (e.g. "3548 Post" or "Total : 3548")
 */
export function normalizeVacancies(text: string): number {
  if (!text) return 0;
  const cleaned = cleanText(text);

  const match = cleaned.match(/(\d[\d,]*)\s*(?:Post|Vacancy|Vacancies|Seats?)/i) ||
                cleaned.match(/(?:Total|Vacancy|Vacancies)\s*[:=-]?\s*(\d[\d,]*)/i) ||
                cleaned.match(/^(\d[\d,]*)$/);

  if (match) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

/**
 * Extracts currency fee from text (e.g. "500/-" or "Rs. 250" or "Nil" or "0")
 */
export function normalizeFee(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (/nil|free|no fee|0\/-|zero/i.test(lower)) return 0;

  const match = text.match(/(?:₹|rs\.?|inr)?\s*(\d+)(?:\/-|\s*rupees)?/i);
  if (match) {
    const fee = parseInt(match[1], 10);
    return isNaN(fee) ? null : fee;
  }
  return null;
}

/**
 * Parses age limits from text
 */
export function normalizeAge(text: string): { min: number | null; max: number | null; relaxation: string } {
  const result: { min: number | null; max: number | null; relaxation: string } = {
    min: null,
    max: null,
    relaxation: '',
  };

  if (!text) return result;

  const minMatch = text.match(/min(?:imum)?(?:\s*age)?\s*[:=-]?\s*(\d+)/i) ||
                   text.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years?/i);

  if (minMatch) {
    if (minMatch[2]) {
      result.min = parseInt(minMatch[1], 10);
      result.max = parseInt(minMatch[2], 10);
    } else {
      result.min = parseInt(minMatch[1], 10);
    }
  }

  const maxMatch = text.match(/max(?:imum)?(?:\s*age)?\s*[:=-]?\s*(\d+)/i);
  if (maxMatch) {
    result.max = parseInt(maxMatch[1], 10);
  }

  if (/relaxation/i.test(text)) {
    const relaxMatch = text.match(/age\s*relaxation.*$/i);
    result.relaxation = relaxMatch ? cleanText(relaxMatch[0]) : 'As per rules';
  }

  return result;
}
