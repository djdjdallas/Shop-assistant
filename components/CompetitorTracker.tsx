import React, { useState } from 'react';
import { Competitor } from '../types';
import { addCompetitor, removeCompetitor } from '../services/api';
import { ExternalLink, Trash2, Plus, DollarSign, Store, Link as LinkIcon, Loader2 } from 'lucide-react';

interface CompetitorTrackerProps {
  competitors: Competitor[];
  loading: boolean;
}

const CompetitorTracker: React.FC<CompetitorTrackerProps> = ({ competitors: initialCompetitors, loading }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Update local state when props change
  React.useEffect(() => {
    setCompetitors(initialCompetitors);
  }, [initialCompetitors]);

  const handleAdd = async () => {
    if (!newName || !newPrice || !newUrl) return;
    
    setIsSaving(true);

    // Simple URL validation/fixing
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newCompetitor: Competitor = {
      id: `c-${Date.now()}`,
      name: newName,
      url: formattedUrl,
      price: newPrice,
      last_checked: new Date().toISOString()
    };
    
    try {
      await addCompetitor(newCompetitor);
      setCompetitors([newCompetitor, ...competitors]);
      
      // Reset form
      setNewName('');
      setNewUrl('');
      setNewPrice('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add competitor', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    // Optimistic update: remove from UI immediately
    const previousCompetitors = [...competitors];
    setCompetitors(competitors.filter(c => c.id !== id));
    
    try {
      await removeCompetitor(id);
    } catch (error) {
      console.error('Failed to remove competitor', error);
      // Revert on failure
      setCompetitors(previousCompetitors);
    }
  };

  if (loading) return (
    <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 animate-pulse"></div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-500" />
          Competitor Tracking
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          disabled={isSaving}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        {isAdding && (
           <div className="bg-blue-50 p-3 rounded-md mb-2 border border-blue-100 flex flex-col gap-2 animate-in slide-in-from-top-2">
              <input 
                placeholder="Competitor Name (e.g. Amazon)" 
                className="w-full text-xs border border-blue-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                disabled={isSaving}
              />
              <div className="relative">
                <LinkIcon className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                <input 
                  placeholder="Product URL" 
                  className="w-full text-xs border border-blue-200 rounded pl-7 pr-2 py-1.5 focus:outline-none focus:border-blue-400"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex gap-2">
                <div className="relative w-1/2">
                   <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                   <input 
                    placeholder="Price" 
                    className="w-full text-xs border border-blue-200 rounded pl-5 pr-2 py-1.5 focus:outline-none focus:border-blue-400"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newName || !newUrl || !newPrice || isSaving}
                  className="w-1/2 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>
           </div>
        )}

        <div className="space-y-1">
          {competitors.map(comp => (
            <div key={comp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group transition-colors border border-transparent hover:border-gray-100">
              <div className="flex flex-col max-w-[70%]">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-gray-800 truncate" title={comp.name}>{comp.name}</span>
                   <a 
                    href={comp.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-gray-400 hover:text-blue-500 shrink-0"
                    title="Open Link"
                   >
                     <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
                <span className="text-[10px] text-gray-400">
                  Checked {new Date(comp.last_checked).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-bold text-gray-900">${comp.price}</span>
                 <button 
                   onClick={() => handleRemove(comp.id)}
                   className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                   title="Remove"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
            </div>
          ))}
          
          {competitors.length === 0 && !isAdding && (
            <div className="text-center py-8 text-xs text-gray-400 italic">
              <Store className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              No competitors tracked yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorTracker;