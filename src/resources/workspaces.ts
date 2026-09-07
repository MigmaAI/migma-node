import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type { ListWorkspacesResponse } from '../types/workspaces';

export class Workspaces {
  constructor(private readonly client: MigmaClient) {}

  /**
   * Workspaces the API key owner belongs to. Pass a workspace id as
   * `organizationId` to projects.list() to scope brands to it.
   */
  async list(): Promise<MigmaResult<ListWorkspacesResponse>> {
    return this.client.get<ListWorkspacesResponse>('/workspaces');
  }
}
