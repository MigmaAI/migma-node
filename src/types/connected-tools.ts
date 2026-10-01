export interface ConnectedToolScope {
  projectId: string;
  serverId: string;
  toolName: string;
}
export interface ListConnectedToolsParams {
  projectId: string;
  search?: string;
  offset?: number;
  limit?: number;
}
export interface ConnectedToolSummary {
  name: string;
  serverId: string;
  description: string;
  requiresApproval: boolean;
  annotations?: Record<string, unknown>;
}
export interface ConnectedToolSchema extends ConnectedToolSummary {
  inputSchema: Record<string, unknown>;
}
export interface ListConnectedToolsResponse {
  tools: ConnectedToolSummary[];
  total: number;
  nextOffset: number | null;
  unreachableServers: string[];
  authRequired: Array<{ serverId: string; authUrl: string }>;
}
