import { getSupabaseServerClient } from './supabase-server';

export interface AuthenticatedShop {
  id: string;
  shopDomain: string;
  accessToken: string;
}

/**
 * Get the authenticated shop from the session token.
 * This is the secure way to identify the shop - it validates the JWT token
 * from App Bridge instead of trusting client-provided data.
 */
export async function getAuthenticatedShop(
  request: Request
): Promise<AuthenticatedShop | null> {
  // Try to get session token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const sessionToken = authHeader?.replace('Bearer ', '');

  if (sessionToken) {
    try {
      // Dynamically import to avoid build-time initialization
      const { getSessionFromToken } = await import('./shopify');
      const session = await getSessionFromToken(sessionToken);
      if (session?.accessToken) {
        const supabase = getSupabaseServerClient();
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('shop_domain', session.shop)
          .single();

        return {
          id: shop?.id || session.shop.replace('.myshopify.com', ''),
          shopDomain: session.shop,
          accessToken: session.accessToken,
        };
      }
    } catch (error) {
      console.error('Error validating session token:', error);
    }
  }

  // Fallback for development: check for shop in query params or headers
  // This should only be used in development mode
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') ||
      request.headers.get('x-shop-domain');

    if (shopDomain) {
      try {
        const { sessionStorage } = await import('./shopify');
        const session = await sessionStorage.loadSession(`offline_${shopDomain}`);
        if (session?.accessToken) {
          const supabase = getSupabaseServerClient();
          const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('shop_domain', shopDomain)
            .single();

          return {
            id: shop?.id || shopDomain.replace('.myshopify.com', ''),
            shopDomain,
            accessToken: session.accessToken,
          };
        }
      } catch (error) {
        // Shopify API not configured, continue with fallback
      }
    }

    // Ultimate fallback for local development without Shopify
    const fallbackShopId = process.env.DEFAULT_SHOP_ID;
    if (fallbackShopId) {
      return {
        id: fallbackShopId,
        shopDomain: 'dev-store.myshopify.com',
        accessToken: 'dev-token',
      };
    }
  }

  return null;
}

/**
 * Verify that a session token is valid and belongs to the expected shop.
 */
export async function verifySessionToken(token: string): Promise<{
  valid: boolean;
  shop?: string;
  error?: string;
}> {
  try {
    const { shopify, sessionStorage } = await import('./shopify');
    const payload = await shopify.session.decodeSessionToken(token);
    const shopDomain = payload.dest.replace('https://', '');

    // Verify the shop has an active session
    const session = await sessionStorage.loadSession(`offline_${shopDomain}`);
    if (!session?.accessToken) {
      return { valid: false, error: 'No active session for shop' };
    }

    return { valid: true, shop: shopDomain };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Get shop ID from shop domain.
 * Uses the shops table to look up the internal ID.
 */
export async function getShopId(shopDomain: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .eq('shop_domain', shopDomain)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Check if a shop is installed (has valid access token).
 */
export async function isShopInstalled(shopDomain: string): Promise<boolean> {
  try {
    const { sessionStorage } = await import('./shopify');
    const session = await sessionStorage.loadSession(`offline_${shopDomain}`);
    return !!session?.accessToken;
  } catch {
    return false;
  }
}
