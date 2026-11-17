import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type {
  CreateLandingPageParams, GenerateLandingPageParams, LandingPage, LandingPageDetail, LandingPageMetrics,
  LandingPageVersions, UpdateLandingPageParams,
} from '../types/landing-pages';

/**
 * Campaign landing pages, served only on Migma's dedicated pages domain
 * (hostedUrl is null until that hosting exists). Buttons must link to a domain
 * the brand has verified. A page is a draft until publish(). Writes send an
 * Idempotency-Key, reused across automatic retries; pass your own to retry an
 * uncertain call.
 */
export class LandingPages {
  constructor(private readonly client: MigmaClient) {}

  private keyed(options?: CallOptions): CallOptions {
    return { ...options, idempotencyKey: options?.idempotencyKey ?? randomUUID() };
  }

  /** Most recently updated first. Pass goalId for the pages a goal prepared. */
  list(projectId: string, params: { goalId?: string } = {}) {
    return this.client.get<{ landingPages: LandingPage[]; count: number }>('/landing-pages', { projectId, ...params });
  }

  /** Includes publish checks and approximate counters. */
  get(id: string) {
    return this.client.get<LandingPageDetail>(`/landing-pages/${encodeURIComponent(id)}`);
  }

  /** Saves a page you wrote as a draft. Nothing is public until publish(). */
  create(params: CreateLandingPageParams, options?: CallOptions) {
    return this.client.post<LandingPage>('/landing-pages', { ...params }, this.keyed(options));
  }

  /** Migma writes and saves a draft from a brief. One email credit. Never publishes. */
  generate(params: GenerateLandingPageParams, options?: CallOptions) {
    return this.client.post<LandingPage>('/landing-pages/generate', { ...params }, this.keyed(options));
  }

  /** Renames the page or replaces the whole draft spec; the live page changes only on publish(). */
  update(id: string, params: UpdateLandingPageParams, options?: CallOptions) {
    return this.client.patch<LandingPage>(`/landing-pages/${encodeURIComponent(id)}`, { ...params }, this.keyed(options));
  }

  /** Makes the draft public. Every publish check must pass; counts toward the plan's live page limit. */
  publish(id: string, options?: CallOptions) {
    return this.client.post<LandingPage>(`/landing-pages/${encodeURIComponent(id)}/publish`, undefined, this.keyed(options));
  }

  /** Takes a live page down; visitors see its ended state, never a 404. */
  pause(id: string, options?: CallOptions) {
    return this.client.post<LandingPage>(`/landing-pages/${encodeURIComponent(id)}/pause`, undefined, this.keyed(options));
  }

  /** A page that was published keeps showing its ended state at its link. */
  delete(id: string, options?: CallOptions) {
    return this.client.delete<{ id: string; deleted: true }>(`/landing-pages/${encodeURIComponent(id)}`, undefined, this.keyed(options));
  }

  /** Published versions, newest first. */
  versions(id: string) {
    return this.client.get<LandingPageVersions>(`/landing-pages/${encodeURIComponent(id)}/versions`);
  }

  /** Approximate views and button clicks per UTC day (YYYY-MM-DD). Defaults to the last 30 days. */
  metrics(id: string, params: { from?: string; to?: string } = {}) {
    return this.client.get<LandingPageMetrics>(`/landing-pages/${encodeURIComponent(id)}/metrics`, params);
  }
}
