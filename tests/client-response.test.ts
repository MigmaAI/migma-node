import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../src/migma';

describe('non-JSON responses', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports the status of an HTML error page instead of a JSON parse error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('<!DOCTYPE html><html>Bad gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 0, retryDelay: 0 });

    const { data, error } = await client.domains.verify('brand.migma.email');

    expect(data).toBeNull();
    expect(error?.statusCode).toBe(502);
    expect(error?.message).toBe('Request failed with status 502: the server did not return JSON');
  });
});
