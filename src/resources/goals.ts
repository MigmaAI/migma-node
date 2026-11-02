import { randomUUID } from 'node:crypto';
import type { CallOptions, MigmaClient } from '../client';
import type { AnswerGoalParams, BuildGoalParams, Goal, GoalReport, GoalView, PlanGoalParams, UpdateGoalParams } from '../types/goals';

/**
 * Goals: describe what a brand wants to achieve, review the plan Migma
 * proposes, build it as drafts, and read results. Building never publishes,
 * schedules, sends or turns anything on; each item goes live through its own
 * API. Writes send an Idempotency-Key, reused across automatic retries; pass
 * your own to retry an uncertain call.
 */
export class Goals {
  constructor(private readonly client: MigmaClient) {}

  private keyed(options?: CallOptions): CallOptions {
    return { ...options, idempotencyKey: options?.idempotencyKey ?? randomUUID() };
  }

  /** Newest first; pass nextCursor as cursor for older goals. Evidence is left out. */
  list(projectId: string, params: { limit?: number; cursor?: string } = {}) {
    return this.client.get<{ goals: Goal[]; nextCursor: string | null }>('/goals', { projectId, ...params });
  }

  /** Starts planning (status planning). Poll get() until planned, needs_input or failed. Builds nothing. */
  plan(params: PlanGoalParams, options?: CallOptions) {
    return this.client.post<Goal>('/goals', { ...params }, this.keyed(options));
  }

  /** The plan with planVersion and planHash, plus where built items stand (resources) and what going live takes (launch). */
  get(id: string) {
    return this.client.get<GoalView>(`/goals/${encodeURIComponent(id)}`);
  }

  /** Edits the plan. Every change gives it a new planHash, so review it again before build(). */
  update(id: string, params: UpdateGoalParams, options?: CallOptions) {
    return this.client.patch<GoalView>(`/goals/${encodeURIComponent(id)}`, { ...params }, this.keyed(options));
  }

  /** Answers the questions of a goal in needs_input; Migma plans again. */
  answer(id: string, params: AnswerGoalParams, options?: CallOptions) {
    return this.client.post<Goal>(`/goals/${encodeURIComponent(id)}/answers`, { ...params }, this.keyed(options));
  }

  /**
   * Builds the reviewed plan as drafts. Call only after the person approved the
   * plan with this planHash; a changed plan returns 409 GOAL_PLAN_CHANGED. Uses
   * the email credits shown as estimatedCredits.
   */
  build(id: string, params: BuildGoalParams, options?: CallOptions) {
    return this.client.post<Goal>(`/goals/${encodeURIComponent(id)}/build`, { ...params }, this.keyed(options));
  }

  /** Stops a build after the item in progress; built items stay as drafts. */
  cancel(id: string, options?: CallOptions) {
    return this.client.post<Goal>(`/goals/${encodeURIComponent(id)}/cancel`, undefined, this.keyed(options));
  }

  /** Delivery, attributed revenue (not incremental lift), signups and page counts. null is unknown, not zero. */
  report(id: string) {
    return this.client.get<GoalReport>(`/goals/${encodeURIComponent(id)}/report`);
  }

  /** Deletes the goal only; everything it built stays and is listed in kept. */
  delete(id: string, options?: CallOptions) {
    return this.client.delete<{ deleted: true; kept: Array<{ kind: string; title: string; resourceId: string }> }>(
      `/goals/${encodeURIComponent(id)}`, undefined, this.keyed(options));
  }
}
