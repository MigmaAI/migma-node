import { MigmaClient } from './client';
import { Contacts } from './resources/contacts';
import { Tags } from './resources/tags';
import { Segments } from './resources/segments';
import { Topics } from './resources/topics';
import { Sending } from './resources/sending';
import { Projects } from './resources/projects';
import { Emails } from './resources/emails';
import { Validation } from './resources/validation';
import { Previews } from './resources/previews';
import { Export } from './resources/export';
import { Domains } from './resources/domains';
import { Webhooks } from './resources/webhooks';
import { KnowledgeBase } from './resources/knowledge-base';
import { Images } from './resources/images';

export interface MigmaConfig {
  /** API base URL. Default: 'https://api.migma.ai/v1' */
  baseUrl?: string;
  /** Max retries on 5xx/429 errors. Default: 2 */
  maxRetries?: number;
  /** Base delay between retries in ms. Default: 1000 */
  retryDelay?: number;
}

export class Migma {
  private readonly client: MigmaClient;

  readonly contacts: Contacts;
  readonly tags: Tags;
  readonly segments: Segments;
  readonly topics: Topics;
  readonly sending: Sending;
  readonly projects: Projects;
  readonly emails: Emails;
  readonly validation: Validation;
  readonly previews: Previews;
  readonly export: Export;
  readonly domains: Domains;
  readonly webhooks: Webhooks;
  readonly knowledgeBase: KnowledgeBase;
  readonly images: Images;

  constructor(apiKey: string, config?: MigmaConfig) {
    if (!apiKey) {
      throw new Error(
        'Missing API key. Pass it to the constructor: `new Migma("your-api-key")`'
      );
    }

    this.client = new MigmaClient(apiKey, {
      baseUrl: config?.baseUrl ?? 'https://api.migma.ai/v1',
      maxRetries: config?.maxRetries ?? 2,
      retryDelay: config?.retryDelay ?? 1000,
    });

    this.contacts = new Contacts(this.client);
    this.tags = new Tags(this.client);
    this.segments = new Segments(this.client);
    this.topics = new Topics(this.client);
    this.sending = new Sending(this.client);
    this.projects = new Projects(this.client);
    this.emails = new Emails(this.client);
    this.validation = new Validation(this.client);
    this.previews = new Previews(this.client);
    this.export = new Export(this.client);
    this.domains = new Domains(this.client);
    this.webhooks = new Webhooks(this.client);
    this.knowledgeBase = new KnowledgeBase(this.client);
    this.images = new Images(this.client);
  }
}
