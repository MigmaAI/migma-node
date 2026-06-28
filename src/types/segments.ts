export interface SegmentFieldFilter {
  key: string;
  /** Exact match (is/is_not) or pattern match (starts_with/ends_with/contains/not_contains,
   *  compiled to anchored case-insensitive regex). Pattern modes keep a value group
   *  like "email ends_with .vc" accurate as new contacts arrive. */
  mode?: 'is' | 'is_not' | 'starts_with' | 'ends_with' | 'contains' | 'not_contains';
  values: string[];
}

export interface SegmentActivityFilter {
  action: 'sent' | 'opened' | 'clicked';
  channel?: 'email';
  mode: 'within' | 'before' | 'never' | 'between';
  unit?: 'hours' | 'days';
  amount?: number;
  from?: string | Date;
  to?: string | Date;
  campaignId?: string;
}

export interface SegmentFilters {
  tags?: string[];
  excludeTags?: string[];
  status?: 'subscribed' | 'unsubscribed' | 'non-subscribed' | 'bounced';
  validationStatus?: 'valid' | 'invalid' | 'risky' | 'unknown';
  customFields?: Record<string, string[]>;
  fields?: SegmentFieldFilter[];
  activity?: SegmentActivityFilter[];
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  filters: SegmentFilters;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentParams {
  name: string;
  description?: string;
  filters?: SegmentFilters;
  projectId: string;
}

export interface UpdateSegmentParams {
  name?: string;
  description?: string;
  filters?: SegmentFilters;
  projectId: string;
}

export interface ListSegmentsResponse {
  data: Segment[];
  count: number;
}
