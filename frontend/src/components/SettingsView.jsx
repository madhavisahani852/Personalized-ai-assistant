import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Database, CheckCircle2, XCircle, RefreshCw, Server, HardDrive, ShieldCheck } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function SettingsView({ documentCount }) {
  const [health, setHealth] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('tinyllama');
  const [topK, setTopK] = useState(3);

  const fetchHealthStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = await checkHealth();
      setHealth(status);
    } catch (err) {
      setHealth({
        status: 'error',
        ollama_connected: false,
        embedding_model_loaded: false,
        total_documents: documentCount || 0,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-400" />
            <span>Assistant Settings & System Health</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor local RAG pipeline services, Ollama connection, and ChromaDB vector store.
          </p>
        </div>

        <button
          onClick={fetchHealthStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <Server className="w-5 h-5 text-brand-400" />
            {health?.status === 'healthy' ? (
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
            ) : (
              <XCircle className="w-5 h-5 text-accent-rose" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">FastAPI Backend</h4>
            <p className="text-xs text-slate-400">
              {health?.status === 'healthy' ? 'Online (127.0.0.1:8000)' : 'Backend Connection Error'}
            </p>
          </div>
        </div>

        {/* Ollama Engine */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-accent-purple" />
            {health?.ollama_connected ? (
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
            ) : (
              <XCircle className="w-5 h-5 text-accent-rose" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Ollama Neural LLM</h4>
            <p className="text-xs text-slate-400">
              {health?.ollama_connected ? 'Connected (http://localhost:11434)' : 'Offline / Not Running'}
            </p>
          </div>
        </div>

        {/* ChromaDB Vector Store */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <Database className="w-5 h-5 text-accent-cyan" />
            <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">ChromaDB Vectors</h4>
            <p className="text-xs text-slate-400">
              {health?.total_documents || documentCount} Total Indexed Chunks
            </p>
          </div>
        </div>
      </div>

      {/* Model & RAG Configurations */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
          Pipeline Configurations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LLM Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Ollama LLM Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-dark-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="tinyllama">TinyLlama (Default - 1.1B)</option>
              <option value="mistral">Mistral (7B)</option>
              <option value="llama3">Llama 3 (8B)</option>
              <option value="gemma">Gemma (2B)</option>
            </select>
            <span className="text-[11px] text-slate-500 block">
              Ensure model is downloaded via local terminal (`ollama pull {selectedModel}`).
            </span>
          </div>

          {/* Top-K Retrieval */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Chroma Retrieval Chunks (k={topK})
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full accent-brand-500 bg-dark-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>k=1 (Fast)</span>
              <span>k=3 (Balanced)</span>
              <span>k=6 (Deep)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Architecture Info */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 text-xs text-slate-400">
        <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>System Architecture Summary</span>
        </h4>
        <ul className="space-y-1.5 list-disc list-inside">
          <li><strong>Document Extractor:</strong> PyPDFLoader (LangChain Community)</li>
          <li><strong>Text Splitter:</strong> RecursiveCharacterTextSplitter (chunk_size=500, overlap=100)</li>
          <li><strong>Embeddings:</strong> HuggingFaceEmbeddings ("sentence-transformers/all-MiniLM-L6-v2")</li>
          <li><strong>Vector Storage:</strong> Persistent ChromaDB (backend/app/database/chroma_db)</li>
          <li><strong>LLM Engine:</strong> LangChain OllamaLLM ("tinyllama")</li>
        </ul>
      </div>
    </div>
  );
}
