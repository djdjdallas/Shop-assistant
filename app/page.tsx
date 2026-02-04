'use client';

import ProductAdminBlock from '../components/ProductAdminBlock';
import type { ProductContext } from '../types';

export default function Page() {
  const product = (window as unknown as { __PRODUCT_CONTEXT__?: ProductContext }).__PRODUCT_CONTEXT__;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-lg font-semibold text-gray-900">Product context not available</h1>
          <p className="text-sm text-gray-600">
            This UI expects Shopify App Bridge (or your Next.js page) to provide the current product context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-[520px]">
        <ProductAdminBlock product={product} />
      </div>
    </div>
  );
}
