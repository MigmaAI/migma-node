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
  | 'start'
  | 'pro'
  | 'max'
  | 'start_annual'
  | 'pro_annual'
  | 'max_annual'
  /** @deprecated Older plan names. Each opens the plan that replaced it: Start, Pro, Max. */
  | 'basic'
  | 'premium'
  | 'business'
  | 'basic_annual'
  | 'premium_annual'
  | 'business_annual';

export interface UpgradeLinkParams {
  /**
   * The plan the pricing page opens on. Omit for an existing customer's
   * billing portal (cards and invoices). Nothing is changed or charged.
   */
  plan?: UpgradePlan;
}

export interface UpgradeLink {
  /** The pricing page or the billing portal, for the account owner to open in a browser. Not proof of payment. */
  url: string;
  /**
   * pricing: the page where the owner picks or changes a plan and pays.
   * portal: the billing portal. `checkout` is no longer returned.
   */
  kind: 'pricing' | 'portal' | 'checkout';
  /** @deprecated No longer returned: the link never starts a checkout. */
  sessionId?: string;
  /** @deprecated No longer returned: the link never changes a subscription. */
  orderId?: string;
}
