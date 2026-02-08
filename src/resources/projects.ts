import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  Project,
  ListProjectsParams,
  ListProjectsResponse,
  ImportProjectParams,
  ImportProjectResponse,
  ImportStatusResponse,
  RetryImportResponse,
} from '../types/projects';
import { poll, type PollingOptions } from '../polling';

export class Projects {
  constructor(private readonly client: MigmaClient) {}

  async list(params?: ListProjectsParams): Promise<MigmaResult<ListProjectsResponse>> {
    return this.client.get<ListProjectsResponse>('/projects', {
      limit: params?.limit,
      offset: params?.offset,
      status: params?.status,
    });
  }

  async get(projectId: string): Promise<MigmaResult<Project>> {
    return this.client.get<Project>(`/projects/${projectId}`);
  }

  async import(params: ImportProjectParams): Promise<MigmaResult<ImportProjectResponse>> {
    return this.client.post<ImportProjectResponse>(
      '/projects/import',
      params as unknown as Record<string, unknown>
    );
  }

  async getImportStatus(projectId: string): Promise<MigmaResult<ImportStatusResponse>> {
    return this.client.get<ImportStatusResponse>(
      `/projects/import/${projectId}/status`
    );
  }

  async retryImport(projectId: string): Promise<MigmaResult<RetryImportResponse>> {
    return this.client.post<RetryImportResponse>(
      `/projects/import/${projectId}/retry`
    );
  }

  /**
   * Import a project and wait for completion.
   * Polls getImportStatus until status is 'active' or 'error'.
   */
  async importAndWait(
    params: ImportProjectParams,
    options?: PollingOptions
  ): Promise<MigmaResult<ImportStatusResponse>> {
    const startResult = await this.import(params);
    if (startResult.error) {
      return { data: null, error: startResult.error };
    }

    const projectId = startResult.data.projectId;

    return poll(
      () => this.getImportStatus(projectId),
      (status) => status.status === 'active' || status.status === 'error',
      options
    );
  }
}
