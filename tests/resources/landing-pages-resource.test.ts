import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';
import type { LandingPageSpec } from '../../src/types/landing-pages';

const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
const unavailable = () => new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
const spec: LandingPageSpec = {
  title: 'Winter collection',
  sections: [
    { id: 'hero', type: 'hero', headline: 'The winter collection is here', imageIndex: 0, cta: { label: 'Shop now', url: 'https://example.com/winter' } },
    { id: 'signup', type: 'form', formId: '665f1e928c2a9e4d8f123789' },
  ],
  ended: { headline: 'This offer has ended' },
};
afterEach(() => vi.unstubAllGlobals());

describe('landing pages API transport', () => {
  it('lists, reads versions and metrics without replay keys on the public paths', async () => {
    const fetch = vi.fn().mockImplementation(async () => ok({}));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', maxRetries: 0 });
    await client.landingPages.list('brand', { goalId: 'goal' });
    await client.landingPages.get('page');
    await client.landingPages.versions('page');
    await client.landingPages.metrics('page', { from: '2026-12-01', to: '2026-12-20' });
    expect(fetch.mock.calls.map(call => [call[1].method, call[0], call[1].headers['Idempotency-Key']])).toEqual([
      ['GET', 'https://api.example.test/v1/landing-pages?projectId=brand&goalId=goal', undefined],
      ['GET', 'https://api.example.test/v1/landing-pages/page', undefined],
      ['GET', 'https://api.example.test/v1/landing-pages/page/versions', undefined],
      ['GET', 'https://api.example.test/v1/landing-pages/page/metrics?from=2026-12-01&to=2026-12-20', undefined],
    ]);
  });

  it('sends drafts, generation and lifecycle actions with one replay key per call, kept across retries', async () => {
    const fetch = vi.fn().mockImplementation(async () => fetch.mock.calls.length % 2 ? unavailable() : ok({ id: 'page' }, 201));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 1 });
    const brief = 'A page for our winter sale: 15% off until December 20.';
    await client.landingPages.create({ projectId: 'brand', name: 'Winter sale', spec });
    await client.landingPages.generate({ projectId: 'brand', brief, links: [{ label: 'Shop', url: 'https://example.com/winter' }] }, { idempotencyKey: 'generate-1' });
    await client.landingPages.update('page', { name: null });
    await client.landingPages.publish('page');
    await client.landingPages.pause('page');
    await client.landingPages.delete('page');
    const requests = fetch.mock.calls.map(call => ({ url: call[0], method: call[1].method, key: call[1].headers['Idempotency-Key'], body: call[1].body }));
    expect(requests.filter((_, index) => index % 2 === 0).map(request => [request.method, request.url])).toEqual([
      ['POST', 'https://api.example.test/v1/landing-pages'],
      ['POST', 'https://api.example.test/v1/landing-pages/generate'],
      ['PATCH', 'https://api.example.test/v1/landing-pages/page'],
      ['POST', 'https://api.example.test/v1/landing-pages/page/publish'],
      ['POST', 'https://api.example.test/v1/landing-pages/page/pause'],
      ['DELETE', 'https://api.example.test/v1/landing-pages/page'],
    ]);
    for (let i = 0; i < requests.length; i += 2) {
      expect(requests[i].key).toBeTruthy();
      expect(requests[i + 1].key).toBe(requests[i].key);
    }
    expect(new Set(requests.map(request => request.key)).size).toBe(6);
    expect(requests[2].key).toBe('generate-1');
    expect(JSON.parse(requests[0].body)).toEqual({ projectId: 'brand', name: 'Winter sale', spec });
    expect(JSON.parse(requests[2].body)).toEqual({ projectId: 'brand', brief, links: [{ label: 'Shop', url: 'https://example.com/winter' }] });
    expect(JSON.parse(requests[4].body)).toEqual({ name: null });
  });

  it('keeps the failed publish check for the caller', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'Landing page hosting is not set up on this server yet.', code: 'LANDING_PAGE_NOT_READY', data: { check: 'hosting' } }), { status: 409 })));
    const result = await new Migma('test-key', { maxRetries: 0 }).landingPages.publish('page');
    expect(result.error?.statusCode).toBe(409);
    expect(result.error?.serverCode).toBe('LANDING_PAGE_NOT_READY');
    expect(result.error?.data).toEqual({ check: 'hosting' });
  });
});
