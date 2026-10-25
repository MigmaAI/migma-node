import type { CampaignReportingStatus } from './campaigns';

export interface AutomationCheck {
  key: string;
  status: 'pass' | 'missing' | 'fail';
  message: string;
  fix?: string;
}

export type AutomationReentry = 'once' | 'perEvent' | 'lifetimeOnce';
export interface AutomationReentryCooldown {
  /** Positive integer; the complete interval cannot exceed 365 days. */
  amount: number;
  unit: 'minute' | 'hour' | 'day';
}
export interface AutomationCancelRule {
  event: string;
  origin?: string;
  /** Only events whose property matches the triggering event's same property cancel the run. */
  matchTriggerProperty?: 'invoiceId';
  /** Defaults to enrollment. Trigger uses the source event's immutable timestamp. */
  since?: 'enrollment' | 'trigger';
  mode: 'exit' | 'restart';
  propertyFilters?: AutomationEventTrigger['event']['propertyFilters'];
}

export interface Automation {
  id: string;
  projectId: string;
  name: string;
  status: 'draft' | 'enabled' | 'paused' | 'archived' | 'error';
  version: number;
  /**
   * Hash of a native flow definition returned by get(). List summaries and
   * imported migration drafts can omit it. Pass an observed value unchanged
   * to graph-changing mutations; never substitute a newly fetched hash.
   */
  definitionHash?: string;
  link: string;
  graphCanvasId?: string;
  conversationId?: string;
  trigger?: Record<string, unknown>;
  /** Present on get() for native flows: the trigger node to edit with updateTrigger(). */
  triggerNodeId?: string;
  steps?: Array<Record<string, unknown>>;
  /** Marketing by default. Transactional is limited to order, shipping, payment and invoice notices. */
  stream?: 'marketing' | 'transactional';
  /** Who may enter: a saved segment or tag, or draft audience filters. */
  audienceGate?: AutomationAudienceGate;
  /** At most maxPerWindow automation emails per contact in windowDays. */
  frequencyCap?: { maxPerWindow: number; windowDays: number };
  overlapLimiter?: { maxConcurrentAutomations?: number };
  enabledAt?: string;
  reentry?: AutomationReentry;
  reentryCooldown?: AutomationReentryCooldown | null;
  /** Requires perEvent, a cooldown, and verified concurrent-entry availability. */
  allowConcurrentReentry?: boolean;
  cancelOn?: AutomationCancelRule[];
  migration?: {
    provider: 'klaviyo'; snapshotId: string; sourceHash: string; mappingHash: string;
    status: 'awaiting_cutover'; preparedAt: string; preparedBy: string;
  };
  /** An imported flow whose source actions still need review in Migma; it cannot be validated as ready or activated. */
  sourceImport?: {
    provider: 'klaviyo'; snapshotId: string; sourceId: string; sourceHash: string;
    status: 'needs_mapping'; counts?: Record<string, number>;
  };
  /** A separately edited copy. Apply it to its original flow in Migma; it cannot be activated itself. */
  workingCopy?: {
    sourceAutomationId: string; sourceVersion: number; sourceDefinitionHash: string;
    sourceExecutionRevision: number; sourceContentHash?: string;
  };
}

/** Optional cursor page controls for list(). */
export interface AutomationListParams {
  /** Opaque cursor returned by the previous page. */
  cursor?: string;
  /** 1-200; defaults to 200. */
  limit?: number;
  /** Archived flows are omitted unless explicitly included. */
  includeArchived?: boolean;
}

/** One page of automation summaries, newest edited first. */
export interface AutomationListPage {
  automations: Automation[];
  count: number;
  nextCursor: string | null;
}

export type AutomationAudienceGate =
  | { type: 'segment'; id: string; name?: string; count?: number }
  | { type: 'tag'; id: string; name?: string; count?: number }
  | { type: 'draftFilters'; filters: Record<string, unknown>; previewCount?: number };

export interface AutomationCapabilities {
  /**
   * Feature flags and limits. Entry rules, settings and run cancellation are
   * editor-only (updateReentry, updateSettings and cancelRuns are false).
   */
  capabilities: Record<string, unknown>;
  triggerEvents: AutomationTriggerEvents;
}

/** Events a trigger can listen to for one brand. */
export interface AutomationTriggerEvents {
  core: Array<{ name: string; label: string }>;
  connectors: Array<{ id: string; name: string; connected: boolean; events: string[] }>;
  custom: string[];
  definitions: Array<{
    name: string; label: string; description?: string; limitation?: string;
    category: string; source: 'migma' | 'connector' | 'custom';
    connectorId?: string; connectorName?: string; connected?: boolean;
    trigger: boolean; condition: boolean; volume: string; retentionDays: number; dedupe: string;
    fields: Array<{ path: string; label: string; type: string; sample?: unknown }>;
  }>;
}

export interface AutomationGenerateParams {
  projectId: string;
  brief: string;
  name?: string;
  emailCount?: number;
  /** Public HTTPS workflow screenshots; these describe the flow, not email artwork. */
  imageUrls?: string[];
}

export interface AutomationEventTrigger {
  type: 'event';
  event: {
    name: string;
    origin?: string;
    eventVersion?: string;
    /** At most 20. exists and is_empty take no value; every other operator needs one. */
    propertyFilters?: Array<{
      /** 1-200 characters. */
      path: string;
      op: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'exists' | 'is_empty';
      value?: string | number | boolean;
    }>;
  };
}

export interface AutomationGeneration {
  jobId: string;
  /** Canonical brand returned when inspecting a generation job. */
  projectId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  statusUrl?: string;
  result?: {
    automationId: string;
    canvasId: string;
    validationChecklist: AutomationCheck[];
    suggestedFollowUps: string[];
    link: string;
  };
  error?: string;
}

export interface AutomationValidation {
  ready: boolean;
  checklist: AutomationCheck[];
  activation: { requiresConfirmation: boolean; link: string };
}

/** One contact's journey, in the same shape as the Migma dashboard. */
export interface AutomationRun {
  id: string;
  status: 'active' | 'waiting' | 'completed' | 'failed' | 'exited' | 'suppressed';
  /** email, firstName and lastName are included only for keys with audience:read. */
  subscriber: { id: string; email?: string; firstName?: string; lastName?: string };
  currentStepId: string | null;
  currentStepKind: string | null;
  nextRunAt: string | null;
  /** Published version this run executes. */
  automationVersion: number;
  startedAt: string;
  updatedAt: string;
  failureReason?: string;
  exitReason?: string;
  suppressionReason?: string;
}

export interface AutomationRunHistoryEntry {
  at: string;
  stepId?: string;
  stepKind?: string;
  outcome: string;
  meta?: Record<string, unknown>;
}

/** getRun(): the run summary plus its most recent recorded steps. */
export interface AutomationRunDetail extends AutomationRun {
  triggerEventId: string;
  /** Oldest first; the latest historyLimit entries (default 25, max 100). */
  history: AutomationRunHistoryEntry[];
  /** Entries Migma retained for this run (at most 100). */
  historyTotal: number;
  /** Present when the run executes an older published version than the current flow. */
  executionVersion?:
    | { status: 'available'; version: number; trigger: Record<string, unknown>; steps: Array<Record<string, unknown>> }
    | { status: 'unavailable'; version: number };
}

export interface AutomationRuns {
  runs: AutomationRun[];
  nextCursor: string | null;
}

export interface AutomationReportParams {
  /** Inclusive YYYY-MM-DD. */
  startDate: string;
  /** Inclusive YYYY-MM-DD; at most 366 days after startDate. */
  endDate: string;
  /** IANA time zone, for example Europe/Madrid. */
  timezone: string;
}

/** Attributed orders and net sales; present only when revenue reporting is available. */
export interface FlowReportSales {
  status: 'live' | 'partial';
  orders: number;
  /** Orders ÷ delivered, a percentage; null when nothing was delivered. */
  orderRate: number | null;
  /** Never add currencies together. Amounts are in minor units (cents). */
  currencies: Array<{ currency: string; scale: number; orders: number; netMinor: number; netPerDeliveredMinor: number | null }>;
}

/** Send-date counts. Rates are percentages to two decimals and null, never 0, when there is nothing to divide by. */
export interface FlowReportCounts {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  /** Null when the tracking source cannot report spam complaints. */
  complained: number | null;
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
  unsubscribeRate: number | null;
  complaintRate: number | null;
  sales?: FlowReportSales;
}

/** One email step: every version of it, including sends made before an edit. Counts are absent when its report is unavailable. */
export interface FlowReportNode extends Partial<FlowReportCounts> {
  nodeId: string;
  stepId?: string;
  campaignId?: string;
  /** Every campaign version of this step. */
  campaignIds: string[];
  variants?: Array<FlowReportCounts & { id: string; name: string; subject?: string; weight: number; campaignId?: string; campaignIds: string[]; winner: boolean }>;
  reporting: { status: string; source: string; reason?: string };
}

/** Send-date report for a period, matching the canvas. Missing numbers are unavailable, not zero. */
export interface AutomationReport {
  version: number;
  cohort: 'send-date';
  scope: 'all-versions';
  /** The wording of every metric, shared with the dashboard and agents. */
  definitions: Record<string, string>;
  window: Record<string, unknown>;
  generatedAt: string;
  engagement: string;
  testSends: 'excluded';
  revenue: { status: string; reason?: string; [key: string]: unknown };
  nodes: FlowReportNode[];
  totals: FlowReportCounts | null;
  coverage?: { since: string; complete: boolean; unclassifiedSends?: number };
  reporting: AutomationMetrics['reporting'];
}

/** The saved canvas behind a flow. */
export interface AutomationGraph {
  id: string;
  nodes: Array<Record<string, unknown> & { id: string; kind: string }>;
  edges: Array<Record<string, unknown>>;
  revision: number;
  sourceImport?: Record<string, unknown>;
}

export interface AutomationMetrics {
  nodes: Array<{
    nodeId: string; stepId?: string; campaignId?: string;
    sent?: number; delivered?: number; opened?: number; clicked?: number;
    openRate?: number; clickRate?: number; converted?: number; revenueCents?: number;
    currency?: string | null; viewed?: number; submitted?: number;
    reporting?: CampaignReportingStatus;
  }>;
  edges: Array<{ edgeId: string; conversions: number; revenueCents?: number; currency?: string | null }>;
  reporting: { status: 'live' | 'cached' | 'partial' | 'unavailable' | 'not_applicable'; source: 'campaigns'; warnings: string[] };
}
