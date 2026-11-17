import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

function newClient() {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const client = new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 0, retryDelay: 0 });
  return { client, fetchMock };
}

const pushed = {
  templateId: 'T1',
  name: 'Spring sale',
  editorUrl: 'https://www.klaviyo.com/email-editor/T1/edit',
  connectionId: 'acct_1',
  images: { hosted: 2, kept: [] },
};

describe('client.export.pushToKlaviyo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('POSTs the push with its body and the caller\'s Idempotency-Key', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: pushed }), { status: 201 }));

    const result = await client.export.pushToKlaviyo('conv_1', { emailId: 'e1', connectionId: 'acct_1' }, { idempotencyKey: 'push-1' });

    expect(result).toEqual({ data: pushed, error: null });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test.local/v1/export/klaviyo/conv_1/push');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ emailId: 'e1', connectionId: 'acct_1' });
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('push-1');
  });

  it('always sends an Idempotency-Key, which the route requires', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: pushed }), { status: 201 }));

    await client.export.pushToKlaviyo('conv_1');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.parse(init.body as string)).toEqual({});
  });

  it('does not retry a server error by itself, since Klaviyo may already hold the template', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const client = new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 3, retryDelay: 0 });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 }));

    const result = await client.export.pushToKlaviyo('conv_1', {}, { idempotencyKey: 'push-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error?.statusCode).toBe(500);
  });

  it('surfaces the server\'s refusal text and code', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: false,
      error: 'Klaviyo is not connected to this brand. Connect it in Migma, then try again: https://migma.ai/integrations/klaviyo/install?projectId=p1',
      code: 'KLAVIYO_NOT_CONNECTED',
    }), { status: 409 }));

    const result = await client.export.pushToKlaviyo('conv_1');

    expect(result.data).toBeNull();
    expect(result.error?.message).toContain('Connect it in Migma');
    expect(result.error?.statusCode).toBe(409);
  });
});
