export interface SegmentFieldFilter {
  key: string;
  /** Exact/pattern, date, or numeric comparison. Date/number comparisons use one
   * value; date_between/number_between use two ordered bounds. */
  mode?: 'is' | 'is_not' | 'starts_with' | 'ends_with' | 'contains' | 'not_contains'
    | 'date_after' | 'date_before' | 'date_on' | 'date_between'
    | 'number_gt' | 'number_gte' | 'number_lt' | 'number_lte' | 'number_between';
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
  /** Limit opened or clicked to one campaign. Not on sent, and not with minCount or maxCount. */
  campaignId?: string;
  /** Mode within only, a period of at most 90 days: at least this many emails (1 to 10,000). */
  minCount?: number;
  /** Mode within only, a period of at most 90 days: at most this many emails (0 to 10,000). Contacts with none match too. */
  maxCount?: number;
}

export interface SegmentFilters {
  /** Combines this group's conditions and child groups. Defaults to all (AND).
   * Campaign-scoped activity requires all in its group and every ancestor. */
  match?: 'all' | 'any';
  /** Nonempty child groups: at most 10 per group, 3 levels below the root,
   * and 50 conditions across the entire filter tree. The root may be empty. */
  groups?: SegmentFilters[];
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
