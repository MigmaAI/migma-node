export type GoalStatus = 'planning' | 'needs_input' | 'planned' | 'building' | 'built' | 'partial' | 'failed';
export type GoalObjective = 'revenue' | 'signups' | 'reactivation' | 'launch' | 'engagement';
/**
 * attributed_revenue and orders are attributed (last human email click within
 * 5 days, by send date), never progress toward a target. signups and clicks are direct counts.
 */
export type GoalMetric = 'attributed_revenue' | 'orders' | 'signups' | 'clicks';
export type GoalDeliverableKind = 'segment' | 'form' | 'landing_page' | 'automation' | 'campaign';
export type GoalDeliverableStatus = 'proposed' | 'queued' | 'building' | 'built' | 'failed' | 'needs_input';

/** What the goal is for, as Migma understood it. Check assumptions and missing before building. */
export interface GoalBrief {
  objective: GoalObjective;
  primaryMetric: GoalMetric;
  /** Only when the person stated one. currency is an ISO 4217 code for money targets. */
  target?: { value: number; currency?: string };
  window: { startsAt?: string; endsAt?: string; timezone?: string };
  audience: { summary: string; segmentIds: string[]; tagIds: string[] };
  /** The offer exactly as the person gave it; Migma never invents one. */
  offer?: { summary: string; code?: string; endsAt?: string };
  keyMessage: string;
  /** Where buttons send people. Must be on a domain the brand has verified. */
  destinationUrl?: string;
  /** Choices Migma made that the person should check. */
  assumptions: string[];
  /** Facts Migma needs and does not have. Never filled with guesses. */
  missing: string[];
}

/** A saved segment, a saved tag, or the segment this goal creates (by deliverable key). */
export type GoalAudienceRef =
  | { type: 'audience'; id: string }
  | { type: 'tag'; id: string }
  | { type: 'deliverable'; key: string };

/** One item in the plan. Building creates it as a draft through its own API. */
export interface GoalDeliverable {
  /** d1, d2, ... */
  key: string;
  kind: GoalDeliverableKind;
  title: string;
  purpose: string;
  brief: string;
  dependsOn: string[];
  evidenceIds: string[];
  /** Flows: how many emails. */
  emailCount?: number;
  formKind?: 'subscribe' | 'waitlist' | 'leadgen' | 'rsvp' | 'gated';
  /** Campaigns: proposed send time. Building never schedules. */
  sendAt?: string;
  audience?: GoalAudienceRef;
  skipped?: boolean;
  status: GoalDeliverableStatus;
  /** The built draft's ID in its own API (segment, form, landing page, automation or campaign). */
  resourceId?: string;
  /** Campaigns: the email Migma wrote, once it is written; use with `emails.get`. `resourceId` is the draft campaign. */
  emailId?: string;
  /** Campaigns: the conversation that wrote the email. */
  conversationId?: string;
  /** Why this item failed. Built items never carry one. */
  error?: string;
  /** What to know about a built item before it goes live: setup left, or a build that stopped partway. */
  note?: string;
  /** What Migma needs to build this item. */
  question?: string;
  /** The plan changed after this item was built. */
  stale?: boolean;
  updatedAt: string;
}

export interface Goal {
  id: string;
  projectId: string;
  name: string;
  /** The person's own words. */
  goal: string;
  status: GoalStatus;
  brief: GoalBrief | null;
  deliverables: GoalDeliverable[];
  questions: Array<{ id: string; question: string; options?: string[] }>;
  answers: Array<{ questionId: string; answer: string }>;
  readiness: Array<{ key: string; status: 'pass' | 'warn' | 'fail'; message: string; fix?: string }>;
  /** Facts Migma read before planning. Empty in list(). */
  evidence: Array<{ id: string; kind: string; label: string; detail: string }>;
  /** Email credits the build will use. */
  estimatedCredits: number | null;
  /** Send the version you read with update() and answer(). */
  planVersion: number;
  /** Identifies the plan a person reviewed; build() requires it. */
  planHash: string | null;
  conversationId: string | null;
  error: string | null;
  run: { id: string; kind: 'plan' | 'build'; state: 'queued' | 'running' | 'done' | 'failed' | 'cancelled'; active: boolean; startedAt: string; updatedAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Where a built item stands now, read from its owner. unknown is never guessed. */
export interface GoalResourceState {
  state: 'draft' | 'saved' | 'live' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'ended' | 'missing' | 'unknown';
  label: string;
  link?: string;
  publicUrl?: string;
}

/** One step toward going live, done through the item's own control. */
export interface GoalLaunchStep {
  key: string;
  title: string;
  status: 'done' | 'todo' | 'blocked';
  message: string;
  link?: string;
}

export interface GoalView extends Goal {
  /** Keyed by deliverable key. */
  resources: Record<string, GoalResourceState>;
  launch: GoalLaunchStep[];
}

export interface GoalDeliveryCounts {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

/** Attributed revenue in one currency. netMinor / 10^scale is the amount. */
export interface GoalRevenueRow {
  currency: string;
  scale: number;
  orders: number;
  netMinor: number;
}

/**
 * Results for a goal. Revenue is attributed (orders after a human email click
 * within 5 days, by send date), not proof of cause and never incremental lift.
 * null means unknown or not sent yet, never zero.
 */
export interface GoalReport {
  generatedAt: string;
  status: 'not_started' | 'live' | 'partial' | 'unavailable';
  window?: { from: string; to: string; maturesAt?: string };
  items: Array<{
    key: string;
    title: string;
    kind: 'campaign' | 'automation';
    resourceId: string;
    delivery: GoalDeliveryCounts | null;
    revenue: GoalRevenueRow[] | null;
    note?: string;
  }>;
  revenue: {
    status: 'live' | 'partial' | 'unavailable' | 'not_applicable';
    /** Show next to the numbers. */
    model: string;
    reason?: string;
    warnings: string[];
    currencies: GoalRevenueRow[];
  };
  signups: { formId: string; submitted: number; confirmed: number; note: string } | null;
  page: { pageId: string; viewed: number; clicked: number; note: string } | null;
  progress: { metric: string; target?: { value: number; currency?: string }; value?: number; percent?: number; note: string };
}

export interface PlanGoalParams {
  projectId: string;
  /** What to achieve, 10-2000 characters, with any offer, dates and audience the person gave. */
  goal: string;
  /** Optional Migma chat thread in the same brand to link the goal to. */
  conversationId?: string;
}

export interface UpdateGoalParams {
  /** The planVersion you read; a changed goal returns 409 GOAL_PLAN_CHANGED. */
  expectedPlanVersion: number;
  name?: string;
  /** Merged into the saved brief. */
  brief?: Partial<GoalBrief>;
  /** Changes to items, by key. A built item cannot be skipped. */
  deliverables?: Array<{
    key: string;
    title?: string;
    brief?: string;
    /** Campaigns only; null clears it. */
    sendAt?: string | null;
    emailCount?: number;
    audience?: GoalAudienceRef;
    skipped?: boolean;
  }>;
}

export interface AnswerGoalParams {
  expectedPlanVersion: number;
  answers: Array<{ questionId: string; answer: string }>;
}

export interface BuildGoalParams {
  /** The planHash of the plan the person reviewed and approved. */
  expectedPlanHash: string;
}
