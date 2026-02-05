import { NextResponse } from 'next/server';
import { getSupabaseServerClient, resolveShopId } from '../../../../lib/supabase-server';
import { getAuthenticatedShop } from '../../../../lib/session';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ competitorId: string }> }
) {
  const { competitorId } = await params;

  // Try authenticated shop first, fall back to legacy method in dev
  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('product_competitors')
    .delete()
    .eq('shop_id', shopId)
    .eq('id', competitorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
