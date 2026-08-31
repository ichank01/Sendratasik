import React, { useState } from 'react';
import { apiRequest } from '../../lib/api.js';
import { KeyRound, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121212] border border-[#262626] rounded-xl w-full max-w-md p-6 shadow-2xl text-[#F5F5F5] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#FF3E00]/10 border border-[#FF3E00]/30 flex items-center justify-center text-[#FF3E00]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF3E00] font-bold block">Keamanan Akun</span>
            <h3 className="text-base font-black uppercase tracking-tight text-[#F5F5F5]">Ganti Kata Sandi</h3>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#2B0E0E] border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-lg bg-[#0F291E] border border-emerald-800/40 text-emerald-300 text-sm flex items-center space-x-3 font-semibold">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Password berhasil diperbarui!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#282828] text-sm text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#282828] text-sm text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#282828] text-sm text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] transition-colors"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#888] hover:text-white bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white bg-[#FF3E00] hover:bg-[#E03700] transition-colors flex items-center space-x-1.5 shadow-lg shadow-[#FF3E00]/20 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
