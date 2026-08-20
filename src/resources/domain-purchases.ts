import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
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
  async registrations(): Promise<MigmaResult<{ registrations: DomainRegistration[] }>> {
    return this.client.get<{ registrations: DomainRegistration[] }>('/domains/purchase/registrations');
  }
}
