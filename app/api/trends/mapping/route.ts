import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { getSupabaseServerClient, resolveShopId } from '../../../../lib/supabase-server';

/**
 * GET: Retrieve trend mappings for a product
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Get mappings with query details
  const { data, error } = await supabase
    .from('product_trends_mappings')
    .select(`
      id,
      product_id,
      trends_query_id,
      created_at,
      google_trends_queries (
        id,
        query_text,
        created_at
      )
    `)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST: Create a new trend mapping for a product
 */
export async function POST(request: Request) {
  const body = await request.json();

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request, body);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, queryText, trendsQueryId } = body;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  if (!queryText && !trendsQueryId) {
    return NextResponse.json(
      { error: 'Either queryText or trendsQueryId is required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  let queryId = trendsQueryId;

  // If queryText provided, create or find the query
  if (queryText && !trendsQueryId) {
    // Check if query already exists
    const { data: existingQuery } = await supabase
      .from('google_trends_queries')
      .select('id')
      .eq('shop_id', shopId)
      .eq('query_text', queryText)
      .single();

    if (existingQuery) {
      queryId = existingQuery.id;
    } else {
      // Create new query
      const { data: newQuery, error: insertError } = await supabase
        .from('google_trends_queries')
        .insert({
          shop_id: shopId,
          query_text: queryText,
        })
        .select('id')
        .single();

      if (insertError || !newQuery) {
        return NextResponse.json(
          { error: 'Failed to create query' },
          { status: 500 }
        );
      }

      queryId = newQuery.id;
    }
  }

  // Check if mapping already exists
  const { data: existingMapping } = await supabase
    .from('product_trends_mappings')
    .select('id')
    .eq('product_id', productId)
    .eq('trends_query_id', queryId)
    .single();

  if (existingMapping) {
    return NextResponse.json(
      { error: 'Mapping already exists', mappingId: existingMapping.id },
      { status: 409 }
    );
  }

  // Create the mapping
  const { data, error } = await supabase
    .from('product_trends_mappings')
    .insert({
      product_id: productId,
      trends_query_id: queryId,
    })
    .select(`
      id,
      product_id,
      trends_query_id,
      created_at,
      google_trends_queries (
        id,
        query_text
      )
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE: Remove a trend mapping
 */
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const mappingId = url.searchParams.get('mappingId');

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!mappingId) {
    return NextResponse.json({ error: 'mappingId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Verify the mapping belongs to a product in this shop
  const { data: mapping } = await supabase
    .from('product_trends_mappings')
    .select(`
      id,
      google_trends_queries!inner (
        shop_id
      )
    `)
    .eq('id', mappingId)
    .single();

  if (!mapping) {
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
  }

  // Delete the mapping
  const { error } = await supabase
    .from('product_trends_mappings')
    .delete()
    .eq('id', mappingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
