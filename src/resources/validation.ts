import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  ValidateAllParams,
  ValidateAllResponse,
  CheckCompatibilityParams,
  CompatibilityResponse,
  AnalyzeLinksParams,
  LinkAnalysisResponse,
  CheckSpellingParams,
  SpellingResponse,
  AnalyzeDeliverabilityParams,
  DeliverabilityResponse,
} from '../types/validation';

export class Validation {
  constructor(private readonly client: MigmaClient) {}

  async all(params: ValidateAllParams): Promise<MigmaResult<ValidateAllResponse>> {
    return this.client.post<ValidateAllResponse>(
      '/emails/validate/all',
      params as unknown as Record<string, unknown>
    );
  }

  async compatibility(
    params: CheckCompatibilityParams
  ): Promise<MigmaResult<CompatibilityResponse>> {
    return this.client.post<CompatibilityResponse>(
      '/emails/validate/compatibility',
      params as unknown as Record<string, unknown>
    );
  }

  async links(params: AnalyzeLinksParams): Promise<MigmaResult<LinkAnalysisResponse>> {
    return this.client.post<LinkAnalysisResponse>(
      '/emails/validate/links',
      params as unknown as Record<string, unknown>
    );
  }

  async spelling(params: CheckSpellingParams): Promise<MigmaResult<SpellingResponse>> {
    return this.client.post<SpellingResponse>(
      '/emails/validate/spelling',
      params as unknown as Record<string, unknown>
    );
  }

  async deliverability(
    params: AnalyzeDeliverabilityParams
  ): Promise<MigmaResult<DeliverabilityResponse>> {
    return this.client.post<DeliverabilityResponse>(
      '/emails/validate/deliverability',
      params as unknown as Record<string, unknown>
    );
  }
}
