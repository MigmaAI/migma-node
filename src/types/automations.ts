import type { CampaignReportingStatus } from './campaigns';

export interface AutomationCheck {
  key: string;
  status: 'pass' | 'missing' | 'fail';
  message: string;
  fix?: string;
}

export interface Automation {
  id: string;
  projectId: string;
  name: string;
  status: 'draft' | 'enabled' | 'paused' | 'archived' | 'error';
  version: number;
  link: string;
  graphCanvasId?: string;
  conversationId?: string;
  trigger?: Record<string, unknown>;
  steps?: Array<Record<string, unknown>>;
}

export interface AutomationCapabilities {
  capabilities: Record<string, unknown>;
  triggerEvents: Record<string, unknown>;
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
    propertyFilters?: Array<{
      path: string;
      op: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'exists' | 'is_empty';
      value?: string | number | boolean | null;
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

export interface AutomationRun {
  id: string;
  status: 'active' | 'waiting' | 'completed' | 'failed' | 'exited' | 'suppressed';
  subscriber?: { id: string; email?: string; firstName?: string; lastName?: string };
  subscriberId?: string;
  currentBlockId?: string;
  createdAt?: string;
  vars?: Record<string, unknown>;
  currentStepId?: string;
  currentStepKind?: string;
  nextRunAt?: string;
  startedAt?: string;
  updatedAt?: string;
  failureReason?: string;
  exitReason?: string;
  suppressionReason?: string;
  history?: Array<{ at: string; stepId?: string; stepKind?: string; outcome: string; meta?: Record<string, unknown> }>;
}

export interface AutomationRuns {
  runs: AutomationRun[];
  nextCursor: string | null;
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
  reporting: { status: 'live' | 'cached' | 'partial' | 'unavailable'; source: 'campaigns'; warnings: string[] };
}
