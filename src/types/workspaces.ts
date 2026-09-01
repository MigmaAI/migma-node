export interface Workspace {
  id: string;
  name: string;
  type: string;
  /** The caller's role in this workspace (owner, admin, member, …). */
  role: string;
  /** True for the caller's personal workspace. */
  personal: boolean;
}

export interface ListWorkspacesResponse {
  workspaces: Workspace[];
}
