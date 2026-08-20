export interface DomainPurchaseQuote {
  rootDomain: string;
  tld: string;
  available?: boolean;
  supported?: boolean;
  premium?: boolean;
  sellPrice?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface DomainPurchaseSearchParams {
  /** Name or keyword, e.g. 'acme' or 'acme.com'. */
  q: string;
  /** Max quotes to return (1-20, default 8). */
  limit?: number;
}

export interface DomainPurchaseParams {
  /** Domain to buy, e.g. 'acme.com'. */
  domain: string;
  /** Optional website the bought apex domain should redirect to. */
  redirectUrl?: string;
}

export interface DomainPurchaseCheckout {
  /** Stripe checkout URL the account owner opens in a browser to pay. */
  checkoutUrl: string;
  checkoutSessionId?: string;
  billingMode?: 'annual_subscription';
  [key: string]: unknown;
}

export type DomainRegistrationStatus =
  | 'quoted'
  | 'payment_pending'
  | 'registering'
  | 'active'
  | 'failed'
  | 'refunded'
  | string;

export interface DomainRegistration {
  id: string;
  rootDomain: string;
  status: DomainRegistrationStatus;
  sellPrice?: number;
  currency?: string;
  [key: string]: unknown;
}
