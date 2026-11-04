import type { SegmentFilters } from './segments';

export type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'non-subscribed';

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  language?: string;
  tags: string[];
  customFields?: Record<string, unknown>;
  status: ContactStatus;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  /** ISO 3166-1 alpha-2 country code (e.g., US, CA, GB) */
  country?: string;
  /** Language code in ISO 639-1 or BCP 47 format (e.g., en, en-US) */
  language?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  status?: ContactStatus;
  projectId: string;
}

export interface UpdateContactParams {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  country?: string;
  language?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  status?: 'subscribed' | 'unsubscribed' | 'bounced' | 'non-subscribed';
  projectId: string;
}

export interface ListContactsParams {
  projectId: string;
  page?: number;
  limit?: number;
  tags?: string;
  status?: ContactStatus;
  search?: string;
}

export interface ListContactsResponse {
  data: Contact[];
  count: number;
}

export interface BulkImportContactItem {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  language?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  status?: ContactStatus;
}

export interface BulkImportParams {
  subscribers: BulkImportContactItem[];
  projectId: string;
}

export interface BulkImportSyncResponse {
  success: number;
  failed: number;
  updated: number;
  errors?: string[];
}

export interface BulkImportAsyncResponse {
  jobId: string;
  status: 'processing';
  totalContacts: number;
  message: string;
}

export type BulkImportResponse = BulkImportSyncResponse | BulkImportAsyncResponse;

export interface BulkImportJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalContacts: number;
  processed: number;
  result: BulkImportSyncResponse | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface BatchDeleteContactsParams {
  /** Email addresses to delete (1-1000 per request). */
  emails: string[];
  projectId: string;
}

export interface BatchDeleteResponse {
  /** Number of contacts actually deleted. */
  deleted: number;
  /** Submitted emails with no matching contact (not an error). */
  notFound: string[];
}

export interface ChangeStatusParams {
  email: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'non-subscribed';
  allLists?: boolean;
  tags?: string[];
  projectId: string;
}

export interface CreateContactExportParams {
  projectId: string;
  segmentId?: string;
  /** Same filters used by saved segments; tags are IDs, not names. */
  filters?: SegmentFilters & { search?: string };
}

export interface ContactExportStatus {
  jobId: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  contactCount: number;
  fileName: string;
  createdAt: string;
  completedAt: string | null;
  /** Present only after the private CSV has been uploaded. Expires after one hour. */
  downloadUrl?: string;
  downloadExpiresAt?: string;
  error?: string;
}

/** Maps contact fields to CSV header names. Only email is required. */
export interface ContactImportColumnMap {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  country?: string;
  language?: string;
  /** Custom field key to CSV header name. */
  customFields?: Record<string, string>;
}

export interface CreateContactImportParams {
  /** CSV contents, up to 200MB: a Buffer, Uint8Array, Blob or File. */
  file: Blob | Uint8Array;
  /** Name shown for the import. Defaults to the File's name, then contacts.csv. */
  fileName?: string;
  projectId: string;
  columnMap: ContactImportColumnMap;
  /** Rows whose email already exists: upsert updates them (default), skip leaves them untouched. */
  onConflict?: 'upsert' | 'skip';
  /** CSV field delimiter. Default comma. */
  delimiter?: string;
  /** Tag names or existing tag IDs for every imported contact. Unknown names create tags. */
  tags?: string[];
}

export interface ContactImportStarted {
  object: 'contact_import';
  id: string;
  status: 'processing';
}

export type ContactImportProvider = 'klaviyo' | 'mailchimp' | 'hubspot';

/** A CSV or provider import. Provider, tag and segment fields are null for CSV imports. */
export interface ContactImportStatus {
  object: 'contact_import';
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: ContactImportProvider | null;
  tag_id: string | null;
  segment_id: string | null;
  counts: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    /** Imported contacts who are not subscribed and cannot receive campaigns. */
    non_sendable: number;
  };
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

/** A list or segment in the connected provider account that can be imported. */
export interface ProviderImportSource {
  id: string;
  type: 'audience' | 'segment' | 'tag' | 'list';
  name: string;
  [key: string]: unknown;
}

export interface ListProviderImportSourcesParams {
  provider: ContactImportProvider;
  projectId: string;
  /** Only when the brand has several accounts connected for this provider. */
  connectionId?: string;
}

export interface ImportFromProviderParams {
  provider: ContactImportProvider;
  projectId: string;
  /** 1 to 25 sources from listProviderImportSources. */
  sources: Pick<ProviderImportSource, 'id' | 'type' | 'name'>[];
  /** Default subscribed-only. */
  consentMode?: 'subscribed-only' | 'include-all';
  connectionId?: string;
}

/** Each import becomes a tag and a segment named after its sources. Poll getImport with its id. */
export interface ProviderImportStarted {
  object: 'contact_import';
  id: string;
  status: 'pending';
  tag: { id: string; name: string };
  segment: { id: string; name: string };
}
