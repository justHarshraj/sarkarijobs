// ============================================================
// Date Parser — Handles all Indian date formats from scraped sites
// ============================================================

const MONTH_MAP: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

/**
 * Parses Indian date formats into a standard Date object.
 *
 * Supported formats:
 * - "15/10/2026"            (DD/MM/YYYY)
 * - "15-10-2026"            (DD-MM-YYYY)
 * - "15.10.2026"            (DD.MM.YYYY)
 * - "15 October 2026"       (DD Month YYYY)
 * - "October 15, 2026"      (Month DD, YYYY)
 * - "15 Oct 2026"           (DD Mon YYYY)
 * - "2026-10-15"            (YYYY-MM-DD — ISO)
 *
 * Returns null for unparseable strings like "As per Schedule", "District Wise", etc.
 */
export function parseIndianDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const cleaned = dateStr.trim();

  // Skip known non-date strings
  const skipPatterns = [
    /as per/i, /schedule/i, /district wise/i, /before exam/i,
    /days?\s*before/i, /notify later/i, /will be/i, /available/i,
    /update soon/i, /coming soon/i,
  ];
  if (skipPatterns.some((p) => p.test(cleaned))) return null;

  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const slashMatch = cleaned.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(slashMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  // Pattern 2: YYYY-MM-DD (ISO)
  const isoMatch = cleaned.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  // Pattern 3: DD Month YYYY or DD Mon YYYY
  const dmy = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const monthName = dmy[2].toLowerCase();
    const year = parseInt(dmy[3], 10);
    if (MONTH_MAP[monthName] !== undefined) {
      return new Date(year, MONTH_MAP[monthName], day);
    }
  }

  // Pattern 4: Month DD, YYYY or Mon DD, YYYY
  const mdy = cleaned.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdy) {
    const monthName = mdy[1].toLowerCase();
    const day = parseInt(mdy[2], 10);
    const year = parseInt(mdy[3], 10);
    if (MONTH_MAP[monthName] !== undefined) {
      return new Date(year, MONTH_MAP[monthName], day);
    }
  }

  // Pattern 5: Month YYYY (approximate — first of month)
  const my = cleaned.match(/^(\w+)\s+(\d{4})$/);
  if (my) {
    const monthName = my[1].toLowerCase();
    const year = parseInt(my[2], 10);
    if (MONTH_MAP[monthName] !== undefined) {
      return new Date(year, MONTH_MAP[monthName], 1);
    }
  }

  return null;
}

/**
 * Formats a Date to YYYY-MM-DD string.
 */
export function formatDateISO(date: Date | null): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date to Indian display format DD/MM/YYYY.
 */
export function formatDateIndian(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Extracts a date from a text string that may contain a date somewhere within it.
 * E.g., "Last Date : 06/11/2026" → Date(2026, 10, 6)
 */
export function extractDateFromText(text: string): Date | null {
  if (!text) return null;

  // Try to find DD/MM/YYYY pattern in the text
  const match = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (match) {
    return parseIndianDate(match[0]);
  }

  // Try month name patterns
  const monthMatch = text.match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  );
  if (monthMatch) {
    return parseIndianDate(monthMatch[0]);
  }

  return null;
}

/**
 * Calculates days remaining until a date.
 */
export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
