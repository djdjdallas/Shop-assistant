-- Change product_trends_mappings.product_id from UUID (FK to products) to TEXT
-- to match product_notes, product_competitors, and product_stats_cache tables,
-- which all store the Shopify GID directly as TEXT.

-- Drop the existing unique constraint first
ALTER TABLE product_trends_mappings DROP CONSTRAINT IF EXISTS product_trends_mappings_product_id_trends_query_id_key;

-- Drop the FK constraint and change column type
ALTER TABLE product_trends_mappings
  DROP CONSTRAINT IF EXISTS product_trends_mappings_product_id_fkey,
  ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- Recreate the unique constraint
ALTER TABLE product_trends_mappings ADD CONSTRAINT product_trends_mappings_product_id_trends_query_id_key UNIQUE (product_id, trends_query_id);
