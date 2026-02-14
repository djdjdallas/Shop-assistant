import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { ProductStats } from '../types';
import { TrendingUp, DollarSign, Package, Download, CheckCircle, AlertCircle, AlertTriangle, Database, Loader2 } from 'lucide-react';

interface StatsCardProps {
  stats: ProductStats | null;
  loading: boolean;
  period: '30d' | '90d';
  inventory: number; // passed from product context
  onPeriodChange: (period: '30d' | '90d') => void;
  onSeed?: () => Promise<void>;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, loading, period, inventory, onPeriodChange, onSeed }) => {
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // --- Inventory Health Logic ---
  const inventoryHealth = useMemo(() => {
    if (!stats || stats.units_sold === 0) return null;
    
    // Calculate daily sales velocity over the period
    const daysInPeriod = period === '30d' ? 30 : 90;
    const velocity = stats.units_sold / daysInPeriod; 
    
    // Estimate days remaining
    const daysRemaining = Math.floor(inventory / velocity);
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (daysRemaining < 7) status = 'critical';
    else if (daysRemaining < 21) status = 'warning';

    return { daysRemaining, status, velocity };
  }, [stats, inventory, period]);

  // --- Forecasting Logic (Linear Regression) ---
  const chartData = useMemo(() => {
    if (!stats) return [];

    const data = stats.daily_breakdown.map((d, index) => ({
      ...d,
      index, // for regression calculation
      forecastRevenue: null as number | null // placeholder
    }));

    // Linear Regression: y = mx + b
    const n = data.length;
    const sumX = data.reduce((acc, val) => acc + val.index, 0);
    const sumY = data.reduce((acc, val) => acc + val.revenue, 0);
    const sumXY = data.reduce((acc, val) => acc + (val.index * val.revenue), 0);
    const sumXX = data.reduce((acc, val) => acc + (val.index * val.index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate 7 days of forecast
    const lastDate = new Date(data[data.length - 1].date);
    const forecastPoints = [];
    
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      
      const nextIndex = n - 1 + i;
      const forecastVal = slope * nextIndex + intercept;

      forecastPoints.push({
        date: nextDate.toISOString().split('T')[0],
        revenue: null,
        units: 0,
        index: nextIndex,
        forecastRevenue: Math.max(0, forecastVal) // Don't predict negative revenue
      });
    }

    // Connect the last actual point to the first forecast point
    const lastActual = data[data.length - 1];
    const connectedData = [
      ...data.slice(0, -1),
      { ...lastActual, forecastRevenue: lastActual.revenue }, // anchor point
      ...forecastPoints
    ];

    return connectedData;
  }, [stats]);


  const initiateExport = () => {
    setIsConfirmingExport(true);
  };

  const confirmExport = () => {
    if (!stats) return;
    const headers = ['Date', 'Units Sold', 'Revenue', 'Forecast Revenue'];
    const rows = chartData.map(day => [
      day.date,
      day.units?.toString() || '0',
      day.revenue?.toFixed(2) || '',
      day.forecastRevenue?.toFixed(2) || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_forecast_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsConfirmingExport(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
        <div className="text-gray-400 text-sm">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        {/* --- Header (same as populated state) --- */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            Performance & Forecast
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button onClick={() => onPeriodChange('30d')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${period === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>30 Days</button>
              <button onClick={() => onPeriodChange('90d')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${period === '90d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>90 Days</button>
            </div>
          </div>
        </div>
        {/* --- Empty State --- */}
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Package className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">No analytics data yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Sales data will appear here once orders come in, or seed demo data to preview the dashboard.
          </p>
          {onSeed && (
            <button
              onClick={async () => {
                setSeeding(true);
                try { await onSeed(); } finally { setSeeding(false); }
              }}
              disabled={seeding}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 relative overflow-hidden">
      
      {/* --- Overlays (Confirmation & Success) --- */}
      {isConfirmingExport && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-xl border border-gray-200 rounded-lg p-5 max-w-sm w-full animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-3 mb-3">
               <div className="bg-blue-100 p-2 rounded-full">
                 <AlertCircle className="w-5 h-5 text-blue-600" />
               </div>
               <h4 className="text-sm font-bold text-gray-900">Confirm Export</h4>
             </div>
             <p className="text-sm text-gray-600 mb-4">Export {period} data including 7-day forecast?</p>
             <div className="flex justify-end gap-2">
               <button onClick={() => setIsConfirmingExport(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
               <button onClick={confirmExport} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1"><Download className="w-3 h-3" /> Download</button>
             </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="absolute top-2 right-2 left-2 z-10 flex justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-top-2 fade-in duration-300">
            <CheckCircle className="w-4 h-4" /> CSV Exported
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          Performance & Forecast
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={initiateExport} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button onClick={() => onPeriodChange('30d')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${period === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>30 Days</button>
            <button onClick={() => onPeriodChange('90d')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${period === '90d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>90 Days</button>
          </div>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Revenue */}
        <div className="p-3 bg-green-50 rounded-md border border-green-100">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Revenue</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
        
        {/* Units Sold */}
        <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Package className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Units</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.units_sold}</span>
        </div>

        {/* Inventory Health */}
        {inventoryHealth && (
          <div className={`p-3 rounded-md border ${
            inventoryHealth.status === 'critical' ? 'bg-red-50 border-red-100' : 
            inventoryHealth.status === 'warning' ? 'bg-amber-50 border-amber-100' : 
            'bg-gray-50 border-gray-100'
          }`}>
            <div className={`flex items-center gap-2 mb-1 ${
               inventoryHealth.status === 'critical' ? 'text-red-700' : 
               inventoryHealth.status === 'warning' ? 'text-amber-700' : 'text-gray-600'
            }`}>
              {inventoryHealth.status === 'critical' ? <AlertTriangle className="w-4 h-4"/> : <Package className="w-4 h-4"/>}
              <span className="text-xs font-medium uppercase tracking-wide">Stock Days</span>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-gray-900">{inventoryHealth.daysRemaining}</span>
               <span className="text-[10px] text-gray-500">days left</span>
            </div>
          </div>
        )}
      </div>

      {/* --- Chart with Forecast --- */}
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            {/* Historical Data */}
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            {/* Forecast Line */}
            <Line 
              type="monotone" 
              dataKey="forecastRevenue" 
              name="Forecast"
              stroke="#9ca3af" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
           <span className="text-[10px] text-gray-500">Historical</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
           <span className="text-[10px] text-gray-500">7-Day Forecast</span>
         </div>
      </div>
    </div>
  );
};

export default StatsCard;