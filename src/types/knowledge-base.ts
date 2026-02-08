export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface KnowledgeBaseListResponse {
  entries: KnowledgeBaseEntry[];
  total: number;
}

export interface AddKnowledgeBaseParams {
  title: string;
  content: string;
}

export interface UpdateKnowledgeBaseParams {
  title?: string;
  content?: string;
}
