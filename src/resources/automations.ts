import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type { Automation, AutomationCapabilities, AutomationEventTrigger, AutomationGeneration, AutomationGenerateParams, AutomationMetrics, AutomationRun, AutomationRuns, AutomationValidation } from '../types/automations';

/** Conversational drafts and their execution state use the same API as chat. */
export class Automations {
  constructor(private readonly client: MigmaClient) {}

  list(projectId: string) {
    return this.client.get<{ automations: Automation[]; count: number }>('/automations', { projectId });
  }

  capabilities(projectId: string) {
    return this.client.get<AutomationCapabilities>('/automations/capabilities', { projectId });
  }

  get(id: string) {
    return this.client.get<Automation>(`/automations/${encodeURIComponent(id)}`);
  }

  /** Same campaign delivery/engagement numbers as the UI; preserve reporting availability. */
  metrics(id: string) {
    return this.client.get<AutomationMetrics>(`/automations/${encodeURIComponent(id)}/metrics`);
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
  validate(id: string) {
    return this.client.post<AutomationValidation>(`/automations/${encodeURIComponent(id)}/validate`);
  }

  /** Call only after the user requests activation of this reviewed automation. */
  activate(id: string, params: { confirmed: true }) {
    return this.client.post<Automation>(`/automations/${encodeURIComponent(id)}/activate`, params);
  }

  pause(id: string) {
    return this.client.post<Automation>(`/automations/${encodeURIComponent(id)}/pause`);
  }

  updateTrigger(id: string, trigger: AutomationEventTrigger) {
    return this.client.put<Automation>(`/automations/${encodeURIComponent(id)}/trigger`, { trigger });
  }

  /** Edit a saved wait using a step ID from get(); leaves its connections intact. */
  updateWait(id: string, stepId: string, duration: string) {
    return this.client.patch<Automation>(`/automations/${encodeURIComponent(id)}/steps/${encodeURIComponent(stepId)}`, { duration });
  }

  runs(id: string, params: { status?: AutomationRun['status']; cursor?: string; limit?: number } = {}) {
    return this.client.get<AutomationRuns>(`/automations/${encodeURIComponent(id)}/runs`, params);
  }

  getRun(id: string, runId: string) {
    return this.client.get<AutomationRun>(`/automations/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}`);
  }
}
