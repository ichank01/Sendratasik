import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Music, Award, ShieldCheck, User as UserIcon, LogOut, KeyRound, Sparkles } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal.js';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, isAdmin }) => {
  const { user, participant, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <header className="bg-[#0D0D0D] border-b border-[#222] text-[#F5F5F5] sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#FF3E00] flex items-center justify-center shadow-lg shadow-[#FF3E00]/25 text-white font-black">
                <Music className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-black text-lg sm:text-xl tracking-tighter text-[#F5F5F5] uppercase">
                    SENDRATASIK
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase bg-[#FF3E00]/15 text-[#FF3E00] border border-[#FF3E00]/40">
                    CBT.2026
                  </span>
                </div>
                <p className="text-[10px] text-[#777] font-semibold uppercase tracking-[0.2em]">
                  MAN Purbalingga • Seleksi Eksekutif
                </p>
              </div>
            </div>

            {/* User Profile & Actions */}
            {user && (
              <div className="flex items-center space-x-3.5">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#EDEDED] uppercase tracking-wide">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-[#FF3E00] font-mono font-semibold tracking-wider">
                    {user.role === 'admin' ? 'PEMBINA / ADMIN' : `NISN: ${user.username} • ${participant?.class_grade || ''}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="p-2 rounded-lg bg-[#181818] hover:bg-[#242424] border border-[#2A2A2A] hover:border-[#FF3E00] text-[#AAA] hover:text-white transition-all"
                    title="Ganti Kata Sandi"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#FF3E00] text-[#BBB] hover:text-white border border-[#2A2A2A] hover:border-[#FF3E00] transition-all text-xs font-bold uppercase tracking-wider"
                    title="Keluar dari Akun"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};
