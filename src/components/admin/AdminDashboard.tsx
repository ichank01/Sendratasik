import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { CandidateAnalysisModal } from './CandidateAnalysisModal.js';
import {
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Settings,
  Layers,
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="p-16 text-center text-[#888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3E00] mx-auto mb-3" />
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AAA]">Memuat data analitik seleksi eksekutif...</span>
      </div>
    );
  }

  const overview = stats?.overview || {
    total_participants: stats?.total_participants ?? 0,
    completed_attempts: stats?.completed_attempts ?? stats?.completed_exams ?? 0,
    in_progress_attempts: stats?.in_progress_attempts ?? stats?.in_progress_exams ?? 0,
    average_score: stats?.average_score ?? 0,
    highest_score: stats?.highest_score ?? 0,
    lowest_score: stats?.lowest_score ?? 0
  };

  const competency_averages = Array.isArray(stats?.competency_averages) ? stats.competency_averages : [];
  const top_fit_per_position = Array.isArray(stats?.top_fit_per_position) ? stats.top_fit_per_position : (Array.isArray(stats?.top_candidates_per_position) ? stats.top_candidates_per_position : []);

  const radarData = competency_averages.map((ca: any) => ({
    subject: String(ca?.competency_name || ca?.code || ca?.competency_code || ca?.name || '-').slice(0, 14),
    fullName: ca?.competency_name || ca?.name || 'Kompetensi',
    score: ca?.avg_score ?? ca?.average ?? 0,
    fullMark: 100
  }));

  return (
    <div className="space-y-6">
      
      {/* 1. Hero KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Total Peserta</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF3E00]/10 text-[#FF3E00] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {overview.total_participants}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666] mt-1">Calon Terdaftar</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Selesai Ujian</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-3">
            {overview.completed_attempts}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666] mt-1">
            {overview.total_participants > 0
              ? `${Math.round((overview.completed_attempts / overview.total_participants) * 100)}% Partisipasi`
              : '0% Partisipasi'}
          </p>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Rata-Rata Skor</span>
            <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 text-[#FF3E00]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {overview.average_score}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666] mt-1">Skala 0 - 100 Standar SJT</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Nilai Tertinggi</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF3E00]/10 text-[#FF3E00] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#FF3E00] font-mono mt-3">
            {overview.highest_score}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666] mt-1">Terendah: {overview.lowest_score}</p>
        </div>

      </div>

      {/* 2. Charts Row: Competency Radar & Quick Action Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Competencies Radar Chart */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#FF3E00]" />
                <span>Rata-Rata Profil 12 Kompetensi Keseluruhan Peserta</span>
              </h3>
            </div>
            <p className="text-xs text-[#888] mb-4">
              Peta kekuatan agregat seluruh calon eksekutif SENDRATASIK yang telah menyelesaikan ujian.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#222222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#555555', fontSize: 9 }} />
                  <Radar name="Rata-rata Kelompok" dataKey="score" stroke="#FF3E00" fill="#FF3E00" fillOpacity={0.3} />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#333] text-xs shadow-2xl">
                            <p className="font-black text-white">{d.fullName}</p>
                            <p className="text-[#888] mt-1">Rata-rata: <span className="font-mono font-black text-[#FF3E00]">{d.score}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#666]">Belum ada data pengerjaan ujian.</div>
            )}
          </div>
        </div>

        {/* Quick Hub Navigation */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">
              Akses Cepat Pengelolaan
            </h3>
            <p className="text-xs text-[#888] mb-4 leading-relaxed">
              Navigasi langsung ke modul operasional seleksi eksekutif.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('results')}
                className="w-full p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#181818] border border-[#242424] hover:border-[#FF3E00] text-left text-xs font-bold text-[#CCC] hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-[#FF3E00]" />
                  <span>Rekapitulasi & Peringkat Seleksi</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#FF3E00] transition-colors" />
              </button>

              <button
                onClick={() => onNavigateTab('questions')}
                className="w-full p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#181818] border border-[#242424] hover:border-[#FF3E00] text-left text-xs font-bold text-[#CCC] hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-[#FF3E00]" />
                  <span>Bank Soal & Generator AI Gemini</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#FF3E00] transition-colors" />
              </button>

              <button
                onClick={() => onNavigateTab('compare')}
                className="w-full p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#181818] border border-[#242424] hover:border-[#FF3E00] text-left text-xs font-bold text-[#CCC] hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-[#FF3E00]" />
                  <span>Komparasi Multi-Kandidat</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#FF3E00] transition-colors" />
              </button>

              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#181818] border border-[#242424] hover:border-[#FF3E00] text-left text-xs font-bold text-[#CCC] hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Settings className="w-4 h-4 text-[#FF3E00]" />
                  <span>Pengaturan Ujian & Blueprint</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#FF3E00] transition-colors" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] text-[11px] text-[#888]">
            Sistem CBT menggunakan penilaian bobot berjenjang 1 s.d. 5 untuk menguji kematangan situasional.
          </div>
        </div>

      </div>

      {/* 3. Top Fit Candidate Per Position Table */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
              Kandidat Terbaik per Posisi Jabatan (Top Match)
            </h3>
            <p className="text-xs text-[#888] mt-1">
              Calon eksekutif dengan kesesuaian profil kompetensi tertinggi untuk setiap jabatan.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('results')}
            className="text-xs text-[#FF3E00] hover:underline font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {top_fit_per_position.map((item: any) => (
            <div
              key={item.position_id}
              className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222] flex flex-col justify-between hover:border-[#FF3E00] transition-colors"
            >
              <div>
                <span className="text-[10px] font-mono text-[#FF3E00] font-black uppercase tracking-wider block mb-1">
                  {item.position_name}
                </span>

                {item.top_candidate ? (
                  <div className="mt-2">
                    <div className="text-xs font-black uppercase text-white">
                      {item.top_candidate.name}
                    </div>
                    <div className="text-[11px] text-[#777] mt-0.5">
                      Kelas {item.top_candidate.class_grade} • Skor CBT: <strong className="text-white font-mono">{item.top_candidate.final_score}</strong>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181818] text-[#AAA] border border-[#282828] font-bold uppercase">
                        {item.top_candidate.fit_category}
                      </span>
                      <span className="font-mono font-black text-[#FF3E00] text-sm">
                        {item.top_candidate.match_percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#666] italic mt-3">
                    Belum ada data kandidat.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CANDIDATE ANALYSIS MODAL */}
      {selectedAttemptId && (
        <CandidateAnalysisModal
          attemptId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}

    </div>
  );
};
