'use client';

import { useState, useEffect } from 'react';
import ProductAdminBlock from '../../components/ProductAdminBlock';
import { useShopifyAuth } from '../hooks/useShopifyAuth';
import { setSessionTokenGetter } from '../../services/api';
import type { ProductContext } from '../../types';

// Demo product for development/testing
const DEMO_PRODUCT: ProductContext = {
  id: 'gid://shopify/Product/123456789',
  title: 'Classic Leather Weekend Bag',
  image: 'https://picsum.photos/400/400',
  status: 'Active',
  inventory: 12,
  price: '129.00',
};

export default function Page() {
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { getToken, isLoading: authLoading } = useShopifyAuth();

  // Diagnostic: log App Bridge state on mount (with delay for script loading)
  useEffect(() => {
    const checkBridge = () => {
      const meta = document.querySelector('meta[name="shopify-api-key"]');
      const apiKey = meta?.getAttribute('content') || '(empty)';
      const params = new URLSearchParams(window.location.search);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = (window as unknown as { shopify?: any }).shopify;
      const inIframe = window.self !== window.top;
      const info = [
        `API Key: ${apiKey.substring(0, 8)}...${apiKey.length > 8 ? apiKey.substring(apiKey.length - 4) : ''}`,
        `shop: ${params.get('shop') || '(none)'}`,
        `host: ${params.get('host') ? 'present' : '(none)'}`,
        `iframe: ${inIframe ? 'yes' : 'no'}`,
        `App Bridge: ${sb ? 'loaded' : 'missing'}`,
        `config: ${sb?.config ? 'yes' : 'no'}`,
        `idToken: ${sb?.idToken ? 'available' : 'missing'}`,
        `resourcePicker: ${sb?.resourcePicker ? 'available' : 'missing'}`,
      ].join(' | ');
      console.log('[Sidekick Debug]', info);
      if (!inIframe) {
        console.warn('[Sidekick] App is NOT in an iframe. App Bridge requires the app to be loaded inside the Shopify Admin.');
      }
      setDebugInfo(info);
    };
    // Delay slightly to let App Bridge script finish initializing
    const timer = setTimeout(checkBridge, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchProduct = async (productId: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build URL — include shop param as fallback auth when idToken is unavailable
      let url = `/api/products/${encodeURIComponent(productId)}`;
      if (!token) {
        const params = new URLSearchParams(window.location.search);
        const shop = params.get('shop');
        if (shop) {
          url += `?shop=${encodeURIComponent(shop)}`;
        }
      }

      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        console.error('Product fetch failed:', response.status, await response.text().catch(() => ''));
        setProduct({
          id: productId,
          title: 'Unknown Product',
          image: '',
          status: 'Active',
          inventory: 0,
          price: '0.00',
        });
      }
    } catch (err) {
      console.error('Product fetch error:', err);
      setProduct({
        id: productId,
        title: 'Unknown Product',
        image: '',
        status: 'Active',
        inventory: 0,
        price: '0.00',
      });
    }
  };

  const openProductPicker = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appBridge = (window as unknown as { shopify?: any }).shopify;

    if (!appBridge) {
      alert('Shopify App Bridge is not available. Make sure you are viewing this app inside the Shopify admin.');
      return;
    }

    if (window.self === window.top) {
      alert('This app must be opened from the Shopify Admin to use the product picker. Go to your Shopify Admin → Apps → Sidekick.');
      return;
    }

    setIsPickerLoading(true);
    try {
      if (appBridge.resourcePicker) {
        // Ensure App Bridge has an active session before opening the picker.
        // Now that App Bridge is properly configured, idToken() should resolve.
        if (appBridge.idToken) {
          try {
            const bridgeToken = await Promise.race([
              appBridge.idToken(),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
            ]);
            console.log('[Picker] App Bridge idToken():', bridgeToken ? 'success' : 'timed out');
          } catch (err) {
            console.warn('[Picker] App Bridge idToken() error:', err);
          }
        }

        // Open the resource picker — give the user 30s to interact with it
        const selected = await Promise.race([
          appBridge.resourcePicker({ type: 'product', multiple: false }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 30000)),
        ]);

        if (selected && Array.isArray(selected) && selected.length > 0) {
          const selectedId = selected[0].id;
          await fetchProduct(selectedId);
        } else if (selected === null) {
          console.warn('Resource picker timed out');
          alert(
            'Product picker timed out. This usually means App Bridge cannot connect to the Shopify Admin.\n\n' +
            'Try: 1) Reload the app from Shopify Admin sidebar\n' +
            '2) Verify the app API key matches your Shopify Partners client_id\n' +
            '3) Use the manual product ID field below as a workaround'
          );
        }
        // If selected is empty array, user cancelled — do nothing
      } else {
        alert('Resource picker not available. Try reloading the page.');
      }
    } catch (err) {
      console.error('Resource picker error:', err);
      alert('Error opening product picker: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsPickerLoading(false);
    }
  };

  useEffect(() => {
    // Set up the session token getter for API calls
    setSessionTokenGetter(getToken);
  }, [getToken]);

  // Automatically exchange the id_token for a server-side access token.
  // This replaces the traditional OAuth redirect flow for embedded apps.
  // Runs immediately on mount — no dependencies needed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get('id_token');
    if (!idToken) {
      console.log('[Auth] No id_token in URL, skipping token exchange');
      return;
    }

    console.log('[Auth] Starting token exchange...');

    fetch('/api/auth/token-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log('[Auth] Token exchange successful for:', data.shop);
        } else {
          console.warn('[Auth] Token exchange failed:', data.error, data.detail);
        }
      })
      .catch((err) => {
        console.error('[Auth] Token exchange request failed:', err);
      });
  }, []);

  useEffect(() => {
    // Check for product context from various sources
    const initProduct = async () => {
      // 1. Check window.__PRODUCT_CONTEXT__ (legacy)
      const windowProduct = (window as unknown as { __PRODUCT_CONTEXT__?: ProductContext }).__PRODUCT_CONTEXT__;
      if (windowProduct) {
        setProduct(windowProduct);
        setIsLoading(false);
        return;
      }

      // 2. Check URL params for product ID (embedded app context)
      const searchParams = new URLSearchParams(window.location.search);
      const productId = searchParams.get('id') || searchParams.get('productId');

      if (productId) {
        await fetchProduct(productId);
        setIsLoading(false);
        return;
      }

      // 3. Use demo product in development mode
      if (process.env.NODE_ENV === 'development') {
        setProduct(DEMO_PRODUCT);
      }

      setIsLoading(false);
    };

    if (!authLoading) {
      initProduct();
    }
  }, [authLoading, getToken]);

  // Safety timeout: if still loading after 10s, force past the spinner
  // so the user can at least interact with the product picker.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading || authLoading) {
        console.warn('Dashboard loading timed out after 10s, forcing past spinner');
        setIsLoading(false);
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isLoading, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">No Product Selected</h1>
          <p className="text-sm text-gray-600">
            Select a product to view details, manage notes, track competitors, and forecast sales.
          </p>
          <button
            onClick={openProductPicker}
            disabled={isPickerLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isPickerLoading ? 'Loading...' : 'Select a Product'}
          </button>

          {/* Fallback: manual product ID entry */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">Or enter a product ID manually:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('productId') as HTMLInputElement;
                const val = input?.value.trim();
                if (val) {
                  const gid = val.startsWith('gid://') ? val : `gid://shopify/Product/${val}`;
                  fetchProduct(gid);
                }
              }}
              className="flex gap-2"
            >
              <input
                name="productId"
                type="text"
                placeholder="e.g. 7982340091"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                Load
              </button>
            </form>
          </div>

          {/* Debug info */}
          {debugInfo && (
            <p className="text-[10px] text-gray-300 break-all mt-4">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[520px] mx-auto">
        <ProductAdminBlock product={product} />
      </div>
    </div>
  );
}
