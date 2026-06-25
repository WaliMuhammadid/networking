import React, { useState, useEffect } from 'react';
import { LEARNING_CURRICULUM } from './constants/curriculum';
import LessonReader from './components/LessonReader';
import NetworkSimulator from './components/NetworkSimulator';
import QuizEngine from './components/QuizEngine';
import AssignmentWorkspace from './components/AssignmentWorkspace';
import { 
  BookOpen, 
  Activity, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  Trophy, 
  Sparkles, 
  RefreshCw,
  Terminal, 
  GraduationCap, 
  Clock,
  Check,
  Percent,
  Cpu,
  Bookmark
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'sandbox'>('curriculum');
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  
  // Progression Storage state
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<{ [modId: string]: number }>({});
  const [completedAssignments, setCompletedAssignments] = useState<string[]>([]);

  // Certificate generator info
  const [studentName, setStudentName] = useState<string>('');
  const [hasClaimedCertificate, setHasClaimedCertificate] = useState<boolean>(false);
  const [certificateSerial, setCertificateSerial] = useState<string>('');

  // Load from database (localstorage) inside mounting
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('devops_net_completed_modules');
      const savedQuizScores = localStorage.getItem('devops_net_quiz_scores');
      const savedAssignments = localStorage.getItem('devops_net_completed_assignments');
      const savedCertClaimed = localStorage.getItem('devops_net_cert_claimed');
      const savedCertName = localStorage.getItem('devops_net_cert_name');
      const savedCertSerial = localStorage.getItem('devops_net_cert_serial');

      if (savedCompleted) setCompletedModules(JSON.parse(savedCompleted));
      if (savedQuizScores) setQuizScores(JSON.parse(savedQuizScores));
      if (savedAssignments) setCompletedAssignments(JSON.parse(savedAssignments));
      if (savedCertClaimed === 'true') setHasClaimedCertificate(true);
      if (savedCertName) setStudentName(savedCertName);
      if (savedCertSerial) {
        setCertificateSerial(savedCertSerial);
      } else {
        const generatedSerial = `CERT-NET-${Math.floor(100000 + Math.random() * 900000)}`;
        setCertificateSerial(generatedSerial);
        localStorage.setItem('devops_net_cert_serial', generatedSerial);
      }
    } catch (e) {
      console.error("LocalStorage parsing exception", e);
    }
  }, []);

  const saveProgression = (completed: string[], quizzes: typeof quizScores, assignments: string[]) => {
    try {
      localStorage.setItem('devops_net_completed_modules', JSON.stringify(completed));
      localStorage.setItem('devops_net_quiz_scores', JSON.stringify(quizzes));
      localStorage.setItem('devops_net_completed_assignments', JSON.stringify(assignments));
    } catch (e) {
      console.error("LocalStorage persist error", e);
    }
  };

  const activeModule = LEARNING_CURRICULUM[activeModuleIndex];

  // Grade helpers
  const handleQuizSuccess = (score: number) => {
    const modId = activeModule.id;
    const currentHigh = quizScores[modId] || 0;
    const nextScores = { ...quizScores, [modId]: Math.max(currentHigh, score) };
    setQuizScores(nextScores);

    // Evaluate if module is fully completed
    const nextCompleted = [...completedModules];
    const isAssignmentComplete = completedAssignments.includes(activeModule.assignment.id);
    
    // Module marked fully cleared if assignment is finished and quiz scored >= 1
    if (score >= 1 && isAssignmentComplete && !nextCompleted.includes(modId)) {
      nextCompleted.push(modId);
      setCompletedModules(nextCompleted);
    }

    saveProgression(nextCompleted, nextScores, completedAssignments);
  };

  const handleAssignmentSuccess = () => {
    const assignId = activeModule.assignment.id;
    if (completedAssignments.includes(assignId)) return;

    const nextAssignments = [...completedAssignments, assignId];
    setCompletedAssignments(nextAssignments);

    // Evaluate module completion
    const nextCompleted = [...completedModules];
    const hasQuizScore = (quizScores[activeModule.id] || 0) >= 1;
    if (hasQuizScore && !nextCompleted.includes(activeModule.id)) {
      nextCompleted.push(activeModule.id);
      setCompletedModules(nextCompleted);
    }

    saveProgression(nextCompleted, quizScores, nextAssignments);
  };

  const resetAllProgress = () => {
    if (window.confirm("Are you sure you want to reset all your DevOps Network Academy learning progress?")) {
      setCompletedModules([]);
      setQuizScores({});
      setCompletedAssignments([]);
      setHasClaimedCertificate(false);
      setStudentName('');
      localStorage.clear();
      setActiveModuleIndex(0);
    }
  };

  // Progression calculation counters
  const totalSteps = LEARNING_CURRICULUM.length;
  const completedAssignmentsCount = completedAssignments.length;
  const totalQuizzesPassed = Object.values(quizScores).filter((s) => (s as number) >= 1).length;
  const totalCompletedModulesCount = completedModules.length;

  const totalCourseProgressPoints = Math.round(
    ((completedAssignmentsCount + totalQuizzesPassed) / (totalSteps * 2)) * 100
  );

  const isCourseFullyCompleted = totalCompletedModulesCount === totalSteps;

  const claimCertificateAction = () => {
    if (!studentName.trim()) {
      alert("Please write your valid human name to append in credentials certification.");
      return;
    }
    setHasClaimedCertificate(true);
    localStorage.setItem('devops_net_cert_claimed', 'true');
    localStorage.setItem('devops_net_cert_name', studentName);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-950" id="main-academy-root">
      
      {/* 🚀 Top Navigation Dashboard Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100/80 sticky top-0 z-30 shadow-sm" id="top-navbar-hdr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo Title */}
          <div className="flex items-center gap-3" id="brand-logo-section">
            <div className="h-10 w-10 bg-linear-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase sm:text-base">NetOps Academy</h1>
              <p className="text-[10px] text-indigo-600 font-mono font-extrabold tracking-wide">ZERO TO DEVOPS HERO PLAYGROUND</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60" id="navbar-tab-controls">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold select-none flex items-center gap-1.5 transition-all ${
                activeTab === 'curriculum' 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              id="tab-btn-curriculum"
            >
              <BookOpen className="h-3.5 w-3.5" /> Course Syllabus
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold select-none flex items-center gap-1.5 transition-all ${
                activeTab === 'sandbox' 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              id="tab-btn-sandbox"
            >
              <Activity className="h-3.5 w-3.5" /> Network Sandbox Simulator
            </button>
          </div>

          {/* Percentage tracker */}
          <div className="hidden md:flex items-center gap-2" id="nav-percent-tracker">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-semibold">Course Progress</span>
              <span className="text-xs font-mono font-bold text-orange-600" id="progress-percent-label">{totalCourseProgressPoints}% Completed</span>
            </div>
            <div className="w-20 bg-slate-200 h-2 rounded-full border border-slate-300 overflow-hidden">
              <div 
                className="bg-linear-to-r from-orange-500 to-amber-500 h-full transition-all duration-500"
                style={{ width: `${totalCourseProgressPoints}%` }}
                id="progress-percent-bar"
              ></div>
            </div>
          </div>

        </div>
      </header>


      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" id="primary-app-container">
        
        {activeTab === 'sandbox' ? (
          /* ================= GLOBAL FLOATING SANDBOX PLAYGROUND TAP ================= */
          <div className="space-y-6" id="floating-sandbox-pane">
            <div className="p-6 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-700/35 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-indigo-950/20" id="sandbox-intro-alert">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-400 animate-pulse" /> Complete Network Sandbox Environment
                </h2>
                <p className="text-xs text-indigo-200 mt-1 leading-relaxed max-w-3xl">
                  This simulation platform is fully detached from any specific reader slide. Experiment with custom port translation, Nginx failover, and SG firewalls!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('curriculum')}
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 font-bold text-xs text-white px-5 py-3 rounded-xl transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-orange-500/20 shrink-0"
                id="back-to-course-btn"
              >
                Go Back to Courseware
              </button>
            </div>

            <NetworkSimulator />
          </div>
        ) : (
          /* ================= LESSON CONTENT PAGE / CURRICULUM TIMELINE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="curriculum-view-grid">
            
            {/* Sidebar Module selection */}
            <nav className="lg:col-span-4 p-5 bg-white border border-indigo-100/90 rounded-2xl shadow-sm space-y-6" id="syllabus-timeline-sidebar">
              
              <div id="syllabus-header">
                <span className="text-[10px] text-orange-600 tracking-wider font-extrabold uppercase block font-mono">Module Index</span>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">Syllabus Path Roadmap</h3>
              </div>

              {/* Progress metrics bars */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-mono border-y border-indigo-50/80 py-4.5" id="stats-badge-timeline">
                <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/40">
                  <span className="text-slate-500 block text-[9px] mb-0.5 font-sans font-bold">QUIZZES</span>
                  <span className="font-extrabold text-indigo-600 text-xs">{totalQuizzesPassed} / {totalSteps}</span>
                </div>
                <div className="bg-orange-50/40 p-2.5 rounded-xl border border-orange-100/40">
                  <span className="text-slate-500 block text-[9px] mb-0.5 font-sans font-bold">ASSIGN</span>
                  <span className="font-extrabold text-orange-600 text-xs">{completedAssignmentsCount} / {totalSteps}</span>
                </div>
                <div className="bg-emerald-50/45 p-2.5 rounded-xl border border-emerald-100/40">
                  <span className="text-slate-500 block text-[9px] mb-0.5 font-sans font-bold">CLEARED</span>
                  <span className="font-extrabold text-emerald-600 text-xs">{totalCompletedModulesCount} / {totalSteps}</span>
                </div>
              </div>

              {/* List of Module Items triggers */}
              <div className="space-y-3" id="modules-list-container">
                {LEARNING_CURRICULUM.map((mod, idx) => {
                  const isActive = idx === activeModuleIndex;
                  const isModCleared = completedModules.includes(mod.id);
                  const isAssignmentDone = completedAssignments.includes(mod.assignment.id);
                  const quizScore = quizScores[mod.id] || 0;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModuleIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                        isActive 
                          ? 'bg-linear-to-br from-indigo-50 to-white border-indigo-500 scale-[1.01] shadow-md shadow-indigo-100/40' 
                          : 'bg-slate-50 border-slate-200/65 hover:bg-white hover:border-indigo-200'
                      }`}
                      id={`mod-roadmap-btn-${mod.id}`}
                    >

                      {/* Check icon or index indicators */}
                      <span className={`h-6 w-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                        isModCleared 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' 
                          : isActive 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-slate-150 border-slate-200 text-slate-500 group-hover:text-slate-700'
                      }`} id={`mod-step-badge-${mod.id}`}>
                        {isModCleared ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </span>

                      {/* Info lines */}
                      <div className="flex-1 space-y-1" id={`mod-step-info-${mod.id}`}>
                        <span className={`text-xs block font-extrabold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                          {mod.title.replace(/^\d+\.\s*/, '')}
                        </span>
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-0.5"><Clock className="h-3.5 w-3.5" /> {mod.estimatedTime}</span>
                          <span className="text-slate-300">•</span>
                          {isAssignmentDone && <span className="text-orange-600 font-bold uppercase tracking-wider text-[8px] bg-orange-50 px-1 rounded border border-orange-100">Assign done</span>}
                          {quizScore >= 1 && <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px] bg-indigo-50 px-1 rounded border border-indigo-100">Quiz pass</span>}
                        </div>
                      </div>

                      {/* Selection arrows */}
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Utility command triggers */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400" id="playlist-foot">
                <button 
                  onClick={resetAllProgress}
                  className="hover:text-rose-500 hover:font-bold underline font-mono select-none transition-colors"
                  id="reset-prog-btn"
                >
                  Reset Progress Data
                </button>
                <span>Syllabus Version: 1.0.4</span>
              </div>

            </nav>


            {/* Main Interactive learning slides pane */}
            <div className="lg:col-span-8 space-y-8" id="interactive-assessment-pane">
              
              {/* 1. Theory Slides / Lesson blocks */}
              <LessonReader module={activeModule} />

              {/* 2. Embedded Sandbox Simulator context-aware */}
              <div className="bg-white border border-indigo-100/90 p-5 md:p-6 rounded-2xl space-y-4 shadow-sm" id="embedded-sandbox-container">
                <div className="flex items-center gap-2.5" id="embedded-sandbox-hdr">
                  <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100/60">
                    <Bookmark className="h-4.5 w-4.5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">Module Application Sandbox</h3>
                    <p className="text-xs font-semibold text-slate-700">Dynamic hands-on labs for {activeModule.title}</p>
                  </div>
                </div>
                
                {activeModuleIndex === 0 && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/30 p-3 rounded-lg border border-indigo-100/40">
                    Inside this slide we recommend playing with the <strong className="text-indigo-600">Port-Mapping Tab</strong> inside the interactive simulator. Adjust values and watch host routing resolve correctly!
                  </p>
                )}
                {activeModuleIndex === 1 && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/30 p-3 rounded-lg border border-indigo-100/40">
                    Test the <strong className="text-indigo-600">Load Balancing/Nginx Router Tab</strong> or study connection isolation inside the <strong className="text-indigo-600">Firewall Tab</strong>!
                  </p>
                )}
                {activeModuleIndex > 1 && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/30 p-3 rounded-lg border border-indigo-100/40">
                    Try out the <strong className="text-indigo-600">Firewall VPC Tab</strong> below. Toggle rule limits on Postgres database ingress and see who can query database systems!
                  </p>
                )}

                <NetworkSimulator />
              </div>

              {/* 3. Quiz Panel */}
              <QuizEngine 
                questions={activeModule.quizzes} 
                onSuccess={handleQuizSuccess}
                savedHighScore={quizScores[activeModule.id]}
              />

              {/* 4. Practical Configure assignments code editor */}
              <AssignmentWorkspace 
                assignment={activeModule.assignment}
                onSuccess={handleAssignmentSuccess}
                isCompleted={completedAssignments.includes(activeModule.assignment.id)}
              />

              {/* 5. Course Completion & Premium Digital Certification card generator */}
              {isCourseFullyCompleted && (
                <div className="bg-white border border-indigo-100/90 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-sm" id="graduation-certificate-section">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-orange-400/5 blur-3xl rounded-full"></div>
                  
                  <div className="flex items-center gap-2 text-orange-600 animate-pulse" id="graduation-unlocked-hdr">
                    <Trophy className="h-5 w-5" />
                    <span className="text-xs font-extrabold uppercase tracking-wider font-mono">Academy Graduation Unlocked</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Claim your DevOps Networking Specialist Certificate!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You have passed all modules, finished matching YAML routing lines, and solved quiz parameters. Put down your name below to instantly generate your credentials.
                    </p>
                  </div>

                  {!hasClaimedCertificate ? (
                    <div className="flex flex-col sm:flex-row gap-3" id="certificate-claim-form">
                      <input 
                        type="text" 
                        placeholder="Write Your Name (For printing on certificate)..." 
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4.5 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                        id="student-name-input-field"
                      />
                      <button
                        onClick={claimCertificateAction}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all hover:scale-[1.01] cursor-pointer shadow-lg shadow-orange-500/10 shrink-0"
                        id="issue-cert-action-btn"
                      >
                        <Sparkles className="h-4 w-4 inline mr-1" /> Issue Certificate
                      </button>
                    </div>
                  ) : (
                    /* Dynamic rendered diploma certificate frame graphic */
                    <div className="bg-linear-to-br from-indigo-950 to-slate-950 border-4 border-amber-500/40 rounded-xl p-6 md:p-8 text-center space-y-6 relative shadow-2xl" id="rendered-credential-diploma">
                      {/* background certificate pattern */}
                      <div className="absolute inset-2 border border-amber-500/20 border-dashed pointer-events-none"></div>

                      <div className="space-y-1 pb-4 border-b border-amber-500/20 max-w-md mx-auto">
                        <h4 className="font-serif italic text-amber-500 text-xl font-medium">Certificate of Accomplishment</h4>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">DevOps Networking Specialist Board</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-400">This certifies that senior student</p>
                        <p className="font-sans font-extrabold text-2xl tracking-tight underline adornment bg-linear-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">{studentName}</p>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto px-4">
                          has successfully mastered core server communication layouts. In recognition of finishing modules regarding <strong>IP Subnet Translations, Private Docker Bridge Connections, Kubernetes Overlay Concepts, DNS Record mappings, Reverse Proxy Load-balancing (Nginx), and VPC Firewall Isolation zones</strong>.
                        </p>
                      </div>

                      <div className="pt-6 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-xl mx-auto text-left font-mono text-[9px] text-slate-400">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500">AUTHORIZED STAMP SIGNATURE:</span>
                          <span className="font-serif italic text-amber-400 block text-xs mt-1">Wali Muhammad</span>
                          <span className="block">Lead Systems & Infrastructure Architect</span>
                        </div>
                        
                        <div className="text-center sm:text-right">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500">CREDENTIAL ID KEY:</span>
                          <span className="text-slate-200 font-semibold block uppercase mt-1">{certificateSerial}</span>
                          <span className="block">ISSUED DATE: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* print/share instructions */}
                      <div className="pt-2 text-[10px] text-slate-400 italic font-mono">
                        Take a screenshot of this certified credential to share inside your DevOps Resume / Portfolio! Excellent!
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Module step navigator panel */}
              <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-sm" id="modules-pager-container">
                <button
                  onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeModuleIndex === 0}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border select-none ${
                    activeModuleIndex === 0 
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-300 border-indigo-100 cursor-pointer shadow-sm'
                  }`}
                  id="navigate-prev-mod-btn"
                >
                  Previous Module
                </button>
                <button
                  onClick={() => setActiveModuleIndex(prev => Math.min(LEARNING_CURRICULUM.length - 1, prev + 1))}
                  disabled={activeModuleIndex === LEARNING_CURRICULUM.length - 1}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all select-none ${
                    activeModuleIndex === LEARNING_CURRICULUM.length - 1
                      ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01] cursor-pointer shadow-md shadow-indigo-600/10'
                  }`}
                  id="navigate-next-mod-btn"
                >
                  Next Module
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer footer-bar design details */}
      <footer className="bg-white border-t border-indigo-50/80 text-slate-500 text-center py-8 mt-16 text-xs space-y-2" id="academy-footer-bar">
        <p className="font-semibold text-slate-700">© 2026 NetOps Academy. Built for students with simple wording, interactive simulations, and configuration playgrounds.</p>
        <p className="text-[10px] text-slate-500">Vibrant theme styling. Built with React, Vite, and tailwind typography tokens.</p>
      </footer>


    </div>
  );
}
