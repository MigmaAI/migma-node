import { MigmaError, MigmaErrorCode } from './errors';
import type { MigmaResult } from './types/common';

export interface PollingOptions {
  /** Polling interval in ms. Default: 2000 */
  interval?: number;
  /** Maximum number of polls before giving up. Default: 150 (5 minutes at 2s) */
  maxAttempts?: number;
  /** Callback on each poll with current status */
  onPoll?: (status: unknown, attempt: number) => void;
  /** AbortSignal to cancel polling */
  signal?: AbortSignal;
}

/**
 * Generic polling function.
 * Calls `fetcher()` repeatedly until `isComplete(result)` returns true
 * or max attempts are reached.
 */
export async function poll<T>(
  fetcher: () => Promise<MigmaResult<T>>,
  isComplete: (data: T) => boolean,
  options?: PollingOptions
): Promise<MigmaResult<T>> {
  const interval = options?.interval ?? 2000;
  const maxAttempts = options?.maxAttempts ?? 150;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (options?.signal?.aborted) {
      return {
        data: null,
        error: new MigmaError('Polling aborted', 0, MigmaErrorCode.TIMEOUT),
      };
    }

    const result = await fetcher();

    if (result.error) {
      return result;
    }

    options?.onPoll?.(result.data, attempt);

    if (isComplete(result.data)) {
      return result;
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, interval);
      if (options?.signal) {
        const onAbort = () => {
          clearTimeout(timer);
          resolve();
        };
        options.signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }

  return {
    data: null,
    error: new MigmaError(
      'Polling timed out after maximum attempts',
      0,
      MigmaErrorCode.TIMEOUT
    ),
  };
}
