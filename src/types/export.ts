export interface ExportFile {
  filename: string;
  url: string;
  format: string;
}

export interface ExportResult {
  files: ExportFile[];
  executionTime: number;
  exportType: string;
}

export interface ExportFormat {
  name: string;
  description: string;
  supportedFormats: string[];
  type: 'simple' | 'complex';
}

export interface ExportFormatsResponse {
  formats: ExportFormat[];
  total: number;
}

export interface ExportStatusResponse {
  conversationId: string;
  canExport: boolean;
  availableFormats: string[];
  reason?: string;
}

export interface HubspotExportParams {
  conversationId: string;
  customOptions?: {
    customInstructions?: string;
    [key: string]: unknown;
  };
}

export interface KlaviyoPushParams {
  /** One email of a series. Omitted: the conversation's latest email. */
  emailId?: string;
  /** Which of the brand's Klaviyo accounts. Required only when the brand has several. */
  connectionId?: string;
  /** Template name in Klaviyo. Defaults to the email's title. */
  name?: string;
}

export interface KlaviyoImageKept {
  url: string;
  reason: string;
}

export interface KlaviyoPushResult {
  templateId: string;
  name: string;
  /** Opens the template in Klaviyo's editor. */
  editorUrl: string;
  /** The Klaviyo account the template was created in. */
  connectionId: string;
  images: {
    /** Images now served from Klaviyo's image library. */
    hosted: number;
    /** Images still linked from Migma, with the reason. */
    kept: KlaviyoImageKept[];
  };
}
