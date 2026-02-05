import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  getShopFromWebhook,
  webhookResponse,
} from '../../../../../lib/webhooks/verify';
import { getSupabaseServerClient } from '../../../../../lib/supabase-server';

interface ShopRedactPayload {
  shop_id: number;
  shop_domain: string;
}

/**
 * GDPR Shop Redact Webhook
 *
 * This webhook is called 48 hours after a shop uninstalls the app.
 * We MUST delete ALL data associated with this shop.
 *
 * Deletion order respects foreign key constraints:
 * 1. forecasts
 * 2. trends_timeseries (via trends_query_id)
 * 3. product_trends_mappings
 * 4. sales_timeseries
 * 5. google_trends_queries
 * 6. products
 * 7. product_stats_cache
 * 8. product_competitors
 * 9. product_notes
 * 10. shops
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  // Verify the webhook is from Shopify
  const isValid = await verifyWebhookSignature(rawBody, hmac);
  if (!isValid) {
    console.error('Invalid webhook signature for shop redact');
    return webhookResponse(false);
  }

  const shopDomain = getShopFromWebhook(request);
  if (!shopDomain) {
    console.error('Missing shop domain in webhook');
    return webhookResponse(false);
  }

  try {
    const payload: ShopRedactPayload = JSON.parse(rawBody);
    const supabase = getSupabaseServerClient();

    // Get shop ID first
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();

    if (shopError || !shop) {
      console.log(`Shop not found for redaction: ${shopDomain}`);
      return webhookResponse(true);
    }

    const shopId = shop.id;
    const errors: string[] = [];

    console.log(`Starting shop redact for: ${shopDomain} (${shopId})`);

    // 1. Delete forecasts
    const { error: forecastError } = await supabase
      .from('forecasts')
      .delete()
      .eq('shop_id', shopId);
    if (forecastError) errors.push(`forecasts: ${forecastError.message}`);

    // 2. Get trends query IDs for this shop, then delete trends_timeseries
    const { data: trendsQueries } = await supabase
      .from('google_trends_queries')
      .select('id')
      .eq('shop_id', shopId);

    if (trendsQueries && trendsQueries.length > 0) {
      const queryIds = trendsQueries.map(q => q.id);

      const { error: trendsTimeseriesError } = await supabase
        .from('trends_timeseries')
        .delete()
        .in('trends_query_id', queryIds);
      if (trendsTimeseriesError) errors.push(`trends_timeseries: ${trendsTimeseriesError.message}`);
    }

    // 3. Get product IDs for this shop, then delete product_trends_mappings
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('shop_id', shopId);

    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);

      const { error: mappingsError } = await supabase
        .from('product_trends_mappings')
        .delete()
        .in('product_id', productIds);
      if (mappingsError) errors.push(`product_trends_mappings: ${mappingsError.message}`);
    }

    // 4. Delete sales_timeseries
    const { error: salesError } = await supabase
      .from('sales_timeseries')
      .delete()
      .eq('shop_id', shopId);
    if (salesError) errors.push(`sales_timeseries: ${salesError.message}`);

    // 5. Delete google_trends_queries
    const { error: trendsQueriesError } = await supabase
      .from('google_trends_queries')
      .delete()
      .eq('shop_id', shopId);
    if (trendsQueriesError) errors.push(`google_trends_queries: ${trendsQueriesError.message}`);

    // 6. Delete products
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .eq('shop_id', shopId);
    if (productsError) errors.push(`products: ${productsError.message}`);

    // 7. Delete product_stats_cache
    const { error: statsError } = await supabase
      .from('product_stats_cache')
      .delete()
      .eq('shop_id', shopId);
    if (statsError) errors.push(`product_stats_cache: ${statsError.message}`);

    // 8. Delete product_competitors
    const { error: competitorsError } = await supabase
      .from('product_competitors')
      .delete()
      .eq('shop_id', shopId);
    if (competitorsError) errors.push(`product_competitors: ${competitorsError.message}`);

    // 9. Delete product_notes
    const { error: notesError } = await supabase
      .from('product_notes')
      .delete()
      .eq('shop_id', shopId);
    if (notesError) errors.push(`product_notes: ${notesError.message}`);

    // 10. Finally, delete the shop record
    const { error: shopDeleteError } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);
    if (shopDeleteError) errors.push(`shops: ${shopDeleteError.message}`);

    if (errors.length > 0) {
      console.error(`Shop redact completed with errors for ${shopDomain}:`, errors);
    } else {
      console.log(`Shop redact completed successfully for: ${shopDomain}`);
    }

    return webhookResponse(true);
  } catch (error) {
    console.error('Error processing shop redact:', error);
    // Still return 200 to acknowledge receipt
    return webhookResponse(true);
  }
}
