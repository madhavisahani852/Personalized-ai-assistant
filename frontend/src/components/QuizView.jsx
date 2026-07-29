import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, RotateCcw, Award, Loader2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import DocumentSelector from './DocumentSelector';
import { generateQuiz } from '../services/api';

export default function QuizView({ documents, selectedDocIds, setSelectedDocIds }) {
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState(null);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    try {
      const activeFileId = selectedDocIds.length > 0 ? selectedDocIds[0] : null;
      const data = await generateQuiz({
        fileId: activeFileId,
        fileIds: selectedDocIds,
        numQuestions: parseInt(numQuestions),
        model: 'tinyllama',
      });
      setQuizData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionText, correctAnswer) => {
    if (selectedAnswers[questionId]) return; // locked once chosen

    const updated = {
      ...selectedAnswers,
      [questionId]: {
        selected: optionText,
        isCorrect: optionText === correctAnswer,
      },
    };
    setSelectedAnswers(updated);

    // Check if all questions are answered
    if (quizData && Object.keys(updated).length === quizData.questions.length) {
      const score = Object.values(updated).filter((a) => a.isCorrect).length;
      if (score === quizData.questions.length) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    return Object.values(selectedAnswers).filter((a) => a.isCorrect).length;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-accent-amber" />
            <span>Practice Quiz Generator</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Generate Multiple Choice Questions (MCQs) to test your knowledge before exams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="bg-dark-800 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={8}>8 Questions</option>
          </select>

          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading || documents.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-amber to-brand-600 font-bold text-sm text-white shadow-lg shadow-accent-amber/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Quiz</span>
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

      {/* Quiz Body */}
      {quizData ? (
        <div className="space-y-6">
          {/* Score Banner */}
          {Object.keys(selectedAnswers).length === quizData.questions.length && (
            <div className="glass-card p-6 rounded-2xl border border-accent-amber/30 bg-accent-amber/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-amber/20 text-accent-amber flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
                  <p className="text-slate-300 text-sm">
                    You scored <span className="font-bold text-accent-amber">{calculateScore()}</span> out of{' '}
                    {quizData.questions.length} questions correctly.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try New Quiz</span>
              </button>
            </div>
          )}

          {/* Question List */}
          {quizData.questions.map((q, qIdx) => {
            const answerState = selectedAnswers[q.id];
            return (
              <div key={q.id} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold text-white flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <span>{q.question}</span>
                  </h3>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answerState?.selected === opt;
                    const isCorrectOpt = opt === q.correct_answer;

                    let btnStyle = 'bg-dark-900/60 border-white/10 hover:border-brand-500/50 text-slate-200';
                    if (answerState) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-accent-emerald/20 border-accent-emerald text-emerald-300 font-semibold';
                      } else if (isSelected && !answerState.isCorrect) {
                        btnStyle = 'bg-accent-rose/20 border-accent-rose text-rose-300 font-semibold';
                      } else {
                        btnStyle = 'bg-dark-900/40 border-white/5 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, opt, q.correct_answer)}
                        disabled={!!answerState}
                        className={`p-4 rounded-xl text-xs text-left border transition flex items-center justify-between gap-3 ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {answerState && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {answerState && isSelected && !answerState.isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {answerState && (
                  <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-slate-300 mt-3">
                    <span className="font-bold text-brand-400 block mb-1">Explanation:</span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center mx-auto text-accent-amber">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Quiz Generated Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Select a document and click "Generate Quiz" to test yourself with AI-generated practice MCQs.
          </p>
        </div>
      )}
    </div>
  );
}
