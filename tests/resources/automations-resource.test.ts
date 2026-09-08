import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
afterEach(() => vi.unstubAllGlobals());

describe('automation API transport', () => {
  it('retains source entry rules and cutover status from saved flows', async () => {
    const flow = { id: 'flow', projectId: 'brand', name: 'Checkout', status: 'draft', version: 1,
      link: 'https://example.test/flow', reentry: 'perEvent', reentryCooldown: { amount: 10, unit: 'day' }, allowConcurrentReentry: true,
      cancelOn: [{ event: 'ecommerce.order_placed', origin: 'shopify', since: 'trigger', mode: 'exit' }],
      migration: { provider: 'klaviyo', snapshotId: 'snapshot', sourceHash: 'a'.repeat(64), mappingHash: 'b'.repeat(64), status: 'awaiting_cutover', preparedAt: '2026-09-08T12:00:00Z', preparedBy: 'actor' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(flow)));
    const client = new Migma('test-key', { maxRetries: 0 });
    const result = await client.automations.get('flow');
    expect(result.data).toEqual(flow);
    expect(result.data?.reentryCooldown?.amount).toBe(10);
    expect(result.data?.cancelOn?.[0].since).toBe('trigger');
    expect(result.data?.migration?.status).toBe('awaiting_cutover');
  });
  it('keeps reporting gaps distinguishable from measured zero', async () => {
    const report = { nodes: [{ nodeId: 'step', campaignId: 'campaign', reporting: { status: 'unavailable', source: 'unavailable' } }], edges: [], reporting: { status: 'unavailable', source: 'campaigns', warnings: ['Tracking unavailable'] } };
    const fetch = vi.fn().mockResolvedValue(ok(report));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { maxRetries: 0 });
    expect((await client.automations.metrics('flow')).data).toEqual(report);
    expect(fetch.mock.calls[0][0]).toMatch(/\/automations\/flow\/metrics$/);
  });
  it('keeps the same idempotency key and image reference when a submission retries', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('temporary network failure')).mockResolvedValueOnce(ok({ jobId: 'job', status: 'queued' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 1 });
    const result = await client.automations.generate({ projectId: 'brand', brief: 'Recreate the flow', imageUrls: ['https://example.test/flow.png'] });
    expect(result.data?.jobId).toBe('job');
    expect(fetch).toHaveBeenCalledTimes(2);
    const requests = fetch.mock.calls.map(call => call[1] as RequestInit);
    const key = (requests[0].headers as Record<string, string>)['Idempotency-Key'];
    expect(key).toBeTruthy();
    expect((requests[1].headers as Record<string, string>)['Idempotency-Key']).toBe(key);
    expect(JSON.parse(requests[1].body as string)).toEqual({ projectId: 'brand', brief: 'Recreate the flow', imageUrls: ['https://example.test/flow.png'] });
  });

  it('preserves a caller-provided key across separate logical retries', async () => {
    const fetch = vi.fn().mockImplementation(async () => ok({ jobId: 'job', status: 'queued' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { maxRetries: 0 });
    for (let i = 0; i < 2; i++) await client.automations.generate({ projectId: 'brand', brief: 'Welcome subscribers' }, { idempotencyKey: 'welcome-001' });
    expect(fetch.mock.calls.map(call => call[1].headers['Idempotency-Key'])).toEqual(['welcome-001', 'welcome-001']);
  });

  it('returns readiness checks without automatically activating and requires explicit activation payload', async () => {
    const checks = { ready: false, checklist: [{ key: 'sender', status: 'missing', message: 'Choose a sender' }], activation: { requiresConfirmation: true, link: 'https://migma.ai/chat?automation=flow' } };
    const fetch = vi.fn().mockResolvedValueOnce(ok(checks)).mockResolvedValueOnce(ok({ id: 'flow', status: 'enabled' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { maxRetries: 0 });
    expect((await client.automations.validate('flow')).data).toEqual(checks);
    expect(fetch).toHaveBeenCalledTimes(1);
    await client.automations.activate('flow', { confirmed: true });
    expect(fetch.mock.calls[1][0]).toMatch(/\/automations\/flow\/activate$/);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ confirmed: true });
  });
});
