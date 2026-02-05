import { NextResponse } from 'next/server';
import {
  AppError,
  ValidationError,
  RateLimitError,
  normalizeError,
} from './errors';

interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

/**
 * Create a consistent JSON error response.
 */
export function errorResponse(error: AppError): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    error: error.message,
    code: error.code,
  };

  // Add validation errors if present
  if (error instanceof ValidationError && error.errors.length > 0) {
    response.details = { validationErrors: error.errors };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Retry-After header for rate limit errors
  if (error instanceof RateLimitError) {
    headers['Retry-After'] = String(error.retryAfter);
  }

  return NextResponse.json(response, {
    status: error.statusCode,
    headers,
  });
}

/**
 * Wrapper for API route handlers that provides consistent error handling.
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const appError = normalizeError(error);

      // Log non-operational errors (programmer errors)
      if (!appError.isOperational) {
        console.error('Unhandled error:', error);
      }

      return errorResponse(appError);
    }
  }) as T;
}

/**
 * Create a success response with consistent format.
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Create a 201 Created response.
 */
export function createdResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Create a 204 No Content response.
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
