import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  CreatePreviewParams,
  CreatePreviewResponse,
  GetPreviewResponse,
  GetPreviewStatusResponse,
  GetDevicePreviewResponse,
  GetSupportedDevicesResponse,
} from '../types/previews';
import { poll, type PollingOptions } from '../polling';

export class Previews {
  constructor(private readonly client: MigmaClient) {}

  async create(
    params: CreatePreviewParams
  ): Promise<MigmaResult<CreatePreviewResponse>> {
    return this.client.post<CreatePreviewResponse>(
      '/emails/previews',
      params as unknown as Record<string, unknown>
    );
  }

  async get(previewId: string): Promise<MigmaResult<GetPreviewResponse>> {
    return this.client.get<GetPreviewResponse>(`/emails/previews/${previewId}`);
  }

  async getStatus(
    previewId: string
  ): Promise<MigmaResult<GetPreviewStatusResponse>> {
    return this.client.get<GetPreviewStatusResponse>(
      `/emails/previews/${previewId}/status`
    );
  }

  async getDevice(
    previewId: string,
    deviceKey: string
  ): Promise<MigmaResult<GetDevicePreviewResponse>> {
    return this.client.get<GetDevicePreviewResponse>(
      `/emails/previews/${previewId}/devices/${deviceKey}`
    );
  }

  async getSupportedDevices(): Promise<MigmaResult<GetSupportedDevicesResponse>> {
    return this.client.get<GetSupportedDevicesResponse>(
      '/emails/devices/supported'
    );
  }

  /**
   * Create a preview and wait for completion.
   * Polls getStatus until status is 'COMPLETED', 'PARTIAL_SUCCESS', or 'FAILED'.
   */
  async createAndWait(
    params: CreatePreviewParams,
    options?: PollingOptions
  ): Promise<MigmaResult<GetPreviewResponse>> {
    const startResult = await this.create(params);
    if (startResult.error) {
      return { data: null, error: startResult.error };
    }

    const previewId = startResult.data.previewId;

    return poll(
      () => this.get(previewId),
      (preview) =>
        preview.status === 'COMPLETED' ||
        preview.status === 'PARTIAL_SUCCESS' ||
        preview.status === 'FAILED',
      options
    );
  }
}
