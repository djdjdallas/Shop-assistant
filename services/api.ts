import { ProductNote, ProductStats, Competitor } from '../types';

type ApiErrorPayload = { error?: string; message?: string; code?: string };

// Session token getter - will be set by the auth hook
let getSessionTokenFn: (() => Promise<string | null>) | null = null;

export const setSessionTokenGetter = (getter: () => Promise<string | null>) => {
  getSessionTokenFn = getter;
};

// Simple in-memory cache for fallback
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

const parseErrorMessage = (payload: ApiErrorPayload | null, statusText: string) => {
  return payload?.error || payload?.message || statusText || 'Request failed';
};

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(
  input: RequestInfo,
  init: RequestInit,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  cacheKey?: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);

      let payload: T | ApiErrorPayload | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message = parseErrorMessage(payload as ApiErrorPayload | null, response.statusText);

        // Don't retry client errors (4xx) except for rate limits
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(message);
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          await sleep(retryAfter * 1000);
          continue;
        }

        throw new Error(message);
      }

      // Cache successful response
      if (cacheKey && payload) {
        setCache(cacheKey, payload);
      }

      return payload as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a network/server error
      if (lastError.message.includes('Unauthorized') ||
          lastError.message.includes('Forbidden') ||
          lastError.message.includes('Not Found')) {
        break;
      }

      // Calculate exponential backoff
      if (attempt < retryConfig.maxRetries) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt),
          retryConfig.maxDelay
        );
        await sleep(delay);
      }
    }
  }

  // Try to return cached data on failure
  if (cacheKey) {
    const cachedData = getCached<T>(cacheKey);
    if (cachedData) {
      console.warn('Returning cached data due to API failure:', lastError?.message);
      return cachedData;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

async function requestJson<T>(
  input: RequestInfo,
  init?: RequestInit,
  cacheKey?: string
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (getSessionTokenFn) {
    try {
      const token = await getSessionTokenFn();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.warn('Failed to get session token:', error);
    }
  }

  return requestWithRetry<T>(
    input,
    { ...init, headers },
    DEFAULT_RETRY_CONFIG,
    cacheKey
  );
}

export const fetchProductStats = async (productId: string, period: '30d' | '90d'): Promise<ProductStats> => {
  const params = new URLSearchParams({ productId, period });
  const cacheKey = `stats:${productId}:${period}`;
  return requestJson<ProductStats>(`/api/product-stats?${params.toString()}`, undefined, cacheKey);
};

export const fetchProductNotes = async (productId: string): Promise<ProductNote[]> => {
  const params = new URLSearchParams({ productId });
  const cacheKey = `notes:${productId}`;
  return requestJson<ProductNote[]>(`/api/notes?${params.toString()}`, undefined, cacheKey);
};

export const saveProductNote = async (payload: {
  productId: string;
  noteText: string;
  tags: string[];
  author?: string;
}): Promise<ProductNote> => {
  // Invalidate cache on write
  cache.delete(`notes:${payload.productId}`);
  return requestJson<ProductNote>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchCompetitors = async (productId: string): Promise<Competitor[]> => {
  const params = new URLSearchParams({ productId });
  const cacheKey = `competitors:${productId}`;
  return requestJson<Competitor[]>(`/api/competitors?${params.toString()}`, undefined, cacheKey);
};

export const addCompetitor = async (payload: {
  productId: string;
  name: string;
  url: string;
  price: string;
}): Promise<Competitor> => {
  // Invalidate cache on write
  cache.delete(`competitors:${payload.productId}`);
  return requestJson<Competitor>('/api/competitors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const removeCompetitor = async (competitorId: string, productId?: string): Promise<void> => {
  // Invalidate cache on write
  if (productId) {
    cache.delete(`competitors:${productId}`);
  }
  await requestJson<{ success: boolean }>(`/api/competitors/${competitorId}`, {
    method: 'DELETE',
  });
};

// --- Trends API ---

export interface TrendMapping {
  id: string;
  product_id: string;
  trends_query_id: string;
  created_at: string;
  google_trends_queries: {
    id: string;
    query: string;
    created_at: string;
  } | null;
}

export const fetchTrendMappings = async (productId: string): Promise<TrendMapping[]> => {
  const params = new URLSearchParams({ productId });
  const cacheKey = `trends-mappings:${productId}`;
  return requestJson<TrendMapping[]>(`/api/trends/mapping?${params.toString()}`, undefined, cacheKey);
};

export const addTrendMapping = async (productId: string, queryText: string): Promise<TrendMapping> => {
  cache.delete(`trends-mappings:${productId}`);
  return requestJson<TrendMapping>('/api/trends/mapping', {
    method: 'POST',
    body: JSON.stringify({ productId, queryText }),
  });
};

export const removeTrendMapping = async (mappingId: string): Promise<void> => {
  await requestJson<{ success: boolean }>(`/api/trends/mapping?mappingId=${mappingId}`, {
    method: 'DELETE',
  });
};

export const fetchTrendsData = async (
  queryId: string,
  queryText?: string
): Promise<{ success: boolean; queryId: string; dataPoints: number }> => {
  return requestJson<{ success: boolean; queryId: string; dataPoints: number }>('/api/trends/fetch', {
    method: 'POST',
    body: JSON.stringify({ queryId, queryText }),
  });
};

// Clear all cached data
export const clearCache = (): void => {
  cache.clear();
};
