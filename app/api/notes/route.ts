import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const shopId = resolveShopId(request) ;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  if (!shopId) {
    return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_notes')
    .select('*')
    .eq('shop_id', shopId)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

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

  if (!body?.productId || !body?.noteText) {
    return NextResponse.json({ error: 'productId and noteText are required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_notes')
    .insert([
      {
        shop_id: shopId,
        product_id: body.productId,
        note_text: body.noteText,
        tags: body.tags ?? [],
        author: body.author ?? 'You',
      },
    ])
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
