import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../../lib/supabase-server';

export async function DELETE(request: Request, { params }: { params: { competitorId: string } }) {
  const shopId = resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('product_competitors')
    .delete()
    .eq('shop_id', shopId)
    .eq('id', params.competitorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
