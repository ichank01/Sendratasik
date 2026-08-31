import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api.js';
import { Question, Competency, Difficulty, QuestionStatus } from '../../types.js';
import {
  downloadQuestionExcelTemplate,
  exportQuestionsToExcel,
  parseQuestionsExcelFile,
  ParsedQuestionItem
} from '../../lib/excelHelper.js';
import {
  HelpCircle,
  Plus,
  Sparkles,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  X,
  Layers,
  Save,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Upload,
  FileDown,
  FileUp,
  FileCheck
} from 'lucide-react';

export const QuestionBankTab: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedComp, setSelectedComp] = useState<string>('');
  const [selectedDiff, setSelectedDiff] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modals
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiDrafts, setAiDrafts] = useState<any[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiParams, setAiParams] = useState({
    competency_id: '',
    difficulty: 'Sedang' as Difficulty,
    count: 3,
    context: 'Gladi resik panggung, koordinasi pementasan drama tari musik, dinamika tim ekstrakurikuler'
  });

  // Excel Upload / Import Modal
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedExcelItems, setParsedExcelItems] = useState<ParsedQuestionItem[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState<boolean>(false);
  const [isImportingExcel, setIsImportingExcel] = useState<boolean>(false);
  const [excelParseError, setExcelParseError] = useState<string | null>(null);
  const [excelFilterValidOnly, setExcelFilterValidOnly] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const comps = await apiRequest('/admin/competencies');
      const safeComps = Array.isArray(comps) ? comps : [];
      setCompetencies(safeComps);
      if (safeComps.length > 0 && !aiParams.competency_id) {
        setAiParams(prev => ({ ...prev, competency_id: safeComps[0].id }));
      }

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedComp) params.set('competency_id', selectedComp);
      if (selectedDiff) params.set('difficulty', selectedDiff);
      if (selectedStatus) params.set('status', selectedStatus);

      const qs = await apiRequest(`/admin/questions?${params.toString()}`);
      setQuestions(Array.isArray(qs) ? qs : []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedComp, selectedDiff, selectedStatus]);

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini dari bank soal?')) return;
    try {
      await apiRequest(`/admin/questions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus soal.');
    }
  };

  const handleDeleteSamples = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua soal contoh bawaan? Soal buatan Anda tidak akan terhapus.')) return;
    try {
      const res = await apiRequest('/admin/questions/delete-samples', { method: 'POST' });
      alert(`Berhasil menghapus ${res.deleted_count} soal contoh.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus soal sampel.');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      if (editingQuestion.id) {
        await apiRequest(`/admin/questions/${editingQuestion.id}`, {
          method: 'PUT',
          body: JSON.stringify(editingQuestion)
        });
      } else {
        await apiRequest('/admin/questions', {
          method: 'POST',
          body: JSON.stringify(editingQuestion)
        });
      }
      setShowEditModal(false);
      setEditingQuestion(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan soal.');
    }
  };

  const [isImportingBatch, setIsImportingBatch] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const CONTEXT_PRESETS = [
    'Gladi Bersih & Blocking Panggung Festival',
    'Friksi Jadwal Latihan Musik vs Tari',
    'Transparansi Sisa Anggaran Belanja Kostum',
    'Merespons Kritik Pedas Pembina Pasca Pentas',
    'Keadaan Darurat Pemeran Utama Sakit',
    'Manajemen Waktu Tugas Madrasah vs Latihan'
  ];

  const handleOpenAiModal = () => {
    if (selectedComp) {
      setAiParams(prev => ({ ...prev, competency_id: selectedComp }));
    } else if (competencies.length > 0 && !aiParams.competency_id) {
      setAiParams(prev => ({ ...prev, competency_id: competencies[0].id }));
    }
    setShowAiModal(true);
  };

  // --- EXCEL IMPORT HANDLERS ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setExcelParseError(null);
    setIsParsingExcel(true);

    try {
      const res = await parseQuestionsExcelFile(file, competencies);
      if (!res.success) {
        setExcelParseError(res.error || 'Gagal memproses file Excel.');
        setParsedExcelItems([]);
      } else {
        setParsedExcelItems(res.results);
      }
    } catch (err: any) {
      setExcelParseError(err.message || 'Terjadi kesalahan saat memvalidasi file.');
      setParsedExcelItems([]);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleImportValidExcelQuestions = async () => {
    const validItems = parsedExcelItems.filter(item => item.isValid).map(item => item.data);
    if (validItems.length === 0) {
      alert('Tidak ada butir soal yang valid untuk diimpor.');
      return;
    }

    setIsImportingExcel(true);
    try {
      const res = await apiRequest('/admin/questions/batch', {
        method: 'POST',
        body: JSON.stringify({
          items: validItems,
          source: 'excel'
        })
      });

      setShowExcelModal(false);
      setExcelFile(null);
      setParsedExcelItems([]);
      fetchData();
      setSuccessToast(`Berhasil mengimpor ${res.count || validItems.length} butir soal dari Excel ke Bank Soal!`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor soal dari Excel.');
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadQuestionExcelTemplate(competencies);
    setSuccessToast('Template Excel Bank Soal berhasil diunduh!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleExportAllQuestions = () => {
    if (questions.length === 0) {
      alert('Tidak ada data soal untuk diekspor.');
      return;
    }
    exportQuestionsToExcel(questions);
    setSuccessToast(`Berhasil mengekspor ${questions.length} butir soal ke Excel!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleGenerateAi = async () => {
    if (!aiParams.competency_id) {
      alert('Pilih kompetensi terlebih dahulu.');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await apiRequest('/admin/questions/ai-generate', {
        method: 'POST',
        body: JSON.stringify(aiParams)
      });
      setAiDrafts(res.drafts || []);
      if (res.drafts && res.drafts.length > 0) {
        setSuccessToast(`Berhasil menghasilkan ${res.drafts.length} butir draf soal SJT!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal membuat draf dengan AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleImportAiDraft = async (draft: any, index: number) => {
    try {
      await apiRequest('/admin/questions', {
        method: 'POST',
        body: JSON.stringify({
          competency_id: aiParams.competency_id,
          question_text: draft.question_text,
          options: draft.options,
          status: 'Approved',
          difficulty: draft.difficulty || aiParams.difficulty,
          indicator: draft.indicator,
          explanation: draft.explanation
        })
      });

      // Remove from drafts list
      setAiDrafts(prev => prev.filter((_, i) => i !== index));
      fetchData();
      setSuccessToast('1 Soal berhasil ditambahkan ke bank soal!');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor soal ke bank soal.');
    }
  };

  const handleImportAllDrafts = async () => {
    if (aiDrafts.length === 0) return;
    setIsImportingBatch(true);
    try {
      const items = aiDrafts.map(d => ({
        competency_id: aiParams.competency_id,
        question_text: d.question_text,
        options: d.options,
        status: 'Approved',
        difficulty: d.difficulty || aiParams.difficulty,
        indicator: d.indicator,
        explanation: d.explanation
      }));

      await apiRequest('/admin/questions/batch', {
        method: 'POST',
        body: JSON.stringify({ items, source: 'ai' })
      });

      const count = aiDrafts.length;
      setAiDrafts([]);
      fetchData();
      setSuccessToast(`Semua (${count}) draf soal berhasil disimpan ke bank soal!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan semua soal.');
    } finally {
      setIsImportingBatch(false);
    }
  };

  const handleDeleteDraft = (index: number) => {
    setAiDrafts(prev => prev.filter((_, i) => i !== index));
    setSuccessToast('Draf soal berhasil dihapus dari daftar.');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleClearAllDrafts = () => {
    if (aiDrafts.length === 0) return;
    if (window.confirm('Hapus semua draf soal yang belum disimpan?')) {
      setAiDrafts([]);
      setSuccessToast('Semua draf soal telah dibersihkan.');
      setTimeout(() => setSuccessToast(null), 2500);
    }
  };

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleRegenerateSingleDraft = async (index: number) => {
    setRegeneratingIndex(index);
    try {
      const res = await apiRequest('/admin/questions/ai-generate', {
        method: 'POST',
        body: JSON.stringify({
          ...aiParams,
          count: 1
        })
      });

      if (res.drafts && res.drafts.length > 0) {
        const replacement = res.drafts[0];
        setAiDrafts(prev => prev.map((d, i) => (i === index ? replacement : d)));
        setSuccessToast(`Soal #${index + 1} berhasil diperbarui dengan draf baru!`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal membuat variasi soal baru.');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const openNewQuestionModal = () => {
    setEditingQuestion({
      competency_id: competencies[0]?.id || '',
      question_text: '',
      difficulty: 'Sedang',
      status: 'Approved',
      indicator: '',
      explanation: '',
      options: {
        A: { text: '', weight: 5 },
        B: { text: '', weight: 4 },
        C: { text: '', weight: 3 },
        D: { text: '', weight: 2 },
        E: { text: '', weight: 1 }
      }
    });
    setShowEditModal(true);
  };

  const validExcelCount = parsedExcelItems.filter(i => i.isValid).length;
  const invalidExcelCount = parsedExcelItems.filter(i => !i.isValid).length;

  return (
    <div className="space-y-6">

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}
      
      {/* Action Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Bank Soal CBT Situational Judgment Test (SJT)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total <span className="text-white font-bold">{questions.length}</span> butir soal tersedia dalam sistem • Dilengkapi modul Import/Export Excel & Generator AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Import & Template Group */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-xs transition-colors cursor-pointer"
              title="Unduh Template Excel format resmi CBT"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Template Excel</span>
            </button>

            <button
              onClick={() => {
                setShowExcelModal(true);
                setExcelFile(null);
                setParsedExcelItems([]);
                setExcelParseError(null);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 font-bold text-xs border border-emerald-700/60 transition-colors cursor-pointer"
              title="Unggah / Import Soal dari Excel"
            >
              <FileUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Excel</span>
            </button>

            <button
              onClick={handleExportAllQuestions}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              title="Ekspor seluruh bank soal saat ini ke Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor</span>
            </button>
          </div>

          <button
            onClick={handleOpenAiModal}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Gemini</span>
          </button>

          <button
            onClick={openNewQuestionModal}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>

          <button
            onClick={handleDeleteSamples}
            className="flex items-center space-x-1 px-2.5 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-medium text-xs border border-rose-800/40 transition-colors cursor-pointer"
            title="Hapus Soal Sampel Bawaan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari teks soal atau indikator..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedComp}
            onChange={e => setSelectedComp(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Semua Kompetensi ({competencies.length})</option>
            {competencies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDiff}
            onChange={e => setSelectedDiff(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Semua Tingkat Kesulitan</option>
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sulit">Sulit</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Semua Status</option>
            <option value="Approved">Approved (Aktif)</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <span className="text-xs">Memuat daftar soal...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Tidak ada soal yang sesuai dengan filter.</p>
          <p className="text-xs text-slate-500 mt-1">Anda dapat mengunggah soal via Excel atau menggunakan Generator AI.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3 hover:border-slate-700 transition-colors"
            >
              {/* Header tags */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                    {q.competency_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                    {q.difficulty}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                    q.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                  }`}>
                    {q.status}
                  </span>
                  {q.is_sample && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-950/40 text-indigo-300 text-[10px]">
                      Contoh
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setShowEditModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Soal"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-medium">
                {q.question_text}
              </p>

              {/* Options Breakdown with Weights */}
              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(key => {
                  const opt = q.options[key];
                  return (
                    <div
                      key={key}
                      className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs flex items-center justify-between"
                    >
                      <div className="truncate max-w-xl text-slate-300">
                        <strong className="text-amber-400 font-mono mr-1.5">{key}.</strong>
                        {opt?.text}
                      </div>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                        opt?.weight === 5 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' :
                        opt?.weight === 4 ? 'bg-teal-950/60 text-teal-300' :
                        opt?.weight === 3 ? 'bg-amber-950/60 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        Bobot {opt?.weight}
                      </span>
                    </div>
                  );
                })}
              </div>

              {q.indicator && (
                <div className="text-[11px] text-slate-400 italic">
                  Indikator: {q.indicator}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EXCEL UPLOAD & PREVIEW MODAL */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl my-6 p-6 shadow-2xl text-slate-100 relative max-h-[92vh] flex flex-col">
            <button
              onClick={() => setShowExcelModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Unggah & Impor Soal Berbasis Excel (.xlsx)
                </h3>
                <p className="text-xs text-slate-400">
                  Unggah berkas template Excel yang telah diisi untuk menambahkan butir soal SJT secara massal.
                </p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              {/* Dropzone & Template Download Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/60 rounded-2xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                    className="hidden"
                  />
                  <FileUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white mb-1">
                    {excelFile ? excelFile.name : 'Pilih Berkas Excel (.xlsx)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Mendukung format standar Microsoft Excel (.xlsx / .xls)
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      {excelFile ? 'Ganti Berkas Excel' : 'Telusuri Berkas Excel'}
                    </button>
                  </div>
                </div>

                {/* Template Info Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Belum memiliki template?
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Gunakan template resmi yang telah memuat struktur kolom, daftar kode 8 kompetensi, dan petunjuk pembobotan SJT (1 s.d. 5).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="mt-3 flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template Excel</span>
                  </button>
                </div>
              </div>

              {/* Parsing State / Errors */}
              {isParsingExcel && (
                <div className="p-6 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                  <span className="text-xs">Memvalidasi baris data Excel...</span>
                </div>
              )}

              {excelParseError && (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold mb-0.5">Kesalahan Format:</strong>
                    <span>{excelParseError}</span>
                  </div>
                </div>
              )}

              {/* Parsed Results Preview */}
              {parsedExcelItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-bold text-white">
                        Total {parsedExcelItems.length} Baris Ditemukan:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-semibold">
                        {validExcelCount} Valid
                      </span>
                      {invalidExcelCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/40 font-semibold">
                          {invalidExcelCount} Bermasalah
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {invalidExcelCount > 0 && (
                        <label className="text-xs text-slate-400 flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={excelFilterValidOnly}
                            onChange={e => setExcelFilterValidOnly(e.target.checked)}
                            className="rounded-sm bg-slate-900 border-slate-700 text-emerald-500"
                          />
                          <span>Hanya tampilkan yang valid</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* List of items preview */}
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {parsedExcelItems
                      .filter(item => !excelFilterValidOnly || item.isValid)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-colors ${
                            item.isValid
                              ? 'bg-slate-950/70 border-slate-800'
                              : 'bg-rose-950/20 border-rose-900/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-bold">
                                {item.data.competency_name} ({item.data.competency_code})
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                                {item.data.difficulty}
                              </span>
                            </div>

                            <div>
                              {item.isValid ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-[10px] font-semibold flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>Siap Impor</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/40 text-[10px] font-semibold flex items-center space-x-1">
                                  <X className="w-3 h-3" />
                                  <span>{item.validationError}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-slate-200 font-medium leading-relaxed">
                            {item.data.question_text}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[11px] pt-1">
                            {(['A', 'B', 'C', 'D', 'E'] as const).map(key => (
                              <div key={key} className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="flex items-center justify-between mb-1">
                                  <strong className="text-amber-400 font-mono">{key}</strong>
                                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                                    Skor: {item.data.options[key]?.weight}
                                  </span>
                                </div>
                                <p className="text-slate-400 truncate text-[10px]" title={item.data.options[key]?.text}>
                                  {item.data.options[key]?.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleImportValidExcelQuestions}
                  disabled={isImportingExcel || validExcelCount === 0}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isImportingExcel ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCheck className="w-4 h-4" />
                  )}
                  <span>
                    {isImportingExcel
                      ? 'Mengimpor ke Bank Soal...'
                      : `Impor ${validExcelCount} Soal Valid ke Bank Soal`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT QUESTION */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl my-6 p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {editingQuestion.id ? 'Edit Butir Soal SJT' : 'Tambah Soal SJT Baru'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kompetensi Target *
                  </label>
                  <select
                    value={editingQuestion.competency_id}
                    onChange={e => setEditingQuestion({ ...editingQuestion, competency_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {competencies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Soal
                  </label>
                  <select
                    value={editingQuestion.status}
                    onChange={e => setEditingQuestion({ ...editingQuestion, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Approved">Approved (Aktif Diujikan)</option>
                    <option value="Draft">Draft (Disimpan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skenario Situasi / Pertanyaan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question_text}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  placeholder="Tuliskan skenario studi kasus situasi organisasi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              {/* 5 Options Inputs */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  5 Opsi Tindakan & Bobot Skor (1 s.d. 5)
                </h4>

                {(['A', 'B', 'C', 'D', 'E'] as const).map(key => (
                  <div key={key} className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {key}
                    </span>
                    <input
                      type="text"
                      required
                      value={editingQuestion.options?.[key]?.text || ''}
                      onChange={e => {
                        const opts = { ...editingQuestion.options } as any;
                        opts[key] = { ...opts[key], text: e.target.value };
                        setEditingQuestion({ ...editingQuestion, options: opts });
                      }}
                      placeholder={`Deskripsi tindakan opsi ${key}...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                    <div className="w-24 shrink-0">
                      <select
                        value={editingQuestion.options?.[key]?.weight || 1}
                        onChange={e => {
                          const opts = { ...editingQuestion.options } as any;
                          opts[key] = { ...opts[key], weight: Number(e.target.value) };
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                        className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-bold focus:outline-hidden focus:border-amber-500"
                      >
                        <option value={5}>Skor 5</option>
                        <option value={4}>Skor 4</option>
                        <option value={3}>Skor 3</option>
                        <option value={2}>Skor 2</option>
                        <option value={1}>Skor 1</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Indikator Perilaku
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.indicator || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, indicator: e.target.value })}
                    placeholder="Contoh: Mengambil keputusan cepat saat darurat"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telaah / Penjelasan Bobot
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.explanation || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Rasional opsi terbaik (Skor 5)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE QUESTIONS WITH GEMINI AI */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl my-6 p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  AI Question Generator (Gemini Flash)
                </h3>
                <p className="text-xs text-slate-400">
                  Buat butir soal SJT berbobot 1–5 terkalibrasi secara otomatis berdasarkan kompetensi dan konteks Sanggar Seni SENDRATASIK.
                </p>
              </div>
            </div>

            {/* AI Control Panel */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kompetensi Target *
                  </label>
                  <select
                    value={aiParams.competency_id}
                    onChange={e => setAiParams({ ...aiParams, competency_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {competencies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={aiParams.difficulty}
                    onChange={e => setAiParams({ ...aiParams, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah Soal yang Dihasilkan
                  </label>
                  <select
                    value={aiParams.count}
                    onChange={e => setAiParams({ ...aiParams, count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value={1}>1 Soal</option>
                    <option value={2}>2 Soal</option>
                    <option value={3}>3 Soal</option>
                    <option value={5}>5 Soal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Konteks & Skenario Kasus Spesifik
                </label>
                <input
                  type="text"
                  value={aiParams.context}
                  onChange={e => setAiParams({ ...aiParams, context: e.target.value })}
                  placeholder="Misal: Gladi resik panggung, koordinasi pementasan, dinamika tim..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Preset Cepat:</span>
                {CONTEXT_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setAiParams({ ...aiParams, context: preset })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Optimasi latensi ultra cepat (tanpa delay buffer)</span>
                </div>

                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isGeneratingAi ? 'Menyusun Soal Instan...' : 'Hasilkan Draf Soal Sekarang'}</span>
                </button>
              </div>
            </div>

            {/* Loading Indicator with Animated Steps */}
            {isGeneratingAi && (
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-amber-500/20 text-center space-y-3 mb-6">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">AI Sedang Menyusun Draf Soal SJT</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Menyusun skenario situasi realistis madrasah, 5 opsi bergradasi bobot 1–5, dan telaah indikator psikometri...
                </p>
              </div>
            )}

            {/* Generated Drafts List */}
            {aiDrafts.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <span>Hasil Draf AI ({aiDrafts.length} Butir Soal)</span>
                    </h4>
                    <button
                      onClick={handleClearAllDrafts}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-medium underline underline-offset-2 flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Semua Draf</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleImportAllDrafts}
                      disabled={isImportingBatch || aiDrafts.length === 0}
                      className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isImportingBatch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Simpan Semua ({aiDrafts.length} Soal) ke Bank Soal</span>
                    </button>
                  </div>
                </div>

                {aiDrafts.map((draft, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-xs font-bold text-amber-400">
                          Draf #{dIdx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold">
                          {draft.difficulty || aiParams.difficulty}
                        </span>
                        {draft.indicator && (
                          <span className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                            • {draft.indicator}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {/* Regenerate this specific draft */}
                        <button
                          onClick={() => handleRegenerateSingleDraft(dIdx)}
                          disabled={regeneratingIndex === dIdx}
                          title="Buat ulang hanya soal ini dengan variasi baru"
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${regeneratingIndex === dIdx ? 'animate-spin text-amber-400' : ''}`} />
                          <span className="hidden sm:inline">Buat Ulang</span>
                        </button>

                        {/* Delete this specific draft */}
                        <button
                          onClick={() => handleDeleteDraft(dIdx)}
                          title="Hapus draf soal ini"
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>

                        {/* Save this draft to Bank Soal */}
                        <button
                          onClick={() => handleImportAiDraft(draft, dIdx)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs border border-slate-700 hover:border-emerald-400 transition-all shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan ke Bank Soal</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                      {draft.question_text}
                    </p>

                    <div className="space-y-1.5">
                      {(['A', 'B', 'C', 'D', 'E'] as const).map(k => (
                        <div
                          key={k}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start sm:items-center justify-between gap-3"
                        >
                          <span className="text-slate-300">
                            <strong className="text-amber-400 mr-1">{k}.</strong> {draft.options[k]?.text}
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                            Bobot: {draft.options[k]?.weight}
                          </span>
                        </div>
                      ))}
                    </div>

                    {draft.explanation && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 italic">
                        <strong>Telaah Psikometri:</strong> {draft.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
