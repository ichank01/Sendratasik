import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api.js';
import { Participant, PositionProfile } from '../../types.js';
import { CandidateAnalysisModal } from './CandidateAnalysisModal.js';
import {
  downloadParticipantExcelTemplate,
  exportParticipantsToExcel,
  parseParticipantsExcelFile,
  ParsedParticipantItem
} from '../../lib/excelHelper.js';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  FileText,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  FastForward,
  CheckSquare,
  RefreshCw,
  Radio,
  FileSpreadsheet,
  Download,
  Upload,
  FileDown,
  FileUp,
  FileCheck,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const POSISI_CHOICES = [
  'Ketua Umum Eksekutif SENDRATASIK',
  'Wakil Ketua Eksekutif',
  'Sekretaris Eksekutif',
  'Bendahara Eksekutif',
  'Koordinator Hubungan Masyarakat & Publikasi',
  'Koordinator Sarana, Prasarana & Tata Panggung',
  'Koordinator Divisi Seni Musik / Vokal',
  'Koordinator Divisi Seni Tari & Koreografi',
  'Koordinator Divisi Seni Drama & Teater'
];

export const ParticipantsTab: React.FC = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [positions, setPositions] = useState<PositionProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingPart, setEditingPart] = useState<Partial<Participant> | null>(null);

  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resettingAttemptId, setResettingAttemptId] = useState<string | null>(null);
  const [resetReason, setResetReason] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Excel Upload / Import Modal
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedExcelItems, setParsedExcelItems] = useState<ParsedParticipantItem[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState<boolean>(false);
  const [isImportingExcel, setIsImportingExcel] = useState<boolean>(false);
  const [excelParseError, setExcelParseError] = useState<string | null>(null);
  const [excelFilterValidOnly, setExcelFilterValidOnly] = useState<boolean>(false);
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchParticipants = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await apiRequest('/admin/participants');
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const posData = await apiRequest('/admin/positions');
      if (Array.isArray(posData)) {
        setPositions(posData);
      }
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchPositions();
  }, []);

  // Auto-refresh live monitor every 6 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchParticipants(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus peserta ${name}? Seluruh data pengerjaan ujian juga akan dihapus.`)) return;
    try {
      await apiRequest(`/admin/participants/${id}`, { method: 'DELETE' });
      fetchParticipants();
      setSuccessToast(`Data peserta ${name} berhasil dihapus.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus peserta.');
    }
  };

  const handleForceSubmit = async (attemptId: string, name: string) => {
    if (!confirm(`Hentikan dan serahkan secara paksa ujian untuk peserta ${name}? Nilai akan dihitung berdasarkan jawaban yang telah tersimpan saat ini.`)) return;
    try {
      const res = await apiRequest(`/admin/attempts/${attemptId}/force-submit`, { method: 'POST' });
      setSuccessToast(res.message || 'Ujian berhasil diserahkan.');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchParticipants();
    } catch (err: any) {
      alert(err.message || 'Gagal menyerahkan ujian peserta.');
    }
  };

  const handleExtendTime = async (attemptId: string, name: string) => {
    const minutes = prompt(`Tambahkan waktu ujian (menit) untuk peserta ${name}:`, '10');
    if (!minutes || isNaN(Number(minutes)) || Number(minutes) <= 0) return;

    try {
      const res = await apiRequest(`/admin/attempts/${attemptId}/extend-time`, {
        method: 'POST',
        body: JSON.stringify({ minutes: Number(minutes) })
      });
      setSuccessToast(res.message || 'Waktu ujian berhasil diperpanjang.');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchParticipants();
    } catch (err: any) {
      alert(err.message || 'Gagal memperpanjang waktu.');
    }
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    try {
      if (editingPart.id) {
        await apiRequest(`/admin/participants/${editingPart.id}`, {
          method: 'PUT',
          body: JSON.stringify(editingPart)
        });
        setSuccessToast(`Data peserta ${editingPart.name} berhasil diperbarui.`);
      } else {
        await apiRequest('/admin/participants', {
          method: 'POST',
          body: JSON.stringify(editingPart)
        });
        setSuccessToast(`Peserta baru ${editingPart.name} berhasil ditambahkan!`);
      }
      setTimeout(() => setSuccessToast(null), 4000);
      setShowEditModal(false);
      setEditingPart(null);
      fetchParticipants();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data peserta.');
    }
  };

  const handleConfirmReset = async () => {
    if (!resettingAttemptId || !resetReason.trim()) {
      alert('Tuliskan alasan reset pengerjaan.');
      return;
    }
    setIsResetting(true);
    try {
      await apiRequest(`/admin/attempts/${resettingAttemptId}/reset`, {
        method: 'POST',
        body: JSON.stringify({ reason: resetReason })
      });
      setShowResetModal(false);
      setResettingAttemptId(null);
      setResetReason('');
      setSuccessToast('Sesi pengerjaan CBT peserta berhasil di-reset.');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchParticipants();
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan reset pengerjaan.');
    } finally {
      setIsResetting(false);
    }
  };

  // --- EXCEL TEMPLATE, EXPORT & IMPORT HANDLERS ---
  const handleDownloadTemplate = () => {
    downloadParticipantExcelTemplate(positions);
    setSuccessToast('Template Excel Peserta CBT berhasil diunduh!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleExportExcel = () => {
    const listToExport = filtered.length > 0 ? filtered : participants;
    if (!listToExport || listToExport.length === 0) {
      alert('Tidak ada data peserta untuk diekspor.');
      return;
    }
    exportParticipantsToExcel(listToExport);
    setSuccessToast(`Berhasil mengekspor ${listToExport.length} data peserta ke format Excel!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenExcelModal = () => {
    setExcelFile(null);
    setParsedExcelItems([]);
    setExcelParseError(null);
    setExcelFilterValidOnly(false);
    setShowExcelModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setExcelParseError(null);
    setIsParsingExcel(true);

    try {
      const res = await parseParticipantsExcelFile(file, positions);
      if (!res.success) {
        setExcelParseError(res.error || 'Gagal memproses berkas Excel.');
        setParsedExcelItems([]);
      } else {
        setParsedExcelItems(res.results);
      }
    } catch (err: any) {
      setExcelParseError(err.message || 'Terjadi kesalahan saat memvalidasi berkas.');
      setParsedExcelItems([]);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleImportValidParticipants = async () => {
    const validItems = parsedExcelItems.filter(item => item.isValid).map(item => item.data);
    if (validItems.length === 0) {
      alert('Tidak ada data peserta yang valid untuk diimpor.');
      return;
    }

    setIsImportingExcel(true);
    try {
      const res = await apiRequest('/admin/participants/batch', {
        method: 'POST',
        body: JSON.stringify({
          items: validItems,
          update_existing: updateExisting
        })
      });

      setShowExcelModal(false);
      setExcelFile(null);
      setParsedExcelItems([]);
      fetchParticipants();
      setSuccessToast(
        `Berhasil mengimpor ${res.count || 0} peserta baru (${res.updated_count || 0} diperbarui) dari Excel!`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor data peserta dari Excel.');
    } finally {
      setIsImportingExcel(false);
    }
  };

  const filtered = (Array.isArray(participants) ? participants : []).filter(p => {
    const name = String(p?.name || '');
    const nisn = String(p?.nisn || '');
    const classGrade = String(p?.class_grade || '');
    const s的的 = search.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(s的的) ||
      nisn.includes(s的的) ||
      classGrade.toLowerCase().includes(s的的);
    const matchesStatus = statusFilter ? p?.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const inProgressCount = participants.filter(p => p.status === 'in_progress').length;
  const completedCount = participants.filter(p => p.status === 'completed').length;
  const validExcelCount = parsedExcelItems.filter(item => item.isValid).length;
  const invalidExcelCount = parsedExcelItems.filter(item => !item.isValid).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1 hover:bg-emerald-600/30 rounded-lg text-slate-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Direktori Calon Eksekutif Peserta Seleksi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total {participants.length} peserta • <span className="text-amber-400 font-bold">{inProgressCount} sedang ujian</span> • <span className="text-emerald-400 font-bold">{completedCount} selesai</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Live Sync Auto-Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              autoRefresh
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Auto-refresh live monitor tiap 6 detik"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{autoRefresh ? 'Live Sync ON' : 'Live Sync OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchParticipants()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Excel Template Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
            title="Unduh format spreadsheet Excel resmi untuk mengisi calon peserta"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Template Excel</span>
          </button>

          {/* Excel Upload / Import Button */}
          <button
            type="button"
            onClick={handleOpenExcelModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-all shadow-xs"
            title="Unggah dan impor data peserta massal dari file Excel"
          >
            <FileUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Excel</span>
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
            title="Ekspor direktori peserta beserta hasil nilai ujian ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>

          {/* Add Single Participant Button */}
          <button
            onClick={() => {
              setEditingPart({
                nisn: '',
                name: '',
                class_grade: 'X MIPA 1',
                major: 'MIPA',
                gender: 'Laki-laki',
                phone: '',
                email: '',
                primary_choice: POSISI_CHOICES[0],
                alternative_choice: POSISI_CHOICES[6],
                motivation: ''
              });
              setShowEditModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, NISN, atau kelas..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Semua Status CBT ({participants.length})</option>
            <option value="completed">Selesai / Completed ({completedCount})</option>
            <option value="in_progress">Sedang Ujian ({inProgressCount})</option>
            <option value="not_started">Belum Mulai ({participants.length - completedCount - inProgressCount})</option>
          </select>
        </div>
      </div>

      {/* Responsive Table for Desktop & Tablet */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Peserta</th>
                <th className="px-4 py-3.5">Kelas & Jurusan</th>
                <th className="px-4 py-3.5">Pilihan Divisi</th>
                <th className="px-4 py-3.5 text-center">Status CBT</th>
                <th className="px-4 py-3.5 text-center">Nilai</th>
                <th className="px-4 py-3.5">Rekomendasi Utama</th>
                <th className="px-5 py-3.5 text-right">Aksi & Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                    <span>Memuat data peserta...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada peserta yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NISN: {p.nisn}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>{p.class_grade}</div>
                      <div className="text-[11px] text-slate-400">{p.gender}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-amber-400/90 truncate max-w-[180px]">{p.primary_choice}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">Alt: {p.alternative_choice || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {p.status === 'completed' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/40 text-[11px] inline-flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      ) : p.status === 'in_progress' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40 text-[11px] inline-flex items-center space-x-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Sedang Ujian</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                          Belum Mulai
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-sm">
                      {p.final_score !== null ? (
                        <span className="text-amber-400">{p.final_score}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-200">
                      {p.top_recommendation || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {p.status === 'completed' && p.attempt_id && (
                          <button
                            onClick={() => setSelectedAttemptId(p.attempt_id)}
                            className="p-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-500/20 transition-colors"
                            title="Lihat Laporan & Analisis Kandidat"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Remote Controls for In-Progress Exams */}
                        {p.status === 'in_progress' && p.attempt_id && (
                          <>
                            <button
                              onClick={() => handleExtendTime(p.attempt_id, p.name)}
                              className="p-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 transition-colors"
                              title="Tambah Waktu (+10 Menit)"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleForceSubmit(p.attempt_id, p.name)}
                              className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                              title="Paksa Selesai / Submit Ujian"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {p.attempt_id && (
                          <button
                            onClick={() => {
                              setResettingAttemptId(p.attempt_id);
                              setShowResetModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-900/50 text-slate-300 hover:text-amber-300 transition-colors"
                            title="Reset Pengerjaan CBT"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingPart(p);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Biodata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 transition-colors"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards (Screen < md) */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
            <span>Memuat data peserta...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            Tidak ada peserta yang sesuai kriteria filter.
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">NISN: {p.nisn} • {p.class_grade}</p>
                </div>
                <div>
                  {p.status === 'completed' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/40 text-[10px] inline-flex items-center space-x-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>Selesai</span>
                    </span>
                  ) : p.status === 'in_progress' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40 text-[10px] inline-flex items-center space-x-1 animate-pulse">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Ujian</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px]">
                      Belum Mulai
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Pilihan Posisi</span>
                  <span className="text-amber-400 font-medium truncate block">{p.primary_choice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Nilai CBT</span>
                  <span className="text-white font-mono font-bold">{p.final_score !== null ? p.final_score : '-'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {p.top_recommendation !== '-' && <span>Rec: {p.top_recommendation}</span>}
                </div>

                <div className="flex items-center space-x-1.5">
                  {p.status === 'completed' && p.attempt_id && (
                    <button
                      onClick={() => setSelectedAttemptId(p.attempt_id)}
                      className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-500/20"
                      title="Lihat Laporan"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

                  {p.status === 'in_progress' && p.attempt_id && (
                    <>
                      <button
                        onClick={() => handleExtendTime(p.attempt_id, p.name)}
                        className="p-2 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800"
                        title="Tambah Waktu"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleForceSubmit(p.attempt_id, p.name)}
                        className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800"
                        title="Paksa Selesai"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {p.attempt_id && (
                    <button
                      onClick={() => {
                        setResettingAttemptId(p.attempt_id);
                        setShowResetModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700"
                      title="Reset Ujian"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingPart(p);
                      setShowEditModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-2 rounded-xl bg-slate-800 text-rose-400 border border-slate-700"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: ADD/EDIT PARTICIPANT */}
      {showEditModal && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl my-6 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {editingPart.id ? 'Edit Biodata Calon Eksekutif' : 'Tambah Calon Eksekutif Baru'}
            </h3>

            <form onSubmit={handleSaveParticipant} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingPart.id)}
                    value={editingPart.nisn || ''}
                    onChange={e => setEditingPart({ ...editingPart, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPart.name || ''}
                    onChange={e => setEditingPart({ ...editingPart, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPart.class_grade || ''}
                    onChange={e => setEditingPart({ ...editingPart, class_grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jurusan
                  </label>
                  <select
                    value={editingPart.major || 'MIPA'}
                    onChange={e => setEditingPart({ ...editingPart, major: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="MIPA">MIPA</option>
                    <option value="IPS">IPS</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={editingPart.gender || 'Laki-laki'}
                    onChange={e => setEditingPart({ ...editingPart, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilihan Posisi Utama *
                </label>
                <select
                  value={editingPart.primary_choice || POSISI_CHOICES[0]}
                  onChange={e => setEditingPart({ ...editingPart, primary_choice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  {POSISI_CHOICES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilihan Posisi Alternatif
                </label>
                <select
                  value={editingPart.alternative_choice || POSISI_CHOICES[6]}
                  onChange={e => setEditingPart({ ...editingPart, alternative_choice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  {POSISI_CHOICES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET ATTEMPT */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100 relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Konfirmasi Reset Pengerjaan CBT</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Reset pengerjaan akan menghapus jawaban sesi saat ini dan mengizinkan peserta untuk memulai kembali ujian dari awal.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alasan Reset Ujian (Wajib diisi) *
              </label>
              <textarea
                rows={2}
                required
                value={resetReason}
                onChange={e => setResetReason(e.target.value)}
                placeholder="Contoh: Terjadi pemadaman listrik / perangkat crash..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-xs font-bold text-white shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isResetting ? 'Memproses...' : 'Ya, Reset Ujian'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANDIDATE ANALYSIS MODAL */}
      {selectedAttemptId && (
        <CandidateAnalysisModal
          attemptId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}

    </div>
  );
};

