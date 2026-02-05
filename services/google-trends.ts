import googleTrends from 'google-trends-api';

export type TrendsPoint = { date: string; index_value: number };

/**
 * Fetch Google Trends data for a query within a date range.
 *
 * Note: The google-trends-api package can be unreliable and may fail
 * due to rate limiting or Google API changes. Implement proper error
 * handling and consider using a fallback or caching strategy.
 */
export async function fetchTrendsData(
  query: string,
  region: string = 'US',
  startDate: Date,
  endDate: Date
): Promise<TrendsPoint[]> {
  try {
    const results = await googleTrends.interestOverTime({
      keyword: query,
      startTime: startDate,
      endTime: endDate,
      geo: region,
    });

    const parsed = JSON.parse(results);

    if (!parsed.default?.timelineData) {
      console.warn('No timeline data returned from Google Trends');
      return [];
    }

    return parsed.default.timelineData.map((point: {
      formattedTime: string;
      formattedAxisTime: string;
      value: number[];
      time: string;
    }) => ({
      date: new Date(parseInt(point.time) * 1000).toISOString().split('T')[0],
      index_value: point.value[0] ?? 0,
    }));
  } catch (error) {
    // Google Trends API is notoriously unreliable
    // Log the error but don't crash - return empty array as fallback
    console.error('Google Trends API error:', error);

    // TODO: In production, consider implementing:
    // 1. Rate limiting to avoid being blocked
    // 2. Caching to reduce API calls
    // 3. Fallback to cached data when API fails
    // 4. Alternative data sources (e.g., paid Trends API)

    return [];
  }
}

/**
 * Fetch related queries for a keyword.
 */
export async function fetchRelatedQueries(query: string, region: string = 'US'): Promise<string[]> {
  try {
    const results = await googleTrends.relatedQueries({
      keyword: query,
      geo: region,
    });

    const parsed = JSON.parse(results);
    const topQueries = parsed.default?.rankedList?.[0]?.rankedKeyword || [];

    return topQueries.slice(0, 10).map((item: { query: string }) => item.query);
  } catch (error) {
    console.error('Error fetching related queries:', error);
    return [];
  }
}

/**
 * Suggest search queries based on product title and tags.
 */
export function suggestQueries(productTitle: string, tags: string[]): string[] {
  const base = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const tagTerms = tags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
  const suggestions = new Set<string>();

  // Add full title (truncated)
  if (base.length) {
    suggestions.add(base.slice(0, 3).join(' '));
  }

  // Add individual meaningful words from title (skip common words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
  for (const word of base) {
    if (!stopWords.has(word) && word.length > 2) {
      suggestions.add(word);
    }
  }

  // Add tags as search queries
  for (const tag of tagTerms) {
    suggestions.add(tag);
  }

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Normalize trends data to a consistent scale (0-100).
 */
export function normalizeTrendsData(data: TrendsPoint[]): TrendsPoint[] {
  if (data.length === 0) return [];

  const maxValue = Math.max(...data.map(p => p.index_value));
  if (maxValue === 0) return data;

  return data.map(point => ({
    ...point,
    index_value: Math.round((point.index_value / maxValue) * 100),
  }));
}
