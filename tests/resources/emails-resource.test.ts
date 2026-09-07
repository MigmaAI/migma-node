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

describe('client.emails public generation and email APIs', () => {
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

  it('importHtml posts html to POST /projects/emails/import-html', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        conversationId: 'conv_2',
        status: 'pending',
        message: 'started',
        link: 'https://migma.ai/chat?c=conv_2',
        count: 1,
      }),
    );

    const res = await client.emails.importHtml({
      projectId: 'proj_1',
      html: '<html><body>Hi</body></html>',
      name: 'welcome.html',
      instruction: 'Keep this as-is',
    });

    expect(res.error).toBeNull();
    expect(res.data?.conversationId).toBe('conv_2');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('POST');
    expect(url).toBe('https://api.test.local/v1/projects/emails/import-html');
    expect(JSON.parse(init.body as string)).toEqual({
      projectId: 'proj_1',
      html: '<html><body>Hi</body></html>',
      name: 'welcome.html',
      instruction: 'Keep this as-is',
    });
  });

  it('getGenerationStatus surfaces result.emails email data', async () => {
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
              id: 'art_1',
              emailId: 'art_1',
              conversationId: 'conv_1',
              messageId: 'msg_1',
              slotIdx: 0,
              slot: 1,
              subject: 'Welcome',
              preheader: 'Start here',
              html: '<html>one</html>',
              status: 'ready',
              screenshotUrl: null,
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
    expect(res.data?.result?.emails[0].emailId).toBe('art_1');
    expect(res.data?.result?.emails[0].html).toBe('<html>one</html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('GET');
    expect(url).toBe('https://api.test.local/v1/projects/emails/conv_1/status');
  });

  it('get(emailId) calls GET /emails/:emailId', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        id: 'art_1',
        emailId: 'art_1',
        conversationId: 'conv_1',
        messageId: 'msg_1',
        slotIdx: 0,
        slotUuid: null,
        status: 'ready',
        subject: 'Welcome',
        preheader: 'Start here',
        html: '<html></html>',
        screenshotUrl: null,
        warnings: [],
        thumbnailUrl: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const res = await client.emails.get('art_1');

    expect(res.error).toBeNull();
    expect(res.data?.html).toBe('<html></html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('GET');
    expect(url).toBe('https://api.test.local/v1/emails/art_1');
  });

  it('edit(emailId, prompt) calls POST /emails/:emailId/edit', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        id: 'art_1',
        emailId: 'art_1',
        conversationId: 'conv_1',
        messageId: 'msg_1',
        slotIdx: 0,
        slotUuid: null,
        status: 'ready',
        subject: 'Updated',
        preheader: '',
        html: '<html>updated</html>',
        screenshotUrl: null,
        warnings: [],
        thumbnailUrl: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const res = await client.emails.edit('art_1', {
      prompt: 'Make it shorter',
    });

    expect(res.error).toBeNull();
    expect(res.data?.html).toBe('<html>updated</html>');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('POST');
    expect(url).toBe('https://api.test.local/v1/emails/art_1/edit');
    expect(JSON.parse(init.body as string)).toEqual({
      prompt: 'Make it shorter',
    });
  });
});

describe('client v1 resource alignment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('projects.fieldCatalog calls GET /projects/:projectId/field-catalog with scope params', async () => {
    const { client, fetchMock } = newClient();
    fetchMock.mockResolvedValueOnce(
      ok({
        entries: [
          {
            key: 'firstName',
            label: 'First name',
            type: 'string',
            fillRate: 0.92,
            sample: ['Sarah'],
            auto: true,
          },
        ],
        totalSubscribers: 25,
        computedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const res = await client.projects.fieldCatalog('proj_1', {
      segmentId: 'seg_1',
      tag: 'tag_1',
    });

    expect(res.error).toBeNull();
    expect(res.data?.entries[0].key).toBe('firstName');

    const { url, init } = lastCall(fetchMock);
    expect(init.method).toBe('GET');
    expect(url).toBe('https://api.test.local/v1/projects/proj_1/field-catalog?segmentId=seg_1&tag=tag_1');
  });

  it('campaigns list/archive/unarchive call the public v1 campaign routes', async () => {
    const { client, fetchMock } = newClient();
    fetchMock
      .mockResolvedValueOnce(ok({ campaigns: [], total: 0 }))
      .mockResolvedValueOnce(ok({ id: 'camp_1', archived: true }))
      .mockResolvedValueOnce(ok({ id: 'camp_1', archived: false }));

    await client.campaigns.list({
      projectId: 'proj_1',
      status: 'draft',
      archived: true,
      page: 2,
      limit: 10,
    });
    await client.campaigns.archive('camp_1');
    await client.campaigns.unarchive('camp_1');

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    expect(calls[0][0]).toBe('https://api.test.local/v1/campaigns?projectId=proj_1&status=draft&page=2&limit=10&archived=true');
    expect(calls[0][1].method).toBe('GET');
    expect(calls[1][0]).toBe('https://api.test.local/v1/campaigns/camp_1/archive');
    expect(calls[1][1].method).toBe('POST');
    expect(calls[2][0]).toBe('https://api.test.local/v1/campaigns/camp_1/unarchive');
    expect(calls[2][1].method).toBe('POST');
  });
});
