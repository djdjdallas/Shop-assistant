import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const shopId = resolveShopId(request);

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  if (!shopId) {
    return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_competitors')
    .select('*')
    .eq('shop_id', shopId)
    .eq('product_id', productId)
    .order('last_checked', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const shopId = resolveShopId(request, body);

  if (!shopId) {
    return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
  }

  if (!body?.productId || !body?.name || !body?.url || !body?.price) {
    return NextResponse.json({ error: 'productId, name, url, price are required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_competitors')
    .insert([
      {
        shop_id: shopId,
        product_id: body.productId,
        name: body.name,
        url: body.url,
        price: Number(body.price),
        last_checked: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
