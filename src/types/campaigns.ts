export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'throttled' | 'ab_testing' | 'sent' | 'failed' | 'cancelled';

export interface Campaign {
  id: string;
  projectId: string;
  name: string;
  conversationId: string;
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
  triggeredBy?: 'manual' | 'api' | 'automation';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignParams {
  projectId: string;
  name: string;
  conversationId: string;
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
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

export interface ScheduleCampaignParams {
  scheduledAt: string;
  scheduledTimezone?: string;
}
