import { MigmaError, MigmaErrorCode } from './errors';
import type { ApiResponse, MigmaResult } from './types/common';

export interface ClientConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export class MigmaClient {
  private readonly apiKey: string;
  private readonly config: ClientConfig;

  constructor(apiKey: string, config: ClientConfig) {
    this.apiKey = apiKey;
    this.config = config;
  }

  async request<T>(options: RequestOptions): Promise<MigmaResult<T>> {
    const url = this.buildUrl(options.path, options.query);
    const timeout = options.timeout ?? this.config.timeout;
    const attempts = this.config.maxRetries + 1;

    let lastError: MigmaError | null = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method: options.method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'migma-node/1.0.0',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === 'AbortError') {
          return {
            data: null,
            error: new MigmaError(
              'Request timed out',
              0,
              MigmaErrorCode.TIMEOUT
            ),
          };
        }

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
    const timeout = options.timeout ?? this.config.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'migma-node/1.0.0',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        return {
          data: null,
          error: new MigmaError(
            'Request timed out',
            0,
            MigmaErrorCode.TIMEOUT
          ),
        };
      }

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

  async post<T>(path: string, body?: Record<string, unknown>) {
    return this.request<T>({ method: 'POST', path, body });
  }

  async patch<T>(path: string, body?: Record<string, unknown>) {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async put<T>(path: string, body?: Record<string, unknown>) {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async delete<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ) {
    return this.request<T>({ method: 'DELETE', path, query });
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
