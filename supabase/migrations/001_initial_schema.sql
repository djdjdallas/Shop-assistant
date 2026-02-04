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

-- Stores Shopify products (normalized for trends + forecasts)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, shopify_product_id)
);

-- Stores merchant notes for products (One-to-Many)
CREATE TABLE product_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
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
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  price DECIMAL(10,2),
  last_checked TIMESTAMP DEFAULT NOW()
);

-- Cached sales statistics
CREATE TABLE product_stats_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  period TEXT NOT NULL, -- '30d' or '90d'
  units_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  daily_breakdown JSONB, 
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shop_id, product_id, period)
);

-- Google Trends query registry
CREATE TABLE google_trends_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  region TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-to-query mapping
CREATE TABLE product_trends_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  trends_query_id UUID REFERENCES google_trends_queries(id) ON DELETE CASCADE,
  weight REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, trends_query_id)
);

-- Daily sales facts
CREATE TABLE sales_timeseries (
  id BIGSERIAL PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  units_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  UNIQUE(shop_id, product_id, date)
);

-- Trends index by query
CREATE TABLE trends_timeseries (
  id BIGSERIAL PRIMARY KEY,
  trends_query_id UUID REFERENCES google_trends_queries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  index_value SMALLINT CHECK(index_value BETWEEN 0 AND 100),
  UNIQUE(trends_query_id, date)
);

-- Forecast outputs
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  horizon_days INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  forecast_json JSONB,
  correlation REAL,
  lag_weeks INTEGER,
  trend_direction TEXT CHECK(trend_direction IN ('rising', 'stable', 'falling'))
);

-- Indexes
CREATE INDEX idx_notes_product ON product_notes(shop_id, product_id);
CREATE INDEX idx_competitors_product ON product_competitors(shop_id, product_id);
CREATE INDEX idx_stats_product ON product_stats_cache(shop_id, product_id, period);
CREATE INDEX idx_trends_queries_shop ON google_trends_queries(shop_id);
CREATE INDEX idx_sales_timeseries_product_date ON sales_timeseries(product_id, date);
CREATE INDEX idx_trends_timeseries_query_date ON trends_timeseries(trends_query_id, date);
CREATE INDEX idx_forecasts_product ON forecasts(product_id);
