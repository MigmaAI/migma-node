import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  AddCustomDnsRecordParams,
  CustomDnsRecord,
  CustomDnsRecordList,
  DomainPurchaseCheckout,
  DomainPurchaseParams,
  DomainPurchaseQuote,
  DomainPurchaseSearchParams,
  DomainRegistration,
} from '../types/domain-purchases';

export class DomainPurchases {
  constructor(private readonly client: MigmaClient) {}

  /** Availability and price quotes for domains you could buy. */
  async search(params: DomainPurchaseSearchParams): Promise<MigmaResult<{ quotes: DomainPurchaseQuote[] }>> {
    return this.client.get<{ quotes: DomainPurchaseQuote[] }>('/domains/purchase/search', {
      q: params.q,
      limit: params.limit,
    });
  }

  /**
   * Start buying a domain. Returns a Stripe checkout URL the account owner
   * opens in a browser; the domain registers after payment clears. Requires
   * an active paid Migma subscription.
   */
  async create(params: DomainPurchaseParams): Promise<MigmaResult<DomainPurchaseCheckout>> {
    return this.client.post<DomainPurchaseCheckout>('/domains/purchase', params as unknown as Record<string, unknown>);
  }

  /** Purchase history and status: payment_pending → registering → active. */
  async registrations(params?: { limit?: number }): Promise<MigmaResult<{ registrations: DomainRegistration[] }>> {
    return this.client.get<{ registrations: DomainRegistration[] }>('/domains/purchase/registrations', {
      limit: params?.limit,
    });
  }

  // DNS records live on Migma-hosted zones, which exist exactly for domains
  // bought in Migma — hence they sit on this resource even though the API
  // path is /domains/:domain/dns-records.

  /** DNS records you added to a domain bought in Migma. `managed: false` = zone not hosted by Migma. */
  async listDnsRecords(domain: string): Promise<MigmaResult<CustomDnsRecordList>> {
    return this.client.get<CustomDnsRecordList>(`/domains/${encodeURIComponent(domain)}/dns-records`);
  }

  /**
   * Add a DNS record (A, AAAA, CNAME, MX, TXT, or NS) to a domain bought in
   * Migma. Migma's email sending records are protected and cannot be
   * overridden; the root and www stay with domain forwarding.
   */
  async addDnsRecord(domain: string, params: AddCustomDnsRecordParams): Promise<MigmaResult<{ record: CustomDnsRecord }>> {
    return this.client.post<{ record: CustomDnsRecord }>(
      `/domains/${encodeURIComponent(domain)}/dns-records`,
      params as unknown as Record<string, unknown>,
    );
  }

  /** Remove a DNS record you added earlier (never Migma's own records). */
  async removeDnsRecord(domain: string, recordId: string): Promise<MigmaResult<{ ok: boolean }>> {
    return this.client.delete<{ ok: boolean }>(
      `/domains/${encodeURIComponent(domain)}/dns-records/${encodeURIComponent(recordId)}`,
    );
  }
}
