import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  GenerateEmailParams,
  GenerateEmailResponse,
  EmailGenerationStatus,
  SendTestEmailParams,
  SendTestEmailResponse,
} from '../types/emails';
import { poll, type PollingOptions } from '../polling';

export class Emails {
  constructor(private readonly client: MigmaClient) {}

  /** Start async email generation */
  async generate(
    params: GenerateEmailParams
  ): Promise<MigmaResult<GenerateEmailResponse>> {
    return this.client.post<GenerateEmailResponse>(
      '/projects/emails/generate',
      params as unknown as Record<string, unknown>
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

  /**
   * Generate an email and wait for completion.
   * Polls getGenerationStatus until status is 'completed' or 'failed'.
   */
  async generateAndWait(
    params: GenerateEmailParams,
    options?: PollingOptions
  ): Promise<MigmaResult<EmailGenerationStatus>> {
    const startResult = await this.generate(params);
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
}
