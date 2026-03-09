'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseShopifyAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  getToken: () => Promise<string | null>;
  shopDomain: string | null;
  error: string | null;
}

/**
 * Hook for managing Shopify authentication in embedded apps.
 *
 * App Bridge 4.x passes the id_token as a URL parameter during navigation.
 * This hook reads the token from the URL first (most reliable), then falls
 * back to calling shopify.idToken() if available.
 */
export function useShopifyAuth(): UseShopifyAuthResult {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);

      // 1. Primary: read id_token from URL params (Shopify passes this in App Bridge 4.x)
      const urlToken = searchParams.get('id_token');
      if (urlToken) {
        console.log('[Auth] Using id_token from URL params');
        setSessionToken(urlToken);
        return urlToken;
      }

      // 2. Try App Bridge idToken() with a short timeout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appBridge = (window as unknown as { shopify?: any }).shopify;

      if (appBridge?.idToken) {
        const token = await Promise.race([
          appBridge.idToken(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);

        if (token) {
          console.log('[Auth] Got token from App Bridge idToken()');
          setSessionToken(token);
          return token;
        }
        console.warn('[Auth] App Bridge idToken() timed out, using fallback');
      }

      // 3. Fallback: set shop domain for shop-param based auth
      const shop = searchParams.get('shop');
      if (shop) {
        setShopDomain(shop);
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
