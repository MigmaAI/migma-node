import type { MigmaClient } from '../client';
import type { MigmaResult } from '../types/common';
import type {
  Domain,
  CreateDomainParams,
  UpdateDomainParams,
  DomainVerificationResult,
  DomainAvailability,
  CreateManagedDomainParams,
  DomainDeleteResponse,
} from '../types/domains';

export class Domains {
  constructor(private readonly client: MigmaClient) {}

  async list(): Promise<MigmaResult<Domain[]>> {
    return this.client.get<Domain[]>('/domains');
  }

  async create(params: CreateDomainParams): Promise<MigmaResult<Domain>> {
    return this.client.post<Domain>('/domains', params as unknown as Record<string, unknown>);
  }

  async get(domain: string): Promise<MigmaResult<Domain>> {
    return this.client.get<Domain>(`/domains/${domain}`);
  }

  async verify(domain: string): Promise<MigmaResult<DomainVerificationResult>> {
    return this.client.post<DomainVerificationResult>(`/domains/${domain}/verify`);
  }

  async update(domain: string, params: UpdateDomainParams): Promise<MigmaResult<Domain>> {
    return this.client.patch<Domain>(`/domains/${domain}`, params as unknown as Record<string, unknown>);
  }

  async remove(domain: string): Promise<MigmaResult<DomainDeleteResponse>> {
    return this.client.delete<DomainDeleteResponse>(`/domains/${domain}`);
  }

  async checkAvailability(prefix: string): Promise<MigmaResult<DomainAvailability>> {
    return this.client.get<DomainAvailability>(`/domains/managed/check/${prefix}`);
  }

  async listManaged(): Promise<MigmaResult<Domain[]>> {
    return this.client.get<Domain[]>('/domains/managed');
  }

  async createManaged(params: CreateManagedDomainParams): Promise<MigmaResult<Domain>> {
    return this.client.post<Domain>('/domains/managed', params as unknown as Record<string, unknown>);
  }

  async removeManaged(domain: string): Promise<MigmaResult<DomainDeleteResponse>> {
    return this.client.delete<DomainDeleteResponse>(`/domains/managed/${domain}`);
  }
}
