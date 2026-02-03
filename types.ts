export interface Shop {
  id: string;
  shop_domain: string;
  installed_at: string;
}

export interface ProductNote {
  id: string;
  shop_domain: string;
  product_id: string;
  note_text: string;
  tags: string[];
  author: string; // New: Who wrote the note
  created_at: string; // New: For timeline
  updated_at: string;
}

export interface Competitor {
  id: string;
  name: string;
  url: string;
  price: string;
  last_checked: string;
}

export interface DailyStat {
  date: string;
  units: number;
  revenue: number;
}

export interface ProductStats {
  id?: string;
  shop_domain?: string;
  product_id: string;
  period: '30d' | '90d';
  units_sold: number;
  revenue: number;
  daily_breakdown: DailyStat[];
  cached_at?: string;
}

export interface ProductContext {
  id: string;
  title: string;
  image: string;
  status: 'Active' | 'Draft' | 'Archived';
  inventory: number;
  price: string;
}