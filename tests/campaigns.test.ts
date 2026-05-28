import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Campaigns } from '../src/resources/campaigns';
import type { MigmaClient } from '../src/client';
import type {
  Campaign,
  CreateCampaignParams,
  ListCampaignsResponse,
  ScheduleCampaignParams,
} from '../src/types/campaigns';

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

const fakeCampaign: Campaign = {
  id: 'camp_123',
  projectId: 'proj_abc',
  name: 'Test Campaign',
  conversationId: 'conv_xyz',
  subject: 'Hello World',
  from: 'hello@example.com',
  fromName: 'Test',
  recipientType: 'tag',
  recipientId: 'tag_1',
  providerType: 'migma',
  status: 'draft',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Campaigns', () => {
  let client: MigmaClient;
  let campaigns: Campaigns;

  beforeEach(() => {
    client = mockClient();
    campaigns = new Campaigns(client);
  });

  // ── list ──────────────────────────────────────────────────────────────

  describe('list', () => {
    it('passes required projectId', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { campaigns: [fakeCampaign], total: 1 } satisfies ListCampaignsResponse,
        error: null,
      });

      const { data, error } = await campaigns.list({ projectId: 'proj_abc' });

      expect(error).toBeNull();
      expect(data).toEqual({ campaigns: [fakeCampaign], total: 1 });
      expect(client.get).toHaveBeenCalledWith('/campaigns', {
        projectId: 'proj_abc',
        status: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('passes all optional params', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { campaigns: [], total: 0 },
        error: null,
      });

      await campaigns.list({
        projectId: 'proj_abc',
        status: 'scheduled',
        page: 2,
        limit: 10,
      });

      expect(client.get).toHaveBeenCalledWith('/campaigns', {
        projectId: 'proj_abc',
        status: 'scheduled',
        page: 2,
        limit: 10,
      });
    });
  });

  // ── create ────────────────────────────────────────────────────────────

  describe('create', () => {
    it('sends required params only', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: fakeCampaign,
        error: null,
      });

      const params: CreateCampaignParams = {
        projectId: 'proj_abc',
        name: 'Test Campaign',
        conversationId: 'conv_xyz',
        from: 'hello@example.com',
        fromName: 'Test',
        recipientType: 'tag',
        recipientId: 'tag_1',
      };

      const { data, error } = await campaigns.create(params);

      expect(error).toBeNull();
      expect(data).toEqual(fakeCampaign);
      expect(client.post).toHaveBeenCalledWith('/campaigns', params);
    });

    it('sends all optional params', async () => {
      const withOptional = {
        ...fakeCampaign,
        preheaderText: 'Preview text',
        replyTo: 'reply@example.com',
        topicId: 'topic_1',
      };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: withOptional,
        error: null,
      });

      const params: CreateCampaignParams = {
        projectId: 'proj_abc',
        name: 'Test Campaign',
        conversationId: 'conv_xyz',
        from: 'hello@example.com',
        fromName: 'Test',
        recipientType: 'audience',
        recipientId: 'aud_1',
        subject: 'Custom Subject',
        preheaderText: 'Preview text',
        replyTo: 'reply@example.com',
        topicId: 'topic_1',
        providerType: 'ses',
        variables: { discount: '30%' },
      };

      const { data, error } = await campaigns.create(params);

      expect(error).toBeNull();
      expect(client.post).toHaveBeenCalledWith('/campaigns', params);
    });
  });

  // ── get ───────────────────────────────────────────────────────────────

  describe('get', () => {
    it('fetches a campaign by id', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: fakeCampaign,
        error: null,
      });

      const { data, error } = await campaigns.get('camp_123');

      expect(error).toBeNull();
      expect(data).toEqual(fakeCampaign);
      expect(client.get).toHaveBeenCalledWith('/campaigns/camp_123');
    });
  });

  // ── send ──────────────────────────────────────────────────────────────

  describe('send', () => {
    it('posts to the send endpoint', async () => {
      const sent = { ...fakeCampaign, status: 'sending' as const };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: sent,
        error: null,
      });

      const { data, error } = await campaigns.send('camp_123');

      expect(error).toBeNull();
      expect(data!.status).toBe('sending');
      expect(client.post).toHaveBeenCalledWith('/campaigns/camp_123/send');
    });
  });

  // ── schedule ──────────────────────────────────────────────────────────

  describe('schedule', () => {
    it('schedules with required scheduledAt only', async () => {
      const scheduled = {
        ...fakeCampaign,
        status: 'scheduled' as const,
        scheduledAt: '2026-07-01T09:00:00Z',
      };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: scheduled,
        error: null,
      });

      const params: ScheduleCampaignParams = {
        scheduledAt: '2026-07-01T09:00:00Z',
      };

      const { data, error } = await campaigns.schedule('camp_123', params);

      expect(error).toBeNull();
      expect(data!.status).toBe('scheduled');
      expect(data!.scheduledAt).toBe('2026-07-01T09:00:00Z');
      expect(client.post).toHaveBeenCalledWith(
        '/campaigns/camp_123/schedule',
        params,
      );
    });

    it('schedules with optional scheduledTimezone', async () => {
      const scheduled = {
        ...fakeCampaign,
        status: 'scheduled' as const,
        scheduledAt: '2026-07-01T09:00:00Z',
        scheduledTimezone: 'America/New_York',
      };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: scheduled,
        error: null,
      });

      const params: ScheduleCampaignParams = {
        scheduledAt: '2026-07-01T09:00:00Z',
        scheduledTimezone: 'America/New_York',
      };

      const { data, error } = await campaigns.schedule('camp_123', params);

      expect(error).toBeNull();
      expect(data!.scheduledTimezone).toBe('America/New_York');
      expect(client.post).toHaveBeenCalledWith(
        '/campaigns/camp_123/schedule',
        params,
      );
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('cancels a campaign', async () => {
      const cancelled = { ...fakeCampaign, status: 'cancelled' as const };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: cancelled,
        error: null,
      });

      const { data, error } = await campaigns.cancel('camp_123');

      expect(error).toBeNull();
      expect(data!.status).toBe('cancelled');
      expect(client.post).toHaveBeenCalledWith('/campaigns/camp_123/cancel');
    });
  });

  // ── error propagation ────────────────────────────────────────────────

  describe('error handling', () => {
    it('propagates errors from client on list', async () => {
      const err = { statusCode: 401, code: 'unauthorized', message: 'Unauthorized' };
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: err });

      const { data, error } = await campaigns.list({ projectId: 'proj_abc' });

      expect(data).toBeNull();
      expect(error).toEqual(err);
    });

    it('propagates errors from client on create', async () => {
      const err = { statusCode: 400, code: 'validation_error', message: 'Missing field' };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: err });

      const { data, error } = await campaigns.create({
        projectId: 'proj_abc',
        name: 'Test',
        conversationId: 'conv_xyz',
        from: 'a@b.com',
        fromName: 'Test',
        recipientType: 'tag',
        recipientId: 'tag_1',
      });

      expect(data).toBeNull();
      expect(error).toEqual(err);
    });

    it('propagates errors from client on schedule', async () => {
      const err = { statusCode: 422, code: 'validation_error', message: 'Invalid date' };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: err });

      const { data, error } = await campaigns.schedule('camp_123', {
        scheduledAt: 'not-a-date',
      });

      expect(data).toBeNull();
      expect(error).toEqual(err);
    });
  });
});
