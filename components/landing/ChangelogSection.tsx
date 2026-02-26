export default function ChangelogSection() {
  return (
    <section className="px-20 py-16 border-y border-[#e5e7eb] bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="w-[300px] border-r border-[#e5e7eb] pr-8">
          <div className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Changelog
          </div>
          <div className="text-[10px] font-mono text-gray-400 uppercase">Updated 2024-05-12</div>
        </div>
        <div className="flex-1 pl-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Team Timeline v2</span>
                <p>
                  Real-time collaboration with @mention support directly in the product admin page.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Inventory Health Alerts</span>
                <p>
                  Visual status indicators flagging low-stock risk based on current 7-day velocity.
                </p>
              </div>
            </li>
          </ul>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Price Guard Tracking</span>
                <p>
                  Automatic competitor price scraping (manual entry fallback) with delta analysis.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-500 font-mono font-bold">+</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-900 font-semibold">Headless Admin Panel</span>
                <p>
                  Toggle-able floating side panel that stays visible while you scroll complex
                  listings.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
