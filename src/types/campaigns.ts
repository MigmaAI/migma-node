export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'throttled' | 'ab_testing' | 'sent' | 'failed' | 'cancelled';

export interface Campaign {
  id: string;
  projectId: string;
  name: string;
  conversationId: string;
  emailId?: string | null;
  subject: string;
  preheaderText?: string | null;
  from: string;
  fromName: string;
  replyTo?: string | null;
  recipientType: 'audience' | 'tag';
  recipientId: string;
  topicId?: string | null;
  estimatedRecipients?: number | null;
  providerType: string;
  variables?: Record<string, unknown> | null;
  status: CampaignStatus;
  scheduledAt?: string | null;
  scheduledTimezone?: string | null;
  batchId?: string | null;
  sentAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
  archived?: boolean;
  archivedAt?: string | null;
  triggeredBy?: 'manual' | 'api' | 'automation';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignParams {
  projectId: string;
  name: string;
  conversationId: string;
  /** Generated email ID from result.emails[].emailId. Recommended for series slots. */
  emailId?: string;
  subject?: string;
  preheaderText?: string;
  from: string;
  fromName: string;
  replyTo?: string;
  recipientType: 'audience' | 'tag';
  recipientId: string;
  topicId?: string;
  providerType?: 'ses' | 'resend' | 'sendgrid' | 'mailgun' | 'migma';
  variables?: Record<string, unknown>;
}

export interface ListCampaignsParams {
  projectId: string;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
  archived?: boolean;
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

export interface ScheduleCampaignParams {
  scheduledAt: string;
  scheduledTimezone?: string;
}

/**
 * Aggregated engagement metrics for a campaign.
 *
 * Sourced from the email tracking worker and cached on the campaign, so values
 * may be slightly stale. `botOpens`, `botClicks`, and `mppOpens` are present
 * when Apple Mail Privacy Protection / bot detection data is available.
 */
export interface CampaignStats {
  totalSent: number;
  totalDelivered: number;
  uniqueOpens: number;
  totalOpens: number;
  uniqueClicks: number;
  totalClicks: number;
  unsubscribes: number;
  bounces: number;
  /** 0-100 */
  openRate: number;
  /** 0-100 */
  clickRate: number;
  /** ISO 8601 timestamp of when these stats were last refreshed. */
  lastUpdated: string;
  botOpens?: number;
  botClicks?: number;
  mppOpens?: number;
}

/**
 * A single per-recipient email log row for a campaign. Returned directly from
 * the tracking worker's D1 `emails` table, so the field names are snake_case
 * (unlike the rest of the API).
 */
export interface CampaignLog {
  id: number;
  tracking_id: string;
  user_id: string;
  domain: string;
  from_email: string;
  to_email: string;
  subscriber_id: string | null;
  subject: string | null;
  /** Delivery status, e.g. 'sent', 'delivered', 'bounced', 'suppressed'. */
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  open_count: number;
  click_count: number;
  bounce_type: string | null;
  complaint_type: string | null;
  suppression_type: string | null;
  suppression_reason: string | null;
  conversation_id: string | null;
  campaign_id: string | null;
  created_at: string;
}

export interface CampaignLogsParams {
  limit?: number;
  cursor?: string;
  status?: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam_report';
}

export interface CampaignLogsResponse {
  emails: CampaignLog[];
  nextCursor: string | null;
  hasMore: boolean;
}
