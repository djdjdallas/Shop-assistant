import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../lib/supabase-server';
import { getAuthenticatedShop } from '../../../lib/session';

export async function POST(request: Request) {
  const body = await request.json();

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request, body);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const productId = body?.productId;
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const results: Record<string, string> = {};

  // --- Seed product_stats_cache (30d and 90d) ---
  for (const period of ['30d', '90d'] as const) {
    const days = period === '30d' ? 30 : 90;
    const daily_breakdown = [];
    let totalUnits = 0;
    let totalRevenue = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Random base units 8-22 with slight upward trend
      const trendFactor = 1 + ((days - i) / days) * 0.15;
      const baseUnits = Math.floor((Math.random() * 14 + 8) * trendFactor);
      const price = Math.random() * 35 + 25; // $25-60 range
      const revenue = Math.round(baseUnits * price * 100) / 100;

      daily_breakdown.push({
        date: date.toISOString().split('T')[0],
        units: baseUnits,
        revenue,
      });

      totalUnits += baseUnits;
      totalRevenue += revenue;
    }

    const { error } = await supabase
      .from('product_stats_cache')
      .upsert(
        {
          shop_id: shopId,
          product_id: productId,
          period,
          units_sold: totalUnits,
          revenue: Math.round(totalRevenue * 100) / 100,
          daily_breakdown,
          cached_at: new Date().toISOString(),
        },
        { onConflict: 'shop_id,product_id,period' }
      );

    if (error) {
      results[`stats_${period}`] = `error: ${error.message}`;
    } else {
      results[`stats_${period}`] = 'seeded';
    }
  }

  // --- Seed product_notes (skip if notes already exist) ---
  const { count: noteCount } = await supabase
    .from('product_notes')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('product_id', productId);

  if (noteCount && noteCount > 0) {
    results.notes = 'skipped (already exist)';
  } else {
    const sampleNotes = [
      {
        shop_id: shopId,
        product_id: productId,
        note_text: 'Ran a 15% off promo last week — saw a noticeable lift in daily orders. Consider repeating monthly.',
        tags: ['promo', 'pricing'],
        author: 'You',
      },
      {
        shop_id: shopId,
        product_id: productId,
        note_text: 'Updated product photos with lifestyle shots. A/B test showed 12% higher conversion rate.',
        tags: ['creative', 'optimization'],
        author: 'You',
      },
      {
        shop_id: shopId,
        product_id: productId,
        note_text: 'Supplier confirmed restock ETA is 2 weeks. Need to monitor inventory levels closely.',
        tags: ['inventory', 'supply-chain'],
        author: 'You',
      },
    ];

    const { error } = await supabase.from('product_notes').insert(sampleNotes);
    results.notes = error ? `error: ${error.message}` : 'seeded';
  }

  // --- Seed product_competitors (skip if competitors already exist) ---
  const { count: compCount } = await supabase
    .from('product_competitors')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('product_id', productId);

  if (compCount && compCount > 0) {
    results.competitors = 'skipped (already exist)';
  } else {
    const sampleCompetitors = [
      {
        shop_id: shopId,
        product_id: productId,
        name: 'CompetitorCo',
        url: 'https://competitor-example.com/similar-product',
        price: 42.99,
        last_checked: new Date().toISOString(),
      },
      {
        shop_id: shopId,
        product_id: productId,
        name: 'RivalBrand',
        url: 'https://rival-example.com/product',
        price: 38.50,
        last_checked: new Date().toISOString(),
      },
    ];

    const { error } = await supabase.from('product_competitors').insert(sampleCompetitors);
    results.competitors = error ? `error: ${error.message}` : 'seeded';
  }

  return NextResponse.json({ success: true, results });
}
