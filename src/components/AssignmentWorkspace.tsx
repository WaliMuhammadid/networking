import React, { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { 
  Terminal, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Flame, 
  Lightbulb,
  FileCheck2,
  LockKeyhole
} from 'lucide-react';

interface AssignmentWorkspaceProps {
  assignment: Assignment;
  onSuccess: () => void;
  isCompleted: boolean;
}

export default function AssignmentWorkspace({ assignment, onSuccess, isCompleted }: AssignmentWorkspaceProps) {
  const [userCode, setUserCode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'grading' | 'success' | 'failed'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Set default code template when assignment changes
  useEffect(() => {
    setUserCode(assignment.startingTemplate);
    setStatus(isCompleted ? 'success' : 'idle');
    setFeedbackMsg(isCompleted ? 'Assignment Grade: 100% / Passed! Outstanding DevOps configure skills.' : '');
    setShowHint(false);
  }, [assignment, isCompleted]);

  const handleGradeCode = () => {
    setStatus('grading');
    setFeedbackMsg('Parsing YAML blocks... evaluating syntax rules...');

    setTimeout(() => {
      const trimmedCode = userCode.trim();

      // Run expression pattern test
      let isCorrect = false;
      if (assignment.expectedPattern instanceof RegExp) {
        isCorrect = assignment.expectedPattern.test(trimmedCode);
      } else if (typeof assignment.expectedPattern === 'function') {
        const result = (assignment.expectedPattern as any)(trimmedCode);
        isCorrect = result.success;
        setFeedbackMsg(result.feedback);
      }

      if (isCorrect) {
        setStatus('success');
        setFeedbackMsg('🎉 Code Graded: SUCCESS (100%)! Configuration pattern matches standard production schemas perfectly.');
        onSuccess();
      } else {
        setStatus('failed');
        setFeedbackMsg(`❌ Syntax Error: Config block does not meet target requirements. ${assignment.expectedValueDescription}`);
      }
    }, 850);
  };

  const handleReset = () => {
    setUserCode(assignment.startingTemplate);
    setStatus('idle');
    setFeedbackMsg('');
    setShowHint(false);
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm" id={`assignment-card-${assignment.id}`}>
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-indigo-50/80 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">DevOps Assignment Challenge</h3>
            <p className="text-[11px] text-slate-500 font-semibold font-mono">Interactive Config Sandbox</p>
          </div>
        </div>
        <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-lg border ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
          {isCompleted ? 'Graded: Passed' : 'Grade Pending'}
        </span>
      </div>

      {/* Intro info */}
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-slate-800">{assignment.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed font-semibold">{assignment.description}</p>
      </div>

      {/* Sandbox guidelines card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2 text-xs text-slate-700 leading-relaxed">
        <span className="font-extrabold text-slate-800 block uppercase tracking-wider font-mono text-[10px]">Challenge Goal & Instructions:</span>
        <p className="leading-relaxed whitespace-pre-line font-medium text-slate-600">{assignment.instructions}</p>
      </div>

      {/* Editor Frame */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-x border-slate-800 rounded-t-xl select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-mono text-slate-400 ml-2">config_production.yaml</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">UTF-8 • YAML</span>
        </div>

        <textarea
          value={userCode}
          onChange={e => {
            if (status !== 'success') {
              setUserCode(e.target.value);
            }
          }}
          disabled={isCompleted || status === 'success'}
          placeholder="Write your configuration commands here..."
          rows={5}
          className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 border border-slate-900 rounded-b-xl focus:outline-none focus:border-indigo-500/80 resize-none leading-relaxed shadow-inner"
        />
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          {status !== 'success' && (
            <button
              onClick={handleGradeCode}
              disabled={status === 'grading'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/10"
            >
              {status === 'grading' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Grading...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Grade and Test Configuration
                </>
              )}
            </button>
          )}

          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Reset
          </button>
        </div>

        <button
          onClick={() => setShowHint(!showHint)}
          className="text-orange-600 hover:text-orange-700 font-extrabold transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <Lightbulb className="h-3.5 w-3.5" /> {showHint ? 'Hide Hint' : 'Reveal Hint'}
        </button>
      </div>

      {/* Hint panel container */}
      {showHint && (
        <div className="bg-orange-50 border border-orange-100 text-orange-800 p-3.5 rounded-xl text-xs leading-relaxed font-semibold shadow-xs animate-fadeIn">
          <strong>💡 Hint Check:</strong> {assignment.hint}
        </div>
      )}

      {/* Grading logs terminal output */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl font-mono text-xs border bg-slate-900 border-slate-800 text-slate-300`}>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-500 uppercase font-bold">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" /> Sandbox Terminal Output
          </div>
          <p className={`${
            status === 'success' ? 'text-emerald-400 font-bold' :
            status === 'failed' ? 'text-rose-400 font-bold animate-shake' :
            'text-slate-300'
          }`}>{feedbackMsg}</p>
        </div>
      )}

    </div>
  );
}
