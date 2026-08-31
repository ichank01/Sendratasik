import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { PositionProfile } from '../../types.js';
import { Sparkles, Edit, Save, X, Layers } from 'lucide-react';

export const PositionProfilesTab: React.FC = () => {
  const [positions, setPositions] = useState<PositionProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingPos, setEditingPos] = useState<PositionProfile | null>(null);

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/positions');
      setPositions(data);
    } catch (err) {
      console.error('Failed to load positions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPos) return;

    try {
      await apiRequest(`/admin/positions/${editingPos.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingPos)
      });
      setEditingPos(null);
      fetchPositions();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil posisi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Matriks Profil 9 Posisi Struktural Eksekutif</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Bobot prioritas kompetensi yang digunakan algoritma sistem untuk menghitung rekomendasi penempatan jabatan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {positions.map(pos => (
          <div
            key={pos.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {pos.code}
                </span>
                <button
                  onClick={() => setEditingPos(pos)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Edit Deskripsi"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 font-serif">
                {pos.position_name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {pos.description}
              </p>

              {/* Priority Weights */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bobot Kompetensi Kunci:
                </span>
                <div className="space-y-1.5">
                  {Object.entries(pos.priority_weights).map(([compCode, weight]) => (
                    <div key={compCode} className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{compCode}</span>
                      <span className="font-mono font-bold text-amber-400">{weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setEditingPos(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              Edit Posisi: {editingPos.position_name}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Jabatan
                </label>
                <input
                  type="text"
                  required
                  value={editingPos.position_name}
                  onChange={e => setEditingPos({ ...editingPos, position_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Uraian Tugas & Peran
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPos.description}
                  onChange={e => setEditingPos({ ...editingPos, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPos(null)}
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
