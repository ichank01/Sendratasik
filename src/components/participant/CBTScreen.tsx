import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api.js';
import { Attempt, AttemptQuestionSnapshot } from '../../types.js';
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Sparkles,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CBTScreenProps {
  initialAttempt: Attempt;
  initialQuestions: any[];
  initialAnswers: Record<string, { selected_display_key: string | null; is_doubtful: boolean }>;
  serverTime: string;
  onFinish: (result: any) => void;
}

export const CBTScreen: React.FC<CBTScreenProps> = ({
  initialAttempt,
  initialQuestions,
  initialAnswers,
  serverTime,
  onFinish
}) => {
  const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
  const [questions] = useState<any[]>(initialQuestions);
  const [answers, setAnswers] = useState<Record<string, { selected_display_key: string | null; is_doubtful: boolean }>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Timer calculation
  const serverOffset = useRef<number>(new Date(serverTime).getTime() - Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const expireTime = new Date(initialAttempt.expires_at).getTime();
    const currentAdjusted = Date.now() + serverOffset.current;
    return Math.max(0, Math.floor((expireTime - currentAdjusted) / 1000));
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [integrityWarning, setIntegrityWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.question_id] : null;

  // 1. Synchronized Server Countdown Timer & Periodic Heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      const expireTime = new Date(attempt.expires_at).getTime();
      const currentAdjusted = Date.now() + serverOffset.current;
      const rem = Math.max(0, Math.floor((expireTime - currentAdjusted) / 1000));
      setSecondsRemaining(rem);

      if (rem <= 0) {
        clearInterval(timer);
        handleFinalSubmit(true); // Auto-submit when time is up
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt.expires_at]);

  // Periodic heartbeat sync with server (every 15 seconds)
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      if (!isOnline) return;
      try {
        const res = await apiRequest('/cbt/heartbeat', {
          method: 'POST',
          body: JSON.stringify({ attempt_id: attempt.id })
        });

        if (res.status === 'completed') {
          // If admin force-submitted or timer expired on server
          handleFinalSubmit(true);
        } else if (res.expires_at && res.expires_at !== attempt.expires_at) {
          // Admin extended exam duration!
          setAttempt(prev => ({ ...prev, expires_at: res.expires_at }));
          setIntegrityWarning('Pemberitahuan: Waktu ujian Anda telah diperbarui oleh Admin / Pembina.');
          setTimeout(() => setIntegrityWarning(null), 5000);
        }
      } catch (err) {
        // Silently ignore transient network drops
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [attempt.id, attempt.expires_at, isOnline]);

  // 2. Anti-Cheating & Integrity Event Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportIntegrityEvent('TAB_SWITCH');
        setIntegrityWarning('Peringatan: Sistem mendeteksi perpindahan tab atau aplikasi. Aktivitas ini dicatat dalam log integritas.');
      }
    };

    const handleFullscreenChange = () => {
      const inFull = Boolean(document.fullscreenElement);
      setIsFullscreen(inFull);
      if (!inFull) {
        reportIntegrityEvent('FULLSCREEN_EXIT');
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attempt.id]);

  // 3. Keyboard Shortcuts for Option Selection (A, B, C, D, E) & Navigation (Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        handleOptionSelect(key as any);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (key === 'R') {
        toggleDoubtful();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, currentAnswer, showSubmitModal]);

  const reportIntegrityEvent = async (eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'PAGE_REFRESH') => {
    try {
      await apiRequest('/cbt/integrity-event', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          event_type: eventType
        })
      });
    } catch (e) {
      console.error('Failed to log event', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleOptionSelect = async (displayKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQ) return;
    const isAlreadySelected = currentAnswer?.selected_display_key === displayKey;
    const newSelectedKey = isAlreadySelected ? null : displayKey;
    const isDoubt = currentAnswer?.is_doubtful || false;

    // Optimistic UI update
    setAnswers(prev => ({
      ...prev,
      [currentQ.question_id]: {
        selected_display_key: newSelectedKey,
        is_doubtful: isDoubt
      }
    }));

    // Server-side Autosave
    setIsSaving(true);
    try {
      await apiRequest('/cbt/answer', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          question_id: currentQ.question_id,
          selected_display_key: newSelectedKey,
          is_doubtful: isDoubt
        })
      });
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDoubtful = async () => {
    if (!currentQ) return;
    const currentOpt = currentAnswer?.selected_display_key || null;
    const newDoubtful = !currentAnswer?.is_doubtful;

    setAnswers(prev => ({
      ...prev,
      [currentQ.question_id]: {
        selected_display_key: currentOpt,
        is_doubtful: newDoubtful
      }
    }));

    setIsSaving(true);
    try {
      await apiRequest('/cbt/answer', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          question_id: currentQ.question_id,
          selected_display_key: currentOpt,
          is_doubtful: newDoubtful
        })
      });
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async (isAuto = false) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/cbt/submit', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          is_auto: isAuto
        })
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onFinish(res.result);
    } catch (err: any) {
      alert(err.message || 'Gagal menyerahkan ujian. Coba beberapa saat lagi.');
      setIsSubmitting(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Counts
  const answeredCount = Object.values(answers).filter((a: any) => a.selected_display_key !== null).length;
  const doubtfulCount = Object.values(answers).filter((a: any) => a.is_doubtful).length;
  const unansweredCount = questions.length - answeredCount;
  const isTimeCritical = secondsRemaining < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-between select-none">
      
      {/* 1. TOP STATUS & NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#0D0D0D] border-b border-[#222] px-4 sm:px-6 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Exam & Question Indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNavDrawer(true)}
              className="lg:hidden p-2 rounded-lg bg-[#181818] text-[#AAA] hover:text-white hover:bg-[#222] border border-[#282828]"
              title="Daftar Soal"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-[#FF3E00] font-mono tracking-wider uppercase">
                  SOAL NO. {currentIndex + 1}
                </span>
                <span className="text-xs text-[#666] font-bold">
                  / {questions.length}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold truncate max-w-[180px] sm:max-w-xs">
                {currentQ?.competency_name}
              </p>
            </div>
          </div>

          {/* Autosave & Network Status */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-[#777]">
            {isOnline ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <Wifi className="w-3.5 h-3.5" />
                <span>Terhubung</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-400 font-bold uppercase tracking-wider text-[10px] animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Koneksi Terputus</span>
              </span>
            )}

            <span className="text-[#333]">•</span>

            {isSaving ? (
              <span className="flex items-center space-x-1 text-[#FF3E00] font-bold uppercase tracking-wider text-[10px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersimpan di Server</span>
              </span>
            )}
          </div>

          {/* Timer & Fullscreen */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-mono text-sm font-black border transition-colors ${
                isTimeCritical
                  ? 'bg-[#290F0F] border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-[#161616] border-[#2A2A2A] text-[#FF3E00]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#FF3E00]" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-[#181818] border border-[#282828] text-[#888] hover:text-white hover:border-[#FF3E00] transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Integrity Warning Alert (if any) */}
      {integrityWarning && (
        <div className="bg-[#2E120A] border-b border-[#FF3E00]/40 text-[#FF8A65] px-4 py-2.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#FF3E00] shrink-0" />
            <span>{integrityWarning}</span>
          </div>
          <button
            onClick={() => setIntegrityWarning(null)}
            className="text-[#FF3E00] hover:text-white font-black text-sm px-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. MAIN QUESTION & NAVIGATION AREA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT / CENTER: Question Content */}
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Question Card */}
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-[#FF3E00]/15 text-[#FF3E00] border border-[#FF3E00]/30">
                  {currentQ?.competency_name}
                </span>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#181818] border border-[#2A2A2A] text-[#888]">
                  {currentQ?.difficulty}
                </span>
              </div>

              <button
                onClick={toggleDoubtful}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                  currentAnswer?.is_doubtful
                    ? 'bg-[#FF3E00] text-white border-[#FF3E00]'
                    : 'bg-[#181818] text-[#888] border-[#2A2A2A] hover:text-white hover:border-[#FF3E00]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{currentAnswer?.is_doubtful ? 'Ragu-Ragu (Ditandai)' : 'Tandai Ragu (R)'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F5F5F5] leading-relaxed">
                {currentQ?.question_text}
              </h2>
            </div>

            {/* 5 Options (A, B, C, D, E) */}
            <div className="space-y-3">
              {currentQ?.options?.map((opt: any) => {
                const isSelected = currentAnswer?.selected_display_key === opt.display_key;
                return (
                  <button
                    key={opt.display_key}
                    onClick={() => handleOptionSelect(opt.display_key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF3E00]/10 border-[#FF3E00] text-white shadow-lg shadow-[#FF3E00]/10 ring-1 ring-[#FF3E00]'
                        : 'bg-[#0A0A0A] border-[#222] text-[#AAA] hover:bg-[#161616] hover:border-[#333] hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-black font-mono text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#FF3E00] text-white'
                          : 'bg-[#181818] text-[#777] border border-[#2C2C2C]'
                      }`}
                    >
                      {opt.display_key}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm pt-0.5 leading-normal font-medium">
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Bottom Action & Paging Bar */}
          <div className="flex items-center justify-between mt-6 pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#181818] hover:bg-[#242424] border border-[#282828] text-[#AAA] hover:text-white disabled:opacity-30 disabled:hover:bg-[#181818] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Kumpulkan Ujian</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-[#FF3E00] hover:bg-[#E03700] text-white shadow-xl shadow-[#FF3E00]/25 transition-all cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* RIGHT (DESKTOP) & DRAWER (MOBILE): Question Navigation Grid */}
        <aside
          className={`lg:w-80 bg-[#121212] border border-[#242424] rounded-2xl p-5 shadow-2xl flex flex-col justify-between ${
            showNavDrawer
              ? 'fixed inset-y-0 right-0 z-50 w-80 shadow-2xl overflow-y-auto block bg-[#121212]'
              : 'hidden lg:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#AAA]">
                Navigasi Soal
              </h3>
              {showNavDrawer && (
                <button
                  onClick={() => setShowNavDrawer(false)}
                  className="p-1 rounded-lg text-[#888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-4">
              <div className="bg-[#0F291E] border border-emerald-800/40 p-2 rounded-lg text-emerald-300 font-bold">
                <div className="font-mono text-sm">{answeredCount}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#888] font-bold">Terjawab</div>
              </div>
              <div className="bg-[#2E120A] border border-[#FF3E00]/40 p-2 rounded-lg text-[#FF8A65] font-bold">
                <div className="font-mono text-sm">{doubtfulCount}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#888] font-bold">Ragu</div>
              </div>
              <div className="bg-[#181818] border border-[#2A2A2A] p-2 rounded-lg text-[#888] font-bold">
                <div className="font-mono text-sm">{unansweredCount}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#666] font-bold">Kosong</div>
              </div>
            </div>

            {/* Question Number Pills Grid (60 questions) */}
            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const ans = answers[q.question_id];
                const isSelected = ans?.selected_display_key !== null && ans?.selected_display_key !== undefined;
                const isDoubt = ans?.is_doubtful;
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-[#0A0A0A] text-[#666] border-[#222] hover:bg-[#1A1A1A] hover:text-[#CCC]';
                if (isDoubt) {
                  btnClass = 'bg-[#FF3E00] text-white font-black border-[#FF3E00]';
                } else if (isSelected) {
                  btnClass = 'bg-emerald-600 text-white font-bold border-emerald-500';
                }

                if (isCurrent) {
                  btnClass += ' ring-2 ring-[#FF3E00] ring-offset-2 ring-offset-[#121212]';
                }

                return (
                  <button
                    key={q.question_id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavDrawer(false);
                    }}
                    className={`h-9 rounded-lg text-xs font-mono font-bold border flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#222] mt-4">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 rounded-lg bg-[#181818] hover:bg-[#252525] border border-[#2A2A2A] hover:border-[#FF3E00] text-[#CCC] hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Selesai & Kumpulkan</span>
            </button>
          </div>
        </aside>

      </main>

      {/* 3. CONFIRMATION SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#242424] rounded-2xl w-full max-w-md p-6 shadow-2xl text-[#F5F5F5] relative">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF3E00] font-bold block mb-1">Penyelesaian Ujian</span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Konfirmasi Pengumpulan
            </h3>
            <p className="text-xs text-[#888] mb-4 leading-relaxed">
              Pastikan seluruh jawaban Anda telah diperiksa. Setelah diserahkan, Anda tidak dapat mengubah jawaban kembali.
            </p>

            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222] space-y-2.5 text-xs mb-5 font-medium">
              <div className="flex justify-between text-[#AAA]">
                <span>Total Soal:</span>
                <span className="font-mono font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Sudah Terjawab:</span>
                <span className="font-mono font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-[#FF7043]">
                <span>Masih Ragu-Ragu:</span>
                <span className="font-mono font-bold">{doubtfulCount}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Belum Terjawab:</span>
                <span className="font-mono font-bold">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-[#2B0E0E] border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Masih ada {unansweredCount} soal yang belum dijawab!</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#181818] hover:bg-[#252525] border border-[#2A2A2A] text-[#888] hover:text-white transition-colors cursor-pointer"
              >
                Kembali Periksa
              </button>

              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-[#FF3E00] hover:bg-[#E03700] text-white shadow-xl shadow-[#FF3E00]/25 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>Ya, Kumpulkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
