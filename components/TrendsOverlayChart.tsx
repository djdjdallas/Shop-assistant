import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface TrendsOverlayChartProps {
  salesData: { date: string; units: number }[];
  trendsData: { date: string; index: number }[];
  correlation: number;
  lag: number;
}

const TrendsOverlayChart: React.FC<TrendsOverlayChartProps> = ({
  salesData,
  trendsData,
  correlation,
  lag,
}) => {
  const merged = salesData.map(point => {
    const trendPoint = trendsData.find(item => item.date === point.date);
    return {
      date: point.date,
      units: point.units,
      index: trendPoint?.index ?? 0,
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Sales vs Trends</h3>
        <p className="text-xs text-gray-500">Correlation {correlation.toFixed(2)} | Lag {lag} weeks</p>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={merged}>
            <XAxis dataKey="date" hide />
            <YAxis yAxisId="left" hide />
            <YAxis yAxisId="right" orientation="right" hide />
            <Tooltip />
            <Bar yAxisId="left" dataKey="units" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="index"
              stroke="#111827"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsOverlayChart;
