export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagParams {
  name: string;
  /** Hex color e.g. #FF5733 */
  color?: string;
  description?: string;
  projectId: string;
}

export interface UpdateTagParams {
  name?: string;
  color?: string;
  description?: string;
  projectId: string;
}

export interface ListTagsParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ListTagsResponse {
  data: Tag[];
  count: number;
}
