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
  /** Scope the list to one workspace (see workspaces.list()). */
  organizationId?: string;
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
  /**
   * Save a second brand for a website you already have a brand for.
   * Without it, the import returns your existing brand for that website.
   */
  allowDuplicate?: boolean;
}

export interface ImportProjectResponse {
  projectId: string;
  /** `pending` for a new import. An existing brand returns its current status. */
  status: 'pending' | 'processing' | 'active';
  domain: string;
  urls: string[];
  message: string;
  /**
   * `true` when the website already had a brand of yours in this workspace and that
   * brand was returned: no new brand was saved and no import started.
   */
  isExisting?: boolean;
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
  /** Set by `importAndWait`: `true` when the website already had a brand and it was returned. */
  isExisting?: boolean;
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

export interface BrandImageStyle {
  styleNotes?: string;
  avoid?: string;
  useBrandColors?: boolean;
}

/** Body for PUT /projects/:id/brand-guidelines. At least one field is required. */
export interface BrandGuidelinesParams {
  /** Replaces the standing instructions every future email is written under. */
  instructions?: string;
  imageStyle?: BrandImageStyle;
}

export interface BrandGuidelinesResponse {
  instructions: string;
  imageStyle: BrandImageStyle;
  previous: { instructions: string };
  changed: boolean;
}

export interface DesignReferenceItem {
  id: string;
  title: string;
  content?: string;
  date?: string;
  previewHtml?: string;
  thumbnailUrl?: string;
  screenshotUrl?: string;
  referenceOrigin?: string;
  [key: string]: unknown;
}

export interface ProjectReferencesResponse {
  references: DesignReferenceItem[];
  total: number;
}
