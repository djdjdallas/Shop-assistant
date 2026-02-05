/**
 * Custom error classes for consistent error handling.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string = 'External service error') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

export class ShopifyAPIError extends ExternalServiceError {
  constructor(message: string = 'Shopify API error') {
    super('shopify', message);
  }
}

export class GoogleTrendsError extends ExternalServiceError {
  constructor(message: string = 'Google Trends API error') {
    super('google_trends', message);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Check if an error is an operational error (expected) vs programmer error.
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Normalize any error to an AppError.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, 'INTERNAL_ERROR', false);
  }

  return new AppError(
    typeof error === 'string' ? error : 'An unexpected error occurred',
    500,
    'INTERNAL_ERROR',
    false
  );
}
