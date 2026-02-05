import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { syncShopifyProducts } from '../../../../lib/jobs/sync-products';

export async function POST(request: Request) {
  const authenticatedShop = await getAuthenticatedShop(request);

  if (!authenticatedShop) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncShopifyProducts(
      authenticatedShop.shopDomain,
      authenticatedShop.id
    );

    if (result.errors.length > 0) {
      return NextResponse.json({
        success: false,
        synced: result.synced,
        errors: result.errors,
      }, { status: 207 }); // Partial success
    }

    return NextResponse.json({
      success: true,
      synced: result.synced,
      created: result.created,
      updated: result.updated,
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
