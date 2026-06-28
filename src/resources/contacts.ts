import type { CallOptions, MigmaClient } from '../client';
import type { MigmaResult, DeleteResponse } from '../types/common';
import type {
  Contact,
  CreateContactParams,
  UpdateContactParams,
  ListContactsParams,
  ListContactsResponse,
  BulkImportParams,
  BulkImportResponse,
  BulkImportJobStatus,
  BatchDeleteContactsParams,
  BatchDeleteResponse,
  ChangeStatusParams,
} from '../types/contacts';

export class Contacts {
  constructor(private readonly client: MigmaClient) {}

  async create(params: CreateContactParams, options?: CallOptions): Promise<MigmaResult<Contact>> {
    return this.client.post<Contact>('/contacts', params as unknown as Record<string, unknown>, options);
  }

  async list(params: ListContactsParams): Promise<MigmaResult<ListContactsResponse>> {
    const { projectId, page, limit, tags, status, search } = params;
    return this.client.getWithCount<Contact[]>('/contacts', {
      projectId,
      page,
      limit,
      tags,
      status,
      search,
    }) as Promise<MigmaResult<ListContactsResponse>>;
  }

  async get(id: string, projectId: string): Promise<MigmaResult<Contact>> {
    return this.client.get<Contact>(`/contacts/${id}`, { projectId });
  }

  async update(id: string, params: UpdateContactParams, options?: CallOptions): Promise<MigmaResult<Contact>> {
    return this.client.patch<Contact>(`/contacts/${id}`, params as unknown as Record<string, unknown>, options);
  }

  async remove(id: string, projectId: string, options?: CallOptions): Promise<MigmaResult<DeleteResponse>> {
    return this.client.delete<DeleteResponse>(`/contacts/${id}`, { projectId }, options);
  }

  async bulkImport(params: BulkImportParams, options?: CallOptions): Promise<MigmaResult<BulkImportResponse>> {
    return this.client.post<BulkImportResponse>('/contacts/bulk', params as unknown as Record<string, unknown>, options);
  }

  async getBulkImportStatus(jobId: string): Promise<MigmaResult<BulkImportJobStatus>> {
    return this.client.get<BulkImportJobStatus>(`/contacts/bulk/${jobId}`);
  }

  /** Batch delete contacts by email (up to 1000). Emails with no match come back in `notFound`. */
  async bulkDeleteByEmail(params: BatchDeleteContactsParams, options?: CallOptions): Promise<MigmaResult<BatchDeleteResponse>> {
    return this.client.post<BatchDeleteResponse>('/contacts/bulk-delete', params as unknown as Record<string, unknown>, options);
  }

  async changeStatus(params: ChangeStatusParams, options?: CallOptions): Promise<MigmaResult<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>('/contacts/status', params as unknown as Record<string, unknown>, options);
  }
}
