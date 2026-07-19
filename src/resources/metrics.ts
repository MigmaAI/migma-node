import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type { SendingMetrics, SendingMetricsParams } from '../types/metrics';

export class Metrics {
  constructor(private readonly client: MigmaClient) {}

  async sending(params?: SendingMetricsParams): Promise<MigmaResult<SendingMetrics>> {
    return this.client.get<SendingMetrics>('/metrics/sending', {
      months: params?.months,
    });
  }
}
