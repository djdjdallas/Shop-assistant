import React, { useMemo, useState } from 'react';

export interface TrendsMapping {
  id?: string;
  query: string;
  weight: number;
}

export interface ProductTrendsMapperProps {
  productTitle: string;
  tags: string[];
  mappings: TrendsMapping[];
  suggestedQueries: string[];
  onSave: (mappings: TrendsMapping[]) => void;
}

const ProductTrendsMapper: React.FC<ProductTrendsMapperProps> = ({
  productTitle,
  tags,
  mappings,
  suggestedQueries,
  onSave,
}) => {
  const [localMappings, setLocalMappings] = useState<TrendsMapping[]>(mappings);
  const [queryInput, setQueryInput] = useState('');

  const maxReached = localMappings.length >= 3;

  const suggested = useMemo(() => {
    const existing = new Set(localMappings.map(item => item.query.toLowerCase()));
    return suggestedQueries.filter(query => !existing.has(query.toLowerCase()));
  }, [localMappings, suggestedQueries]);

  const addMapping = (query: string) => {
    if (!query.trim() || maxReached) return;
    setLocalMappings(prev => [...prev, { query: query.trim(), weight: 1 }]);
    setQueryInput('');
  };

  const updateWeight = (index: number, weight: number) => {
    setLocalMappings(prev => prev.map((item, idx) => (idx === index ? { ...item, weight } : item)));
  };

  const removeMapping = (index: number) => {
    setLocalMappings(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Product Trends Mapping</h3>
        <p className="text-xs text-gray-500">{productTitle}</p>
        {tags.length > 0 && (
          <p className="text-xs text-gray-400">Tags: {tags.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Search trends</label>
        <div className="flex gap-2">
          <input
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5"
            placeholder="Search Google Trends queries"
            value={queryInput}
            onChange={event => setQueryInput(event.target.value)}
            disabled={maxReached}
          />
          <button
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={() => addMapping(queryInput)}
            disabled={!queryInput.trim() || maxReached}
          >
            Add
          </button>
        </div>
        {maxReached && (
          <p className="text-[11px] text-amber-600">Maximum of 3 queries per product.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Attached queries</p>
        {localMappings.length === 0 ? (
          <p className="text-xs text-gray-400">No queries mapped yet.</p>
        ) : (
          <div className="space-y-2">
            {localMappings.map((mapping, index) => (
              <div key={`${mapping.query}-${index}`} className="flex items-center gap-2">
                <div className="flex-1 text-xs text-gray-800">{mapping.query}</div>
                <input
                  type="number"
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="w-16 text-xs border border-gray-200 rounded px-2 py-1"
                  value={mapping.weight}
                  onChange={event => updateWeight(index, Number(event.target.value))}
                />
                <button
                  className="text-xs text-red-500"
                  onClick={() => removeMapping(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {suggested.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Suggested queries</p>
          <div className="flex flex-wrap gap-2">
            {suggested.map(query => (
              <button
                key={query}
                className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-600"
                onClick={() => addMapping(query)}
                disabled={maxReached}
              >
                + {query}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          className="text-xs px-3 py-1.5 rounded bg-gray-900 text-white"
          onClick={() => onSave(localMappings)}
        >
          Save Mapping
        </button>
      </div>
    </div>
  );
};

export default ProductTrendsMapper;
