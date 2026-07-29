import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import ChatView from './components/ChatView';
import SummaryView from './components/SummaryView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import SettingsView from './components/SettingsView';
import { fetchDocuments, checkHealth } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'upload' | 'chat' | 'summary' | 'quiz' | 'flashcards' | 'settings'
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const loadDocuments = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs || []);
      // If no docs selected yet, default to all
      if (docs && docs.length > 0 && selectedDocIds.length === 0) {
        setSelectedDocIds(docs.map(d => d.file_id));
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const checkStatus = async () => {
    try {
      const health = await checkHealth();
      setIsConnected(health.ollama_connected);
    } catch (err) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (currentView === 'landing') {
    return <LandingPage onLaunch={() => setCurrentView('chat')} />;
  }

  return (
    <div className="flex min-h-screen bg-dark-900 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={currentView}
        setActiveView={setCurrentView}
        docCount={documents.length}
        isConnected={isConnected}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        {currentView === 'upload' && (
          <UploadView documents={documents} refreshDocuments={loadDocuments} />
        )}
        {currentView === 'chat' && (
          <ChatView
            documents={documents}
            selectedDocIds={selectedDocIds}
            setSelectedDocIds={setSelectedDocIds}
          />
        )}
        {currentView === 'summary' && (
          <SummaryView
            documents={documents}
            selectedDocIds={selectedDocIds}
            setSelectedDocIds={setSelectedDocIds}
          />
        )}
        {currentView === 'quiz' && (
          <QuizView
            documents={documents}
            selectedDocIds={selectedDocIds}
            setSelectedDocIds={setSelectedDocIds}
          />
        )}
        {currentView === 'flashcards' && (
          <FlashcardView
            documents={documents}
            selectedDocIds={selectedDocIds}
            setSelectedDocIds={setSelectedDocIds}
          />
        )}
        {currentView === 'settings' && (
          <SettingsView documentCount={documents.length} />
        )}
      </main>
    </div>
  );
}
