export type WebsiteEnvironment = 'live' | 'test';
export type WebsiteStatus = 'enabled' | 'disabled';

export interface WebsiteSite {
  id: string;
  projectId: string;
  name: string;
  origins: string[];
  environment: WebsiteEnvironment;
  status: WebsiteStatus;
  collectorUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsiteSiteInput {
  projectId: string;
  name: string;
  origins: string[];
  environment: WebsiteEnvironment;
}

export interface UpdateWebsiteSiteInput {
  name?: string;
  status?: WebsiteStatus;
}

export type WebsiteObservationName =
  | 'storefront.page_viewed'
  | 'storefront.product_viewed'
  | 'storefront.cart_observed'
  | 'storefront.checkout_observed';

export interface WebsiteEvent {
  event_id: string;
  name: WebsiteObservationName;
  path: string;
  identityState: 'anonymous' | 'identified' | 'unavailable';
  executionState: 'retained' | 'history_only' | 'contact_unavailable';
  receivedAt: string;
  occurredAt: string;
  conflictingReplay: 0 | 1;
}

export type WebsiteEventHistory =
  | {
      status: 'available';
      events: WebsiteEvent[];
      sampleWindowHours: 24;
      sampledRows: 1000;
    }
  | {
      status: 'unavailable';
      events: null;
    };

export interface IssueWebsiteIdentityInput {
  visitorId: string;
  /** Existing contact id in the website's brand. This call does not create or update contacts. */
  subscriberId: string;
  /** Token lifetime in seconds, from 60 through 3600. Defaults to 900. */
  ttlSeconds?: number;
}

export interface WebsiteIdentity {
  /** Secret for the matching browser collector session. Do not log or persist it in analytics. */
  identityToken: string;
  issuedAt: string;
  expiresAt: string;
}
