import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  Campaign,
  CreateCampaignParams,
  ListCampaignsParams,
  ListCampaignsResponse,
  ScheduleCampaignParams,
} from '../types/campaigns';

export class Campaigns {
  constructor(private readonly client: MigmaClient) {}

  async list(params: ListCampaignsParams): Promise<MigmaResult<ListCampaignsResponse>> {
    const { projectId, status, page, limit } = params;
    return this.client.get<ListCampaignsResponse>('/campaigns', {
      projectId,
      status,
      page,
      limit,
    });
  }

  async create(params: CreateCampaignParams): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>('/campaigns', params as unknown as Record<string, unknown>);
  }

  async get(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.get<Campaign>(`/campaigns/${id}`);
  }

  async send(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/send`);
  }

  async schedule(id: string, params: ScheduleCampaignParams): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/schedule`, params as unknown as Record<string, unknown>);
  }

  async cancel(id: string): Promise<MigmaResult<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${id}/cancel`);
  }
}
