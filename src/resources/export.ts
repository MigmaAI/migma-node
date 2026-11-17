import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  ExportResult,
  ExportFormatsResponse,
  ExportStatusResponse,
  HubspotExportParams,
  KlaviyoPushParams,
  KlaviyoPushResult,
} from '../types/export';

export class Export {
  constructor(private readonly client: MigmaClient) {}

  async getFormats(): Promise<MigmaResult<ExportFormatsResponse>> {
    return this.client.get<ExportFormatsResponse>('/export/formats');
  }

  async getStatus(conversationId: string): Promise<MigmaResult<ExportStatusResponse>> {
    return this.client.get<ExportStatusResponse>(
      `/export/status/${conversationId}`
    );
  }

  async html(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/html/${conversationId}`);
  }

  async pdf(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/pdf/${conversationId}`);
  }

  async png(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/png/${conversationId}`);
  }

  async klaviyo(
    conversationId: string,
    klaviyoType?: 'html' | 'hybrid' | 'code'
  ): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(
      `/export/klaviyo/${conversationId}`,
      { klaviyoType }
    );
  }

  /**
   * Create an HTML template in the brand's connected Klaviyo account, with the
   * email's images hosted in Klaviyo. Pass the same `idempotencyKey` when retrying
   * so a retry returns the first template instead of creating another. No automatic
   * retries by default: a server error is not replayed, and Klaviyo may already hold the
   * template, so check it before retrying.
   */
  async pushToKlaviyo(
    conversationId: string,
    params: KlaviyoPushParams = {},
    options?: CallOptions
  ): Promise<MigmaResult<KlaviyoPushResult>> {
    return this.client.post<KlaviyoPushResult>(
      `/export/klaviyo/${encodeURIComponent(conversationId)}/push`,
      params as unknown as Record<string, unknown>,
      { maxRetries: 0, ...options, idempotencyKey: options?.idempotencyKey || randomUUID() }
    );
  }

  async mailchimp(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/mailchimp/${conversationId}`);
  }

  async hubspot(params: HubspotExportParams): Promise<MigmaResult<ExportResult>> {
    return this.client.post<ExportResult>(
      '/export/hubspot',
      params as unknown as Record<string, unknown>
    );
  }
}
