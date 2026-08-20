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
   * Mint a Stripe link the account owner opens in a browser to upgrade or
   * manage the subscription. Nothing is charged by this call itself.
   */
  async upgradeLink(params: UpgradeLinkParams = {}): Promise<MigmaResult<UpgradeLink>> {
    return this.client.post<UpgradeLink>('/billing/upgrade-link', params as unknown as Record<string, unknown>);
  }
}
