// ============================================================
// Deduplication Engine — Multi-layer deduplication & hashing
// ============================================================

import crypto from 'crypto';

/**
 * Generates an MD5 content hash for change detection & deduplication
 */
export function generateContentHash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Calculates Token Similarity (Jaccard Index) between two strings
 * Range: 0.0 (completely distinct) to 1.0 (identical)
 */
export function calculateTitleSimilarity(titleA: string, titleB: string): number {
  const tokenize = (str: string): Set<string> => {
    return new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((token) => token.length > 2)
    );
  };

  const tokensA = tokenize(titleA);
  const tokensB = tokenize(titleB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Checks if two jobs are duplicates based on similarity threshold
 */
export function isDuplicateJob(
  jobA: { title: string; organization?: string; totalVacancies?: number },
  jobB: { title: string; organization?: string; totalVacancies?: number },
  threshold = 0.75
): boolean {
  const sim = calculateTitleSimilarity(jobA.title, jobB.title);
  if (sim >= threshold) {
    // If vacancies match or organization matches, high confidence
    if (
      jobA.totalVacancies &&
      jobB.totalVacancies &&
      jobA.totalVacancies === jobB.totalVacancies
    ) {
      return true;
    }
    return sim >= 0.85;
  }
  return false;
}
