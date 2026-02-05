import { z } from 'zod';

// Common validators
export const shopDomainSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+\.myshopify\.com$/, 'Invalid shop domain format');

export const productIdSchema = z
  .string()
  .min(1)
  .regex(/^gid:\/\/shopify\/Product\/\d+$/, 'Invalid Shopify product ID format');

export const uuidSchema = z.string().uuid();

// Note schemas
export const createNoteSchema = z.object({
  productId: productIdSchema,
  noteText: z.string().min(1).max(5000),
  tags: z.array(z.string().max(50)).max(10).default([]),
  author: z.string().max(100).optional(),
});

// Competitor schemas
export const createCompetitorSchema = z.object({
  productId: productIdSchema,
  name: z.string().min(1).max(200),
  url: z.string().url().max(2000),
  price: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error('Invalid price');
    return num;
  }),
});

// Trends schemas
export const fetchTrendsSchema = z.object({
  queryId: uuidSchema.optional(),
  queryText: z.string().min(1).max(200).optional(),
  daysBack: z.number().int().min(7).max(365).default(90),
  region: z.string().length(2).default('US'),
}).refine(
  (data) => data.queryId || data.queryText,
  { message: 'Either queryId or queryText is required' }
);

export const createTrendsMappingSchema = z.object({
  productId: productIdSchema,
  queryText: z.string().min(1).max(200).optional(),
  trendsQueryId: uuidSchema.optional(),
}).refine(
  (data) => data.queryText || data.trendsQueryId,
  { message: 'Either queryText or trendsQueryId is required' }
);

// Forecast schemas
export const generateForecastSchema = z.object({
  productId: productIdSchema,
  horizonDays: z.number().int().min(1).max(365).default(30),
});

// Product sync schema
export const syncProductsSchema = z.object({
  fullSync: z.boolean().default(false),
});

// Stats schema
export const getStatsSchema = z.object({
  productId: productIdSchema,
  period: z.enum(['30d', '90d']),
});

/**
 * Validate request body against a Zod schema.
 * Returns the parsed data or throws a validation error.
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T,
  body: unknown
): z.infer<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}

/**
 * Validate query parameters against a Zod schema.
 */
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return validateBody(schema, params);
}

export class ValidationError extends Error {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
