import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../lib/api.js';
import { CBTScreen } from './CBTScreen.js';
import { ParticipantResultView } from './ParticipantResultView.js';
import {
  Clock,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Play,
  Award,
  Sparkles,
  User,
  Layers,
  HelpCircle,
  Loader2
} from 'lucide-react';

export const ParticipantDashboard: React.FC = () => {
  const { user, participant, refreshProfile } = useAuth();
  
  const [examData, setExamData] = useState<any>(null);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Active CBT session state
  const [cbtSession, setCbtSession] = useState<{
    attempt: any;
    questions: any[];
    answers: any;
    serverTime: string;
  } | null>(null);

  // Result state
  const [showResultView, setShowResultView] = useState<boolean>(false);
  const [resultData, setResultData] = useState<any>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const fetchActiveExam = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/cbt/active-exam');
      setExamData(res.exam);
      setActiveAttempt(res.activeAttempt);
      setHasCompleted(res.hasCompleted);

      if (res.hasCompleted) {
        // Fetch completed result
        try {
          const resResult = await apiRequest('/cbt/result');
          setResultData(resResult);
        } catch (e) {
          console.warn('Result not yet ready', e);
        }
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveExam();
  }, []);

  const handleStartExam = async () => {
    setIsStarting(true);
    try {
      const res = await apiRequest('/cbt/start', { method: 'POST' });
      setCbtSession({
        attempt: res.attempt,
        questions: res.questions,
        answers: res.answers,
        serverTime: res.server_time
      });
    } catch (err: any) {
      alert(err.message || 'Gagal memulai ujian CBT.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleFinishExam = (result: any) => {
    setCbtSession(null);
    setResultData(result);
    setShowResultView(true);
    setHasCompleted(true);
    fetchActiveExam();
  };

  // If in active CBT session, render full screen CBT
  if (cbtSession) {
    return (
      <CBTScreen
        initialAttempt={cbtSession.attempt}
        initialQuestions={cbtSession.questions}
        initialAnswers={cbtSession.answers}
        serverTime={cbtSession.serverTime}
        onFinish={handleFinishExam}
      />
    );
  }

  // If viewing results
  if (showResultView && resultData) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ParticipantResultView
          result={resultData}
          onBackToDashboard={() => setShowResultView(false)}
        />
      </main>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#888]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-9 h-9 animate-spin text-[#FF3E00]" />
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#AAA]">Memuat data peserta & sesi ujian...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Welcome Card & Candidate Profile */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#FF3E00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-[#FF3E00] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#FF3E00]/25 shrink-0">
              {participant?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  {participant?.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#FF3E00]/15 text-[#FF3E00] border border-[#FF3E00]/30">
                  Calon Eksekutif
                </span>
              </div>
              <p className="text-xs text-[#888] mt-1 font-medium">
                NISN: <span className="font-mono text-white font-bold">{participant?.nisn}</span> • KELAS {participant?.class_grade} ({participant?.major})
              </p>

              <div className="flex flex-wrap gap-2 mt-3.5 text-xs">
                <span className="px-3 py-1 rounded-lg bg-[#0A0A0A] border border-[#242424] text-[#AAA]">
                  Pilihan Utama: <strong className="text-[#FF3E00] font-bold">{participant?.primary_choice}</strong>
                </span>
                {participant?.alternative_choice && (
                  <span className="px-3 py-1 rounded-lg bg-[#0A0A0A] border border-[#242424] text-[#888]">
                    Alternatif: <strong className="text-[#DDD] font-medium">{participant?.alternative_choice}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[10px] text-[#666] uppercase font-bold tracking-[0.2em] mb-1.5">
              Status Ujian CBT
            </span>
            {hasCompleted ? (
              <span className="px-3.5 py-1.5 rounded-lg bg-[#0F291E] border border-emerald-800/60 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Selesai Dikerjakan</span>
              </span>
            ) : activeAttempt ? (
              <span className="px-3.5 py-1.5 rounded-lg bg-[#2E120A] border border-[#FF3E00]/50 text-[#FF7043] font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 animate-pulse">
                <Clock className="w-4 h-4 text-[#FF3E00]" />
                <span>Sedang Berlangsung</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-lg bg-[#181818] border border-[#2C2C2C] text-[#AAA] font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-[#FF3E00]" />
                <span>Siap Dikerjakan</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Action Card (Start / Resume / View Result) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Exam Details & Actions */}
        <div className="md:col-span-2 bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-[#FF3E00] text-[10px] font-black uppercase tracking-[0.25em] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tes Kemampuan Pengambilan Keputusan Organisasi (SJT)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {examData?.title || 'Seleksi Eksekutif SENDRATASIK 2026'}
            </h3>
            <p className="text-xs sm:text-sm text-[#888] mt-2.5 leading-relaxed">
              Tes ini mengukur kesiapan kepemimpinan, komunikasi, pemecahan masalah, integritas, dan adaptabilitas Anda melalui skenario situasi nyata dalam organisasi seni madrasah.
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#666] block">Jumlah Soal</span>
                <span className="text-lg font-black text-[#F5F5F5] font-mono mt-0.5 block">
                  {examData?.total_questions || 60} BUTIR
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#666] block">Alokasi Waktu</span>
                <span className="text-lg font-black text-[#FF3E00] font-mono mt-0.5 block">
                  {examData?.duration_minutes || 60} MENIT
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#666] block">Tipe Soal</span>
                <span className="text-lg font-black text-[#F5F5F5] uppercase mt-0.5 block">
                  SJT 5 Opsi
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            {hasCompleted ? (
              <button
                onClick={() => setShowResultView(true)}
                className="w-full py-4 px-6 rounded-xl bg-[#0F291E] hover:bg-[#133829] border border-emerald-700/50 text-emerald-300 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
              >
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Lihat Hasil & Rekomendasi Seleksi</span>
              </button>
            ) : activeAttempt ? (
              <button
                onClick={handleStartExam}
                disabled={isStarting}
                className="w-full py-4 px-6 rounded-xl bg-[#FF3E00] hover:bg-[#E03700] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FF3E00]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                <span>Lanjutkan Pengerjaan Ujian</span>
              </button>
            ) : (
              <button
                onClick={handleStartExam}
                disabled={isStarting}
                className="w-full py-4 px-6 rounded-xl bg-[#FF3E00] hover:bg-[#E03700] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FF3E00]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                <span>Mulai Tes CBT Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Rules & Tips */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#FF3E00]" />
              <span>Tata Tertib & Petunjuk</span>
            </h4>

            <ul className="space-y-3.5 text-xs text-[#AAA]">
              <li className="flex items-start space-x-2">
                <span className="text-[#FF3E00] font-black">•</span>
                <span>Pilihlah satu opsi tindakan yang menurut Anda <strong className="text-white">paling efektif dan bijaksana</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#FF3E00] font-black">•</span>
                <span>Seluruh jawaban tersimpan otomatis di server setiap kali Anda memilih opsi.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#FF3E00] font-black">•</span>
                <span>Gunakan fitur <strong className="text-white">Ragu-Ragu (R)</strong> jika Anda ingin meninjau kembali jawaban.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#FF3E00] font-black">•</span>
                <span><strong className="text-[#FF7043]">Dilarang berpindah tab</strong> atau keluar dari layar ujian demi menjaga integritas tes.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] text-[11px] text-[#777] flex items-center space-x-2.5">
            <HelpCircle className="w-4 h-4 text-[#FF3E00] shrink-0" />
            <span>Jika mengalami kendala jaringan, refresh halaman untuk melanjutkan sesi.</span>
          </div>
        </div>

      </div>

    </main>
  );
};
