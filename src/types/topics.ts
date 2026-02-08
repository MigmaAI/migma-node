export interface Topic {
  id: string;
  name: string;
  description: string;
  defaultSubscription: 'opt_in' | 'opt_out';
  visibility: 'public' | 'private';
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicParams {
  name: string;
  description?: string;
  defaultSubscription?: 'opt_in' | 'opt_out';
  visibility?: 'public' | 'private';
  displayOrder?: number;
  projectId: string;
}

export interface UpdateTopicParams {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private';
  displayOrder?: number;
  isActive?: boolean;
  projectId: string;
}

export interface ListTopicsParams {
  projectId: string;
  includeInactive?: boolean;
}

export interface ListTopicsResponse {
  data: Topic[];
  count: number;
}

export interface TopicSubscriptionParams {
  subscriberId: string;
  projectId: string;
}

export interface TopicSubscriptionResponse {
  topicId: string;
  subscriberId: string;
  subscribed: boolean;
}
