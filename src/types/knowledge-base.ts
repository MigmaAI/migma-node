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
}

export interface KnowledgeBaseListResponse {
  entries: KnowledgeBaseEntry[];
  total: number;
}

export interface AddKnowledgeBaseParams {
  title: string;
  content: string;
  /** Set to mark the entry as a design reference generation should match. */
  referenceOrigin?: ReferenceOrigin;
  previewHtml?: string;
  thumbnailUrl?: string;
  screenshotUrl?: string;
}

export interface UpdateKnowledgeBaseParams {
  title?: string;
  content?: string;
}
