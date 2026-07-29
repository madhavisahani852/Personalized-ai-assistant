import React from 'react';
import { FileText, Check, Layers } from 'lucide-react';

export default function DocumentSelector({ documents, selectedDocIds, setSelectedDocIds }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
        <span>No PDFs uploaded yet. Please upload a PDF first.</span>
      </div>
    );
  }

  const toggleSelect = (fileId) => {
    if (selectedDocIds.includes(fileId)) {
      // Don't deselect all if only 1 was selected
      if (selectedDocIds.length > 1) {
        setSelectedDocIds(selectedDocIds.filter(id => id !== fileId));
      }
    } else {
      setSelectedDocIds([...selectedDocIds, fileId]);
    }
  };

  const selectAll = () => {
    setSelectedDocIds(documents.map(d => d.file_id));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1 font-semibold">
        <Layers className="w-3.5 h-3.5" />
        <span>Context Scope:</span>
      </div>

      <button
        onClick={selectAll}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
          selectedDocIds.length === documents.length
            ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
            : 'bg-dark-800 text-slate-400 border-white/10 hover:text-slate-200'
        }`}
      >
        All PDFs ({documents.length})
      </button>

      {documents.map((doc) => {
        const isSelected = selectedDocIds.includes(doc.file_id);
        return (
          <button
            key={doc.file_id}
            onClick={() => toggleSelect(doc.file_id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all truncate max-w-[200px] ${
              isSelected
                ? 'bg-brand-600/30 text-white border-brand-500/50 shadow-sm'
                : 'bg-dark-800 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title={doc.filename}
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-brand-400" />
            <span className="truncate">{doc.filename}</span>
            {isSelected && <Check className="w-3 h-3 shrink-0 text-brand-400 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
