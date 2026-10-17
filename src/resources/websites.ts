import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  CreateWebsiteSiteInput,
  IssueWebsiteIdentityInput,
  UpdateWebsiteSiteInput,
  WebsiteEventHistory,
  WebsiteIdentity,
  WebsiteSite,
} from '../types/websites';

export class Websites {
  constructor(private readonly client: MigmaClient) {}

  async list(projectId: string): Promise<MigmaResult<WebsiteSite[]>> {
    return this.client.get<WebsiteSite[]>('/websites', { projectId });
  }

  /**
   * Create a website. Keep the required key stable when retrying the same
   * logical creation; the SDK also preserves it across automatic retries.
   */
  async create(
    input: CreateWebsiteSiteInput,
    idempotencyKey: string
  ): Promise<MigmaResult<WebsiteSite>> {
    return this.client.post<WebsiteSite>(
      '/websites',
      input as unknown as Record<string, unknown>,
      { idempotencyKey }
    );
  }

  async update(
    siteId: string,
    input: UpdateWebsiteSiteInput
  ): Promise<MigmaResult<WebsiteSite>> {
    return this.client.patch<WebsiteSite>(
      `/websites/${encodeURIComponent(siteId)}`,
      input as unknown as Record<string, unknown>
    );
  }

  async events(siteId: string): Promise<MigmaResult<WebsiteEventHistory>> {
    return this.client.get<WebsiteEventHistory>(
      `/websites/${encodeURIComponent(siteId)}/events`
    );
  }

  /**
   * Issue a short-lived identity token from a trusted merchant server only.
   * Resolve the authenticated customer in your own validated session, then
   * pass its existing Migma contact id. This does not create a contact, change
   * consent, or validate ownership of the customer session for you. Keep the
   * API key and returned token out of logs and browser application bundles.
   */
  async issueIdentity(
    siteId: string,
    input: IssueWebsiteIdentityInput
  ): Promise<MigmaResult<WebsiteIdentity>> {
    return this.client.post<WebsiteIdentity>(
      `/websites/${encodeURIComponent(siteId)}/identity`,
      input as unknown as Record<string, unknown>
    );
  }
}
