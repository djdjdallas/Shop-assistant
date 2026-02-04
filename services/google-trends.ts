export type TrendsPoint = { date: string; index_value: number };

export async function fetchTrendsData(
  query: string,
  region: string,
  startDate: Date,
  endDate: Date
): Promise<TrendsPoint[]> {
  void query;
  void region;
  void startDate;
  void endDate;
  // TODO: Implement with google-trends-api or a server-side proxy.
  throw new Error('fetchTrendsData not implemented');
}

export function suggestQueries(productTitle: string, tags: string[]): string[] {
  const base = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const tagTerms = tags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
  const suggestions = new Set<string>();

  if (base.length) {
    suggestions.add(base.slice(0, 3).join(' '));
  }

  for (const tag of tagTerms) {
    suggestions.add(tag);
  }

  return Array.from(suggestions).slice(0, 5);
}
