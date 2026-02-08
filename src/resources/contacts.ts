import type { MigmaClient } from '../client';
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
  ChangeStatusParams,
} from '../types/contacts';

export class Contacts {
  constructor(private readonly client: MigmaClient) {}

  async create(params: CreateContactParams): Promise<MigmaResult<Contact>> {
    return this.client.post<Contact>('/contacts', params as unknown as Record<string, unknown>);
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

  async update(id: string, params: UpdateContactParams): Promise<MigmaResult<Contact>> {
    return this.client.patch<Contact>(`/contacts/${id}`, params as unknown as Record<string, unknown>);
  }

  async remove(id: string, projectId: string): Promise<MigmaResult<DeleteResponse>> {
    return this.client.delete<DeleteResponse>(`/contacts/${id}`, { projectId });
  }

  async bulkImport(params: BulkImportParams): Promise<MigmaResult<BulkImportResponse>> {
    return this.client.post<BulkImportResponse>('/contacts/bulk', params as unknown as Record<string, unknown>);
  }

  async getBulkImportStatus(jobId: string): Promise<MigmaResult<BulkImportJobStatus>> {
    return this.client.get<BulkImportJobStatus>(`/contacts/bulk/${jobId}`);
  }

  async changeStatus(params: ChangeStatusParams): Promise<MigmaResult<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>('/contacts/status', params as unknown as Record<string, unknown>);
  }
}
