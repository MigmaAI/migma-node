import type { MigmaClient } from '../client';
import type { MigmaResult, DeleteResponse } from '../types/common';
import type {
  Topic,
  CreateTopicParams,
  UpdateTopicParams,
  ListTopicsParams,
  ListTopicsResponse,
  TopicSubscriptionParams,
  TopicSubscriptionResponse,
} from '../types/topics';

export class Topics {
  constructor(private readonly client: MigmaClient) {}

  async list(params: ListTopicsParams): Promise<MigmaResult<ListTopicsResponse>> {
    const { projectId, includeInactive } = params;
    return this.client.getWithCount<Topic[]>('/topics', {
      projectId,
      includeInactive,
    }) as Promise<MigmaResult<ListTopicsResponse>>;
  }

  async create(params: CreateTopicParams): Promise<MigmaResult<Topic>> {
    return this.client.post<Topic>('/topics', params as unknown as Record<string, unknown>);
  }

  async get(id: string, projectId: string): Promise<MigmaResult<Topic>> {
    return this.client.get<Topic>(`/topics/${id}`, { projectId });
  }

  async update(id: string, params: UpdateTopicParams): Promise<MigmaResult<Topic>> {
    return this.client.patch<Topic>(`/topics/${id}`, params as unknown as Record<string, unknown>);
  }

  async remove(id: string, projectId: string): Promise<MigmaResult<DeleteResponse>> {
    return this.client.delete<DeleteResponse>(`/topics/${id}`, { projectId });
  }

  async subscribe(
    topicId: string,
    params: TopicSubscriptionParams
  ): Promise<MigmaResult<TopicSubscriptionResponse>> {
    return this.client.post<TopicSubscriptionResponse>(
      `/topics/${topicId}/subscribe`,
      params as unknown as Record<string, unknown>
    );
  }

  async unsubscribe(
    topicId: string,
    params: TopicSubscriptionParams
  ): Promise<MigmaResult<TopicSubscriptionResponse>> {
    return this.client.post<TopicSubscriptionResponse>(
      `/topics/${topicId}/unsubscribe`,
      params as unknown as Record<string, unknown>
    );
  }
}
