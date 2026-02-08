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
}

export interface GenerateEmailResponse {
  conversationId: string;
  status: 'pending';
  message: string;
  link: string;
}

export interface EmailGenerationResult {
  subject: string;
  previewText: string;
  html: string;
  screenshotUrl: string | null;
  screenshotFullUrl: string | null;
  stats: {
    imageCount: number;
    buttonCount: number;
    estimatedLength: string;
    colors: string[];
  };
  languages: string[];
}

export interface EmailGenerationStatus {
  conversationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
  result?: EmailGenerationResult;
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
