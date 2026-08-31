import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { exportRecapToExcel, exportRecapToPDF } from '../../lib/exportUtils.js';
import { CandidateAnalysisModal } from './CandidateAnalysisModal.js';
import {
  Award,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const ResultsAndRankingTab: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/results');
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleExportExcel = () => {
    if (results.length === 0) {
      alert('Belum ada data hasil seleksi untuk diekspor.');
      return;
    }
    exportRecapToExcel(filtered);
  };

  const handleExportPDF = () => {
    if (results.length === 0) {
      alert('Belum ada data hasil seleksi untuk diekspor.');
      return;
    }
    exportRecapToPDF(filtered);
  };

  const filtered = (Array.isArray(results) ? results : []).filter(r => {
    const name = String(r?.name || '');
    const nisn = String(r?.nisn || '');
    const classGrade = String(r?.class_grade || '');
    const s = search.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(s) ||
      nisn.includes(s) ||
      classGrade.toLowerCase().includes(s);
    const matchesPos = positionFilter ? r?.top_recommended_position?.position_name === positionFilter : true;
    const matchesClass = classFilter ? classGrade.includes(classFilter) : true;
    return matchesSearch && matchesPos && matchesClass;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Peringkat & Rekapitulasi Seleksi Eksekutif</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data penilaian objektif Situational Judgment Test (SJT) dan pemetaan kecocokan jabatan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF Rekap</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, NISN, atau kelas..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Semua Rekomendasi Jabatan</option>
            <option value="Ketua Umum Eksekutif SENDRATASIK">Ketua Umum Eksekutif</option>
            <option value="Wakil Ketua Eksekutif">Wakil Ketua Eksekutif</option>
            <option value="Sekretaris Eksekutif">Sekretaris Eksekutif</option>
            <option value="Bendahara Eksekutif">Bendahara Eksekutif</option>
            <option value="Koordinator Hubungan Masyarakat & Publikasi">Humas & Publikasi</option>
            <option value="Koordinator Sarana, Prasarana & Tata Panggung">Sarpras & Tata Panggung</option>
            <option value="Koordinator Divisi Seni Musik / Vokal">Divisi Musik / Vokal</option>
            <option value="Koordinator Divisi Seni Tari & Koreografi">Divisi Tari & Koreografi</option>
            <option value="Koordinator Divisi Seni Drama & Teater">Divisi Drama & Teater</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            placeholder="Filter kelas (contoh: X, XI, MIPA, IPS)..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 text-center">Rank</th>
                <th className="px-5 py-3.5">Nama Peserta</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5">Pilihan Utama</th>
                <th className="px-4 py-3.5 text-center">Nilai CBT</th>
                <th className="px-5 py-3.5">Rekomendasi Utama & Kecocokan</th>
                <th className="px-4 py-3.5 text-center">Integritas</th>
                <th className="px-5 py-3.5 text-right">Laporan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                    <span>Memuat data peringkat...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Belum ada hasil ujian yang diselesaikan.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr
                    key={r.attempt_id}
                    className="hover:bg-slate-850/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAttemptId(r.attempt_id)}
                  >
                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      {idx === 0 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto text-xs shadow-md shadow-amber-500/30">
                          🥇 1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 flex items-center justify-center mx-auto text-xs shadow-md">
                          🥈 2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center mx-auto text-xs shadow-md">
                          🥉 3
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-xs sm:text-sm">{r.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NISN: {r.nisn}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-200">{r.class_grade}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-300 truncate max-w-[160px] block">{r.primary_choice}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono font-black text-sm text-amber-400">
                        {r.final_score}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100">
                        {r.top_recommended_position?.position_name || '-'}
                      </div>
                      <div className="text-[10px] text-amber-400/90 font-mono">
                        Kecocokan: {r.top_recommended_position?.match_percentage}% • {r.top_recommended_position?.fit_category}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center text-[10px] text-slate-400">
                      <div>Tab: {r.integrity_summary?.tab_switches || 0}</div>
                      <div>FS: {r.integrity_summary?.fullscreen_exits || 0}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAttemptId(r.attempt_id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
