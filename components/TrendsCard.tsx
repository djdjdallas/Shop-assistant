import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, X, Search, Loader2 } from 'lucide-react';
import { fetchTrendMappings, addTrendMapping, removeTrendMapping, fetchTrendsData, TrendMapping } from '../services/api';

interface TrendsDataPoint {
  date: string;
  interest: number;
}

interface TrendsCardProps {
  productId: string;
  productTitle: string;
}

const TrendsCard: React.FC<TrendsCardProps> = ({ productId, productTitle }) => {
  const [mappings, setMappings] = useState<TrendMapping[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsDataPoint[]>([]);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing mappings
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchTrendMappings(productId)
      .then((data) => {
        if (isMounted) {
          setMappings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMappings([]);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [productId]);

  // Fetch trends data when mappings change
  useEffect(() => {
    if (mappings.length === 0) {
      setTrendsData([]);
      return;
    }

    let isMounted = true;
    setFetchingData(true);

    // Fetch data for the first mapping's query
    const firstMapping = mappings[0];
    if (!firstMapping.google_trends_queries) {
      setFetchingData(false);
      return;
    }

    fetchTrendsData(firstMapping.trends_query_id, firstMapping.google_trends_queries.query)
      .then((result) => {
        if (isMounted && result.success) {
          // If we got dataPoints, fetch the timeseries data
          // For now, use the result metadata to show something
          setTrendsData([]);
          setFetchingData(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchingData(false);
        }
      });

    return () => { isMounted = false; };
  }, [mappings]);

  const handleAddQuery = useCallback(async () => {
    const trimmed = queryInput.trim();
    if (!trimmed) return;

    setAdding(true);
    setError(null);
    try {
      const newMapping = await addTrendMapping(productId, trimmed);
      setMappings(prev => [...prev, newMapping]);
      setQueryInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add query');
    } finally {
      setAdding(false);
    }
  }, [queryInput, productId]);

  const handleRemoveMapping = useCallback(async (mappingId: string) => {
    try {
      await removeTrendMapping(mappingId);
      setMappings(prev => prev.filter(m => m.id !== mappingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove query');
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddQuery();
    }
  };

  // Suggest the product title as initial query
  const suggestedQuery = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading trends...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Market Trends
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={suggestedQuery ? `e.g. "${suggestedQuery}"` : 'Search query...'}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={adding}
            />
          </div>
          <button
            onClick={handleAddQuery}
            disabled={!queryInput.trim() || adding}
            className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 flex items-center gap-1 transition-colors"
          >
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Track
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Active Queries as Chips */}
        {mappings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mappings.map((mapping) => (
              <span
                key={mapping.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs border border-indigo-100"
              >
                {mapping.google_trends_queries?.query || 'Unknown'}
                <button
                  onClick={() => handleRemoveMapping(mapping.id)}
                  className="hover:text-indigo-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Chart or Empty State */}
        {mappings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">Track market trends</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Add a search query above to see how interest in your product category is trending on Google.
            </p>
          </div>
        ) : (
          <div>
            {fetchingData ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            ) : trendsData.length > 0 ? (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      formatter={(value) => [`${value}`, 'Interest']}
                    />
                    <Line
                      type="monotone"
                      dataKey="interest"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] text-gray-500">Search Interest (0-100)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-center">
                <div>
                  <p className="text-xs text-gray-500">Trends data is being fetched.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Data may take a moment to populate from Google Trends.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsCard;
