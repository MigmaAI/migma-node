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
