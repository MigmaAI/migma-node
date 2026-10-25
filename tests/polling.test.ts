import { getEventListeners } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MigmaError, MigmaErrorCode } from '../src/errors';
import { poll } from '../src/polling';

describe('poll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('removes each completed delay listener before fetching again', async () => {
    const controller = new AbortController();
    const listenerCounts: number[] = [];
    let attempts = 0;
    const resultPromise = poll(async () => {
      listenerCounts.push(getEventListeners(controller.signal, 'abort').length);
      return { data: ++attempts, error: null };
    }, (data) => data === 15, { interval: 10, signal: controller.signal });

    await vi.runAllTimersAsync();

    expect(await resultPromise).toEqual({ data: 15, error: null });
    expect(listenerCounts).toEqual(Array(15).fill(0));
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it.each(['timeout', 'error'] as const)('leaves no delay listener after %s', async (ending) => {
    const controller = new AbortController();
    const error = new MigmaError('Fetch failed', 500);
    let attempts = 0;
    const resultPromise = poll<number>(async () => {
      attempts++;
      return ending === 'error' && attempts === 2
        ? { data: null, error }
        : { data: attempts, error: null };
    }, () => false, { interval: 10, maxAttempts: 2, signal: controller.signal });

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.error?.message).toBe(ending === 'error'
      ? 'Fetch failed' : 'Polling timed out after maximum attempts');
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it('cancels during a delay and clears its timer and listener', async () => {
    const controller = new AbortController();
    let attempts = 0;
    const resultPromise = poll(async () => ({ data: ++attempts, error: null }),
      () => false, { interval: 1000, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(0);
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(1);

    controller.abort();

    const result = await resultPromise;
    expect(result.error).toMatchObject({ message: 'Polling aborted', code: MigmaErrorCode.TIMEOUT });
    expect(attempts).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it.each(['fetch', 'onPoll'] as const)('does not wait when aborted during %s', async (phase) => {
    const controller = new AbortController();
    let attempts = 0;
    let settled = false;
    const resultPromise = poll(async () => {
      attempts++;
      if (phase === 'fetch') controller.abort();
      return { data: attempts, error: null };
    }, () => false, {
      interval: 1000,
      signal: controller.signal,
      onPoll: () => { if (phase === 'onPoll') controller.abort(); },
    });
    void resultPromise.then(() => { settled = true; });

    await vi.advanceTimersByTimeAsync(0);

    expect(settled).toBe(true);
    expect((await resultPromise).error?.message).toBe('Polling aborted');
    expect(attempts).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it('does not fetch when already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    let attempts = 0;
    const result = await poll(async () => ({ data: ++attempts, error: null }),
      () => false, { signal: controller.signal });

    expect(result.error?.message).toBe('Polling aborted');
    expect(attempts).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps completion when abort happens after the final delay', async () => {
    const controller = new AbortController();
    let attempts = 0;
    const resultPromise = poll(async () => ({ data: ++attempts, error: null }),
      (data) => data === 2, { interval: 10, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10);
    expect(await resultPromise).toEqual({ data: 2, error: null });

    controller.abort();
    await vi.runAllTimersAsync();

    expect(attempts).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it('polls without a signal', async () => {
    let attempts = 0;
    const resultPromise = poll(async () => ({ data: ++attempts, error: null }),
      (data) => data === 2, { interval: 10 });
    await vi.runAllTimersAsync();

    expect(await resultPromise).toEqual({ data: 2, error: null });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves listeners owned by the caller', async () => {
    const controller = new AbortController();
    let aborts = 0;
    const onAbort = () => { aborts++; };
    controller.signal.addEventListener('abort', onAbort, { once: true });
    let attempts = 0;
    const resultPromise = poll(async () => ({ data: ++attempts, error: null }),
      (data) => data === 2, { interval: 10, signal: controller.signal });

    await vi.runAllTimersAsync();

    expect(await resultPromise).toEqual({ data: 2, error: null });
    expect(getEventListeners(controller.signal, 'abort')).toEqual([onAbort]);
    controller.abort();
    expect(aborts).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
