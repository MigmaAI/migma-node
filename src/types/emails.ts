export interface EmailImage {
  source: { type: 'url'; url: string };
}

export interface GenerateEmailParams {
  projectId: string;
  prompt: string;
  images?: EmailImage[];
  model?: string;
  webMode?: boolean;
  languages?: string[];
  visibility?: 'private' | 'unlisted' | 'public';
  referenceId?: string;
  /** Optional target email count. Omit to let Migma infer single vs series from the prompt. */
  count?: number;
}

export interface GenerateEmailResponse {
  conversationId: string;
  status: 'pending';
  message: string;
  link: string;
  count?: number;
  referenceId?: string;
}

export interface EmailGenerationResult {
  subject: string;
  previewText: string;
  html: string;
  source?: string;
  emails: GeneratedEmailArtifact[];
  seriesPlan?: {
    name?: string;
    count?: number;
    themeId?: string;
  };
  screenshotUrl: string | null;
  screenshotFullUrl: string | null;
  stats: {
    imageCount: number;
    buttonCount: number;
    estimatedLength: string;
    colors: string[];
  };
  languages: string[];
  templateVariables?: unknown[];
}

export interface GeneratedEmailArtifact {
  artifactId: string | null;
  conversationId: string;
  messageId: string | null;
  slotIdx: number;
  slot: number;
  subject: string;
  preheader: string;
  html: string;
  source?: string;
  sendOffsetDays?: number;
  status: 'ready' | 'processing' | 'failed';
  thumbnailUrl?: string | null;
  templateVariables?: unknown[];
}

export interface EmailGenerationStatus {
  conversationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
  result?: EmailGenerationResult;
}

export interface ListEmailsParams {
  projectId: string;
  limit?: number;
  page?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  search?: string;
}

export interface ListEmailsEmail {
  conversationId: string;
  title: string;
  subject: string | null;
  previewText: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  screenshotUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListEmailsResponse {
  emails: ListEmailsEmail[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface SendTestEmailParams {
  conversationId: string;
  to: string;
}

export interface SendTestEmailResponse {
  messageId: string;
  conversationId: string;
  sentTo: string;
  sentAt: string;
  subject: string;
}

export interface EmailArtifact {
  artifactId: string;
  conversationId: string;
  messageId: string | null;
  slotIdx: number;
  slotUuid: string | null;
  status: string;
  engine: 'zinn' | 'react-email';
  subject: string;
  preheader: string;
  html: string;
  source?: string;
  templateVariables: unknown[];
  warnings: string[];
  thumbnailUrl: string | null;
  updatedAt: string;
}

export interface UpdateEmailArtifactParams {
  source: string;
  vars?: Record<string, unknown>;
  lang?: string;
  label?: string;
}

export interface CompileEmailArtifactParams {
  source?: string;
  vars?: Record<string, unknown>;
  lang?: string;
}

export interface CompileEmailArtifactResponse {
  artifactId: string;
  html: string;
  warnings: string[];
  metadata?: Record<string, unknown>;
}
