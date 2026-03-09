'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseShopifyAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  getToken: () => Promise<string | null>;
  shopDomain: string | null;
  error: string | null;
}

/**
 * Wait for App Bridge to be fully connected to the Shopify Admin parent frame.
 * In App Bridge 4.x, window.shopify exists once the script loads, but idToken()
 * will hang until the bridge has established its postMessage connection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function waitForAppBridge(timeoutMs = 5000): Promise<any | null> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (window as unknown as { shopify?: any }).shopify;
    if (sb?.idToken) {
      // Test if the bridge is actually connected by checking for config/environment
      // App Bridge 4.x sets shopify.config when fully initialized
      if (sb.config || sb.environment) {
        return sb;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  // Return whatever we have even if config isn't set — idToken may still work
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as unknown as { shopify?: any }).shopify ?? null;
}

/**
 * Hook for managing Shopify authentication in embedded apps.
 *
 * In App Bridge 4.x, session tokens are managed differently.
 * This hook provides a simplified interface for authentication state
 * and can be extended to integrate with App Bridge when needed.
 */
export function useShopifyAuth(): UseShopifyAuthResult {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const appBridge = await waitForAppBridge(5000);

      if (appBridge?.idToken) {
        // Attempt idToken with 5s timeout; retry once on timeout
        for (let attempt = 0; attempt < 2; attempt++) {
          const token = await Promise.race([
            appBridge.idToken(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
          ]);

          if (token) {
            retryCount.current = 0;
            setSessionToken(token);
            return token;
          }

          if (attempt === 0) {
            console.warn('App Bridge idToken() timed out, retrying...');
            // Brief pause before retry
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        console.warn(
          'App Bridge idToken() timed out after retries. ' +
          'Verify NEXT_PUBLIC_SHOPIFY_API_KEY matches your app client_id in Shopify Partners, ' +
          'and that the app is loaded inside the Shopify Admin.'
        );
      }

      // Fallback: check URL params for embedded context
      const searchParams = new URLSearchParams(window.location.search);
      const host = searchParams.get('host');
      const shop = searchParams.get('shop');

      if (host && shop) {
        // We're in an embedded context but App Bridge isn't connected
        setShopDomain(shop);
        return null;
      }

      return null;
    } catch (err) {
      console.warn('Failed to get session token:', err);
      setError(err instanceof Error ? err.message : 'Failed to get token');
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get shop domain from URL
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const shop = searchParams.get('shop');
          if (shop) {
            setShopDomain(shop);
          }
        }

        await getToken();
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [getToken]);

  return {
    isAuthenticated: !!sessionToken || !!shopDomain,
    isLoading,
    sessionToken,
    shopDomain,
    getToken,
    error,
  };
}

/**
 * Get the current shop domain from the URL.
 */
export function useShopDomain(): string | null {
  const [shopDomain, setShopDomain] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const shop = searchParams.get('shop');

    if (shop) {
      setShopDomain(shop);
    }
  }, []);

  return shopDomain;
}

/**
 * Create an authenticated fetch function.
 * Uses the session token from App Bridge when available.
 */
export function useAuthenticatedFetch() {
  const { getToken } = useShopifyAuth();

  return useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, [getToken]);
}
