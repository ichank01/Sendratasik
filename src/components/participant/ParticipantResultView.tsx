import React from 'react';
import { AttemptResult } from '../../types.js';
import {
  Award,
  CheckCircle,
  TrendingUp,
  FileText,
  Download,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  ArrowRight
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
import { exportCandidateIndividualPDF } from '../../lib/exportUtils.js';

interface ParticipantResultViewProps {
  result: any;
  onBackToDashboard?: () => void;
}

export const ParticipantResultView: React.FC<ParticipantResultViewProps> = ({ result, onBackToDashboard }) => {
  const settings = result?.settings || {
    show_participant_score: true,
    show_participant_rank: true,
    show_competency_profile: true,
    show_position_recommendation: true
  };

  const compScores = Array.isArray(result?.competency_scores) ? result.competency_scores : [];
  const posScores = Array.isArray(result?.position_scores) ? result.position_scores : [];
  const topPosition = result?.top_recommended_position || posScores[0];

  const radarData = compScores.map((cs: any) => ({
    subject: String(cs?.competency_name || cs?.competency_code || cs?.name || cs?.code || '').slice(0, 14),
    fullName: cs?.competency_name || cs?.name || 'Kompetensi',
    score: cs?.normalized_score ?? cs?.score ?? 0,
    fullMark: 100
  }));

  const handleDownloadPDF = () => {
    exportCandidateIndividualPDF(result as AttemptResult);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF3E00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 mb-3 shadow-inner">
          <CheckCircle className="w-7 h-7" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF3E00] font-black block mb-1">Status Sesi Seleksi</span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Ujian CBT Telah Selesai
        </h2>
        <p className="text-xs sm:text-sm text-[#888] mt-1.5 max-w-lg mx-auto leading-relaxed">
          Terima kasih telah menyelesaikan Tes Kemampuan Organisasi Seleksi Eksekutif SENDRATASIK MAN Purbalingga.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#FF3E00] hover:bg-[#E03700] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF3E00]/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan PDF</span>
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-[#181818] hover:bg-[#252525] border border-[#2A2A2A] text-[#AAA] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Kembali ke Beranda</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Score & Rank Cards (if permitted) */}
      {(settings.show_participant_score || settings.show_participant_rank) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {settings.show_participant_score && (
            <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl shadow-xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#FF3E00]/10 border border-[#FF3E00]/20 flex items-center justify-center text-[#FF3E00] shrink-0 font-black">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-[0.2em]">
                  Nilai Akhir CBT
                </span>
                <div className="text-2xl font-black text-[#FF3E00] font-mono mt-0.5">
                  {result?.final_score ?? 0} <span className="text-xs text-[#555] font-normal">/ 100</span>
                </div>
              </div>
            </div>
          )}

          {settings.show_participant_rank && result?.rank && (
            <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl shadow-xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#1E1E1E] border border-[#333] flex items-center justify-center text-white shrink-0 font-black">
                <TrendingUp className="w-6 h-6 text-[#FF3E00]" />
              </div>
              <div>
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-[0.2em]">
                  Peringkat Seleksi
                </span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  #{result?.rank} <span className="text-xs text-[#666] font-normal">dari {result?.total_participants ?? 0} peserta</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl shadow-xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-black">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#666] uppercase font-bold tracking-[0.2em]">
                Status Integritas
              </span>
              <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                Terverifikasi Valid
              </div>
              <span className="text-[10px] text-[#555]">Terekam di Server</span>
            </div>
          </div>

        </div>
      )}

      {/* Recommended Position Match (if permitted) */}
      {settings.show_position_recommendation && topPosition && (
        <div className="bg-[#121212] border border-[#FF3E00]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center space-x-2 text-[#FF3E00] text-[10px] font-black uppercase tracking-[0.25em] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Rekomendasi Kesesuaian Posisi Utama</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {topPosition.position_name}
              </h3>
              <p className="text-xs text-[#888] mt-1.5 max-w-xl leading-relaxed">
                Berdasarkan distribusi 12 kompetensi kepemimpinan dan manajerial, profil Anda memiliki kesesuaian tertinggi untuk posisi ini.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-[#0A0A0A] px-5 py-3.5 rounded-xl border border-[#282828]">
              <div className="text-right">
                <span className="text-[9px] text-[#666] block uppercase font-bold tracking-wider">Kesesuaian</span>
                <span className="text-xs font-black uppercase tracking-wider text-[#FF3E00]">{topPosition.fit_category}</span>
              </div>
              <div className="text-3xl font-black text-[#FF3E00] font-mono border-l border-[#242424] pl-4">
                {topPosition.match_percentage}%
              </div>
            </div>
          </div>

          {/* Top 3 Positions Mini List */}
          {posScores.length > 1 && (
            <div className="mt-6 pt-5 border-t border-[#222]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] mb-3">
                Alternatif Rekomendasi Posisi Lainnya:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posScores.slice(1, 3).map((ps: any) => (
                  <div
                    key={ps.position_id}
                    className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{ps.position_name}</div>
                      <div className="text-[10px] uppercase text-[#666] font-medium">{ps.fit_category}</div>
                    </div>
                    <span className="text-xs font-mono font-black text-[#FF3E00]">{ps.match_percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Radar & Competency Breakdown Profile (if permitted) */}
      {settings.show_competency_profile && compScores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Radar Chart */}
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#AAA] mb-2 flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#FF3E00]" />
              <span>Radar Profil 12 Kompetensi</span>
            </h3>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#222222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#555555', fontSize: 9 }} />
                  <Radar
                    name="Skor Peserta"
                    dataKey="score"
                    stroke="#FF3E00"
                    fill="#FF3E00"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#333] text-xs shadow-2xl">
                            <p className="font-black text-white">{d.fullName}</p>
                            <p className="text-[#888] mt-1">Skor: <span className="font-mono font-black text-[#FF3E00]">{d.score}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[10px] uppercase tracking-wider text-[#555] text-center mt-2 font-medium">
              Skor normalisasi dihitung berdasarkan bobot opsi SJT (1 s.d. 5).
            </p>
          </div>

          {/* Competency Score Bars */}
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#AAA] mb-3">
              Rincian Capaian Kompetensi
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {compScores.map((cs: any) => (
                <div key={cs.competency_id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#CCC] truncate max-w-[220px]">
                      {cs.competency_name}
                    </span>
                    <span className="font-mono font-black text-[#FF3E00]">
                      {cs.normalized_score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0A0A0A] border border-[#1E1E1E] overflow-hidden">
                    <div
                      className="h-full bg-[#FF3E00] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, cs.normalized_score)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Development Pill Badges */}
            <div className="pt-4 border-t border-[#222] mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#0F291E] border border-emerald-800/40 p-3 rounded-xl">
                <span className="text-emerald-400 font-black text-[10px] uppercase tracking-wider block mb-1">Kekuatan Utama:</span>
                <ul className="text-[#AAA] space-y-0.5 list-disc list-inside text-xs">
                  {(Array.isArray(result?.strengths) ? result.strengths : []).slice(0, 2).map((s: any) => (
                    <li key={s?.competency_id || s?.name} className="truncate">{s?.competency_name || s?.name}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-[#333] p-3 rounded-xl">
                <span className="text-[#DDD] font-black text-[10px] uppercase tracking-wider block mb-1">Area Pengembangan:</span>
                <ul className="text-[#888] space-y-0.5 list-disc list-inside text-xs">
                  {(Array.isArray(result?.areas_for_development) ? result.areas_for_development : []).slice(0, 2).map((d: any) => (
                    <li key={d?.competency_id || d?.name} className="truncate">{d?.competency_name || d?.name}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Pembina Note Banner (if present) */}
      {result.admin_note && (
        <div className="bg-[#121212] border border-[#242424] rounded-xl p-5 shadow-xl">
          <h4 className="text-[10px] font-black text-[#FF3E00] uppercase tracking-[0.2em] mb-1.5">
            Catatan Pembina Ekstrakurikuler:
          </h4>
          <p className="text-xs text-[#CCC] italic leading-relaxed">
            "{result.admin_note}"
          </p>
        </div>
      )}

    </div>
  );
};
