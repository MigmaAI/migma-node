import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

const ok = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

afterEach(() => vi.unstubAllGlobals());

describe('website API transport', () => {
  it('calls the website management routes with encoded ids', async () => {
    const site = {
      id: 'site',
      projectId: 'project',
      name: 'Store',
      origins: ['https://shop.example'],
      environment: 'test',
      status: 'enabled',
      collectorUrl: 'https://collect.example',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(ok([site]))
      .mockResolvedValueOnce(ok(site))
      .mockResolvedValueOnce(
        ok({ status: 'available', events: [], sampleWindowHours: 24, sampledRows: 1000 })
      )
      .mockResolvedValueOnce(
        ok({
          identityToken: 'secret-token',
          issuedAt: '2026-10-01T10:00:00.000Z',
          expiresAt: '2026-10-01T10:15:00.000Z',
        })
      );
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', {
      baseUrl: 'https://api.example.test/v1',
      maxRetries: 0,
    });

    await client.websites.list('project');
    await client.websites.update('site/one', { status: 'disabled' });
    await client.websites.events('site/one');
    await client.websites.issueIdentity('site/one', {
      visitorId: '8a3016d8-53ec-4f19-a849-e8d85c94527a',
      subscriberId: '68dd00000000000000000001',
      ttlSeconds: 600,
    });

    const calls = fetch.mock.calls as Array<[string, RequestInit]>;
    expect(calls[0][0]).toBe('https://api.example.test/v1/websites?projectId=project');
    expect(calls[0][1].method).toBe('GET');
    expect(calls[1][0]).toBe('https://api.example.test/v1/websites/site%2Fone');
    expect(calls[1][1].method).toBe('PATCH');
    expect(JSON.parse(calls[1][1].body as string)).toEqual({ status: 'disabled' });
    expect(calls[2][0]).toBe('https://api.example.test/v1/websites/site%2Fone/events');
    expect(calls[2][1].method).toBe('GET');
    expect(calls[3][0]).toBe('https://api.example.test/v1/websites/site%2Fone/identity');
    expect(calls[3][1].method).toBe('POST');
    expect(JSON.parse(calls[3][1].body as string)).toEqual({
      visitorId: '8a3016d8-53ec-4f19-a849-e8d85c94527a',
      subscriberId: '68dd00000000000000000001',
      ttlSeconds: 600,
    });
  });

  it('keeps the required creation key stable across automatic retries', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce(ok({ id: 'site' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', {
      baseUrl: 'https://api.example.test/v1',
      maxRetries: 1,
      retryDelay: 0,
    });

    const input = {
      projectId: '68dd00000000000000000000',
      name: 'Store',
      origins: ['https://shop.example'],
      environment: 'live' as const,
    };
    await client.websites.create(input, 'website-creation-001');

    expect(fetch).toHaveBeenCalledTimes(2);
    const calls = fetch.mock.calls as Array<[string, RequestInit]>;
    for (const [url, init] of calls) {
      expect(url).toBe('https://api.example.test/v1/websites');
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe(
        'website-creation-001'
      );
      expect(JSON.parse(init.body as string)).toEqual(input);
    }
  });
});
