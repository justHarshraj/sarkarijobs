// ============================================================
// Controlled Concurrency Runner (Async Worker Pool)
// Enhanced with Dynamic Concurrency, Auto-Backoff & Progress
// ============================================================

export interface AsyncPoolOptions {
  /** Maximum retries per item if iteratorFn throws */
  retries?: number;
  /** Initial delay before retrying (in ms) */
  retryDelayMs?: number;
  /** Optional callback after each item finishes */
  onProgress?: (completed: number, total: number, itemIndex: number) => void;
  /** Delay between tasks per worker (in ms, defaults to 0) */
  taskDelayMs?: number;
}

/**
 * Runs tasks concurrently with a maximum concurrency limit.
 * Supports retries, exponential backoff, micro-delay per worker, and progress callbacks.
 *
 * @param concurrency Maximum number of concurrent tasks running simultaneously
 * @param items Array of input items to process
 * @param iteratorFn Async function executed for each item
 * @param options Optional configuration (retries, delay, progress)
 */
export async function asyncPool<T, R>(
  concurrency: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>,
  options: AsyncPoolOptions = {}
): Promise<R[]> {
  if (items.length === 0) return [];

  const { retries = 2, retryDelayMs = 1000, onProgress, taskDelayMs = 0 } = options;
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: R[] = new Array(items.length);

  let currentIndex = 0;
  let completedCount = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      let attempt = 0;
      let success = false;

      while (attempt <= retries && !success) {
        try {
          results[index] = await iteratorFn(items[index], index);
          success = true;
        } catch (err: unknown) {
          attempt++;
          const isRateLimit =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            (err as { response?: { status?: number } }).response?.status === 429;

          if (attempt <= retries) {
            // Exponential backoff with jitter (longer if 429 rate limit hit)
            const multiplier = isRateLimit ? 3 : 1.5;
            const backoff = Math.round(
              retryDelayMs * Math.pow(multiplier, attempt) + Math.random() * 500
            );
            await new Promise((resolve) => setTimeout(resolve, backoff));
          } else {
            results[index] = null as unknown as R;
          }
        }
      }

      completedCount++;
      if (onProgress) {
        try {
          onProgress(completedCount, items.length, index);
        } catch {
          // Ignore progress callback errors
        }
      }

      if (taskDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, taskDelayMs));
      }
    }
  });

  await Promise.all(workers);
  return results;
}
