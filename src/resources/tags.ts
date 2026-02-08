import type { MigmaClient } from '../client';
import type { MigmaResult, DeleteResponse } from '../types/common';
import type {
  Tag,
  CreateTagParams,
  UpdateTagParams,
  ListTagsParams,
  ListTagsResponse,
} from '../types/tags';

export class Tags {
  constructor(private readonly client: MigmaClient) {}

  async list(params: ListTagsParams): Promise<MigmaResult<ListTagsResponse>> {
    const { projectId, page, limit, search, sortBy, sortOrder } = params;
    return this.client.getWithCount<Tag[]>('/tags', {
      projectId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    }) as Promise<MigmaResult<ListTagsResponse>>;
  }

  async create(params: CreateTagParams): Promise<MigmaResult<Tag>> {
    return this.client.post<Tag>('/tags', params as unknown as Record<string, unknown>);
  }

  async get(id: string, projectId: string): Promise<MigmaResult<Tag>> {
    return this.client.get<Tag>(`/tags/${id}`, { projectId });
  }

  async update(id: string, params: UpdateTagParams): Promise<MigmaResult<Tag>> {
    return this.client.patch<Tag>(`/tags/${id}`, params as unknown as Record<string, unknown>);
  }

  async remove(id: string, projectId: string): Promise<MigmaResult<DeleteResponse>> {
    return this.client.delete<DeleteResponse>(`/tags/${id}`, { projectId });
  }
}
