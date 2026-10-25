import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';
import type { FormSpec } from '../../src/types/forms';

const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
const spec: FormSpec = {
  kind: 'subscribe', confirmation: { mode: 'message', value: 'Thanks' }, styleTokens: {},
  steps: [{ id: 'signup', headline: 'Join', ctaLabel: 'Join', fields: [{ key: 'email', label: 'Email', type: 'email', required: true }] }],
};
afterEach(() => vi.unstubAllGlobals());

describe('forms API transport', () => {
  it('lists, reads and pages submissions with the public paths', async () => {
    const fetch = vi.fn().mockImplementation(async () => ok({}));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', maxRetries: 0 });
    await client.forms.list('brand', { status: 'live' });
    await client.forms.get('form');
    await client.forms.submissions('form', { limit: 50, cursor: 'next' });
    expect(fetch.mock.calls.map(call => [call[1].method, call[0]])).toEqual([
      ['GET', 'https://api.example.test/v1/forms?projectId=brand&status=live'],
      ['GET', 'https://api.example.test/v1/forms/form'],
      ['GET', 'https://api.example.test/v1/forms/form/submissions?limit=50&cursor=next'],
    ]);
  });

  it('sends draft writes and lifecycle actions with one replay key per call, kept across retries', async () => {
    const unavailable = () => new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    const fetch = vi.fn().mockImplementation(async () => fetch.mock.calls.length % 2 ? unavailable() : ok({ id: 'form' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 1 });
    await client.forms.create({ projectId: 'brand', spec, tagIds: ['tag'] });
    await client.forms.update('form', { spec: { confirmation: { mode: 'message', value: 'Welcome' } } });
    await client.forms.publish('form');
    await client.forms.pause('form', { idempotencyKey: 'pause-1' });
    await client.forms.delete('form');
    const requests = fetch.mock.calls.map(call => ({ url: call[0], method: call[1].method, key: call[1].headers['Idempotency-Key'], body: call[1].body }));
    expect(requests.filter((_, index) => index % 2 === 0).map(request => [request.method, request.url])).toEqual([
      ['POST', 'https://api.example.test/v1/forms'],
      ['PATCH', 'https://api.example.test/v1/forms/form'],
      ['POST', 'https://api.example.test/v1/forms/form/publish'],
      ['POST', 'https://api.example.test/v1/forms/form/pause'],
      ['DELETE', 'https://api.example.test/v1/forms/form'],
    ]);
    for (let i = 0; i < requests.length; i += 2) {
      expect(requests[i].key).toBeTruthy();
      expect(requests[i + 1].key).toBe(requests[i].key);
    }
    expect(new Set(requests.map(request => request.key)).size).toBe(5);
    expect(requests[6].key).toBe('pause-1');
    expect(JSON.parse(requests[0].body)).toEqual({ projectId: 'brand', spec, tagIds: ['tag'] });
  });

  it('submits a signup with one replay key per call, kept across retries', async () => {
    const result = { formId: 'form', submissionId: 'hash', state: 'received', duplicate: false };
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(ok(result, 201))
      .mockResolvedValueOnce(ok({ ...result, state: 'confirmation_pending' }, 202));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 1 });
    const params = {
      email: 'ada@example.com',
      fields: { firstName: 'Ada', consent: true },
      attribution: { utmSource: 'launch' },
      consent: { ip: '203.0.113.10', userAgent: 'Signup UI/1.0' },
    };
    const first = await client.forms.submit('form', params);
    expect(first.data).toEqual(result);
    const second = await client.forms.submit('form', params, { idempotencyKey: 'signup-1' });
    expect(second.data?.state).toBe('confirmation_pending');
    const requests = fetch.mock.calls.map(call => ({ url: call[0], method: call[1].method, key: call[1].headers['Idempotency-Key'], body: JSON.parse(call[1].body) }));
    expect(requests.map(request => [request.method, request.url])).toEqual(Array(3).fill(['POST', 'https://api.example.test/v1/forms/form/submissions']));
    expect(requests[0].key).toBeTruthy();
    expect(requests[1].key).toBe(requests[0].key);
    expect(requests[2].key).toBe('signup-1');
    expect(requests[0].body).toEqual(params);
  });

  it('keeps the automation conflict code when a used form cannot be paused', async () => {
    const automations = [{ id: 'flow', name: 'Welcome', link: 'https://migma.ai/chat?automation=flow' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'Pause it first', code: 'FORM_USED_BY_AUTOMATION', data: { automations } }), { status: 409 })));
    const result = await new Migma('test-key', { maxRetries: 0 }).forms.pause('form');
    expect(result.error?.statusCode).toBe(409);
    expect(result.error?.serverCode).toBe('FORM_USED_BY_AUTOMATION');
    expect(result.error?.data).toEqual({ automations });
  });

  it('names a form on create and renames or clears it on update', async () => {
    const fetch = vi.fn(async () => ok({ id: 'form', name: 'Spring waitlist' }));
    vi.stubGlobal('fetch', fetch);
    const client = new Migma('test-key', { baseUrl: 'https://api.example.test/v1', retryDelay: 0, maxRetries: 0 });
    const created = await client.forms.create({ projectId: 'brand', name: 'Spring waitlist', spec });
    await client.forms.update('form', { name: 'Summer waitlist' });
    await client.forms.update('form', { name: null });
    const bodies = fetch.mock.calls.map(call => JSON.parse((call as unknown as [string, RequestInit])[1].body as string));
    expect(created.data?.name).toBe('Spring waitlist');
    expect(bodies).toEqual([{ projectId: 'brand', name: 'Spring waitlist', spec }, { name: 'Summer waitlist' }, { name: null }]);
  });
});
