import { createClient } from '@supabase/supabase-js';

type SupabaseServerClient = ReturnType<typeof createClient>;

let client: SupabaseServerClient | null = null;

export const getSupabaseServerClient = (): SupabaseServerClient => {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });

  return client;
};

export const resolveShopId = (request: Request, body?: { shopId?: string }) => {
  const headerShopId = request.headers.get('x-shop-id') || undefined;
  const url = new URL(request.url);
  const queryShopId = url.searchParams.get('shopId') || undefined;
  const fallbackShopId = process.env.DEFAULT_SHOP_ID;

  return body?.shopId || headerShopId || queryShopId || fallbackShopId || null;
};
