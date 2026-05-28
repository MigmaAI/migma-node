import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Emails } from '../src/resources/emails';
import type { MigmaClient } from '../src/client';
import type { ListEmailsResponse } from '../src/types/emails';

function mockClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    getWithCount: vi.fn(),
    request: vi.fn(),
    requestWithCount: vi.fn(),
  } as unknown as MigmaClient;
}

describe('Emails', () => {
  let client: MigmaClient;
  let emails: Emails;

  beforeEach(() => {
    client = mockClient();
    emails = new Emails(client);
  });

  describe('list', () => {
    it('passes required projectId', async () => {
      const response: ListEmailsResponse = { emails: [], total: 0 };
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: response,
        error: null,
      });

      const { data, error } = await emails.list({ projectId: 'proj_abc' });

      expect(error).toBeNull();
      expect(data).toEqual(response);
      expect(client.get).toHaveBeenCalledWith('/projects/emails', {
        projectId: 'proj_abc',
        status: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('passes all optional params', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { emails: [], total: 0 },
        error: null,
      });

      await emails.list({
        projectId: 'proj_abc',
        status: 'completed',
        page: 1,
        limit: 5,
      });

      expect(client.get).toHaveBeenCalledWith('/projects/emails', {
        projectId: 'proj_abc',
        status: 'completed',
        page: 1,
        limit: 5,
      });
    });

    it('propagates errors', async () => {
      const err = { statusCode: 401, code: 'unauthorized', message: 'Unauthorized' };
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: err });

      const { data, error } = await emails.list({ projectId: 'proj_abc' });

      expect(data).toBeNull();
      expect(error).toEqual(err);
    });
  });
});
