import React from 'react';

export interface ForecastSummary {
  id: string;
  productTitle: string;
  trendDirection: 'rising' | 'stable' | 'falling';
  action: string;
}

interface ForecastDashboardProps {
  items: ForecastSummary[];
}

const ForecastDashboard: React.FC<ForecastDashboardProps> = ({ items }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Forecast Overview</h3>
        <input
          className="text-xs border border-gray-200 rounded px-2 py-1"
          placeholder="Search products"
        />
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400">No forecast data available yet.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded p-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.productTitle}</p>
                <p className="text-xs text-gray-500">Trend: {item.trendDirection}</p>
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ForecastDashboard;
