import { ProductNote, ProductStats, Competitor } from '../types';
import { MOCK_NOTES, MOCK_STATS_30, MOCK_STATS_90, MOCK_COMPETITORS } from './mockData';

// In a real implementation, these would call your Next.js API routes

const DELAY_MS = 600; // Simulate network latency

export const fetchProductStats = async (productId: string, period: '30d' | '90d'): Promise<ProductStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(period === '30d' ? MOCK_STATS_30 : MOCK_STATS_90);
    }, DELAY_MS);
  });
};

export const fetchProductNotes = async (productId: string): Promise<ProductNote[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_NOTES]);
    }, DELAY_MS);
  });
};

export const saveProductNote = async (note: ProductNote): Promise<ProductNote> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In real app: POST /api/notes
      console.log('Saved note to database:', note);
      // Simulate adding to mock DB so it persists in session
      MOCK_NOTES.unshift(note);
      resolve({ ...note, updated_at: new Date().toISOString() });
    }, DELAY_MS);
  });
};

export const fetchCompetitors = async (productId: string): Promise<Competitor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_COMPETITORS]);
    }, DELAY_MS);
  });
};

export const addCompetitor = async (competitor: Competitor): Promise<Competitor> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In real app: POST /api/competitors
      console.log('Added competitor:', competitor);
      MOCK_COMPETITORS.unshift(competitor);
      resolve(competitor);
    }, DELAY_MS);
  });
};

export const removeCompetitor = async (competitorId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In real app: DELETE /api/competitors/:id
      console.log('Removed competitor:', competitorId);
      const index = MOCK_COMPETITORS.findIndex(c => c.id === competitorId);
      if (index !== -1) {
        MOCK_COMPETITORS.splice(index, 1);
      }
      resolve();
    }, DELAY_MS);
  });
};