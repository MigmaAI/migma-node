import { File } from 'node:buffer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../../src';

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const started = { object: 'contact_import', id: 'job', status: 'processing' };
const csv = 'Email,First Name\nada@example.com,Ada\n';
const client = () => new Migma('test', { baseUrl: 'https://api.test/v1', maxRetries: 3, retryDelay: 0 });

/** Reads the multipart body the way the server would. */
const sentForm = (init: RequestInit) => new Response(init.body as FormData).formData();

describe('contact CSV imports', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uploads a Buffer as multipart with the fields the API reads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(started));
    vi.stubGlobal('fetch', fetchMock);

    const { data } = await client().contacts.createImport({
      file: Buffer.from(csv),
      projectId: 'brand',
      columnMap: { email: 'Email', firstName: 'First Name', customFields: { plan: 'Plan' } },
      onConflict: 'skip',
      delimiter: ';',
      tags: ['newsletter', 'launch'],
    });

    expect(data).toEqual(started);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/v1/contacts/imports');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBeUndefined();
    expect(init.headers.Authorization).toBe('Bearer test');

    const form = await sentForm(init);
    const file = form.get('file') as File;
    expect(file.name).toBe('contacts.csv');
    expect(file.type).toBe('text/csv');
    expect(await file.text()).toBe(csv);
    expect(form.get('projectId')).toBe('brand');
    expect(JSON.parse(form.get('columnMap') as string)).toEqual({
      email: 'Email',
      firstName: 'First Name',
      customFields: { plan: 'Plan' },
    });
    expect(form.get('onConflict')).toBe('skip');
    expect(form.get('delimiter')).toBe(';');
    expect(JSON.parse(form.get('tags') as string)).toEqual(['newsletter', 'launch']);
  });

  it('leaves optional fields out so the API defaults apply', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(started));
    vi.stubGlobal('fetch', fetchMock);

    await client().contacts.createImport({ file: Buffer.from(csv), projectId: 'brand', columnMap: { email: 'Email' } });

    const form = await sentForm(fetchMock.mock.calls[0][1]);
    expect([...form.keys()].sort()).toEqual(['columnMap', 'file', 'projectId']);
  });

  it('keeps a File name unless fileName is given', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok(started));
    vi.stubGlobal('fetch', fetchMock);
    const params = { file: new File([csv], 'march.csv'), projectId: 'brand', columnMap: { email: 'Email' } };

    await client().contacts.createImport(params);
    await client().contacts.createImport({ ...params, fileName: 'april.csv' });

    expect(((await sentForm(fetchMock.mock.calls[0][1])).get('file') as File).name).toBe('march.csv');
    expect(((await sentForm(fetchMock.mock.calls[1][1])).get('file') as File).name).toBe('april.csv');
  });

  it('never repeats an upload, because a repeat creates a second import', async () => {
    const lost = vi.fn().mockRejectedValue(new Error('lost response'));
    vi.stubGlobal('fetch', lost);
    const params = { file: Buffer.from(csv), projectId: 'brand', columnMap: { email: 'Email' } };

    const network = await client().contacts.createImport(params);
    expect(network.error?.message).toBe('lost response');
    expect(lost).toHaveBeenCalledTimes(1);

    const busy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'Busy' }), { status: 503 }));
    vi.stubGlobal('fetch', busy);
    const server = await client().contacts.createImport(params);
    expect(server.error?.statusCode).toBe(503);
    expect(busy).toHaveBeenCalledTimes(1);
  });

  it('polls a CSV or provider import by id', async () => {
    const status = {
      object: 'contact_import',
      id: 'job/1',
      status: 'completed',
      provider: null,
      tag_id: null,
      segment_id: null,
      counts: { total: 2, created: 1, updated: 1, skipped: 0, failed: 0, non_sendable: 0 },
      error: null,
      created_at: '2026-11-04T10:00:00.000Z',
      completed_at: '2026-11-04T10:00:05.000Z',
    };
    const fetchMock = vi.fn().mockResolvedValue(ok(status));
    vi.stubGlobal('fetch', fetchMock);

    const { data } = await client().contacts.getImport('job/1');

    expect(data).toEqual(status);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/v1/contacts/imports/job%2F1');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
  });

  it('still sends JSON from every other write', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 'c' }));
    vi.stubGlobal('fetch', fetchMock);

    await client().contacts.create({ email: 'ada@example.com', projectId: 'brand' });

    const init = fetchMock.mock.calls[0][1];
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ email: 'ada@example.com', projectId: 'brand' });
  });
});
