import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { Competency } from '../../types.js';
import { Award, Edit, Save, X, Loader2, CheckCircle2 } from 'lucide-react';

export const CompetenciesTab: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingComp, setEditingComp] = useState<Competency | null>(null);

  const fetchComps = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/competencies');
      setCompetencies(data);
    } catch (err) {
      console.error('Failed to load competencies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComps();
  }, []);

  const handleSaveComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;

    try {
      await apiRequest(`/admin/competencies/${editingComp.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingComp)
      });
      setEditingComp(null);
      fetchComps();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kompetensi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Kerangka 12 Kompetensi Seleksi Eksekutif SENDRATASIK</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Daftar kompetensi kepemimpinan dan manajerial yang diuji melalui instrumen Situational Judgment Test (SJT).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies.map((c, idx) => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-400 font-mono font-semibold text-xs border border-slate-700">
                  {c.code}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {c.description}
              </p>

              {c.indicators && c.indicators.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Indikator Perilaku Kunci:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {c.indicators.map((ind, iIdx) => (
                      <li key={iIdx}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEditingComp(c)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Deskripsi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setEditingComp(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              Edit Kompetensi: {editingComp.name}
            </h3>

            <form onSubmit={handleSaveComp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Kompetensi
                </label>
                <input
                  type="text"
                  required
                  value={editingComp.name}
                  onChange={e => setEditingComp({ ...editingComp, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi / Definisi Operasional
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingComp.description}
                  onChange={e => setEditingComp({ ...editingComp, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingComp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
