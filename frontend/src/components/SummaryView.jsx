import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, Loader2, ListChecks, FileText } from 'lucide-react';
import DocumentSelector from './DocumentSelector';
import { generateSummary } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function SummaryView({ documents, selectedDocIds, setSelectedDocIds }) {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFileId = selectedDocIds.length > 0 ? selectedDocIds[0] : null;
      const data = await generateSummary({
        fileId: activeFileId,
        fileIds: selectedDocIds,
        summaryType: 'comprehensive',
        model: 'tinyllama',
      });
      setSummaryData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const fullText = `# ${summaryData.title}\n\n## Overview\n${summaryData.summary}\n\n## Key Points\n${summaryData.key_points.map(kp => `- ${kp}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-accent-purple" />
            <span>Document Summaries</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Generate high-yield chapter overviews and key takeaways from your course PDFs.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isLoading || documents.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-brand-600 font-bold text-sm text-white shadow-lg shadow-accent-purple/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Scope Selector */}
      <div className="glass-panel p-4 rounded-xl border border-white/10">
        <DocumentSelector
          documents={documents}
          selectedDocIds={selectedDocIds}
          setSelectedDocIds={setSelectedDocIds}
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Summary Display Card */}
      {summaryData ? (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-400" />
                <span>{summaryData.title}</span>
              </h2>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>

            {/* Overview Section */}
            <div>
              <h3 className="text-sm font-bold text-accent-purple uppercase tracking-wider mb-3">
                Executive Overview
              </h3>
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
              </div>
            </div>

            {/* Key Takeaways Grid */}
            <div>
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider mb-4 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accent-cyan" />
                <span>Key Concepts & Takeaways</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summaryData.key_points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-dark-900/70 p-4 rounded-xl border border-white/5 text-xs text-slate-300 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto text-accent-purple">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Summary Generated Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Select a PDF document above and click "Generate Summary" to produce automated executive notes.
          </p>
        </div>
      )}
    </div>
  );
}
