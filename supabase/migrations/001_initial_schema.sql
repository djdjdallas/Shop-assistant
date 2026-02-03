-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores Shopify shop credentials
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stores merchant notes for products (One-to-Many)
CREATE TABLE product_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT NOT NULL REFERENCES shops(shop_domain) ON DELETE CASCADE,
  product_id TEXT NOT NULL, 
  note_text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT, -- New: 'John Doe'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stores competitor tracking info
CREATE TABLE product_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT NOT NULL REFERENCES shops(shop_domain) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  price DECIMAL(10,2),
  last_checked TIMESTAMP DEFAULT NOW()
);

-- Cached sales statistics
CREATE TABLE product_stats_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT NOT NULL REFERENCES shops(shop_domain) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  period TEXT NOT NULL, -- '30d' or '90d'
  units_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  daily_breakdown JSONB, 
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shop_domain, product_id, period)
);

-- Indexes
CREATE INDEX idx_notes_product ON product_notes(shop_domain, product_id);
CREATE INDEX idx_competitors_product ON product_competitors(shop_domain, product_id);
CREATE INDEX idx_stats_product ON product_stats_cache(shop_domain, product_id, period);