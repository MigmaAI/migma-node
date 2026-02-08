export interface CheckCompatibilityParams {
  html: string;
  clients?: string[];
}

export interface CompatibilityResponse {
  clientIssues: Record<string, unknown>;
  summary: {
    totalErrors: number;
    totalWarnings: number;
    compatibilityScore: number;
  };
  supportedClients: unknown[];
  metadata: { processingTime: number; clientsTested: number };
}

export interface AnalyzeLinksParams {
  html: string;
  timeout?: number;
  followRedirects?: boolean;
}

export interface CheckedLink {
  url: string;
  status: string;
  responseTime?: number;
  error?: string;
}

export interface LinkAnalysisResponse {
  totalLinks: number;
  checkedLinks: CheckedLink[];
  summary: {
    brokenLinks: number;
    unreachableLinks: number;
    averageResponseTime: number;
  };
  recommendations: string[];
  metadata: {
    processingTime: number;
    linksChecked: number;
    linksSkipped: number;
  };
}

export interface CheckSpellingParams {
  html: string;
  languages?: string[];
  checkGrammar?: boolean;
}

export interface SpellingResponse {
  summary: { totalErrors: number };
  metadata: { processingTime: number; aiModel: string; tokensUsed: number };
  [key: string]: unknown;
}

export interface AnalyzeDeliverabilityParams {
  html: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface DeliverabilityResponse {
  prediction: {
    category: 'inbox' | 'promotions' | 'spam';
    confidence: number;
    score: number;
    reasoning: string;
  };
  contentSignals: {
    promotional: string[];
    transactional: string[];
    spam: string[];
    engagement: string[];
  };
  spamScore: {
    score: number;
    triggers: string[];
    recommendations: string[];
  };
  recommendations: {
    critical: string[];
    important: string[];
    suggested: string[];
  };
  metadata: { processingTime: number; analysisType: string };
}

export interface ValidateAllParams {
  html: string;
  subject?: string;
  options?: {
    checkCompatibility?: boolean;
    checkLinks?: boolean;
    checkSpelling?: boolean;
    checkDeliverability?: boolean;
    clients?: string[];
    languages?: string[];
  };
}

export interface ValidateAllResponse {
  overallScore: number;
  compatibility?: CompatibilityResponse;
  linkAnalysis?: LinkAnalysisResponse;
  spelling?: SpellingResponse;
  deliverability?: DeliverabilityResponse;
  summary: {
    criticalIssues: number;
    warnings: number;
    passed: string[];
    failed: string[];
  };
  recommendations: {
    critical: string[];
    important: string[];
    suggested: string[];
  };
  metadata: { totalProcessingTime: number; checksPerformed: string[] };
}
