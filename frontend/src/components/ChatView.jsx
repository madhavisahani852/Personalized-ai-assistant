import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DocumentSelector from './DocumentSelector';
import { sendChatMessage } from '../services/api';

export default function ChatView({ documents, selectedDocIds, setSelectedDocIds }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Student Assistant. Ask me anything about your uploaded textbooks or lecture notes!',
      sources: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const chatBottomRef = useRef(null);

  const samplePrompts = [
    "What are the main concepts covered in this PDF?",
    "Explain the ACID properties of DBMS",
    "What is the difference between Primary Key and Foreign Key?",
    "Summarize the key definitions and formulas"
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText = inputQuery) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build conversation memory payload
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await sendChatMessage({
        question: textToSend,
        fileIds: selectedDocIds,
        history,
        model: 'tinyllama',
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Failed to get answer from backend. Please ensure Ollama is running (`ollama run tinyllama`) and the backend server is online.',
          sources: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSourceExpand = (msgId) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat history cleared. How can I help with your study material today?',
        sources: []
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 md:p-6">
      {/* Header bar with Document Selector */}
      <div className="glass-panel p-4 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-4 border border-white/10 shrink-0">
        <DocumentSelector
          documents={documents}
          selectedDocIds={selectedDocIds}
          setSelectedDocIds={setSelectedDocIds}
        />

        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-white/5"
          title="Clear Chat History"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSourcesOpen = expandedSources[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-brand-600 to-accent-purple text-white'
                    : 'bg-dark-800 text-brand-400 border border-brand-500/30'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-3xl rounded-2xl p-5 border relative shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-500/30 rounded-tr-none'
                    : 'glass-card text-slate-100 border-white/10 rounded-tl-none'
                }`}
              >
                <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>

                {/* Assistant Copy Action */}
                {!isUser && msg.id !== 'welcome' && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1.5 hover:text-white transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-accent-emerald" />
                          <span className="text-accent-emerald font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Sources Button */}
                    {msg.sources && msg.sources.length > 0 && (
                      <button
                        onClick={() => toggleSourceExpand(msg.id)}
                        className="flex items-center gap-1.5 text-brand-400 font-semibold hover:text-brand-300 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{msg.sources.length} Sources</span>
                        {isSourcesOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Sources Accordion */}
                {!isUser && isSourcesOpen && msg.sources && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Retrieved Context Sources:
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="bg-dark-900/80 p-3 rounded-lg border border-white/5 text-xs text-slate-300"
                        >
                          <div className="flex items-center justify-between text-brand-400 font-semibold mb-1">
                            <span className="flex items-center gap-1 truncate">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              {src.filename}
                            </span>
                            <span className="bg-brand-500/20 px-2 py-0.5 rounded text-[10px]">
                              Page {src.page}
                            </span>
                          </div>
                          <p className="text-slate-400 italic text-[11px] line-clamp-3">
                            "{src.content_snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-dark-800 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="glass-card p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-3 text-sm text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Analyzing ChromaDB vectors & generating response...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompts if chat is brief */}
      {messages.length <= 2 && !isLoading && (
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full text-xs bg-dark-800 text-slate-300 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 border border-white/10 transition whitespace-nowrap"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="relative shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              selectedDocIds.length > 0
                ? "Ask a question about your selected PDF(s)..."
                : "Ask a question (or select PDFs above)..."
            }
            disabled={isLoading}
            className="w-full bg-dark-800 border border-white/15 rounded-2xl py-4 pl-5 pr-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xl transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2.5 p-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
