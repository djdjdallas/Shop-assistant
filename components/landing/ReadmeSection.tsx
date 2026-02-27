import { FileCode, Copy } from 'lucide-react';

export default function ReadmeSection() {
  return (
    <section className="bg-[#0d1117] py-24 px-20">
      <div className="max-w-4xl mx-auto border border-[#30363d] rounded-lg overflow-hidden">
        <div className="bg-[#161b22] border-b border-[#30363d] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-xs text-gray-300 font-medium">README.md</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-gray-500">7.2kb</span>
            <Copy className="w-4 h-4 text-gray-500 hover:text-cyan-400 cursor-pointer" />
          </div>
        </div>
        <div className="p-10 space-y-6">
          <h2 className="text-2xl font-bold text-white">
            # The Merchants Productivity Manifesto
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Operating a high-volume Shopify store shouldn&apos;t feel like a browser tab marathon. We
            believe internal context belongs where the data lives--not in a separate Slack channel or
            buried in a generic spreadsheet.
          </p>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">## Design Principles</h3>
            <ul className="list-none space-y-2">
              <li className="flex gap-3 text-gray-400">
                <span className="text-cyan-500">-</span>
                <span>Zero-context-switch architecture</span>
              </li>
              <li className="flex gap-3 text-gray-400">
                <span className="text-cyan-500">-</span>
                <span>Deterministic forecasting based on real velocity</span>
              </li>
              <li className="flex gap-3 text-gray-400">
                <span className="text-cyan-500">-</span>
                <span>Utilitarian UI that respects screen real estate</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <div className="bg-[#010409] border border-[#30363d] p-4 rounded-md font-mono">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">1.</span>
                <span className="text-gray-300">
                  Install from the Shopify App Store
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">2.</span>
                <span className="text-gray-300">
                  Approve OAuth permissions for your store
                </span>
              </div>
              <div className="text-gray-500 italic">
                // Sidekick appears on every product page automatically
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
