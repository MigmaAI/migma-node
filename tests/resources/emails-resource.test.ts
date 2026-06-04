import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src/migma';

type FetchMock = ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function ok<T>(data: T): Response {
  return jsonResponse({ success: true, data });
}

function lastCall(fetchMock: FetchMock): { url: string; init: RequestInit } {
  const calls = fetchMock.mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  const [url, init] = calls[calls.length - 1] as [string, RequestInit];
  return { url, init };
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

describe('client.emails public generation and artifact APIs', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('generate includes count and referenceId in POST /projects/emails/generate', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        conversationId: 'conv_1',
        status: 'pending',
        message: 'started',
        link: 'https://migma.ai/chat?c=conv_1',
        count: 3,
        referenceId: 'ref_1',
      }),
    );

    const res = await client.emails.generate({
      projectId: 'proj_1',
      prompt: 'Create a welcome series',
      count: 3,
      referenceId: 'ref_1',
    });

    expect(res.error).toBeNull();
    expect(res.data?.count).toBe(3);

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('POST');
    expect(url).toBe('https://api.test.local/v1/projects/emails/generate');
    expect(JSON.parse(init.body as string)).toEqual({
      projectId: 'proj_1',
      prompt: 'Create a welcome series',
      count: 3,
      referenceId: 'ref_1',
    });
  });

  it('getGenerationStatus surfaces result.emails artifact data', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        conversationId: 'conv_1',
        status: 'completed',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:01.000Z',
        result: {
          subject: 'Welcome',
          previewText: 'Start here',
          html: '<html>one</html>',
          emails: [
            {
              artifactId: 'art_1',
              conversationId: 'conv_1',
              messageId: 'msg_1',
              slotIdx: 0,
              slot: 1,
              subject: 'Welcome',
              preheader: 'Start here',
              html: '<html>one</html>',
              source: 'Email { }',
              status: 'ready',
            },
          ],
          screenshotUrl: null,
          screenshotFullUrl: null,
          stats: { imageCount: 0, buttonCount: 1, estimatedLength: 'short', colors: [] },
          languages: ['en'],
        },
      }),
    );

    const res = await client.emails.getGenerationStatus('conv_1');

    expect(res.error).toBeNull();
    expect(res.data?.result?.emails[0].artifactId).toBe('art_1');
    expect(res.data?.result?.emails[0].html).toBe('<html>one</html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('GET');
    expect(url).toBe('https://api.test.local/v1/projects/emails/conv_1/status');
  });

  it('get(artifactId) calls GET /emails/:artifactId', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        artifactId: 'art_1',
        conversationId: 'conv_1',
        messageId: 'msg_1',
        slotIdx: 0,
        slotUuid: null,
        status: 'ready',
        engine: 'zinn',
        subject: 'Welcome',
        preheader: 'Start here',
        html: '<html></html>',
        source: 'Email { }',
        templateVariables: [],
        warnings: [],
        thumbnailUrl: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const res = await client.emails.get('art_1');

    expect(res.error).toBeNull();
    expect(res.data?.source).toBe('Email { }');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('GET');
    expect(url).toBe('https://api.test.local/v1/emails/art_1');
  });

  it('update(artifactId, source) calls PATCH /emails/:artifactId', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        artifactId: 'art_1',
        conversationId: 'conv_1',
        messageId: 'msg_1',
        slotIdx: 0,
        slotUuid: null,
        status: 'ready',
        engine: 'zinn',
        subject: 'Updated',
        preheader: '',
        html: '<html>updated</html>',
        source: 'Email { updated }',
        templateVariables: [],
        warnings: [],
        thumbnailUrl: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const res = await client.emails.update('art_1', {
      source: 'Email { updated }',
      label: 'copy edit',
    });

    expect(res.error).toBeNull();
    expect(res.data?.html).toBe('<html>updated</html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('PATCH');
    expect(url).toBe('https://api.test.local/v1/emails/art_1');
    expect(JSON.parse(init.body as string)).toEqual({
      source: 'Email { updated }',
      label: 'copy edit',
    });
  });

  it('compile(artifactId, source) calls POST /emails/:artifactId/compile', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({ artifactId: 'art_1', html: '<html>preview</html>', warnings: [] }),
    );

    const res = await client.emails.compile('art_1', {
      source: 'Email { preview }',
      vars: { firstName: 'Sarah' },
    });

    expect(res.error).toBeNull();
    expect(res.data?.html).toBe('<html>preview</html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('POST');
    expect(url).toBe('https://api.test.local/v1/emails/art_1/compile');
    expect(JSON.parse(init.body as string)).toEqual({
      source: 'Email { preview }',
      vars: { firstName: 'Sarah' },
    });
  });
});
