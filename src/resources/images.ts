import type { MigmaClient } from '../client';
import type { MigmaResult, MessageResponse } from '../types/common';
import type {
  ProjectImage,
  AddImageParams,
  UpdateImageParams,
  UpdateLogosParams,
  LogosResponse,
} from '../types/images';

export class Images {
  constructor(private readonly client: MigmaClient) {}

  async add(
    projectId: string,
    params: AddImageParams
  ): Promise<MigmaResult<ProjectImage>> {
    return this.client.post<ProjectImage>(
      `/projects/${projectId}/images`,
      params as unknown as Record<string, unknown>
    );
  }

  async update(
    projectId: string,
    params: UpdateImageParams
  ): Promise<MigmaResult<ProjectImage>> {
    return this.client.put<ProjectImage>(
      `/projects/${projectId}/images`,
      params as unknown as Record<string, unknown>
    );
  }

  async remove(
    projectId: string,
    imageUrl: string
  ): Promise<MigmaResult<MessageResponse>> {
    return this.client.delete<MessageResponse>(
      `/projects/${projectId}/images`,
      { imageUrl }
    );
  }

  async updateLogos(
    projectId: string,
    params: UpdateLogosParams
  ): Promise<MigmaResult<LogosResponse>> {
    return this.client.put<LogosResponse>(
      `/projects/${projectId}/logos`,
      params as unknown as Record<string, unknown>
    );
  }
}
