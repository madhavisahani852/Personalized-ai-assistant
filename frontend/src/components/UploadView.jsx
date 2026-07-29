import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle, AlertCircle, Loader2, HardDrive, Clock, FileCheck } from 'lucide-react';
import { uploadPDF, deleteDocument } from '../services/api';

export default function UploadView({ documents, refreshDocuments }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file (.pdf format only).');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsUploading(true);
    setProgress(10);

    try {
      const result = await uploadPDF(file, (p) => {
        setProgress(Math.max(p, 20));
      });
      setProgress(100);
      setSuccessMsg(`Successfully uploaded and indexed "${file.name}"!`);
      await refreshDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process PDF upload.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDelete = async (fileId, filename) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await deleteDocument(fileId);
        await refreshDocuments();
      } catch (err) {
        setError('Failed to delete document.');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Upload Course Materials</h1>
        <p className="text-slate-400 text-sm">
          Upload PDF textbooks, lecture notes, or syllabus slides to enable RAG question answering, flashcards, and quizzes.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-white/15 hover:border-brand-500/40 hover:bg-dark-800/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {isUploading ? 'Indexing PDF into ChromaDB...' : 'Drag & Drop your PDF here'}
            </h3>
            <p className="text-slate-400 text-xs">
              or <span className="text-brand-400 font-semibold underline">browse files</span> from your computer
            </p>
          </div>

          <p className="text-[11px] text-slate-500">
            Supports PDF files up to 50MB. Text will be chunked and converted to HuggingFace embeddings.
          </p>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/10 mt-4">
              <div
                className="bg-gradient-to-r from-brand-600 to-accent-cyan h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-400" />
            <span>Indexed Documents ({documents.length})</span>
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-sm">
            No documents uploaded yet. Upload a PDF above to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.file_id}
                className="glass-card p-5 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/15 transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-100 truncate" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        {formatBytes(doc.file_size)}
                      </span>
                      <span>•</span>
                      <span>{doc.chunk_count} vector chunks</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.file_id, doc.filename)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  title="Delete PDF"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
