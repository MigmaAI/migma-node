export interface CreditStatus {
  currentPlan: string;
  isExpired: boolean;
  planExpiry?: string;
  hasCredits: boolean;
  emailCreditsRemainingToday: number;
  imageCreditsRemainingToday: number;
  monthlyCreditsRemaining: number;
}

export type UpgradePlan =
  | 'basic'
  | 'premium'
  | 'business'
  | 'basic_annual'
  | 'premium_annual'
  | 'business_annual';

export interface UpgradeLinkParams {
  /**
   * Target plan for Stripe Checkout. Omit to get a billing portal link
   * (existing Stripe customers only).
   */
  plan?: UpgradePlan;
}

export interface UpgradeLink {
  /** URL the account owner opens in a browser to pay or manage billing. */
  url: string;
  kind: 'checkout' | 'portal';
  sessionId?: string;
  orderId?: string;
}
