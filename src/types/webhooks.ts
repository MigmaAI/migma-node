export type WebhookEventType =
  | 'email.generation.started'
  | 'email.generation.completed'
  | 'email.generation.failed'
  | 'email.test.sent'
  | 'project.import.started'
  | 'project.import.processing'
  | 'project.import.completed'
  | 'project.import.failed'
  | 'export.completed'
  | 'export.failed'
  | 'subscriber.added'
  | 'subscriber.updated'
  | 'subscriber.unsubscribed'
  | 'subscriber.bulk_imported'
  | 'api_key.created'
  | 'api_key.revoked';

export interface CreateWebhookParams {
  url: string;
  events: WebhookEventType[];
  description?: string;
  customHeaders?: Record<string, string>;
}

export interface UpdateWebhookParams {
  url?: string;
  events?: WebhookEventType[];
  active?: boolean;
  description?: string;
  customHeaders?: Record<string, string>;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  secret: string;
  description?: string;
  createdAt: string;
}

export interface WebhookDetail extends Webhook {
  customHeaders?: Record<string, string>;
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
  updatedAt: string;
}

export interface ListWebhooksResponse {
  webhooks: WebhookDetail[];
  total: number;
}

export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export interface WebhookDelivery {
  id: string;
  eventId: string;
  eventType: WebhookEventType;
  status: string;
  attempts: number;
  lastAttemptAt: string;
  response: Record<string, unknown>;
  createdAt: string;
}

export interface WebhookDeliveriesResponse {
  deliveries: WebhookDelivery[];
  total: number;
}

export interface WebhookEvent {
  type: WebhookEventType;
  description: string;
}

export interface WebhookEventsResponse {
  events: WebhookEvent[];
  total: number;
}
