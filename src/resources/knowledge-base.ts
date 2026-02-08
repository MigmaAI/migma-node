import type { MigmaClient } from '../client';
import type { MigmaResult, MessageResponse } from '../types/common';
import type {
  KnowledgeBaseEntry,
  KnowledgeBaseListResponse,
  AddKnowledgeBaseParams,
  UpdateKnowledgeBaseParams,
} from '../types/knowledge-base';

export class KnowledgeBase {
  constructor(private readonly client: MigmaClient) {}

  async list(projectId: string): Promise<MigmaResult<KnowledgeBaseListResponse>> {
    return this.client.get<KnowledgeBaseListResponse>(
      `/projects/${projectId}/knowledge-base`
    );
  }

  async add(
    projectId: string,
    params: AddKnowledgeBaseParams
  ): Promise<MigmaResult<KnowledgeBaseEntry>> {
    return this.client.post<KnowledgeBaseEntry>(
      `/projects/${projectId}/knowledge-base`,
      params as unknown as Record<string, unknown>
    );
  }

  async update(
    projectId: string,
    entryId: string,
    params: UpdateKnowledgeBaseParams
  ): Promise<MigmaResult<KnowledgeBaseEntry>> {
    return this.client.put<KnowledgeBaseEntry>(
      `/projects/${projectId}/knowledge-base/${entryId}`,
      params as unknown as Record<string, unknown>
    );
  }

  async remove(
    projectId: string,
    entryId: string
  ): Promise<MigmaResult<MessageResponse>> {
    return this.client.delete<MessageResponse>(
      `/projects/${projectId}/knowledge-base/${entryId}`
    );
  }
}
