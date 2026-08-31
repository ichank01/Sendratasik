import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/common/Header.js';
import { LoginView } from './components/auth/LoginView.js';
import { ChangePasswordModal } from './components/common/ChangePasswordModal.js';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard.js';

// Admin Tabs
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { ParticipantsTab } from './components/admin/ParticipantsTab.js';
import { ResultsAndRankingTab } from './components/admin/ResultsAndRankingTab.js';
import { ParticipantComparisonTab } from './components/admin/ParticipantComparisonTab.js';
import { QuestionBankTab } from './components/admin/QuestionBankTab.js';
import { CompetenciesTab } from './components/admin/CompetenciesTab.js';
import { PositionProfilesTab } from './components/admin/PositionProfilesTab.js';
import { ExamSettingsTab } from './components/admin/ExamSettingsTab.js';
import { ActivityLogsTab } from './components/admin/ActivityLogsTab.js';
import { BackupSettingsTab } from './components/admin/BackupSettingsTab.js';

import {
  LayoutDashboard,
  Users,
  Award,
  Layers,
  BookOpen,
  Settings,
  ShieldCheck,
  Database,
  Sparkles,
  Loader2
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'participants', label: 'Peserta', icon: Users },
  { id: 'results', label: 'Peringkat & Rekap', icon: Award },
  { id: 'compare', label: 'Komparasi Radar', icon: Layers },
  { id: 'questions', label: 'Bank Soal & AI', icon: BookOpen },
  { id: 'competencies', label: '12 Kompetensi', icon: Sparkles },
  { id: 'positions', label: 'Profil Posisi', icon: Layers },
  { id: 'settings', label: 'Pengaturan CBT', icon: Settings },
  { id: 'logs', label: 'Audit Trail', icon: ShieldCheck },
  { id: 'backup', label: 'Cadangan Data', icon: Database },
];

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#888]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF3E00]" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#AAA]">Memuat sistem CBT SENDRATASIK...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // If Participant Role:
  if (user.role === 'participant') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col selection:bg-[#FF3E00] selection:text-white">
        <Header onChangePassword={() => setShowPasswordModal(true)} />
        <div className="flex-1">
          <ParticipantDashboard />
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </div>
    );
  }

  // If Admin / Pembina Role:
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col selection:bg-[#FF3E00] selection:text-white">
      <Header onChangePassword={() => setShowPasswordModal(true)} />

      {/* Admin Navigation Tab Bar */}
      <nav aria-label="Admin Navigation" className="bg-[#0D0D0D] border-b border-[#222] sticky top-16 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {ADMIN_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#FF3E00] text-white shadow-lg shadow-[#FF3E00]/20 font-black'
                      : 'text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#888]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Admin Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'participants' && <ParticipantsTab />}
        {activeTab === 'results' && <ResultsAndRankingTab />}
        {activeTab === 'compare' && <ParticipantComparisonTab />}
        {activeTab === 'questions' && <QuestionBankTab />}
        {activeTab === 'competencies' && <CompetenciesTab />}
        {activeTab === 'positions' && <PositionProfilesTab />}
        {activeTab === 'settings' && <ExamSettingsTab />}
        {activeTab === 'logs' && <ActivityLogsTab />}
        {activeTab === 'backup' && <BackupSettingsTab />}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
