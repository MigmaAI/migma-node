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

export type DomainStream = 'transactional' | 'marketing';

export interface ProvisionStreamParams {
  /** Apex domain you own, e.g. 'acme.com'. */
  rootDomain: string;
  /** 'transactional' provisions notify.<rootDomain>; 'marketing' provisions send.<rootDomain>. */
  stream: DomainStream;
  region?: 'us-east-1' | 'eu-west-1';
  /** Show the apex domain in the From header when its DMARC passes. */
  vanityRootFrom?: boolean;
}

export interface SetupDomainParams {
  /** Apex domain you own, e.g. 'acme.com'. */
  rootDomain: string;
  region?: 'us-east-1' | 'eu-west-1';
  /** Default From display name applied to both provisioned streams. */
  fromName?: string;
  /** Associate the provisioned streams with a project. */
  projectId?: string;
  /** Show the apex domain in the From header when its DMARC passes. Defaults to true. */
  vanityRootFrom?: boolean;
}

/** Both stream identities provisioned for a root domain by `domains.setup`. */
export interface SetupDomainResponse {
  /** send.<rootDomain> marketing stream identity. */
  marketing: Domain;
  /** notify.<rootDomain> transactional stream identity. */
  transactional: Domain;
}

export interface DomainDeleteResponse {
  domain: string;
  deleted: boolean;
}
