import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type { CreditStatus, UpgradeLink, UpgradeLinkParams } from '../types/billing';

export class Billing {
  constructor(private readonly client: MigmaClient) {}

  /** Plan and remaining credits for the API key owner. */
  async credits(): Promise<MigmaResult<CreditStatus>> {
    return this.client.get<CreditStatus>('/billing/credits');
  }

  /**
   * Create checkout for a user-chosen new plan, or omit plan for the existing
   * customer's billing portal. Passing plan for an active subscription can
   * change it and charge prorated payment immediately; obtain charge approval.
   * The returned URL alone does not confirm payment. Do not retry unknown writes.
   */
  async upgradeLink(params: UpgradeLinkParams = {}): Promise<MigmaResult<UpgradeLink>> {
    return this.client.post<UpgradeLink>('/billing/upgrade-link', params as unknown as Record<string, unknown>);
  }
}
