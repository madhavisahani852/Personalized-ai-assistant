import React from 'react';
import { 
  FileUp, 
  MessageSquare, 
  BookOpen, 
  HelpCircle, 
  BrainCircuit, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers,
  Circle,
  Home
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, docCount, isConnected, onGoHome }) {
  const navItems = [
    { id: 'upload', label: 'Upload PDF', icon: FileUp, badge: docCount > 0 ? `${docCount} docs` : null },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'summary', label: 'Summaries', icon: BookOpen },
    { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-dark-800/90 border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md z-40">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                StudyPulse
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Student AI Assistant</span>
            </div>
          </div>

          <button 
            onClick={onGoHome}
            title="Landing Page"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/25 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="glass-card p-3 rounded-xl flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-accent-emerald' : 'bg-accent-rose'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-accent-emerald' : 'bg-accent-rose'
              }`}></span>
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">
                {isConnected ? 'Ollama Online' : 'Ollama Offline'}
              </span>
              <span className="text-[10px] text-slate-400">TinyLlama Engine</span>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
