import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { ExamSettings, ExamBlueprint } from '../../types.js';
import { Settings, Save, CheckCircle, Clock, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';

export const ExamSettingsTab: React.FC = () => {
  const [exam, setExam] = useState<ExamSettings | null>(null);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/exam-settings');
      setExam(data.exam);
      setBlueprints(data.blueprints);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    setIsSaving(true);
    try {
      await apiRequest('/admin/exam-settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...exam,
          blueprints
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !exam) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <span className="text-xs">Memuat konfigurasi ujian...</span>
      </div>
    );
  }

  const totalBlueprintTargets = blueprints.reduce((sum, b) => sum + (Number(b.target_count) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Pengaturan CBT & Blueprint Soal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi waktu ujian, randomisasi, privasi hasil peserta, dan distribusi soal per kompetensi.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Exam Parameter Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Parameter Pokok Ujian
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Tes CBT
              </label>
              <input
                type="text"
                required
                value={exam.title}
                onChange={e => setExam({ ...exam, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Durasi Waktu (Menit)
              </label>
              <input
                type="number"
                min={10}
                max={180}
                required
                value={exam.duration_minutes}
                onChange={e => setExam({ ...exam, duration_minutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-bold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Total Soal Diujikan
              </label>
              <input
                type="number"
                min={10}
                max={100}
                required
                value={exam.total_questions}
                onChange={e => setExam({ ...exam, total_questions: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-bold focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Randomization & Anti-Cheating Toggles */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={exam.randomize_questions}
                onChange={e => setExam({ ...exam, randomize_questions: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Acak Urutan Soal</span>
                <span className="text-[11px] text-slate-400">Urutan soal berbeda untuk tiap peserta</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={exam.randomize_options}
                onChange={e => setExam({ ...exam, randomize_options: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Acak Opsi Pilihan Jawaban</span>
                <span className="text-[11px] text-slate-400">Posisi opsi A s.d. E diacak secara otomatis</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={exam.activity_monitoring_enabled}
                onChange={e => setExam({ ...exam, activity_monitoring_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Anti-Cheating & Integrity Log</span>
                <span className="text-[11px] text-slate-400">Deteksi perpindahan tab & keluar fullscreen</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={exam.one_active_attempt}
                onChange={e => setExam({ ...exam, one_active_attempt: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Batasi 1 Kali Pengerjaan</span>
                <span className="text-[11px] text-slate-400">Peserta tidak dapat mengulang tanpa reset Admin</span>
              </div>
            </label>
          </div>

          {/* Privacy & Result Visibility for Participant */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Visibilitas Hasil untuk Peserta
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exam.show_participant_score}
                  onChange={e => setExam({ ...exam, show_participant_score: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span className="text-xs text-slate-300">Tampilkan Nilai Akhir</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exam.show_participant_rank}
                  onChange={e => setExam({ ...exam, show_participant_rank: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span className="text-xs text-slate-300">Tampilkan Peringkat</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exam.show_competency_profile}
                  onChange={e => setExam({ ...exam, show_competency_profile: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span className="text-xs text-slate-300">Tampilkan Radar Kompetensi</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exam.show_position_recommendation}
                  onChange={e => setExam({ ...exam, show_position_recommendation: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <span className="text-xs text-slate-300">Tampilkan Rekomendasi Jabatan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Blueprint Distribution Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Blueprint Distribusi Soal per Kompetensi
              </h3>
              <p className="text-xs text-slate-400">
                Atur berapa butir soal yang diambil sistem untuk setiap kompetensi saat peserta memulai ujian.
              </p>
            </div>

            <div className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold ${
              totalBlueprintTargets === exam.total_questions
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800'
            }`}>
              Total Target: {totalBlueprintTargets} / {exam.total_questions} Soal
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {blueprints.map((bp, idx) => (
              <div
                key={bp.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="truncate max-w-[180px]">
                  <div className="text-xs font-bold text-white truncate">{bp.competency_name}</div>
                  <div className="text-[10px] text-amber-400 font-mono">{bp.competency_code}</div>
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={bp.target_count}
                    onChange={e => {
                      const updated = [...blueprints];
                      updated[idx] = { ...updated[idx], target_count: Number(e.target.value) };
                      setBlueprints(updated);
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 text-center focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>

      </form>
    </div>
  );
};
