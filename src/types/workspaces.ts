export interface Workspace {
  id: string;
  name: string;
  type: string;
  /** The caller's role in this workspace (owner, admin, member, …). */
  role: string;
  /** True for the caller's personal workspace. */
  personal: boolean;
  /** Brands in this workspace the caller can access — id + name only. */
  projects: Array<{ id: string; name: string }>;
}

export interface ListWorkspacesResponse {
  workspaces: Workspace[];
}
