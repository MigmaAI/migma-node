import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  ExportResult,
  ExportFormatsResponse,
  ExportStatusResponse,
  HubspotExportParams,
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

  async mjml(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/mjml/${conversationId}`);
  }

  async pdf(conversationId: string): Promise<MigmaResult<ExportResult>> {
    return this.client.get<ExportResult>(`/export/pdf/${conversationId}`);
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
