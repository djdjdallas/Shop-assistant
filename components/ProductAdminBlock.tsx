import React, { useEffect, useState } from 'react';
import { ProductContext, ProductStats, ProductNote, Competitor } from '../types';
import { fetchProductStats, fetchProductNotes, fetchCompetitors } from '../services/api';
import StatsCard from './StatsCard';
import NoteEditor from './NoteEditor';
import CompetitorTracker from './CompetitorTracker';
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

  // Load Stats
  useEffect(() => {
    let isMounted = true;
    setLoadingStats(true);
    fetchProductStats(product.id, period).then((data) => {
      if (isMounted) {
        setStats(data);
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
        setNotes(data); // Expecting array now
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

  const handleNoteAdded = (newNote: ProductNote) => {
    setNotes(prev => [newNote, ...prev]);
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
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* Timeline Notes */}
           <NoteEditor 
             initialNotes={notes} 
             loading={loadingNotes} 
             onNoteAdded={handleNoteAdded}
             productId={product.id}
             filterTag={filterTag}
           />
           
           {/* Competitor Tracking */}
           <CompetitorTracker 
              competitors={competitors}
              loading={loadingCompetitors}
           />
        </div>

      </div>
    </div>
  );
};

export default ProductAdminBlock;