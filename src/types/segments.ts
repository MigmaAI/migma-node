export interface SegmentFilters {
  tags?: string[];
  status?: 'subscribed' | 'unsubscribed' | 'non-subscribed' | 'bounced';
  customFields?: Record<string, string[]>;
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
