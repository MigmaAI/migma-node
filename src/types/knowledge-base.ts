/** What makes a knowledge-base entry a design reference rather than a plain brand fact. */
export type ReferenceOrigin = 'favorite' | 'upload' | 'manual';

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  previewHtml?: string;
  thumbnailUrl?: string;
  screenshotUrl?: string;
  referenceOrigin?: ReferenceOrigin;
  sourceFileName?: string;
  /** Preparation runs after save; poll list() for completion. Retry failures by updating the original content. */
  conversion?: {
    status: 'pending' | 'complete' | 'failed';
    revision: string;
    error?: string;
  };
}

export interface KnowledgeBaseListResponse {
  entries: KnowledgeBaseEntry[];
  total: number;
}

export interface AddKnowledgeBaseParams {
  title: string;
  content: string;
  /** Original upload name, including .html, .eml, or .mjml; at most 255 characters. */
  sourceFileName?: string;
  /** Set to mark the entry as a design reference generation should match. */
  referenceOrigin?: ReferenceOrigin;
  previewHtml?: string;
  thumbnailUrl?: string;
  screenshotUrl?: string;
}

export interface UpdateKnowledgeBaseParams {
  title?: string;
  content?: string;
  /** Empty string clears the previous upload name. */
  sourceFileName?: string;
}
