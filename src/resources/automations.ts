import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type { Automation, AutomationCapabilities, AutomationEventTrigger, AutomationGeneration, AutomationGenerateParams, AutomationGraph, AutomationMetrics, AutomationReport, AutomationReportParams, AutomationRun, AutomationRunDetail, AutomationRuns, AutomationTriggerEvents, AutomationValidation } from '../types/automations';

/**
 * Conversational drafts and their execution state use the same API as chat.
 * Writes send an Idempotency-Key, reused across automatic retries, so a retry
 * replays the first result instead of conflicting with its own success.
 * Pass the same key yourself to retry an uncertain call later.
 */
export class Automations {
  constructor(private readonly client: MigmaClient) {}

  private keyed(options?: CallOptions): CallOptions {
    return { ...options, idempotencyKey: options?.idempotencyKey ?? randomUUID() };
  }

  list(projectId: string) {
    return this.client.get<{ automations: Automation[]; count: number }>('/automations', { projectId });
  }

  capabilities(projectId: string) {
    return this.client.get<AutomationCapabilities>('/automations/capabilities', { projectId });
  }

  /** Events a trigger can listen to for this brand. */
  triggerEvents(projectId: string) {
    return this.client.get<AutomationTriggerEvents>('/automations/trigger-events', { projectId });
  }

  get(id: string) {
    return this.client.get<Automation>(`/automations/${encodeURIComponent(id)}`);
  }

  /** Same campaign delivery/engagement numbers as the UI; preserve reporting availability. */
  metrics(id: string) {
    return this.client.get<AutomationMetrics>(`/automations/${encodeURIComponent(id)}/metrics`);
  }

  /** Send-date report for a period, the same report as the canvas. Requires analytics access. */
  report(id: string, params: AutomationReportParams) {
    return this.client.get<AutomationReport>(`/automations/${encodeURIComponent(id)}/report`, { ...params });
  }

  /** The saved canvas nodes and edges behind this flow. */
  graph(id: string) {
    return this.client.get<AutomationGraph>(`/automations/${encodeURIComponent(id)}/graph`);
  }

  /** Creates an off draft. Keep the key when retrying an uncertain submission. */
  generate(params: AutomationGenerateParams, options?: CallOptions) {
    return this.client.post<AutomationGeneration>('/automations/generate', { ...params }, {
      idempotencyKey: options?.idempotencyKey ?? randomUUID(),
    });
  }

  generationStatus(jobId: string) {
    return this.client.get<AutomationGeneration>(`/automations/generations/${encodeURIComponent(jobId)}`);
  }

  /** Checks setup and prepares delivery drafts; never sends or turns on the flow. */
  validate(id: string, options?: CallOptions) {
    return this.client.post<AutomationValidation>(`/automations/${encodeURIComponent(id)}/validate`, undefined, this.keyed(options));
  }

  /** Call only after the user requests activation of this exact reviewed definition. */
  activate(id: string, params: { confirmed: true; expectedDefinitionHash: string }, options?: CallOptions) {
    return this.client.post<Automation>(`/automations/${encodeURIComponent(id)}/activate`, params, this.keyed(options));
  }

  pause(id: string, options?: CallOptions) {
    return this.client.post<Automation>(`/automations/${encodeURIComponent(id)}/pause`, undefined, this.keyed(options));
  }

  /** Draft or paused flows with no contacts in progress. */
  updateTrigger(id: string, trigger: AutomationEventTrigger, expectedDefinitionHash: string, options?: CallOptions) {
    return this.client.put<Automation>(`/automations/${encodeURIComponent(id)}/trigger`, { trigger, expectedDefinitionHash }, this.keyed(options));
  }

  /**
   * Edit a saved wait using a step ID from get() (at most 160 characters);
   * leaves its connections intact. Duration is a positive ISO 8601 duration of
   * at most 365 days and 50 characters, such as P2D or PT1H.
   */
  updateWait(id: string, stepId: string, duration: string, expectedDefinitionHash: string, options?: CallOptions) {
    return this.client.patch<Automation>(`/automations/${encodeURIComponent(id)}/steps/${encodeURIComponent(stepId)}`, { duration, expectedDefinitionHash }, this.keyed(options));
  }

  /** Contact runs, newest first. Cancel runs in Migma under Results → Activity; the API cannot cancel them. */
  runs(id: string, params: { status?: AutomationRun['status']; cursor?: string; limit?: number } = {}) {
    return this.client.get<AutomationRuns>(`/automations/${encodeURIComponent(id)}/runs`, params);
  }

  /** One run with its most recent steps; historyLimit defaults to 25 (max 100). */
  getRun(id: string, runId: string, params: { historyLimit?: number } = {}) {
    return this.client.get<AutomationRunDetail>(`/automations/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}`, params);
  }
}
