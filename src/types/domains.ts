export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
  status?: string;
}

export interface Domain {
  domain: string;
  region: string;
  status: string;
  isVerified?: boolean;
  dnsRecords?: DnsRecord[];
  trackingSettings?: {
    openTracking?: boolean;
    clickTracking?: boolean;
    brandedTracking?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateDomainParams {
  domain: string;
  region?: 'us-east-1' | 'eu-west-1';
}

export interface UpdateDomainParams {
  openTracking?: boolean;
  clickTracking?: boolean;
  brandedTracking?: boolean;
}

export interface DomainVerificationResult {
  domain: string;
  status: string;
  dnsRecords?: DnsRecord[];
  [key: string]: unknown;
}

export interface DomainAvailability {
  available: boolean;
  [key: string]: unknown;
}

export interface CreateManagedDomainParams {
  prefix: string;
  region?: string;
}

export interface DomainDeleteResponse {
  domain: string;
  deleted: boolean;
}
