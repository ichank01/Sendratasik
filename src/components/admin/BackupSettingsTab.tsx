import React, { useState } from 'react';
import { apiRequest } from '../../lib/api.js';
import { Download, Upload, Database, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

export const BackupSettingsTab: React.FC = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const data = await apiRequest('/admin/backup/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CBT_SENDRATASIK_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh cadangan database.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    if (!confirm('PERINGATAN: Memulihkan database akan menimpa data yang ada saat ini. Apakah Anda yakin ingin melanjutkan?')) {
      return;
    }

    setIsRestoring(true);
    setRestoreSuccess(null);
    setRestoreError(null);

    try {
      const text = await restoreFile.text();
      const jsonData = JSON.parse(text);

      await apiRequest('/admin/backup/restore', {
        method: 'POST',
        body: JSON.stringify({ backup_data: jsonData })
      });

      setRestoreSuccess('Database berhasil dipulihkan secara penuh!');
      setRestoreFile(null);
    } catch (err: any) {
      setRestoreError(err.message || 'Gagal memulihkan file cadangan. Format file tidak valid.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-amber-400" />
          <span>Cadangan & Pemulihan Basis Data (Backup & Restore)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simpan salinan data lengkap (peserta, bank soal, hasil ujian, konfigurasi) secara aman atau pulihkan dari file JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Unduh Cadangan Database</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Ekspor seluruh data sistem CBT ke dalam format JSON terenkripsi/terstruktur untuk arsip berkala atau sebelum pembaharuan data penting.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Mengemas Data...' : 'Unduh File JSON Sekarang'}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Pulihkan Database dari File</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Unggah file cadangan JSON yang valid untuk mengembalikan data sistem ke kondisi saat pencadangan dilakukan.
            </p>
          </div>

          <form onSubmit={handleRestore} className="space-y-3">
            <input
              type="file"
              accept=".json"
              onChange={e => setRestoreFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
            />

            {restoreSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{restoreSuccess}</span>
              </div>
            )}

            {restoreError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!restoreFile || isRestoring}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              {isRestoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isRestoring ? 'Memulihkan Data...' : 'Proses Pemulihan Database'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
