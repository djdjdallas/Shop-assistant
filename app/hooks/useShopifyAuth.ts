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
 * In App Bridge 4.x, session tokens are managed differently.
 * This hook provides a simplified interface for authentication state
 * and can be extended to integrate with App Bridge when needed.
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
      // Check if App Bridge is available (loaded by Shopify admin)
      const appBridge = (window as unknown as { shopify?: { idToken?: () => Promise<string> } }).shopify;

      if (appBridge?.idToken) {
        const token = await appBridge.idToken();
        setSessionToken(token);
        return token;
      }

      // Fallback: check URL params for embedded context
      const searchParams = new URLSearchParams(window.location.search);
      const host = searchParams.get('host');
      const shop = searchParams.get('shop');

      if (host && shop) {
        // We're in an embedded context but App Bridge isn't loaded yet
        // The token will be available after App Bridge initializes
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
