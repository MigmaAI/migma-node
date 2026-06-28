// Auto-identify the AI agent driving this SDK so Migma can show live
// presence ("Claude Code · creating") in the user's dashboard. An explicit
// MIGMA_AGENT_ID always wins; host detection is best-effort and silent.
const AGENT_ID_PATTERN = /^ai:[a-z0-9][a-z0-9._-]{0,62}$/;

const HOST_AGENT_ENV: Array<{ env: string; id: string }> = [
  { env: 'CLAUDECODE', id: 'ai:claude-code' },
  { env: 'CURSOR_TRACE_ID', id: 'ai:cursor' },
  { env: 'CODEX_HOME', id: 'ai:codex' },
];

export function detectAgentId(): string | null {
  if (typeof process === 'undefined' || !process.env) return null;

  const explicit = (process.env.MIGMA_AGENT_ID || '').trim().toLowerCase();
  if (AGENT_ID_PATTERN.test(explicit)) return explicit;

  for (const { env, id } of HOST_AGENT_ENV) {
    if (process.env[env]) return id;
  }
  return null;
}
