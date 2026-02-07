import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { executeGraphQL } from '../../../../lib/shopify-graphql';
import { GET_PRODUCT, GetProductResponse } from '../../../../lib/queries/products';

/**
 * GET: Fetch a single product from the Shopify Admin API.
 * Returns product details formatted as a ProductContext.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authenticatedShop = await getAuthenticatedShop(request);

  if (!authenticatedShop) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  // Ensure the ID is in Shopify's GID format
  const gid = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;

  try {
    const data = await executeGraphQL<GetProductResponse>(
      authenticatedShop.shopDomain,
      GET_PRODUCT,
      { id: gid }
    );

    if (!data.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = data.product;
    const price =
      product.priceRangeV2?.minVariantPrice?.amount ||
      product.variants?.edges[0]?.node?.price ||
      '0.00';

    const statusMap: Record<string, string> = {
      ACTIVE: 'Active',
      DRAFT: 'Draft',
      ARCHIVED: 'Archived',
    };

    return NextResponse.json({
      id: product.id,
      title: product.title,
      image: product.featuredImage?.url || '',
      status: statusMap[product.status] || 'Active',
      inventory: product.totalInventory ?? 0,
      price,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
