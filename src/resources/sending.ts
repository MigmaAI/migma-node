import type { CallOptions, MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  SendEmailParams,
  SendEmailResponse,
  BatchStatus,
} from '../types/sending';

export class Sending {
  constructor(private readonly client: MigmaClient) {}

  async send(params: SendEmailParams, options?: CallOptions): Promise<MigmaResult<SendEmailResponse>> {
    return this.client.post<SendEmailResponse>('/sending', params as unknown as Record<string, unknown>, options);
  }

  async getBatchStatus(batchId: string): Promise<MigmaResult<BatchStatus>> {
    return this.client.get<BatchStatus>(`/sending/batches/${batchId}`);
  }
}
