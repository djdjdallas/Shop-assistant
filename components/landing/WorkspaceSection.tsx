import {
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  User,
  MoveHorizontal,
} from 'lucide-react';

export default function WorkspaceSection() {
  return (
    <section className="h-[800px] flex border-b border-[#e5e7eb] bg-white overflow-hidden">
      {/* Left Sidebar: Explorer */}
      <div className="w-64 border-r border-[#e5e7eb] flex flex-col bg-[#f9fafb]">
        <div className="p-4 border-b border-[#e5e7eb]">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Workspace Explorer
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-custom">
          <div className="p-2">
            <div className="flex items-center gap-2 p-2 bg-cyan-50 text-cyan-700 rounded cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Product_Context.json</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Team_History.md</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs">Market_Intelligence.csv</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#e5e7eb] bg-white">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Shortcuts
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Add Note</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 border border-gray-200 rounded shadow-sm">
                ⌘N
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Forecast</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 border border-gray-200 rounded shadow-sm">
                ⌘F
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Stage: The Feature Showcase */}
      <div className="flex-1 relative flex flex-col">
        <div className="h-10 border-b border-[#e5e7eb] flex items-center px-4 bg-white">
          <div className="flex h-full items-center border-b-2 border-cyan-500 px-4">
            <span className="text-xs font-semibold text-gray-900">Feature_Preview.canvas</span>
          </div>
        </div>
        <div className="flex-1 relative p-12 bg-[#f3f4f6]">
          <div className="grid-bg opacity-20" />

          {/* Focused UI Element */}
          <div className="relative z-10 mx-auto max-w-2xl bg-white rounded-lg border-2 border-cyan-500 shadow-2xl p-8 transition-transform">
            {/* Dimension Labels */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] font-mono">
              W: 600px
            </div>
            <div className="absolute top-1/2 -right-10 -translate-y-1/2 bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] font-mono rotate-90">
              H: 400px
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold">Internal Product Notes</h3>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">
                  Live Link
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold">Sarah (Operations)</span>
                      <span className="text-[10px] text-gray-400 font-mono">14:22 PM</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Waiting for the summer drop restock. Marketing says we should hold off on
                      pricing changes until the sale starts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded border border-gray-100">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold">Inventory System</span>
                      <span className="text-[10px] text-gray-400 font-mono">09:10 AM</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      [Alert] Stock levels hit critical threshold (4 units remaining). Reorder
                      recommended based on 7-day velocity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a private note..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  readOnly
                />
                <button className="px-4 py-2 bg-cyan-500 text-white rounded text-xs font-semibold">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Property Inspector */}
      <div className="w-80 border-l border-[#e5e7eb] flex flex-col bg-white">
        <div className="p-4 border-b border-[#e5e7eb]">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Component Properties
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Layout Settings
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <label className="font-mono text-[10px] text-gray-400">POSITION</label>
                  <select className="text-[12px] border border-gray-200 rounded px-2 py-1 bg-[#f9fafb] focus:outline-none focus:border-cyan-500">
                    <option>Right Sidebar</option>
                    <option>Floating Left</option>
                    <option>Bottom Drawer</option>
                  </select>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <label className="font-mono text-[10px] text-gray-400">WIDTH</label>
                  <div className="flex items-center gap-2 group cursor-ew-resize">
                    <input
                      type="text"
                      defaultValue="420px"
                      className="w-full text-[12px] border border-gray-200 rounded px-2 py-1 bg-[#f9fafb] focus:outline-none focus:border-cyan-500"
                      readOnly
                    />
                    <MoveHorizontal className="w-4 h-4 text-gray-300 group-hover:text-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <label className="font-mono text-[10px] text-gray-400">THEME</label>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded border border-gray-300 bg-white ring-2 ring-cyan-500 ring-offset-2" />
                    <div className="w-5 h-5 rounded border border-gray-300 bg-slate-900 shadow-sm" />
                    <div className="w-5 h-5 rounded border border-gray-300 bg-gray-100 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Analytics Modules
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">7-Day Forecasting</span>
                  <div className="w-8 h-4 bg-cyan-500 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">Competitor Watch</span>
                  <div className="w-8 h-4 bg-cyan-500 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">Timeline History</span>
                  <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
