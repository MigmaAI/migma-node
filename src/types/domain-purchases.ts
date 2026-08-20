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

export type CustomDnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';

export interface CustomDnsRecord {
  id: string;
  type: CustomDnsRecordType;
  name: string;
  content: string;
  /** MX only. */
  priority?: number;
  createdAt: string;
  [key: string]: unknown;
}

export interface CustomDnsRecordList {
  /** false = Migma does not host this domain's DNS zone (connected from an outside registrar). */
  managed: boolean;
  records: CustomDnsRecord[];
}

export interface AddCustomDnsRecordParams {
  /** Record name: '@' for the root, a label like 'mail', or a full name like 'mail.acme.com'. */
  name: string;
  /** Record value, e.g. an IP, hostname, or TXT string. */
  content: string;
  /** Defaults to TXT. */
  type?: CustomDnsRecordType;
  /** MX priority (0-65535). */
  priority?: number;
}
