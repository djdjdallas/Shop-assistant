import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../lib/supabase-server';
import { getAuthenticatedShop } from '../../../lib/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');

  // Try authenticated shop first, fall back to legacy method in dev
  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  // Try authenticated shop first, fall back to legacy method in dev
  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request, body);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function PUT(request: Request) {
  const body = await request.json();

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request, body);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!body?.noteId || !body?.noteText) {
    return NextResponse.json({ error: 'noteId and noteText are required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_notes')
    .update({
      note_text: body.noteText,
      tags: body.tags ?? [],
    })
    .eq('id', body.noteId)
    .eq('shop_id', shopId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const noteId = url.searchParams.get('noteId');

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!noteId) {
    return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('product_notes')
    .delete()
    .eq('id', noteId)
    .eq('shop_id', shopId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
