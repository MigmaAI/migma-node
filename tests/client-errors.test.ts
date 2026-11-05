import { afterEach, describe, expect, it, vi } from 'vitest';
import { MigmaClient } from '../src/client';
import { MigmaErrorCode } from '../src/errors';

afterEach(() => vi.unstubAllGlobals());

describe('API error transport', () => {
  it('preserves public server code and data without replacing the HTTP category', async () => {
    const data = {
      checklist: [{ key: 'sender', status: 'missing', message: 'Choose a verified sender' }],
      failing: [{ key: 'sender', status: 'missing', message: 'Choose a verified sender' }],
      fixes: [{ key: 'sender', fix: 'Verify a sender', message: 'Choose a verified sender' }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: 'Fix the automation checks before activation',
      code: 'AUTOMATION_VALIDATION_FAILED',
      data,
    }), { status: 400, headers: { 'Content-Type': 'application/json' } })));

    const client = new MigmaClient('test-key', {
      baseUrl: 'https://api.example.test/v1',
      maxRetries: 0,
      retryDelay: 0,
    });
    const result = await client.post('/automations/flow/activate', { confirmed: true });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Fix the automation checks before activation');
    expect(result.error?.statusCode).toBe(400);
    expect(result.error?.code).toBe(MigmaErrorCode.VALIDATION_ERROR);
    expect(result.error?.serverCode).toBe('AUTOMATION_VALIDATION_FAILED');
    expect(result.error?.data).toEqual(data);
    expect(result.error?.toJSON()).toEqual({
      name: 'MigmaError',
      message: 'Fix the automation checks before activation',
      statusCode: 400,
      code: MigmaErrorCode.VALIDATION_ERROR,
      serverCode: 'AUTOMATION_VALIDATION_FAILED',
      data,
    });
  });
});
