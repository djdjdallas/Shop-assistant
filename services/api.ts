import { ProductNote, ProductStats, Competitor } from '../types';

type ApiErrorPayload = { error?: string; message?: string };

const parseErrorMessage = (payload: ApiErrorPayload | null, statusText: string) => {
  return payload?.error || payload?.message || statusText || 'Request failed';
};

const requestJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  let payload: T | ApiErrorPayload | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = parseErrorMessage(payload as ApiErrorPayload | null, response.statusText);
    throw new Error(message);
  }

  return payload as T;
};

export const fetchProductStats = async (productId: string, period: '30d' | '90d'): Promise<ProductStats> => {
  const params = new URLSearchParams({ productId, period });
  return requestJson<ProductStats>(`/api/product-stats?${params.toString()}`);
};

export const fetchProductNotes = async (productId: string): Promise<ProductNote[]> => {
  const params = new URLSearchParams({ productId });
  return requestJson<ProductNote[]>(`/api/notes?${params.toString()}`);
};

export const saveProductNote = async (payload: {
  productId: string;
  noteText: string;
  tags: string[];
}): Promise<ProductNote> => {
  return requestJson<ProductNote>('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const fetchCompetitors = async (productId: string): Promise<Competitor[]> => {
  const params = new URLSearchParams({ productId });
  return requestJson<Competitor[]>(`/api/competitors?${params.toString()}`);
};

export const addCompetitor = async (payload: {
  productId: string;
  name: string;
  url: string;
  price: string;
}): Promise<Competitor> => {
  return requestJson<Competitor>('/api/competitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const removeCompetitor = async (competitorId: string): Promise<void> => {
  await requestJson<void>(`/api/competitors/${competitorId}`, {
    method: 'DELETE',
  });
};
