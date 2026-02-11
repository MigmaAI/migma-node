export type RecipientType = 'email' | 'audience' | 'segment' | 'tag';
export type ProviderType = 'ses' | 'resend' | 'sendgrid' | 'mailgun' | 'migma';

export interface SendEmailParams {
  recipientType: RecipientType;
  /** Required when recipientType is audience, segment, or tag */
  recipientId?: string;
  /** Required when recipientType is email */
  recipientEmail?: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  /** Email template — raw HTML or a React Email TSX component with a default export */
  template: string;
  variables?: Record<string, unknown>;
  providerType?: ProviderType;
  projectId: string;
  conversationId?: string;
}

export interface SendEmailResponse {
  id: string;
  provider: string;
  status: string;
  sentCount?: number;
  message?: string;
}

export interface BatchStatus {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipientType: string;
  recipientId?: string;
  provider: string;
  totalCount: number;
  queuedCount: number;
  sentCount: number;
  failedCount: number;
  from: string;
  fromName: string;
  subject: string;
  createdAt: string;
  updatedAt?: string;
  error?: string;
}
