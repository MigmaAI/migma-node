import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Migma } from '../src/migma';

const sentAgentId = async (agentId?: string) => {
  const fetchMock = vi.fn().mockImplementation(async () => Response.json({ success: true, data: { domains: [] } }));
  vi.stubGlobal('fetch', fetchMock);
  await new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 0, agentId }).domains.list();
  return (fetchMock.mock.calls[0][1].headers as Record<string, string>)['X-Agent-Id'];
};

describe('X-Agent-Id', () => {
  beforeEach(() => {
    for (const name of ['MIGMA_AGENT_ID', 'CLAUDECODE', 'CURSOR_TRACE_ID', 'CODEX_HOME']) vi.stubEnv(name, '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('is left out when nothing names an agent', async () => {
    expect(await sentAgentId()).toBeUndefined();
  });

  it('sends the configured agent, normalized', async () => {
    expect(await sentAgentId(' AI:Claude-Code ')).toBe('ai:claude-code');
  });

  it('prefers the configured agent over the environment and the host', async () => {
    vi.stubEnv('MIGMA_AGENT_ID', 'ai:from-env');
    vi.stubEnv('CLAUDECODE', '1');
    expect(await sentAgentId('ai:cursor')).toBe('ai:cursor');
  });

  it('ignores a configured value outside the contract', async () => {
    expect(await sentAgentId('Claude Code')).toBeUndefined();
    vi.stubEnv('MIGMA_AGENT_ID', 'ai:from-env');
    expect(await sentAgentId('Claude Code')).toBe('ai:from-env');
  });

  it('still falls back to the environment, then the host', async () => {
    vi.stubEnv('CURSOR_TRACE_ID', 'trace');
    expect(await sentAgentId()).toBe('ai:cursor');
    vi.stubEnv('MIGMA_AGENT_ID', 'ai:from-env');
    expect(await sentAgentId()).toBe('ai:from-env');
  });

  it('keeps live clients in one process apart', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => Response.json({ success: true, data: { domains: [] } }));
    vi.stubGlobal('fetch', fetchMock);
    const clientFor = (agentId: string) => new Migma('mgm_test', { baseUrl: 'https://api.test.local/v1', maxRetries: 0, agentId });
    const cursor = clientFor('ai:cursor');
    const codex = clientFor('ai:codex');

    await cursor.domains.list();
    await codex.domains.list();
    await cursor.domains.list();

    expect(fetchMock.mock.calls.map(([, init]) => init.headers['X-Agent-Id'])).toEqual(['ai:cursor', 'ai:codex', 'ai:cursor']);
  });
});
