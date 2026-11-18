import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

type FetchMock = ReturnType<typeof vi.fn>;

function ok<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function newClient(): { client: Migma; fetchMock: FetchMock } {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const client = new Migma('mgm_test', {
    baseUrl: 'https://api.test.local/v1',
    maxRetries: 0,
    retryDelay: 0,
  });
  return { client, fetchMock };
}

const activeStatus = { projectId: 'brand_1', status: 'active', progress: { stage: 'completed', percentage: 100 } };

describe('client.projects brand import', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('importAndWait says when the website already had a brand and it was returned', async () => {
    const { client, fetchMock } = newClient();
    fetchMock
      .mockResolvedValueOnce(ok({ projectId: 'brand_1', status: 'active', domain: 'https://acme.example', urls: ['https://acme.example'], isExisting: true, message: 'Using it.' }))
      .mockResolvedValueOnce(ok(activeStatus));

    const { data, error } = await client.projects.importAndWait({ urls: ['https://acme.example'] });

    expect(error).toBeNull();
    expect(data?.projectId).toBe('brand_1');
    expect(data?.status).toBe('active');
    expect(data?.isExisting).toBe(true);
  });

  it('importAndWait marks a new import as not existing', async () => {
    const { client, fetchMock } = newClient();
    fetchMock
      .mockResolvedValueOnce(ok({ projectId: 'brand_2', status: 'pending', domain: 'https://new.example', urls: ['https://new.example'], isExisting: false, message: 'Import started.' }))
      .mockResolvedValueOnce(ok({ ...activeStatus, projectId: 'brand_2' }));

    const { data } = await client.projects.importAndWait({ urls: ['https://new.example'] }, { interval: 1 });

    expect(data?.isExisting).toBe(false);
  });

  it('importAndWait leaves the field out for a server that does not send it', async () => {
    const { client, fetchMock } = newClient();
    fetchMock
      .mockResolvedValueOnce(ok({ projectId: 'brand_3', status: 'pending', domain: 'https://old.example', urls: ['https://old.example'], message: 'Import started.' }))
      .mockResolvedValueOnce(ok({ ...activeStatus, projectId: 'brand_3' }));

    const { data } = await client.projects.importAndWait({ urls: ['https://old.example'] }, { interval: 1 });

    expect(data).not.toHaveProperty('isExisting');
  });

  it('import sends allowDuplicate when a second brand is wanted', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(ok({ projectId: 'brand_4', status: 'pending', domain: 'https://acme.example', urls: ['https://acme.example'], isExisting: false, message: 'Import started.' }));

    await client.projects.import({ urls: ['https://acme.example'], allowDuplicate: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test.local/v1/projects/import');
    expect(JSON.parse(String(init.body))).toEqual({ urls: ['https://acme.example'], allowDuplicate: true });
  });
});
