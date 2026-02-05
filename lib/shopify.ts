import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  LATEST_API_VERSION,
  Session,
  SessionParams,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import { getSupabaseServerClient } from './supabase-server';

// Custom Supabase session storage implementation
class SupabaseSessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('shops')
      .upsert({
        id: session.shop.replace('.myshopify.com', ''),
        shop_domain: session.shop,
        access_token: session.accessToken,
        scope: session.scope,
        installed_at: new Date().toISOString(),
      }, {
        onConflict: 'shop_domain',
      });

    if (error) {
      console.error('Error storing session:', error);
      return false;
    }

    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const supabase = getSupabaseServerClient();

    // The session ID format is typically "offline_{shop}" for offline tokens
    const shopDomain = id.replace('offline_', '');

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('shop_domain', shopDomain)
      .single();

    if (error || !data) {
      return undefined;
    }

    const sessionParams: SessionParams = {
      id: `offline_${data.shop_domain}`,
      shop: data.shop_domain,
      state: '',
      isOnline: false,
      accessToken: data.access_token || undefined,
      scope: data.scope || undefined,
    };

    return new Session(sessionParams);
  }

  async deleteSession(id: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    const shopDomain = id.replace('offline_', '');

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('shop_domain', shopDomain);

    return !error;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    for (const id of ids) {
      await this.deleteSession(id);
    }
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const session = await this.loadSession(`offline_${shop}`);
    return session ? [session] : [];
  }
}

// Lazy initialization of Shopify API to avoid build-time errors
let _shopify: ReturnType<typeof shopifyApi> | null = null;

function getShopifyApi() {
  if (_shopify) return _shopify;

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecretKey = process.env.SHOPIFY_API_SECRET;

  if (!apiKey || !apiSecretKey) {
    throw new Error(
      'Missing Shopify API credentials. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET environment variables.'
    );
  }

  _shopify = shopifyApi({
    apiKey,
    apiSecretKey,
    scopes: (process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,read_inventory').split(','),
    hostName: process.env.SHOPIFY_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000',
    hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
    isEmbeddedApp: true,
    apiVersion: LATEST_API_VERSION,
  });

  return _shopify;
}

// Export a proxy object that lazily initializes on first access
export const shopify = new Proxy({} as ReturnType<typeof shopifyApi>, {
  get(target, prop) {
    const api = getShopifyApi();
    return (api as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const sessionStorage = new SupabaseSessionStorage();

// Helper to get authenticated shop from session token
export async function getSessionFromToken(token: string): Promise<Session | null> {
  try {
    const api = getShopifyApi();
    const payload = await api.session.decodeSessionToken(token);
    const shopDomain = payload.dest.replace('https://', '');
    const session = await sessionStorage.loadSession(`offline_${shopDomain}`);
    return session || null;
  } catch (error) {
    console.error('Error decoding session token:', error);
    return null;
  }
}

// Get GraphQL client for a shop
export async function getShopifyClient(shop: string) {
  const api = getShopifyApi();
  const session = await sessionStorage.loadSession(`offline_${shop}`);

  if (!session?.accessToken) {
    throw new Error(`No access token found for shop: ${shop}`);
  }

  return new api.clients.Graphql({
    session,
  });
}

// Get REST client for a shop
export async function getShopifyRestClient(shop: string) {
  const api = getShopifyApi();
  const session = await sessionStorage.loadSession(`offline_${shop}`);

  if (!session?.accessToken) {
    throw new Error(`No access token found for shop: ${shop}`);
  }

  return new api.clients.Rest({
    session,
  });
}
