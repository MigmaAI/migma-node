// Auto-identify the AI agent driving this SDK so Migma can show live
// presence ("Claude Code · creating") in the user's dashboard. A configured
// agentId wins, then MIGMA_AGENT_ID; host detection is best-effort and silent.
// An id outside the contract is ignored, as the API ignores it.
const AGENT_ID_PATTERN = /^ai:[a-z0-9][a-z0-9._-]{0,62}$/;

const HOST_AGENT_ENV: Array<{ env: string; id: string }> = [
  { env: 'CLAUDECODE', id: 'ai:claude-code' },
  { env: 'CURSOR_TRACE_ID', id: 'ai:cursor' },
  { env: 'CODEX_HOME', id: 'ai:codex' },
];

function validAgentId(value: string | undefined): string | null {
  const id = (value || '').trim().toLowerCase();
  return AGENT_ID_PATTERN.test(id) ? id : null;
}

export function detectAgentId(configured?: string): string | null {
  const configuredId = validAgentId(configured);
  if (configuredId) return configuredId;

  if (typeof process === 'undefined' || !process.env) return null;

  const explicit = validAgentId(process.env.MIGMA_AGENT_ID);
  if (explicit) return explicit;

  for (const { env, id } of HOST_AGENT_ENV) {
    if (process.env[env]) return id;
  }
  return null;
}
