/**
 * Shared API response envelope, matching the backend's common response
 * format documented in docs/api-notes.md.
 *
 * Success:
 *   { "success": true, "data": { ... } }
 *
 * Error:
 *   { "success": false, "message": "Something went wrong." }
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
