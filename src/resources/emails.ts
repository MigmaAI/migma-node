import type { CallOptions, MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  GenerateEmailParams,
  GenerateEmailResponse,
  ImportHtmlEmailParams,
  EmailGenerationStatus,
  Email,
  EditEmailParams,
  ListEmailsParams,
  ListEmailsResponse,
  SendTestEmailParams,
  SendTestEmailResponse,
  EmailMetrics,
  EmailLogsParams,
  EmailLogsResponse,
} from '../types/emails';
import { poll, type PollingOptions } from '../polling';

export class Emails {
  constructor(private readonly client: MigmaClient) {}

  /** List emails for a project */
  async list(
    params: ListEmailsParams
  ): Promise<MigmaResult<ListEmailsResponse>> {
    const { projectId, limit, page, status, search } = params;
    return this.client.get<ListEmailsResponse>('/projects/emails', {
      projectId,
      limit,
      page,
      status,
      search,
    });
  }

  /** Start async email generation */
  async generate(
    params: GenerateEmailParams,
    options?: CallOptions
  ): Promise<MigmaResult<GenerateEmailResponse>> {
    return this.client.post<GenerateEmailResponse>(
      '/projects/emails/generate',
      params as unknown as Record<string, unknown>,
      options
    );
  }

  /** Convert existing HTML or .eml into editable emails (async). */
  async importHtml(
    params: ImportHtmlEmailParams,
    options?: CallOptions
  ): Promise<MigmaResult<GenerateEmailResponse>> {
    return this.client.post<GenerateEmailResponse>(
      '/projects/emails/import-html',
      params as unknown as Record<string, unknown>,
      options
    );
  }

  /** Check email generation status */
  async getGenerationStatus(
    conversationId: string
  ): Promise<MigmaResult<EmailGenerationStatus>> {
    return this.client.get<EmailGenerationStatus>(
      `/projects/emails/${conversationId}/status`
    );
  }

  /** Fetch one generated email by email id */
  async get(emailId: string): Promise<MigmaResult<Email>> {
    return this.client.get<Email>(`/emails/${emailId}`);
  }

  /** Prompt Migma to edit one generated email */
  async edit(
    emailId: string,
    params: EditEmailParams
  ): Promise<MigmaResult<Email>> {
    return this.client.post<Email>(
      `/emails/${emailId}/edit`,
      params as unknown as Record<string, unknown>
    );
  }

  /**
   * Generate an email and wait for completion.
   * Polls getGenerationStatus until status is 'completed' or 'failed'.
   */
  async generateAndWait(
    params: GenerateEmailParams,
    options?: PollingOptions,
    callOptions?: CallOptions
  ): Promise<MigmaResult<EmailGenerationStatus>> {
    const startResult = await this.generate(params, callOptions);
    if (startResult.error) {
      return { data: null, error: startResult.error };
    }

    const conversationId = startResult.data.conversationId;

    return poll(
      () => this.getGenerationStatus(conversationId),
      (status) => status.status === 'completed' || status.status === 'failed',
      options
    );
  }

  /**
   * Import HTML and wait for completion.
   * Polls getGenerationStatus until status is 'completed' or 'failed'.
   */
  async importHtmlAndWait(
    params: ImportHtmlEmailParams,
    options?: PollingOptions,
    callOptions?: CallOptions
  ): Promise<MigmaResult<EmailGenerationStatus>> {
    const startResult = await this.importHtml(params, callOptions);
    if (startResult.error) {
      return { data: null, error: startResult.error };
    }

    const conversationId = startResult.data.conversationId;

    return poll(
      () => this.getGenerationStatus(conversationId),
      (status) => status.status === 'completed' || status.status === 'failed',
      options
    );
  }

  /** Send a test email from a completed conversation */
  async sendTest(
    params: SendTestEmailParams
  ): Promise<MigmaResult<SendTestEmailResponse>> {
    return this.client.post<SendTestEmailResponse>(
      '/emails/test/send',
      params as unknown as Record<string, unknown>
    );
  }

  /**
   * Aggregate performance for one generated email across every API send of it:
   * delivery, opens, clicks, bounces, complaints, unsubscribes + a daily time
   * series. Events arrive asynchronously; opens are directional while clicks
   * and delivery events are stronger signals.
   */
  async metrics(emailId: string): Promise<MigmaResult<EmailMetrics>> {
    return this.client.get<EmailMetrics>(`/emails/${emailId}/metrics`);
  }

  /** Per-recipient send log for one generated email (cursor-paginated). */
  async logs(
    emailId: string,
    params?: EmailLogsParams
  ): Promise<MigmaResult<EmailLogsResponse>> {
    return this.client.get<EmailLogsResponse>(`/emails/${emailId}/logs`, {
      limit: params?.limit,
      cursor: params?.cursor,
      status: params?.status,
    });
  }
}
