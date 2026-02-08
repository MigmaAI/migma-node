import { MigmaError } from '../errors';

/** Result type returned by all SDK methods — never throws */
export type MigmaResult<T> =
  | { data: T; error: null }
  | { data: null; error: MigmaError };

/** Raw API response envelope from the Migma backend */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

/** Standard pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Offset-based pagination (used by projects) */
export interface OffsetPaginationParams {
  limit?: number;
  offset?: number;
}

/** Delete response */
export interface DeleteResponse {
  id: string;
  deleted: boolean;
}

/** Generic message response */
export interface MessageResponse {
  message: string;
}
