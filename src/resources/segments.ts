import type { MigmaClient } from '../client';
import type { MigmaResult, DeleteResponse } from '../types/common';
import type {
  Segment,
  CreateSegmentParams,
  UpdateSegmentParams,
  ListSegmentsResponse,
} from '../types/segments';

export class Segments {
  constructor(private readonly client: MigmaClient) {}

  async list(projectId: string): Promise<MigmaResult<ListSegmentsResponse>> {
    return this.client.getWithCount<Segment[]>('/segments', {
      projectId,
    }) as Promise<MigmaResult<ListSegmentsResponse>>;
  }

  async create(params: CreateSegmentParams): Promise<MigmaResult<Segment>> {
    return this.client.post<Segment>('/segments', params as unknown as Record<string, unknown>);
  }

  async get(id: string, projectId: string): Promise<MigmaResult<Segment>> {
    return this.client.get<Segment>(`/segments/${id}`, { projectId });
  }

  async update(id: string, params: UpdateSegmentParams): Promise<MigmaResult<Segment>> {
    return this.client.patch<Segment>(`/segments/${id}`, params as unknown as Record<string, unknown>);
  }

  async remove(id: string, projectId: string): Promise<MigmaResult<DeleteResponse>> {
    return this.client.delete<DeleteResponse>(`/segments/${id}`, { projectId });
  }
}
