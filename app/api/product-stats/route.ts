import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../lib/supabase-server';
import { getAuthenticatedShop } from '../../../lib/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const period = url.searchParams.get('period');

  // Try authenticated shop first, fall back to legacy method in dev
  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!productId || !period) {
    return NextResponse.json({ error: 'productId and period are required' }, { status: 400 });
  }

  if (period !== '30d' && period !== '90d') {
    return NextResponse.json({ error: 'period must be 30d or 90d' }, { status: 400 });
  }

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_stats_cache')
    .select('*')
    .eq('shop_id', shopId)
    .eq('product_id', productId)
    .eq('period', period)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
