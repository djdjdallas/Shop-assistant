import { getSupabaseServerClient } from '../supabase-server';
import { paginateGraphQL } from '../shopify-graphql';
import { GET_PRODUCTS, GetProductsResponse, ShopifyProduct } from '../queries/products';

interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

/**
 * Sync all products from Shopify to Supabase.
 * Paginates through all products and upserts them to the products table.
 */
export async function syncShopifyProducts(
  shopDomain: string,
  shopId: string
): Promise<SyncResult> {
  const supabase = getSupabaseServerClient();
  const result: SyncResult = { synced: 0, created: 0, updated: 0, errors: [] };

  try {
    // Fetch all products from Shopify using pagination
    const products = await paginateGraphQL<GetProductsResponse, ShopifyProduct>(
      shopDomain,
      GET_PRODUCTS,
      { first: 50 },
      (data) => data.products.edges.map((edge) => edge.node),
      (data) => data.products.pageInfo,
      100 // Max 5000 products (100 pages * 50 per page)
    );

    // Process products in batches
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const upsertData = batch.map((product) => ({
        shop_id: shopId,
        shopify_product_id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status.toLowerCase(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('products')
        .upsert(upsertData, {
          onConflict: 'shop_id,shopify_product_id',
          ignoreDuplicates: false,
        });

      if (error) {
        result.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        result.synced += batch.length;
      }
    }

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Sync a single product from Shopify to Supabase.
 */
export async function syncSingleProduct(
  shopDomain: string,
  shopId: string,
  shopifyProductId: string,
  productData: ShopifyProduct
): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from('products')
    .upsert({
      shop_id: shopId,
      shopify_product_id: shopifyProductId,
      title: productData.title,
      handle: productData.handle,
      status: productData.status.toLowerCase(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'shop_id,shopify_product_id',
    });

  if (error) {
    console.error('Failed to sync product:', error);
    return false;
  }

  return true;
}
