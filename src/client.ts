import { detectAgentId } from './agent-identity';
import { MigmaError, MigmaErrorCode } from './errors';
import type { ApiResponse, MigmaResult } from './types/common';

export interface ClientConfig {
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

/** Per-call options for write methods (POST/PATCH/DELETE). */
export interface CallOptions {
  /**
   * Optional Idempotency-Key (max 100 chars). Same key + same body within 24h
   * replays the original response; a different body returns 409 IDEMPOTENCY_CONFLICT.
   * Reused across the SDK's own automatic retries so a retried call never duplicates.
   */
  idempotencyKey?: string;
}

export class MigmaClient {
  private readonly apiKey: string;
  private readonly config: ClientConfig;
  private readonly headers: Record<string, string>;

  constructor(apiKey: string, config: ClientConfig) {
    this.apiKey = apiKey;
    this.config = config;

    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'migma-node/1.0.0',
    };
    const agentId = detectAgentId();
    if (agentId) {
      this.headers['X-Agent-Id'] = agentId;
    }
  }

  async request<T>(options: RequestOptions): Promise<MigmaResult<T>> {
    const url = this.buildUrl(options.path, options.query);
    const attempts = this.config.maxRetries + 1;

    let lastError: MigmaError | null = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: options.method,
          headers: { ...this.headers, ...options.headers },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const json = (await response.json()) as ApiResponse<T>;

        if (!response.ok || !json.success) {
          const error = new MigmaError(
            json.error || `Request failed with status ${response.status}`,
            response.status
          );

          if (response.status >= 500 || response.status === 429) {
            lastError = error;
            if (attempt < attempts - 1) {
              const delay =
                response.status === 429
                  ? (this.parseRetryAfter(response) ??
                    this.config.retryDelay * (attempt + 1))
                  : this.config.retryDelay * Math.pow(2, attempt);
              await this.sleep(delay);
              continue;
            }
          }

          return { data: null, error };
        }

        return { data: json.data as T, error: null };
      } catch (err: unknown) {
        lastError = new MigmaError(
          err instanceof Error ? err.message : 'Network error',
          0,
          MigmaErrorCode.NETWORK_ERROR
        );

        if (attempt < attempts - 1) {
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
    }

    return { data: null, error: lastError! };
  }

  /**
   * For endpoints where the API returns `{ success, data, count }` and we want
   * both the data array and the count together.
   */
  async requestWithCount<T>(
    options: RequestOptions
  ): Promise<MigmaResult<{ data: T; count: number }>> {
    const url = this.buildUrl(options.path, options.query);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: { ...this.headers, ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const json = (await response.json()) as ApiResponse<T>;

      if (!response.ok || !json.success) {
        return {
          data: null,
          error: new MigmaError(
            json.error || `Request failed with status ${response.status}`,
            response.status
          ),
        };
      }

      return {
        data: { data: json.data as T, count: json.count ?? 0 },
        error: null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: new MigmaError(
          err instanceof Error ? err.message : 'Network error',
          0,
          MigmaErrorCode.NETWORK_ERROR
        ),
      };
    }
  }

  async get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ) {
    return this.request<T>({ method: 'GET', path, query });
  }

  async getWithCount<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ) {
    return this.requestWithCount<T>({ method: 'GET', path, query });
  }

  async post<T>(path: string, body?: Record<string, unknown>, options?: CallOptions) {
    return this.request<T>({ method: 'POST', path, body, headers: this.callHeaders(options) });
  }

  async patch<T>(path: string, body?: Record<string, unknown>, options?: CallOptions) {
    return this.request<T>({ method: 'PATCH', path, body, headers: this.callHeaders(options) });
  }

  async put<T>(path: string, body?: Record<string, unknown>) {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async delete<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    options?: CallOptions
  ) {
    return this.request<T>({ method: 'DELETE', path, query, headers: this.callHeaders(options) });
  }

  private callHeaders(options?: CallOptions): Record<string, string> | undefined {
    if (options?.idempotencyKey) {
      return { 'Idempotency-Key': options.idempotencyKey };
    }
    return undefined;
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private parseRetryAfter(response: Response): number | null {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) return seconds * 1000;
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
