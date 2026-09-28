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
  variables?: Record<string, unknown>;
  providerType?: ProviderType;
  /** Optional when emailId or conversationId can resolve project automatically. */
  projectId?: string;
  /**
   * Generated email id from result.emails[].emailId. Use this for selected
   * emails inside multi-slot conversations or series. Resolves template,
   * projectId, and parent conversation automatically.
   */
  emailId?: string;
  /**
   * Conversation id. Works for single-email conversations. For multi-slot
   * conversations, use emailId so API knows which email to send.
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
  /** Real tracking id for a single send — use with emails.metrics()/logs() and the activity view. Absent for batch sends. */
  sendId?: string;
  /** Batch id for an audience/tag send. Absent for single sends. */
  batchId?: string;
  /** Echoes the generated email id this send was tagged with, when provided. */
  emailId?: string;
  /** Conversation this send belongs to, when known. */
  conversationId?: string;
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
