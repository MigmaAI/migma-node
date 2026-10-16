import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src';
const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ success: true, data }), { status });
describe('contact exports and connected workflows', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('creates an export using exact filters and replay header, then polls exact job', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(ok({ jobId: 'job', status: 'pending' }, 202))
      .mockResolvedValueOnce(ok({ jobId: 'job', status: 'completed', downloadUrl: 'https://private.test/file.csv' }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('test', { baseUrl: 'https://api.test/v1', maxRetries: 0 });
    const filters = { status: 'unsubscribed' as const, groups: [{ tags: ['tag-1'] }] };
    const started = await client.contacts.createExport({ projectId: 'brand', filters }, { idempotencyKey: 'export-1' });
    expect(started.data?.status).toBe('pending');
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/v1/contacts/exports');
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe('export-1');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ projectId: 'brand', filters });
    const status = await client.contacts.getExport('job', 'brand');
    expect(status.data?.downloadUrl).toBe('https://private.test/file.csv');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.test/v1/contacts/exports/job?projectId=brand');
  });
  it('unsafe export without a replay key is never automatically repeated', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('lost response'));
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('test', { maxRetries: 2, retryDelay: 0 });
    await client.contacts.createExport({ projectId: 'brand' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('connected tools use scoped discovery and schema; writes never automatically retry', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(ok({ tools: [], total: 0, nextOffset: null }))
      .mockResolvedValueOnce(ok({ inputSchema: { type: 'object' } }))
      .mockRejectedValue(new Error('provider outcome unknown'));
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('test', { baseUrl: 'https://api.test/v1', maxRetries: 3, retryDelay: 0 });
    await client.projects.listConnectedTools({ projectId: 'brand', search: 'consent', limit: 3 });
    await client.projects.getConnectedTool({ projectId: 'brand', serverId: 'store', toolName: 'update_consent' });
    const result = await client.projects.callConnectedTool({ projectId: 'brand', serverId: 'store', toolName: 'update_consent', parameters: { consent: 'unsubscribed' } });
    expect(result.error?.message).toBe('provider outcome unknown'); expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/v1/connected-tools?projectId=brand&search=consent&limit=3');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.test/v1/connected-tools/schema?projectId=brand&serverId=store&toolName=update_consent');
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ projectId: 'brand', serverId: 'store', toolName: 'update_consent', parameters: { consent: 'unsubscribed' } });
  });
});
