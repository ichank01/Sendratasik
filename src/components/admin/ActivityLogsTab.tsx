import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import { ActivityLog } from '../../types.js';
import { ShieldCheck, Search, Clock, User, Info, Loader2 } from 'lucide-react';

export const ActivityLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/admin/activity-logs');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Audit Trail & Log Aktivitas Sistem</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rekam jejak seluruh aktivitas login, pengerjaan ujian, perubahan soal, dan tindakan pembina/admin.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari aktivitas atau username..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">Pengguna</th>
                <th className="px-4 py-3.5">Aksi</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-4 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                    <span>Memuat log aktivitas...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-sans">
                    Tidak ada catatan aktivitas yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-200">
                      {log.username || 'System'}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-sans text-slate-300">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
