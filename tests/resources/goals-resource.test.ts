import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
const unavailable = () => new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
const hash = 'a'.repeat(64);
afterEach(() => vi.unstubAllGlobals());

describe('goals API transport', () => {
  it('lists, reads and reports without replay keys on the public paths', async () => {
    const fetch = vi.fn().mockImplementation(async () => ok({}));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', maxRetries: 0 });
    await client.goals.list('brand', { limit: 10, cursor: 'older' });
    await client.goals.get('goal');
    await client.goals.report('goal');
    expect(fetch.mock.calls.map(call => [call[1].method, call[0], call[1].headers['Idempotency-Key']])).toEqual([
      ['GET', 'https://api.example.test/v1/goals?projectId=brand&limit=10&cursor=older', undefined],
      ['GET', 'https://api.example.test/v1/goals/goal', undefined],
      ['GET', 'https://api.example.test/v1/goals/goal/report', undefined],
    ]);
  });

  it('sends every write with one replay key per call, kept across retries', async () => {
    const fetch = vi.fn().mockImplementation(async () => fetch.mock.calls.length % 2 ? unavailable() : ok({ id: 'goal', status: 'planning' }, 202));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 1 });
    await client.goals.plan({ projectId: 'brand', goal: 'Sell out the winter collection by December 20.' });
    await client.goals.update('goal', { expectedPlanVersion: 2, deliverables: [{ key: 'd3', skipped: true }] });
    await client.goals.answer('goal', { expectedPlanVersion: 1, answers: [{ questionId: 'q1', answer: 'Past buyers.' }] });
    await client.goals.build('goal', { expectedPlanHash: hash }, { idempotencyKey: 'build-1' });
    await client.goals.cancel('goal');
    await client.goals.delete('goal');
    const requests = fetch.mock.calls.map(call => ({ url: call[0], method: call[1].method, key: call[1].headers['Idempotency-Key'], body: call[1].body }));
    expect(requests.filter((_, index) => index % 2 === 0).map(request => [request.method, request.url])).toEqual([
      ['POST', 'https://api.example.test/v1/goals'],
      ['PATCH', 'https://api.example.test/v1/goals/goal'],
      ['POST', 'https://api.example.test/v1/goals/goal/answers'],
      ['POST', 'https://api.example.test/v1/goals/goal/build'],
      ['POST', 'https://api.example.test/v1/goals/goal/cancel'],
      ['DELETE', 'https://api.example.test/v1/goals/goal'],
    ]);
    for (let i = 0; i < requests.length; i += 2) {
      expect(requests[i].key).toBeTruthy();
      expect(requests[i + 1].key).toBe(requests[i].key);
    }
    expect(new Set(requests.map(request => request.key)).size).toBe(6);
    expect(requests[6].key).toBe('build-1');
    expect(JSON.parse(requests[0].body)).toEqual({ projectId: 'brand', goal: 'Sell out the winter collection by December 20.' });
    expect(JSON.parse(requests[2].body)).toEqual({ expectedPlanVersion: 2, deliverables: [{ key: 'd3', skipped: true }] });
    expect(JSON.parse(requests[6].body)).toEqual({ expectedPlanHash: hash });
  });

  it('keeps the server code when the reviewed plan changed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'The plan changed since you reviewed it.', code: 'GOAL_PLAN_CHANGED' }), { status: 409 })));
    const result = await new Migma('test-key', { maxRetries: 0 }).goals.build('goal', { expectedPlanHash: hash });
    expect(result.data).toBeNull();
    expect(result.error?.statusCode).toBe(409);
    expect(result.error?.serverCode).toBe('GOAL_PLAN_CHANGED');
  });
});
