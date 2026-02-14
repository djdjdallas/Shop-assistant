import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ProductContext, ProductStats, ProductNote, Competitor } from '../types';
import { fetchProductStats, fetchProductNotes, fetchCompetitors, saveProductNote } from '../services/api';
import { generateInsights, Insight } from '../services/insightEngine';
import StatsCard from './StatsCard';
import NoteEditor from './NoteEditor';
import CompetitorTracker from './CompetitorTracker';
import TrendsCard from './TrendsCard';
import { Filter, XCircle } from 'lucide-react';

interface ProductAdminBlockProps {
  product: ProductContext;
}

const ProductAdminBlock: React.FC<ProductAdminBlockProps> = ({ product }) => {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [notes, setNotes] = useState<ProductNote[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);

  const [period, setPeriod] = useState<'30d' | '90d'>('30d');
  const [filterTag, setFilterTag] = useState('');
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  // Load Stats
  useEffect(() => {
    let isMounted = true;
    setLoadingStats(true);
    fetchProductStats(product.id, period).then((data) => {
      if (isMounted) {
        setStats(data);
        setLoadingStats(false);
      }
    }).catch(() => {
      if (isMounted) {
        setStats(null);
        setLoadingStats(false);
      }
    });
    return () => { isMounted = false; };
  }, [product.id, period]);

  // Load Notes
  useEffect(() => {
    let isMounted = true;
    setLoadingNotes(true);
    fetchProductNotes(product.id).then((data) => {
      if (isMounted) {
        setNotes(data);
        setLoadingNotes(false);
      }
    });
    return () => { isMounted = false; };
  }, [product.id]);

  // Load Competitors
  useEffect(() => {
    let isMounted = true;
    setLoadingCompetitors(true);
    fetchCompetitors(product.id).then((data) => {
      if (isMounted) {
        setCompetitors(data);
        setLoadingCompetitors(false);
      }
    });
    return () => { isMounted = false; };
  }, [product.id]);

  // Generate insights
  const insights = useMemo(() => {
    const all = generateInsights({
      stats,
      inventory: product.inventory,
      competitors,
      period,
      productPrice: product.price,
    });
    return all.filter(i => !dismissedKeys.has(i.key));
  }, [stats, product.inventory, product.price, competitors, period, dismissedKeys]);

  const handleNoteAdded = (newNote: ProductNote) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleApproveInsight = useCallback(async (insight: Insight) => {
    try {
      const savedNote = await saveProductNote({
        productId: product.id,
        noteText: insight.text,
        tags: insight.tags,
        author: 'Sidekick',
      });
      setNotes(prev => [savedNote, ...prev]);
      setDismissedKeys(prev => new Set(prev).add(insight.key));
    } catch (error) {
      console.error('Failed to save insight as note:', error);
    }
  }, [product.id]);

  const handleDismissInsight = useCallback((key: string) => {
    setDismissedKeys(prev => new Set(prev).add(key));
  }, []);

  const handleSeed = async () => {
    const res = await fetch('/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    if (!res.ok) throw new Error('Seed failed');

    const [statsData, notesData, competitorsData] = await Promise.all([
      fetchProductStats(product.id, period),
      fetchProductNotes(product.id),
      fetchCompetitors(product.id),
    ]);
    setStats(statsData);
    setNotes(notesData);
    setCompetitors(competitorsData);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Sidekick Assistant</h2>
        <div className="flex items-center gap-2">
          {/* Tag Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Filter className={`w-3 h-3 ${filterTag ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              placeholder="Filter notes..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className={`pl-7 pr-7 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-32 focus:w-48 ${filterTag ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-gray-200'}`}
            />
            {filterTag && (
              <button
                onClick={() => setFilterTag('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
            Pro
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4">

        {/* Analytics Card */}
        <StatsCard
          stats={stats}
          loading={loadingStats}
          period={period}
          inventory={product.inventory}
          onPeriodChange={setPeriod}
          onSeed={handleSeed}
        />

        {/* Market Trends Card */}
        <TrendsCard
          productId={product.id}
          productTitle={product.title}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* Timeline Notes */}
           <NoteEditor
             initialNotes={notes}
             loading={loadingNotes}
             onNoteAdded={handleNoteAdded}
             productId={product.id}
             filterTag={filterTag}
             insights={insights}
             onApproveInsight={handleApproveInsight}
             onDismissInsight={handleDismissInsight}
           />

           {/* Competitor Tracking */}
           <CompetitorTracker
              competitors={competitors}
              loading={loadingCompetitors}
              productId={product.id}
           />
        </div>

      </div>
    </div>
  );
};

export default ProductAdminBlock;
