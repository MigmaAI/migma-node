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
