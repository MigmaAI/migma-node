export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'active' | 'error';
  domain: string;
  logoUrls?: {
    primary?: string;
    secondary?: string;
    favicon?: string;
  };
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ListProjectsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export interface ListProjectsResponse {
  projects: Project[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ImportProjectParams {
  urls: string[];
  logoUrls?: {
    primary?: string;
    secondary?: string;
    favicon?: string;
  };
}

export interface ImportProjectResponse {
  projectId: string;
  status: 'pending';
  domain: string;
  urls: string[];
  message: string;
}

export interface ImportStatusResponse {
  projectId: string;
  status: 'pending' | 'processing' | 'active' | 'error';
  name?: string;
  description?: string;
  domain?: string;
  error?: string;
  progress: {
    stage: string;
    percentage: number;
  };
  importMetrics?: Record<string, unknown>;
}

export interface RetryImportResponse {
  projectId: string;
  status: string;
  message: string;
}

export interface FieldCatalogParams {
  segmentId?: string;
  tag?: string;
}

export type FieldCatalogEntryType = 'string' | 'number' | 'boolean' | 'date' | 'url' | 'unknown';

export interface FieldCatalogEntry {
  key: string;
  label: string;
  type: FieldCatalogEntryType;
  fillRate: number;
  sample: string[];
  auto: boolean;
}

export interface FieldCatalogResponse {
  entries: FieldCatalogEntry[];
  totalSubscribers: number;
  computedAt: string;
}
