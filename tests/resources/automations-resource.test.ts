import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
afterEach(() => vi.unstubAllGlobals());

describe('automation API transport', () => {
  it('retains source entry rules and cutover status from saved flows', async () => {
    const flow = { id: 'flow', projectId: 'brand', name: 'Checkout', status: 'draft', version: 1, definitionHash: 'a'.repeat(64),
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
  it('keeps definition hashes optional on list summaries and imported drafts', async () => {
    const list = { automations: [{ id: 'flow', projectId: 'brand', name: 'Welcome', status: 'draft', version: 1, link: 'https://example.test/flow' }], count: 1, nextCursor: 'next-page' };
    const imported = { id: 'import', projectId: 'brand', name: 'Imported flow', status: 'draft', version: 1,
      link: 'https://example.test/import', sourceImport: { provider: 'klaviyo' } };
    const fetch = vi.fn().mockResolvedValueOnce(ok(list)).mockResolvedValueOnce(ok(imported));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { maxRetries: 0 });

    const page = await client.automations.list('brand', { cursor: 'previous-page', limit: 50, includeArchived: true });
    expect(page.data?.automations[0].definitionHash).toBeUndefined();
    expect(page.data?.nextCursor).toBe('next-page');
    expect(fetch.mock.calls[0][0]).toBe('https://api.migma.ai/v1/automations?projectId=brand&cursor=previous-page&limit=50&includeArchived=true');
    expect((await client.automations.get('import')).data?.definitionHash).toBeUndefined();
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
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 0 });
    const result = await client.automations.generate(
      { projectId: 'brand', brief: 'Recreate the flow', imageUrls: ['https://example.test/flow.png'] },
      { maxRetries: 1 }
    );
    expect(result.data?.jobId).toBe('job');
    expect(fetch).toHaveBeenCalledTimes(2);
    const requests = fetch.mock.calls.map(call => call[1] as RequestInit);
    const key = (requests[0].headers as Record<string, string>)['Idempotency-Key'];
    expect(key).toBeTruthy();
    expect((requests[1].headers as Record<string, string>)['Idempotency-Key']).toBe(key);
    expect(JSON.parse(requests[1].body as string)).toEqual({ projectId: 'brand', brief: 'Recreate the flow', imageUrls: ['https://example.test/flow.png'] });
  });

  it('honors maxRetries 0 for generation when the client retry default is higher', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('temporary network failure'));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { retryDelay: 0, maxRetries: 2 });

    const result = await client.automations.generate(
      { projectId: 'brand', brief: 'Welcome subscribers' },
      { maxRetries: 0 }
    );

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('temporary network failure');
    expect(fetch).toHaveBeenCalledTimes(1);
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
    await client.automations.activate('flow', { confirmed: true, expectedDefinitionHash: 'a'.repeat(64) });
    expect(fetch.mock.calls[1][0]).toMatch(/\/automations\/flow\/activate$/);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ confirmed: true, expectedDefinitionHash: 'a'.repeat(64) });
  });

  it('reuses one idempotency key across retries of every automation write', async () => {
    const unavailable = () => new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    const fetch = vi.fn().mockImplementation(async () => fetch.mock.calls.length % 2 ? unavailable() : ok({ id: 'flow' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { retryDelay: 0, maxRetries: 1 });
    const trigger = { type: 'event' as const, event: { name: 'contact.subscribed' } };
    await client.automations.validate('flow');
    await client.automations.activate('flow', { confirmed: true, expectedDefinitionHash: 'a'.repeat(64) });
    await client.automations.pause('flow');
    await client.automations.updateTrigger('flow', trigger, 'a'.repeat(64));
    await client.automations.updateWait('flow', 'wait-1', 'P2D', 'a'.repeat(64), { idempotencyKey: 'wait-edit-1' });
    const keys = fetch.mock.calls.map(call => (call[1].headers as Record<string, string>)['Idempotency-Key']);
    expect(keys).toHaveLength(10);
    for (let i = 0; i < keys.length; i += 2) {
      expect(keys[i]).toBeTruthy();
      expect(keys[i + 1]).toBe(keys[i]);
    }
    expect(new Set(keys).size).toBe(5);
    expect(keys.at(-1)).toBe('wait-edit-1');
    expect(fetch.mock.calls[6][1].method).toBe('PUT');
  });

  it('reads the period report, graph, trigger events and canonical run detail', async () => {
    const run = { id: 'run', status: 'failed', subscriber: { id: 'contact' }, currentStepId: null, currentStepKind: null, nextRunAt: null,
      automationVersion: 2, startedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z', failureReason: 'Sender domain unverified',
      triggerEventId: 'event', history: [{ at: '2026-10-01T00:00:00Z', outcome: 'failed' }], historyTotal: 1 };
    const fetch = vi.fn().mockImplementation(async () => ok(run));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', maxRetries: 0 });
    await client.automations.report('flow', { startDate: '2026-09-01', endDate: '2026-09-30', timezone: 'Europe/Madrid' });
    await client.automations.graph('flow');
    await client.automations.triggerEvents('brand');
    const detail = await client.automations.getRun('flow', 'run', { historyLimit: 50 });
    expect(fetch.mock.calls.map(call => call[0])).toEqual([
      'https://api.example.test/v1/automations/flow/report?startDate=2026-09-01&endDate=2026-09-30&timezone=Europe%2FMadrid',
      'https://api.example.test/v1/automations/flow/graph',
      'https://api.example.test/v1/automations/trigger-events?projectId=brand',
      'https://api.example.test/v1/automations/flow/runs/run?historyLimit=50',
    ]);
    expect(detail.data?.failureReason).toBe('Sender domain unverified');
    expect(detail.data?.subscriber.id).toBe('contact');
  });

  it('carries the reviewed definition hash through trigger and wait updates', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ id: 'flow', definitionHash: 'b'.repeat(64) }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { maxRetries: 0 });
    const trigger = { type: 'event' as const, event: { name: 'contact.subscribed' } };

    await client.automations.updateTrigger('flow', trigger, 'a'.repeat(64));
    await client.automations.updateWait('flow', 'wait-1', 'P2D', 'b'.repeat(64));

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ trigger, expectedDefinitionHash: 'a'.repeat(64) });
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ duration: 'P2D', expectedDefinitionHash: 'b'.repeat(64) });
  });
});
