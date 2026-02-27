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
  const { getToken, isLoading: authLoading } = useShopifyAuth();

  const fetchProduct = async (productId: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setProduct({
          id: productId,
          title: 'Unknown Product',
          image: '',
          status: 'Active',
          inventory: 0,
          price: '0.00',
        });
      }
    } catch {
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
    console.log('App Bridge available:', !!appBridge);
    console.log('App Bridge keys:', appBridge ? Object.keys(appBridge) : 'none');

    if (!appBridge) {
      alert('Shopify App Bridge is not available. Make sure you are viewing this app inside the Shopify admin.');
      return;
    }

    setIsPickerLoading(true);
    try {
      if (appBridge.resourcePicker) {
        const selected = await appBridge.resourcePicker({ type: 'product', multiple: false });
        if (selected && selected.length > 0) {
          const selectedId = selected[0].id;
          await fetchProduct(selectedId);
        }
      } else {
        console.log('resourcePicker not available, available methods:', Object.keys(appBridge));
        alert('Resource picker not available. App Bridge methods: ' + Object.keys(appBridge).join(', '));
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
