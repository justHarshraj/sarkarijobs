// ============================================================
// Slug generator for job titles and URLs
// ============================================================

export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace hindi or special punctuation
    .replace(/[\/\\]/g, '-')
    // Replace non-alphanumeric chars (keep hyphens and spaces)
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace whitespace with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove duplicate consecutive hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates an SEO-optimized unique slug for a job
 */
export function generateJobSlug(title: string, sourceId?: string): string {
  const baseSlug = slugify(title).slice(0, 120);
  if (sourceId) {
    const cleanId = slugify(sourceId).slice(-8);
    return `${baseSlug}-${cleanId}`;
  }
  return baseSlug;
}
