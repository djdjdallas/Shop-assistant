import React, { useState, useCallback } from 'react';
import { ProductNote } from '../types';
import { Insight } from '../services/insightEngine';
import { saveProductNote, updateProductNote, deleteProductNote } from '../services/api';
import { FileText, Send, Tag, X, Sparkles, Check, XCircle, Pencil, Trash2 } from 'lucide-react';

interface NoteEditorProps {
  initialNotes: ProductNote[];
  loading: boolean;
  onNoteAdded: (note: ProductNote) => void;
  onNoteUpdated?: (note: ProductNote) => void;
  onNoteDeleted?: (noteId: string) => void;
  productId: string;
  filterTag: string;
  insights?: Insight[];
  onApproveInsight?: (insight: Insight) => void;
  onDismissInsight?: (key: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialNotes,
  loading,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
  productId,
  filterTag,
  insights = [],
  onApproveInsight,
  onDismissInsight,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [approvingKey, setApprovingKey] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = useCallback(async () => {
    if (!newNoteText.trim()) return;

    setIsSaving(true);
    try {
      const savedNote = await saveProductNote({
        productId,
        noteText: newNoteText,
        tags: newTags,
      });
      onNoteAdded(savedNote);

      setNewNoteText('');
      setNewTags([]);
      setIsInputExpanded(false);
    } catch (error) {
      console.error("Failed to save note", error);
    } finally {
      setIsSaving(false);
    }
  }, [newNoteText, newTags, productId, onNoteAdded]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !newTags.includes(trimmed)) {
        setNewTags([...newTags, trimmed]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTags(newTags.filter(t => t !== tagToRemove));
  };

  const handleApprove = useCallback(async (insight: Insight) => {
    setApprovingKey(insight.key);
    try {
      if (onApproveInsight) {
        onApproveInsight(insight);
      }
    } finally {
      setApprovingKey(null);
    }
  }, [onApproveInsight]);

  const startEdit = useCallback((note: ProductNote) => {
    setEditingNoteId(note.id);
    setEditText(note.note_text);
    setEditTags(note.tags || []);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingNoteId || !editText.trim()) return;
    setIsUpdating(true);
    try {
      const updated = await updateProductNote({
        noteId: editingNoteId,
        noteText: editText,
        tags: editTags,
        productId,
      });
      onNoteUpdated?.(updated);
      setEditingNoteId(null);
    } catch (error) {
      console.error('Failed to update note', error);
    } finally {
      setIsUpdating(false);
    }
  }, [editingNoteId, editText, editTags, productId, onNoteUpdated]);

  const handleDelete = useCallback(async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteProductNote(noteId, productId);
      onNoteDeleted?.(noteId);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  }, [productId, onNoteDeleted]);

  const displayedNotes = initialNotes.filter(note =>
    !filterTag || (note.tags && note.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase())))
  );

  const severityStyles = {
    critical: 'border-red-200 bg-red-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    info: 'border-purple-200 bg-purple-50/50',
  };

  const severityBadge = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-purple-100 text-purple-700',
  };

  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading team notes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          Team Notes & Timeline
          {insights.length > 0 && (
            <span className="ml-auto text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">

        {/* Insight Cards */}
        {insights.map((insight) => (
          <div
            key={insight.key}
            className={`p-3 rounded-lg border shadow-sm ${severityStyles[insight.severity]}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-900">Sidekick</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${severityBadge[insight.severity]}`}>
                  {insight.severity}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleApprove(insight)}
                  disabled={approvingKey === insight.key}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                  title="Approve — save as a note"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDismissInsight?.(insight.key)}
                  className="p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors"
                  title="Dismiss"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{insight.text}</p>
            <div className="flex flex-wrap gap-1">
              {insight.tags.map((tag, i) => (
                <span key={i} className="bg-purple-100/70 text-purple-600 px-1.5 py-0.5 rounded text-[10px] border border-purple-200/50">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Existing Notes */}
        {displayedNotes.length === 0 && insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 italic">No notes found {filterTag ? `matching "${filterTag}"` : ''}</p>
          </div>
        ) : (
          displayedNotes.map((note) => (
            <div key={note.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm group/note">
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={3}
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={!editText.trim() || isUpdating}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {note.author === 'Sidekick' ? (
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                          {note.author.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-900">{note.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover/note:opacity-100"
                        title="Edit note"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover/note:opacity-100"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{note.note_text}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, i) => (
                         <span key={i} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] border border-gray-200">
                           #{tag}
                         </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-100 bg-white rounded-b-lg">
        {!isInputExpanded && !isSaving ? (
          <button
            onClick={() => setIsInputExpanded(true)}
            className="w-full text-left text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-2 transition-colors"
          >
            Write a note...
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <textarea
              className="w-full p-3 text-sm text-gray-900 bg-white placeholder-gray-400 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="What's on your mind?"
              rows={3}
              autoFocus
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
            />

            {/* Tag Inputs */}
            <div className="flex items-center gap-2">
               <Tag className="w-3.5 h-3.5 text-gray-400" />
               <div className="flex-1 flex flex-wrap gap-2 items-center">
                  {newTags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs border border-blue-100 flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-blue-900"><X size={10} /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ Tag"
                    className="text-xs border-none outline-none focus:ring-0 bg-transparent placeholder-gray-400 w-16"
                  />
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsInputExpanded(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newNoteText.trim() || isSaving}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center gap-1"
              >
                {isSaving ? 'Posting...' : <><Send className="w-3 h-3" /> Post Note</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
