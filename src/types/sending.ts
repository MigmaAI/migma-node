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
  bcc?: string[];
  subject: string;
  /** Email template source. Required unless conversationId or artifactId is provided. */
  template?: string;
  variables?: Record<string, unknown>;
  providerType?: ProviderType;
  /** Required unless conversationId or artifactId is provided. */
  projectId?: string;
  /**
   * Slot-precise email artifact id. Use this for a selected email inside a
   * multi-slot conversation or series. Resolves template, projectId, and parent
   * conversation automatically.
   */
  artifactId?: string;
  /**
   * Conversation id. Works for single-email conversations. For multi-slot
   * conversations, also provide artifactId so API knows which email to send.
   */
  conversationId?: string;
  /** Defaults to true for single sends, false for batch sends. Set explicitly to override. Transactional emails bypass subscription status and topic filters, and omit List-Unsubscribe headers. */
  transactional?: boolean;
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
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial' | 'throttled';
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
  /** Present when status is 'throttled' — indicates the batch is waiting for capacity */
  throttle?: {
    throttledAt: string;
    expiresAt: string;
    resumeCount: number;
    reason: string;
    remainingCount: number;
    resumeMessage?: string;
  };
}
