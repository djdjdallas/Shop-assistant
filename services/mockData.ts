import { ProductContext, ProductStats, ProductNote, Competitor } from '../types';

export const MOCK_PRODUCT: ProductContext = {
  id: "gid://shopify/Product/123456789",
  title: "Classic Leather Weekend Bag",
  image: "https://picsum.photos/400/400",
  status: "Active",
  inventory: 12, // Low inventory to trigger alert (assuming high sales velocity)
  price: "129.00"
};

export const MOCK_NOTES: ProductNote[] = [
  {
    id: "note-2",
    shop_domain: "demo-store.myshopify.com",
    product_id: "gid://shopify/Product/123456789",
    note_text: "Check stitching quality on next batch from supplier A.",
    tags: ["Quality Check"],
    author: "Sarah Jenkins",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "note-1",
    shop_domain: "demo-store.myshopify.com",
    product_id: "gid://shopify/Product/123456789",
    note_text: "Restock expected by mid-October. Customer demand is rising.",
    tags: ["Inventory"],
    author: "Mike Thompson",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const MOCK_COMPETITORS: Competitor[] = [
  { 
    id: 'c1', 
    name: 'Amazon Basics', 
    url: 'https://amazon.com/dp/B00...', 
    price: '115.00', 
    last_checked: new Date().toISOString() 
  },
  { 
    id: 'c2', 
    name: 'Competitor X', 
    url: 'https://shop-x.com/bag', 
    price: '135.50', 
    last_checked: new Date(Date.now() - 86400000).toISOString() 
  }
];

// Generate 90 days of fake sales data
const generateDailyStats = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Increasing trend to make forecast interesting
    const trendBase = 5 + (days - i) * 0.1; 
    data.push({
      date: date.toISOString().split('T')[0],
      units: Math.floor(Math.random() * 5 + trendBase),
      revenue: Math.floor(Math.random() * 5 + trendBase) * 129.00
    });
  }
  return data;
};

const breakdown90 = generateDailyStats(90);
const breakdown30 = breakdown90.slice(-30);

export const MOCK_STATS_30: ProductStats = {
  product_id: "gid://shopify/Product/123456789",
  period: '30d',
  units_sold: breakdown30.reduce((acc, curr) => acc + curr.units, 0),
  revenue: breakdown30.reduce((acc, curr) => acc + curr.revenue, 0),
  daily_breakdown: breakdown30
};

export const MOCK_STATS_90: ProductStats = {
  product_id: "gid://shopify/Product/123456789",
  period: '90d',
  units_sold: breakdown90.reduce((acc, curr) => acc + curr.units, 0),
  revenue: breakdown90.reduce((acc, curr) => acc + curr.revenue, 0),
  daily_breakdown: breakdown90
};