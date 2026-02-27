export default function ChangelogSection() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="px-20 py-16 border-y border-[#e5e7eb] bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="w-[300px] border-r border-[#e5e7eb] pr-8">
          <div className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Changelog
          </div>
          <div className="text-[10px] font-mono text-gray-400 uppercase">Updated {today}</div>
        </div>
        <div className="flex-1 pl-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Product Notes Timeline</span>
                <p>
                  Tag-based notes timeline attached to each product. Filter by tag, track decisions, and review history — all from the product admin page.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Inventory Health Alerts</span>
                <p>
                  Visual status indicators flagging low-stock risk based on 7-day velocity.
                </p>
              </div>
            </li>
          </ul>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Competitor Price Tracking</span>
                <p>
                  Manual competitor entry with name, URL, and price. Automatic undercut alerts when a competitor&apos;s price drops below yours.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">AI-Powered Insights Engine</span>
                <p>
                  Auto-generated insights for low stock, revenue trends, sales spikes, and competitor undercuts — surfaced directly in your notes timeline.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
