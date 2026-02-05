import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types will be properly generated with `npx supabase gen types typescript`
// For now, using a simple record type that allows all table operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatabaseSchema = any;

let client: SupabaseClient<DatabaseSchema> | null = null;

export const getSupabaseServerClient = (): SupabaseClient<DatabaseSchema> => {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  client = createClient<DatabaseSchema>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });

  return client;
};

/**
 * @deprecated Use getAuthenticatedShop() from lib/session.ts instead.
 * This function trusts client-provided data which is a security vulnerability.
 * Only kept for backwards compatibility during migration.
 */
export const resolveShopId = (request: Request, body?: { shopId?: string }) => {
  // In development mode, allow fallback to legacy behavior
  if (process.env.NODE_ENV === 'development') {
    const headerShopId = request.headers.get('x-shop-id') || undefined;
    const url = new URL(request.url);
    const queryShopId = url.searchParams.get('shopId') || undefined;
    const fallbackShopId = process.env.DEFAULT_SHOP_ID;

    return body?.shopId || headerShopId || queryShopId || fallbackShopId || null;
  }

  // In production, this function should not be used
  console.warn('resolveShopId is deprecated. Use getAuthenticatedShop() instead.');
  return null;
};
