import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

describe('client.campaigns.schedule', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends local-time delivery with the schedule', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      data: { id: 'cmp_1', status: 'scheduled', localTimeDelivery: true },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 0, retryDelay: 0 });

    const { data } = await client.campaigns.schedule('cmp_1', {
      scheduledAt: '2026-07-01T07:00:00Z',
      scheduledTimezone: 'Europe/Rome',
      localTimeDelivery: true,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test.local/v1/campaigns/cmp_1/schedule');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      scheduledAt: '2026-07-01T07:00:00Z',
      scheduledTimezone: 'Europe/Rome',
      localTimeDelivery: true,
    });
    expect(data?.localTimeDelivery).toBe(true);
  });
});
