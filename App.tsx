import React from 'react';
import ProductAdminBlock from './components/ProductAdminBlock';
import { MOCK_PRODUCT } from './services/mockData';
import { ArrowLeft, ExternalLink, MoreHorizontal, ChevronDown } from 'lucide-react';

// This App component simulates the Shopify Admin environment
// The "ProductAdminBlock" is the actual extension we are building.

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f1f2f3] pb-20">
      
      {/* --- Simulated Shopify Admin Top Bar --- */}
      <div className="bg-[#1a1a1a] h-14 flex items-center px-4 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center text-white font-bold text-xs">Shop</div>
           <div className="bg-[#303030] text-gray-400 text-sm px-3 py-1.5 rounded w-96 flex items-center">
             Search
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold">JD</div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="max-w-[1100px] mx-auto pt-6 px-4">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-4 hover:text-gray-800 cursor-pointer w-fit">
          <ArrowLeft className="w-3 h-3" />
          <span>Products</span>
        </div>

        {/* Page Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{MOCK_PRODUCT.title}</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200 font-medium">
              {MOCK_PRODUCT.status}
            </span>
          </div>
          <div className="flex gap-2">
             <button className="text-gray-600 text-sm font-medium px-3 py-1.5 hover:bg-gray-200 rounded transition-colors flex items-center gap-1">
               Duplicate <ChevronDown className="w-3 h-3"/>
             </button>
             <button className="text-gray-600 text-sm font-medium px-3 py-1.5 hover:bg-gray-200 rounded transition-colors flex items-center gap-1">
               <ExternalLink className="w-3 h-3"/> Preview
             </button>
          </div>
        </div>

        {/* --- Two Column Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (Simulated Native Shopify Fields) */}
          <div className="lg:col-span-2 space-y-4 opacity-75 pointer-events-none select-none grayscale-[0.2]">
            {/* These are dummy cards to make it look like the admin */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64">
               <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
               <div className="h-32 bg-gray-100 rounded border border-gray-200"></div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-40">
               <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="h-10 bg-gray-100 rounded"></div>
                 <div className="h-10 bg-gray-100 rounded"></div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Where our Extension Lives) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* --- OUR EXTENSION --- */}
            <div className="border-2 border-dashed border-blue-400 rounded-lg p-1 bg-blue-50/30 relative">
               <div className="absolute -top-3 left-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                  App Block: Sidekick
               </div>
               
               {/* This is the actual App Component */}
               <div className="p-2">
                 <ProductAdminBlock product={MOCK_PRODUCT} />
               </div>
            </div>
            
            {/* Simulated Native Sidebar Item */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-60">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-800">Organization</span>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-100 rounded w-full"></div>
                <div className="h-8 bg-gray-100 rounded w-full"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default App;