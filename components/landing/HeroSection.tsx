'use client';

import { ShoppingBag, MousePointer2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative px-20 pt-24 pb-16 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="lg:w-1/2 animate-slide-up">
          <div className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-700 font-mono text-[10px] font-bold rounded mb-6 border border-cyan-200 animate-pulse-cyan">
            v2.0 RELEASED
          </div>
          <h1 className="text-[64px] font-display font-semibold leading-[0.9] tracking-[0.04em] uppercase text-gray-900 mb-8">
            ADMIN
            <br />
            SIDEKICK
          </h1>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed mb-10">
            A productivity layer for Shopify. Manage notes, track competitor pricing, and forecast
            sales without leaving the product page.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-3 bg-[#06B6D4] hover:bg-[#0891b2] text-white px-8 py-4 rounded-md font-semibold transition-all shadow-lg active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>View on Shopify App Store</span>
            </a>
            <div className="flex items-center gap-2 px-6 py-4 text-gray-600 font-medium cursor-help hover:text-cyan-600 transition-colors">
              <span className="font-mono text-xs">[⌘+K] for Quick Demo</span>
            </div>
          </div>
        </div>

        {/* Simulated UI Window */}
        <div className="lg:w-1/2 relative">
          <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xl p-1 relative overflow-hidden group">
            <div className="bg-[#f9fafb] border-b border-[#e5e7eb] p-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  Inspector Workspace
                </span>
              </div>
              <div className="font-mono text-[10px] text-gray-400">1280x800px</div>
            </div>

            <div className="p-6 min-h-[400px] relative">
              {/* Mock Shopify Product Page Content */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-100 rounded w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-gray-50 border border-dashed border-gray-200 rounded" />
                  <div className="h-32 bg-gray-50 border border-dashed border-gray-200 rounded" />
                  <div className="h-32 bg-gray-50 border border-dashed border-gray-200 rounded" />
                </div>
                <div className="h-24 bg-gray-100 rounded" />
              </div>

              {/* Floating Inspector Tooltip */}
              <div className="absolute top-[120px] left-[200px] bg-[#111827] text-white p-4 rounded shadow-xl border border-cyan-500/30 z-10 w-64 animate-slide-up">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-cyan-400">.sidekick-panel</span>
                  <span className="font-mono text-[10px] text-gray-500">240x180</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-gray-400">visibility:</span>
                    <span className="font-mono text-[11px] text-cyan-300">active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-gray-400">revenue_forecast:</span>
                    <span className="font-mono text-[11px] text-cyan-300">$12,400.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-gray-400">context_sync:</span>
                    <span className="font-mono text-[11px] text-green-400">synced</span>
                  </div>
                </div>
              </div>

              {/* Simulated Cursor */}
              <div className="absolute w-6 h-6 pointer-events-none z-20 animate-cursor-move">
                <MousePointer2 className="w-6 h-6 text-cyan-500 drop-shadow-md -rotate-90" />
                <div className="absolute top-full left-full mt-1 ml-1 bg-cyan-500 text-white px-1 py-0.5 rounded font-mono text-[8px]">
                  admin_user
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
