export interface SendingMetricsParams {
  months?: number;
}

export interface SendingMetricsCounts {
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
}

export interface SendingMetricsToday {
  sent: number;
  reserved: number;
  dailyLimit: number;
  remainingToday: number;
}

export interface SendingMetricsHistoryEntry extends SendingMetricsCounts {
  period: string;
}

export interface SendingMetrics {
  period: string;
  monthly: SendingMetricsCounts;
  today: SendingMetricsToday;
  monthlyLimit: number;
  remainingMonth: number;
  history?: SendingMetricsHistoryEntry[];
}
