export interface EmailImage {
  source: { type: 'url'; url: string };
}

export interface GenerateEmailParams {
  projectId: string;
  prompt: string;
  images?: EmailImage[];
  model?: string;
  webMode?: boolean;
  languages?: string[];
  visibility?: 'private' | 'unlisted' | 'public';
  referenceId?: string;
  /** Optional target email count. Omit to let Migma infer single vs series from the prompt. */
  count?: number;
}

export interface GenerateEmailResponse {
  conversationId: string;
  status: 'pending';
  message: string;
  link: string;
  count?: number;
  referenceId?: string;
}

export interface EmailGenerationResult {
  subject: string;
  previewText: string;
  html: string;
  emails: GeneratedEmail[];
  seriesPlan?: {
    name?: string;
    count?: number;
    themeId?: string;
  };
  screenshotUrl: string | null;
  screenshotFullUrl: string | null;
  stats: {
    imageCount: number;
    buttonCount: number;
    estimatedLength: string;
    colors: string[];
  };
  languages: string[];
}

export interface GeneratedEmail {
  id: string | null;
  emailId: string | null;
  conversationId: string;
  messageId: string | null;
  slotIdx: number;
  slot: number;
  subject: string;
  preheader: string;
  html: string;
  sendOffsetDays?: number;
  status: 'ready' | 'processing' | 'failed';
  screenshotUrl?: string | null;
  thumbnailUrl?: string | null;
}

export interface EmailGenerationStatus {
  conversationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
  result?: EmailGenerationResult;
}

export interface ListEmailsParams {
  projectId: string;
  limit?: number;
  page?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  search?: string;
}

export interface ListEmailsEmail {
  conversationId: string;
  title: string;
  subject: string | null;
  previewText: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  screenshotUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListEmailsResponse {
  emails: ListEmailsEmail[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface SendTestEmailParams {
  emailId?: string;
  conversationId?: string;
  to: string;
}

export interface SendTestEmailResponse {
  messageId: string;
  emailId?: string;
  conversationId: string;
  sentTo: string;
  sentAt: string;
  subject: string;
}

export interface Email {
  id: string;
  emailId: string;
  conversationId: string;
  messageId: string | null;
  slotIdx: number;
  slotUuid: string | null;
  status: string;
  subject: string;
  preheader: string;
  html: string;
  screenshotUrl: string | null;
  warnings: string[];
  thumbnailUrl: string | null;
  updatedAt: string;
}

export interface EditEmailParams {
  prompt: string;
  label?: string;
}

export interface EmailMetricsSummary {
  totalEmails: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  /** 0-100 */
  deliveryRate: number;
  /** 0-100 */
  openRate: number;
  /** 0-100 */
  clickRate: number;
  /** 0-100 */
  bounceRate: number;
  /** 0-100 */
  complaintRate: number;
  /** 0-100 */
  unsubscribeRate: number;
}

export interface EmailMetricsTimePoint {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

export interface EmailMetricsCountry {
  country: string;
  count: number;
}

/**
 * Aggregate performance for one generated email across every API send of it,
 * plus a daily time series and country breakdown.
 *
 * Sourced from the email tracking worker, so values may be slightly stale and
 * cover roughly the last 30 days of raw send history (aggregates persist
 * longer). Opens are directional — Apple Mail Privacy Protection and bots
 * inflate them; clicks and delivery events are stronger signals.
 */
export interface EmailMetrics {
  summary: EmailMetricsSummary;
  timeSeries: EmailMetricsTimePoint[];
  countryBreakdown: EmailMetricsCountry[];
  /** ISO 8601 timestamp of when these stats were last refreshed. */
  lastUpdated: string;
  cached: boolean;
}

/**
 * A single per-recipient send row for one generated email. Returned directly
 * from the tracking worker's D1 table, so field names are snake_case.
 */
export interface EmailSendLog {
  id: number;
  tracking_id: string;
  domain: string;
  from_email: string;
  to_email: string;
  subject: string | null;
  /** Delivery status, e.g. 'sent', 'delivered', 'bounced', 'suppressed'. */
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  open_count: number;
  click_count: number;
  bounce_type: string | null;
  complaint_type: string | null;
  created_at: string;
}

export interface EmailLogsParams {
  limit?: number;
  cursor?: string;
  status?: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'suppressed' | 'sent';
}

export interface EmailLogsResponse {
  emails: EmailSendLog[];
  nextCursor: string | null;
  hasMore: boolean;
}
