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
   * User-chosen plan for new subscription checkout. Omit for an existing
   * Stripe customer's billing portal. Passing plan for an active subscription
   * can change it and charge immediately; requires explicit charge approval.
   */
  plan?: UpgradePlan;
}

export interface UpgradeLink {
  /** Checkout, invoice, confirmation, or portal URL; not proof of payment. */
  url: string;
  /** checkout includes an existing plan-change result; portal is the billing portal. */
  kind: 'checkout' | 'portal';
  /** Present when a new Stripe Checkout session was created. */
  sessionId?: string;
  /** Migma checkout order id or Stripe invoice id for an existing plan change. */
  orderId?: string;
}
