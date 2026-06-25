import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { 
  CheckCircle, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  BookOpen,
  Info
} from 'lucide-react';

interface QuizEngineProps {
  questions: QuizQuestion[];
  onSuccess: (score: number) => void;
  savedHighScore?: number;
}

export default function QuizEngine({ questions, onSuccess, savedHighScore }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isCheckedMode, setIsCheckedMode] = useState<{ [qIdx: number]: boolean }>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scoreCount, setScoreCount] = useState<number>(0);

  // Sync state when entering a new set of module questions
  useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCheckedMode({});
    setIsFinished(false);
    setScoreCount(0);
  }, [questions]);

  const handleSelectOption = (optIdx: number) => {
    if (isCheckedMode[currentIdx]) return; // locked once checked
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const checkAnswer = () => {
    if (selectedAnswers[currentIdx] === undefined) return;
    
    const isCorrect = selectedAnswers[currentIdx] === questions[currentIdx].correctIndex;
    if (isCorrect) {
      setScoreCount(prev => prev + 1);
    }
    
    setIsCheckedMode(prev => ({ ...prev, [currentIdx]: true }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      onSuccess(scoreCount + (selectedAnswers[currentIdx] === questions[currentIdx].correctIndex ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCheckedMode({});
    setIsFinished(false);
    setScoreCount(0);
  };

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const hasSelected = selectedAnswers[currentIdx] !== undefined;
  const isChecked = isCheckedMode[currentIdx];

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm" id="assessment-quiz-engine">
      
      {/* Quiz progress indicator */}
      <div className="flex items-center justify-between border-b border-indigo-50/80 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Knowledge Check Quiz</h3>
            <p className="text-[11px] text-slate-500">Validate what you have read</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500 font-bold">
          {!isFinished ? `Question ${currentIdx + 1} of ${totalQuestions}` : 'Assessment Completed'}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-5">
          {/* Question Text */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block font-mono">Multiple Choice:</span>
            <p className="text-sm text-slate-800 font-extrabold leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options list selection */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, optIdx) => {
              const worksAsSelected = selectedAnswers[currentIdx] === optIdx;
              const isCorrectTarget = currentQuestion.correctIndex === optIdx;
              
              let styling = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs font-semibold';
              if (worksAsSelected) {
                styling = 'bg-indigo-50/70 border-indigo-400 text-indigo-950 shadow-sm font-bold scale-[1.01]';
              }
              if (isChecked) {
                if (isCorrectTarget) {
                  styling = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold scale-[1.01] shadow-xs';
                } else if (worksAsSelected) {
                  styling = 'bg-rose-50 border-rose-300 text-rose-800 font-extrabold';
                } else {
                  styling = 'bg-slate-50 border-slate-200/40 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isChecked}
                  className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 cursor-pointer ${styling}`}
                >
                  <span className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center font-mono text-[10px] border ${
                    worksAsSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation drawer once checked */}
          {isChecked && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs leading-relaxed animate-fadeIn">
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <Info className="h-4 w-4 text-indigo-600" /> Lesson Analogy explanation:
              </span>
              <p className="text-slate-700 font-medium">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Nav action buttons */}
          <div className="flex gap-2 justify-end pt-3 border-t border-indigo-50/80">
            {!isChecked ? (
              <button
                onClick={checkAnswer}
                disabled={!hasSelected}
                className={`py-2 px-4 rounded-xl text-xs font-bold select-none transition-all ${
                  hasSelected 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-500/10' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/10"
              >
                {currentIdx < totalQuestions - 1 ? (
                  <>
                    Next Question <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Finish Quiz <CheckCircle className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Summary Frame */
        <div className="text-center py-6 space-y-4 animate-scaleUp">
          <div className="inline-flex h-12 w-12 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100 text-indigo-600 mb-2">
            <Award className="h-6 w-6" />
          </div>
          
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-slate-800">Congratulations!</h4>
            <p className="text-xs text-slate-500">You have completed the module knowledge assessment.</p>
          </div>

          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-2 font-sans shadow-xs">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-semibold">Your Score:</span>
              <span className="font-extrabold text-slate-800">{scoreCount} / {totalQuestions}</span>
            </div>
            
            {savedHighScore !== undefined && (
              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span className="font-semibold">Personal High Score:</span>
                <span className="font-extrabold text-indigo-600">{Math.max(savedHighScore, scoreCount)} / {totalQuestions}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium italic">
              {scoreCount === totalQuestions ? '🏆 Flawless performance! DevOps Architect calibre!' : 'Keep learning, you are doing awesome!'}
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={handleRestart}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all w-28 justify-center font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retry Quiz
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
