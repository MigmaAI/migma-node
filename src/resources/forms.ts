import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type { CreateFormParams, Form, FormDetail, FormStatus, FormSubmissions, FormSubmitResult, SubmitFormParams, UpdateFormParams } from '../types/forms';

/**
 * Signup forms. Visitors submit through the hosted page or embed, or your
 * server submits for them with submit(); the API also manages drafts,
 * publication and results. Writes send an Idempotency-Key,
 * reused across automatic retries; pass your own to retry an uncertain call.
 */
export class Forms {
  constructor(private readonly client: MigmaClient) {}

  private keyed(options?: CallOptions): CallOptions {
    return { ...options, idempotencyKey: options?.idempotencyKey ?? randomUUID() };
  }

  list(projectId: string, params: { status?: FormStatus } = {}) {
    return this.client.get<{ forms: Form[]; count: number }>('/forms', { projectId, ...params });
  }

  /** Includes counters and the automations this form starts. */
  get(id: string) {
    return this.client.get<FormDetail>(`/forms/${encodeURIComponent(id)}`);
  }

  /** Saves a draft. Nothing is public until publish(). */
  create(params: CreateFormParams, options?: CallOptions) {
    return this.client.post<Form>('/forms', { ...params }, this.keyed(options));
  }

  /** Updates the draft only; the live form keeps its published version. */
  update(id: string, params: UpdateFormParams, options?: CallOptions) {
    return this.client.patch<Form>(`/forms/${encodeURIComponent(id)}`, { ...params }, this.keyed(options));
  }

  /** Makes the current draft live. Counts toward the plan's live form limit. */
  publish(id: string, options?: CallOptions) {
    return this.client.post<Form>(`/forms/${encodeURIComponent(id)}/publish`, undefined, this.keyed(options));
  }

  /**
   * Stops new submissions to a live form; a draft returns 409 FORM_NOT_LIVE. Returns 409
   * FORM_USED_BY_LANDING_PAGE while a live landing page shows the form and 409
   * FORM_USED_BY_AUTOMATION while an enabled automation starts from it.
   */
  pause(id: string, options?: CallOptions) {
    return this.client.post<Form>(`/forms/${encodeURIComponent(id)}/pause`, undefined, this.keyed(options));
  }

  /** Past submissions and contacts remain. Blocked like pause() while a live landing page or an enabled automation uses the form. */
  delete(id: string, options?: CallOptions) {
    return this.client.delete<{ id: string; deleted: true }>(`/forms/${encodeURIComponent(id)}`, undefined, this.keyed(options));
  }

  /**
   * Submits a signup from your own form UI through the live form's rules (fields,
   * tags, double opt-in). Add-only: an existing contact keeps its status, and the
   * result never reveals it. Needs the campaign:write and audience:write scopes.
   */
  submit(id: string, params: SubmitFormParams, options?: CallOptions) {
    return this.client.post<FormSubmitResult>(`/forms/${encodeURIComponent(id)}/submissions`, { ...params }, this.keyed(options));
  }

  /** Newest first. Needs the campaign:read and audience:read scopes. */
  submissions(id: string, params: { limit?: number; cursor?: string } = {}) {
    return this.client.get<FormSubmissions>(`/forms/${encodeURIComponent(id)}/submissions`, params);
  }
}
