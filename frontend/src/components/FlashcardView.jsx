import React, { useState } from 'react';
import { BrainCircuit, Sparkles, RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle, Loader2 } from 'lucide-react';
import DocumentSelector from './DocumentSelector';
import { generateFlashcards } from '../services/api';

export default function FlashcardView({ documents, selectedDocIds, setSelectedDocIds }) {
  const [deckData, setDeckData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});
  const [numCards, setNumCards] = useState(5);
  const [error, setError] = useState(null);

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCards({});
    try {
      const activeFileId = selectedDocIds.length > 0 ? selectedDocIds[0] : null;
      const data = await generateFlashcards({
        fileId: activeFileId,
        fileIds: selectedDocIds,
        numCards: parseInt(numCards),
        model: 'tinyllama',
      });
      setDeckData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = deckData?.cards?.[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (deckData?.cards) {
      setCurrentIndex((prev) => (prev + 1) % deckData.cards.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (deckData?.cards) {
      setCurrentIndex((prev) => (prev - 1 + deckData.cards.length) % deckData.cards.length);
    }
  };

  const toggleMastered = (cardId) => {
    setMasteredCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleShuffle = () => {
    if (!deckData?.cards) return;
    setIsFlipped(false);
    const shuffled = [...deckData.cards].sort(() => Math.random() - 0.5);
    setDeckData({ ...deckData, cards: shuffled });
    setCurrentIndex(0);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-accent-emerald" />
            <span>3D Study Flashcards</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Review key definitions and core concepts using interactive study flashcard decks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={numCards}
            onChange={(e) => setNumCards(e.target.value)}
            className="bg-dark-800 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value={5}>5 Cards</option>
            <option value={8}>8 Cards</option>
            <option value={12}>12 Cards</option>
          </select>

          <button
            onClick={handleGenerateFlashcards}
            disabled={isLoading || documents.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-emerald to-brand-600 font-bold text-sm text-white shadow-lg shadow-accent-emerald/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Deck</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scope Selector */}
      <div className="glass-panel p-4 rounded-xl border border-white/10">
        <DocumentSelector
          documents={documents}
          selectedDocIds={selectedDocIds}
          setSelectedDocIds={setSelectedDocIds}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* 3D Flashcard Deck */}
      {deckData && currentCard ? (
        <div className="space-y-6 flex flex-col items-center">
          {/* Deck Controls Header */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Card {currentIndex + 1} of {deckData.cards.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => toggleMastered(currentCard.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition font-semibold ${
                  masteredCards[currentCard.id]
                    ? 'bg-accent-emerald/20 text-emerald-300 border border-accent-emerald/40'
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{masteredCards[currentCard.id] ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-xl h-80 perspective-1000 cursor-pointer group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 w-full h-full glass-card border border-white/15 rounded-3xl p-8 flex flex-col justify-between backface-hidden shadow-2xl group-hover:border-brand-500/40 transition-colors">
                <div className="flex items-center justify-between text-xs text-brand-400 font-bold uppercase tracking-wider">
                  <span>Topic: {currentCard.topic || 'Concept'}</span>
                  <span className="text-slate-500 text-[11px]">Click to reveal answer 🔄</span>
                </div>

                <div className="my-auto text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="text-center text-xs text-slate-500">FRONT (QUESTION)</div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-dark-800 to-dark-900 border border-brand-500/40 rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-accent-emerald font-bold uppercase tracking-wider">
                  <span>Answer / Explanation</span>
                  <span className="text-slate-500 text-[11px]">Click to flip back 🔄</span>
                </div>

                <div className="my-auto text-center">
                  <p className="text-base md:text-lg text-slate-200 leading-relaxed font-normal">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-xs text-brand-400 font-medium">BACK (ANSWER)</div>
              </div>
            </div>
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full glass-card hover:bg-white/10 text-white transition border border-white/10"
              title="Previous Card"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
            >
              <RotateCw className="w-4 h-4" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-full glass-card hover:bg-white/10 text-white transition border border-white/10"
              title="Next Card"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto text-accent-emerald">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Flashcard Deck Created</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Select a document and click "Generate Deck" to produce an interactive 3D study flashcard deck.
          </p>
        </div>
      )}
    </div>
  );
}
