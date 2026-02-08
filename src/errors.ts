export enum MigmaErrorCode {
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CONFLICT = 'conflict',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  INTERNAL_ERROR = 'internal_error',
  UNKNOWN = 'unknown',
}

export class MigmaError extends Error {
  readonly statusCode: number;
  readonly code: MigmaErrorCode;

  constructor(message: string, statusCode: number, code?: MigmaErrorCode) {
    super(message);
    this.name = 'MigmaError';
    this.statusCode = statusCode;
    this.code = code ?? MigmaError.codeFromStatus(statusCode);
  }

  private static codeFromStatus(status: number): MigmaErrorCode {
    switch (status) {
      case 400:
        return MigmaErrorCode.VALIDATION_ERROR;
      case 401:
        return MigmaErrorCode.UNAUTHORIZED;
      case 403:
        return MigmaErrorCode.FORBIDDEN;
      case 404:
        return MigmaErrorCode.NOT_FOUND;
      case 409:
        return MigmaErrorCode.CONFLICT;
      case 429:
        return MigmaErrorCode.RATE_LIMIT_EXCEEDED;
      default:
        if (status >= 500) return MigmaErrorCode.INTERNAL_ERROR;
        return MigmaErrorCode.UNKNOWN;
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };
  }
}
