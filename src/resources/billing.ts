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
   * A link for the account owner to open in a browser: the pricing page on the
   * plan asked for, or with no plan the existing customer's billing portal.
   * It changes nothing and charges nothing; the owner picks and pays there.
   */
  async upgradeLink(params: UpgradeLinkParams = {}): Promise<MigmaResult<UpgradeLink>> {
    return this.client.post<UpgradeLink>('/billing/upgrade-link', params as unknown as Record<string, unknown>);
  }
}
