// ============================================================
// Controlled Concurrency Runner (Async Worker Pool)
// ============================================================

/**
 * Runs tasks concurrently with a maximum concurrency limit.
 * Useful for polite web scraping, parallel network calls, and batch operations.
 *
 * @param concurrency Maximum number of concurrent tasks running simultaneously
 * @param items Array of input items to process
 * @param iteratorFn Async function executed for each item
 */
export async function asyncPool<T, R>(
  concurrency: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        results[index] = await iteratorFn(items[index], index);
      } catch (err) {
        // Capture error or allow caller to handle within iteratorFn
        results[index] = null as unknown as R;
        console.error(`[asyncPool] Error processing item at index ${index}:`, err);
      }
    }
  });

  await Promise.all(workers);
  return results;
}
