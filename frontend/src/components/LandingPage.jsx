import React from 'react';
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  HelpCircle, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Cpu, 
  Layers, 
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-600/20 via-accent-purple/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-accent-cyan/10 via-brand-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-dark-900/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-400">
                StudyPulse
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                RAG SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLaunch}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-purple font-semibold text-sm text-white shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-medium text-brand-400 mb-8 border border-brand-500/30 shadow-inner">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>Powered by LangChain + ChromaDB + Ollama TinyLlama</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
          Master Any Textbook with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-accent-purple to-accent-cyan">
            Intelligent RAG AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal">
          Upload your PDFs and transform dense course material into interactive Q&A, chapter summaries, instant practice quizzes, and 3D study flashcards.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md">
          <button
            onClick={onLaunch}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple font-bold text-base text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          <div className="glass-card p-4 rounded-xl flex items-center gap-3 border border-white/5">
            <ShieldCheck className="w-5 h-5 text-accent-emerald" />
            <span className="text-sm font-medium text-slate-300">100% Offline & Private</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3 border border-white/5">
            <Zap className="w-5 h-5 text-accent-amber" />
            <span className="text-sm font-medium text-slate-300">Instant Vector Search</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3 border border-white/5">
            <Database className="w-5 h-5 text-accent-purple" />
            <span className="text-sm font-medium text-slate-300">ChromaDB Multi-PDF</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3 border border-white/5">
            <Cpu className="w-5 h-5 text-accent-cyan" />
            <span className="text-sm font-medium text-slate-300">TinyLlama Neural LLM</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/5 bg-dark-800/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-slate-400">
              Turn passive reading into active learning with specialized AI studying tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-2xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Contextual PDF Chat</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ask deep questions about any section of your PDF. Get accurate answers powered by vector retrieval with explicit page citations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-2xl hover:border-accent-purple/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Smart Chapter Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extract high-yield executive summaries and bulleted key takeaways from hundred-page textbooks in seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-2xl hover:border-accent-amber/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-accent-amber" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Practice Quiz Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Test your knowledge with automatically generated Multiple Choice Questions (MCQs) complete with explanations and score tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 rounded-2xl hover:border-accent-emerald/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6 text-accent-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">3D Study Flashcards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Master complex key terms and definitions using interactive 3D flip flashcard decks generated directly from your documents.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-8 rounded-2xl hover:border-accent-cyan/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Multi-PDF Memory</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cross-examine multiple textbooks simultaneously. ChromaDB indexes your entire library with persistent metadata.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-8 rounded-2xl hover:border-accent-rose/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-accent-rose" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Source Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero hallucination ambiguity. Expand source references on every answer to inspect the exact PDF paragraph and page number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">How StudyPulse Works</h2>
          <p className="text-slate-400">Three simple steps to transform your study process.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="glass-card p-8 rounded-2xl text-center relative z-10 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
              1
            </div>
            <h3 className="text-lg font-bold mb-2">Upload Course PDF</h3>
            <p className="text-slate-400 text-sm">Drag and drop your textbooks or lecture notes into the dashboard.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl text-center relative z-10 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-accent-purple text-white font-bold text-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-purple/30">
              2
            </div>
            <h3 className="text-lg font-bold mb-2">Neural Indexing</h3>
            <p className="text-slate-400 text-sm">PyPDFLoader extracts text and SentenceTransformers generates vector embeddings into ChromaDB.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl text-center relative z-10 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-accent-cyan text-white font-bold text-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-cyan/30">
              3
            </div>
            <h3 className="text-lg font-bold mb-2">Learn & Practice</h3>
            <p className="text-slate-400 text-sm">Query your material, test yourself with quizzes, and flip flashcards with TinyLlama.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 bg-dark-900 text-slate-500 text-sm mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-slate-300">StudyPulse RAG AI Assistant</span>
          </div>
          <div>
            Built with FastAPI, LangChain, ChromaDB, HuggingFace & React
          </div>
        </div>
      </footer>
    </div>
  );
}
