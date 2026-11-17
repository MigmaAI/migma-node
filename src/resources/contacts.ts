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
  CreateContactExportParams,
  ContactExportStatus,
  CreateContactImportParams,
  ContactImportStarted,
  ContactImportStatus,
  ListProviderImportSourcesParams,
  ProviderImportSource,
  ImportFromProviderParams,
  ProviderImportStarted,
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

  /** Queue a filtered CSV export. Poll getExport; do not list every contact to build a CSV. */
  async createExport(params: CreateContactExportParams, options?: CallOptions): Promise<MigmaResult<ContactExportStatus>> {
    return this.client.post<ContactExportStatus>('/contacts/exports', params as unknown as Record<string, unknown>, { ...options, maxRetries: options?.idempotencyKey ? options.maxRetries : 0 });
  }

  async getExport(jobId: string, projectId: string): Promise<MigmaResult<ContactExportStatus>> {
    return this.client.get<ContactExportStatus>(`/contacts/exports/${encodeURIComponent(jobId)}`, { projectId });
  }

  /**
   * Upload a CSV to import in the background. Poll getImport for status and counts.
   * Never retried automatically: the endpoint has no idempotency key, so a repeat creates a second import.
   */
  async createImport(params: CreateContactImportParams): Promise<MigmaResult<ContactImportStarted>> {
    const { file, fileName, projectId, columnMap, onConflict, delimiter, tags } = params;
    const form = new FormData();
    form.append(
      'file',
      file instanceof Blob ? file : new Blob([file as Uint8Array<ArrayBuffer>], { type: 'text/csv' }),
      fileName ?? (file as { name?: string }).name ?? 'contacts.csv'
    );
    form.append('projectId', projectId);
    form.append('columnMap', JSON.stringify(columnMap));
    if (onConflict) form.append('onConflict', onConflict);
    if (delimiter) form.append('delimiter', delimiter);
    if (tags?.length) form.append('tags', JSON.stringify(tags));
    return this.client.postForm<ContactImportStarted>('/contacts/imports', form, { maxRetries: 0 });
  }

  /** Status and counts of a CSV or provider import. */
  async getImport(id: string): Promise<MigmaResult<ContactImportStatus>> {
    return this.client.get<ContactImportStatus>(`/contacts/imports/${encodeURIComponent(id)}`);
  }

  /** Lists and segments in the brand's connected Klaviyo, Mailchimp or HubSpot account. A 409 error message includes the link to connect it. */
  async listProviderImportSources(params: ListProviderImportSourcesParams): Promise<MigmaResult<{ sources: ProviderImportSource[] }>> {
    const { provider, projectId, connectionId } = params;
    return this.client.get<{ sources: ProviderImportSource[] }>(`/contacts/imports/providers/${encodeURIComponent(provider)}/sources`, { projectId, connectionId });
  }

  /** Import provider sources as contacts (subscribed only by default). Poll getImport for counts. */
  async importFromProvider(params: ImportFromProviderParams, options?: CallOptions): Promise<MigmaResult<ProviderImportStarted>> {
    return this.client.post<ProviderImportStarted>('/contacts/imports/provider', params as unknown as Record<string, unknown>, { ...options, maxRetries: options?.idempotencyKey ? options.maxRetries : 0 });
  }

  async changeStatus(params: ChangeStatusParams, options?: CallOptions): Promise<MigmaResult<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>('/contacts/status', params as unknown as Record<string, unknown>, options);
  }
}
