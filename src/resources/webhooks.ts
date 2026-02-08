import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  Webhook,
  WebhookDetail,
  CreateWebhookParams,
  UpdateWebhookParams,
  ListWebhooksResponse,
  WebhookTestResult,
  WebhookDeliveriesResponse,
  WebhookEventsResponse,
} from '../types/webhooks';

export class Webhooks {
  constructor(private readonly client: MigmaClient) {}

  async list(): Promise<MigmaResult<ListWebhooksResponse>> {
    return this.client.get<ListWebhooksResponse>('/webhooks');
  }

  async create(params: CreateWebhookParams): Promise<MigmaResult<Webhook>> {
    return this.client.post<Webhook>('/webhooks', params as unknown as Record<string, unknown>);
  }

  async get(webhookId: string): Promise<MigmaResult<WebhookDetail>> {
    return this.client.get<WebhookDetail>(`/webhooks/${webhookId}`);
  }

  async update(
    webhookId: string,
    params: UpdateWebhookParams
  ): Promise<MigmaResult<{ updated: boolean }>> {
    return this.client.patch<{ updated: boolean }>(
      `/webhooks/${webhookId}`,
      params as unknown as Record<string, unknown>
    );
  }

  async remove(webhookId: string): Promise<MigmaResult<{ deleted: boolean }>> {
    return this.client.delete<{ deleted: boolean }>(`/webhooks/${webhookId}`);
  }

  async test(webhookId: string): Promise<MigmaResult<WebhookTestResult>> {
    return this.client.post<WebhookTestResult>(`/webhooks/${webhookId}/test`);
  }

  async getDeliveries(
    webhookId: string,
    limit?: number
  ): Promise<MigmaResult<WebhookDeliveriesResponse>> {
    return this.client.get<WebhookDeliveriesResponse>(
      `/webhooks/${webhookId}/deliveries`,
      { limit }
    );
  }

  async getEvents(): Promise<MigmaResult<WebhookEventsResponse>> {
    return this.client.get<WebhookEventsResponse>('/webhooks/events');
  }

  async getStats(): Promise<MigmaResult<Record<string, unknown>>> {
    return this.client.get<Record<string, unknown>>('/webhooks/stats');
  }
}
