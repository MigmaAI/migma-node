import type { CallOptions, MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  Campaign,
  CampaignLogsParams,
  CampaignLogsResponse,
  CampaignStats,
  CreateCampaignParams,
  ListCampaignsParams,
  ListCampaignsResponse,
  ScheduleCampaignParams,
} from '../types/campaigns';

export class Campaigns {
  constructor(private readonly client: MigmaClient) {}

  async list(params: ListCampaignsParams): Promise<MigmaResult<ListCampaignsResponse>> {
    const { projectId, status, page, limit, archived } = params;
    return this.client.get<ListCampaignsResponse>('/campaigns', {
      projectId,
      status,
      page,
      limit,
      archived,
    });
  }

  async create(params: CreateCampaignParams, options?: CallOptions): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>('/campaigns', params as unknown as Record<string, unknown>, options);
  }

  async get(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.get<Campaign>(`/campaigns/${id}`);
  }

  async send(id: string, options?: CallOptions): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/send`, undefined, options);
  }

  async schedule(id: string, params: ScheduleCampaignParams, options?: CallOptions): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/schedule`, params as unknown as Record<string, unknown>, options);
  }

  async cancel(id: string, options?: CallOptions): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/cancel`, undefined, options);
  }

  /** Aggregated engagement metrics for a campaign (cached, may be slightly stale). */
  async stats(id: string): Promise<MigmaResult<CampaignStats>> {
    return this.client.get<CampaignStats>(`/campaigns/${id}/stats`);
  }

  /** Per-recipient email logs for a campaign (cursor-paginated). */
  async logs(id: string, params?: CampaignLogsParams): Promise<MigmaResult<CampaignLogsResponse>> {
    return this.client.get<CampaignLogsResponse>(`/campaigns/${id}/logs`, {
      limit: params?.limit,
      cursor: params?.cursor,
      status: params?.status,
    });
  }

  async archive(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/archive`);
  }

  async unarchive(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/unarchive`);
  }
}
