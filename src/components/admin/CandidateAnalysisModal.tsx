import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { AttemptResult } from '../../types.js';
import {
  X,
  Award,
  TrendingUp,
  Download,
  Save,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { exportCandidateIndividualPDF } from '../../lib/exportUtils.js';

interface CandidateAnalysisModalProps {
  attemptId: string;
  onClose: () => void;
}

export const CandidateAnalysisModal: React.FC<CandidateAnalysisModalProps> = ({ attemptId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pembina Note state
  const [noteText, setNoteText] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [noteSavedAlert, setNoteSavedAlert] = useState<boolean>(false);
  const [showQuestionsAudit, setShowQuestionsAudit] = useState<boolean>(false);

  const fetchCandidateReport = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(`/admin/results/${attemptId}`);
      setData(res);
      setNoteText(res.admin_note || '');
    } catch (err: any) {
      setError(err.message || 'Gagal memuat laporan kandidat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateReport();
  }, [attemptId]);

  const handleSaveNote = async () => {
    if (!data?.participant?.id) return;
    setIsSavingNote(true);
    try {
      await apiRequest(`/admin/results/${data.participant.id}/note`, {
        method: 'POST',
        body: JSON.stringify({ note_text: noteText })
      });
      setNoteSavedAlert(true);
      setTimeout(() => setNoteSavedAlert(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan catatan.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    exportCandidateIndividualPDF(data as AttemptResult);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
          <p className="text-xs text-slate-300">Memuat analisis lengkap kandidat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-slate-200 mb-4">{error || 'Data tidak ditemukan.'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const participant = data?.participant || {};
  const attempt = data?.attempt || {};
  const competency_scores = Array.isArray(data?.competency_scores) ? data.competency_scores : [];
  const position_scores = Array.isArray(data?.position_scores) ? data.position_scores : [];
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const areas_for_development = Array.isArray(data?.areas_for_development) ? data.areas_for_development : [];
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  const topPos = position_scores[0];

  const radarData = competency_scores.map((cs: any) => ({
    subject: String(cs?.competency_name || cs?.competency_code || cs?.name || cs?.code || '').slice(0, 14),
    fullName: cs?.competency_name || cs?.name || 'Kompetensi',
    score: cs?.normalized_score ?? cs?.score ?? 0,
    fullMark: 100
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl my-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Analisis Lengkap Profil Kandidat
              </h3>
              <p className="text-xs text-slate-400">
                {participant.name} (NISN: {participant.nisn}) • {participant.class_grade}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Summary Score Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Nilai Akhir CBT</span>
              <span className="text-xl font-black text-amber-400 font-mono">{data.final_score}</span>
              <span className="text-[10px] text-slate-500 block">Skor Maks 100</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Peringkat</span>
              <span className="text-xl font-black text-indigo-400 font-mono">#{data.rank || '-'}</span>
              <span className="text-[10px] text-slate-500 block">dari {data.total_participants} peserta</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Pilihan Utama</span>
              <span className="text-xs font-bold text-slate-200 block truncate mt-1">{participant.primary_choice}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Integritas CBT</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">
                Tab: {attempt.tab_switch_count} • FS: {attempt.fullscreen_exit_count}
              </span>
            </div>
          </div>

          {/* Top Recommendation Highlight */}
          {topPos && (
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rekomendasi Jabatan Paling Sesuai</span>
                </span>
                <h4 className="text-base sm:text-lg font-black text-white font-serif">
                  {topPos.position_name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tingkat kesesuaian profil kompetensi kepemimpinan kandidat.
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-amber-500/20 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Kategori</span>
                  <span className="text-xs font-bold text-amber-400">{topPos.fit_category}</span>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono border-l border-slate-800 pl-3">
                  {topPos.match_percentage}%
                </div>
              </div>
            </div>
          )}

          {/* Radar Chart & Position Ranking List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Radar Chart */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Radar Profil 12 Kompetensi
              </h4>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9.5 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8.5 }} />
                    <Radar name="Skor Normalisasi" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                    <Tooltip
                      content={({ payload }) => {
                        if (payload && payload.length > 0) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs shadow-xl">
                              <p className="font-bold text-amber-400">{d.fullName}</p>
                              <p className="text-slate-300">Skor: <span className="font-mono font-bold">{d.score}%</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All Position Fit Rankings */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Kesesuaian 9 Posisi Eksekutif
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {position_scores.map((ps: any, idx: number) => (
                  <div
                    key={ps.position_id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{ps.position_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {ps.fit_category}
                      </span>
                      <span className="font-mono font-bold text-amber-400">{ps.match_percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Competency Strengths & Development Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Top Kekuatan Utama (Strengths)
              </h5>
              <div className="space-y-1.5 text-xs text-slate-300">
                {strengths.map((s: any) => (
                  <div key={s.competency_id} className="flex justify-between">
                    <span>{s.competency_name}</span>
                    <span className="font-mono font-bold text-emerald-400">{s.normalized_score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40">
              <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                Area Perlu Pengembangan (Development)
              </h5>
              <div className="space-y-1.5 text-xs text-slate-300">
                {areas_for_development.map((d: any) => (
                  <div key={d.competency_id} className="flex justify-between">
                    <span>{d.competency_name}</span>
                    <span className="font-mono font-bold text-indigo-400">{d.normalized_score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pembina Notes Section */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Catatan & Rekomendasi Khusus Pembina
              </h4>
              {noteSavedAlert && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Catatan tersimpan!</span>
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Tuliskan catatan evaluasi wawancara, kepribadian, atau pertimbangan rapat untuk kandidat ini..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSavingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan Catatan</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Answers Audit Accordion */}
          <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-950">
            <button
              onClick={() => setShowQuestionsAudit(!showQuestionsAudit)}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-900/60 transition-colors"
            >
              <span>Audit Rincian Jawaban Soal ({questions.length} Butir)</span>
              {showQuestionsAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showQuestionsAudit && (
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto border-t border-slate-800">
                {questions.map((q: any, qIdx: number) => (
                  <div key={q.question_id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-amber-400">Soal #{qIdx + 1} • {q.competency_name}</span>
                      <span className="font-mono">Bobot Terpilih: <strong className="text-emerald-400">{q.selected_weight} / 5</strong></span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed">{q.question_text}</p>

                    <div className="space-y-1 pt-1">
                      {q.options?.map((opt: any) => {
                        const isChosen = q.selected_display_key === opt.display_key;
                        return (
                          <div
                            key={opt.display_key}
                            className={`p-2 rounded-xl text-[11px] flex items-center justify-between ${
                              isChosen
                                ? 'bg-amber-500/10 border border-amber-500/30 text-white font-medium'
                                : 'bg-slate-950/40 text-slate-400'
                            }`}
                          >
                            <span className="truncate max-w-lg">
                              <strong>{opt.display_key}.</strong> {opt.text}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 ml-2">
                              Bobot: {opt.weight}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-900 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Tutup Laporan
          </button>
        </div>

      </div>
    </div>
  );
};
