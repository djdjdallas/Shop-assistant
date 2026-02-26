import { ArrowLeft, ArrowRight, RotateCw, Lock, Zap, X } from 'lucide-react';

export default function BrowserChrome() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col border-b border-[#e5e7eb] bg-[#f3f4f6] shrink-0">
      {/* Tab Bar */}
      <div className="flex items-center h-10 px-4 gap-4 bg-[#e5e7eb]/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex h-full items-end">
          <div className="h-8 px-4 flex items-center bg-white rounded-t-lg border-x border-t border-[#e5e7eb] shadow-sm">
            <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
              Sidekick Workspace
            </span>
            <X className="ml-4 w-2.5 h-2.5 text-gray-400" />
          </div>
          <div className="h-8 px-4 flex items-center text-gray-500 opacity-60">
            <span className="text-[11px] font-medium">Analytics Dashboard</span>
          </div>
        </div>
      </div>

      {/* Address Bar Row */}
      <div className="flex items-center gap-4 h-11 px-4 bg-white">
        <div className="flex items-center gap-3 text-gray-400">
          <ArrowLeft className="w-[18px] h-[18px]" />
          <ArrowRight className="w-[18px] h-[18px]" />
          <RotateCw className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 h-7 bg-[#f3f4f6] rounded flex items-center px-3 border border-[#e5e7eb]">
          <Lock className="w-3 h-3 text-green-600 mr-2" />
          <span className="font-mono text-xs text-gray-600">
            sidekick.dev/admin/product/workspace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-sm">
            <Zap className="w-[18px] h-[18px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" />
        </div>
      </div>
    </div>
  );
}
