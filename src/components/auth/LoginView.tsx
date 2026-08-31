import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Music, ShieldCheck, User as UserIcon, UserPlus, LogIn, Sparkles, AlertCircle, Loader2, CheckCircle2, BookOpen } from 'lucide-react';

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

export const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'peserta' | 'admin' | 'register'>('peserta');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(regData);
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Periksa kembali isian form.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-between selection:bg-[#FF3E00] selection:text-white relative overflow-hidden">
      {/* Background Architectural Watermark & Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FF3E00]/10 blur-[120px]" />
        <div className="absolute -bottom-10 -left-10 text-[160px] sm:text-[220px] font-black text-[#141414] tracking-tighter opacity-40 select-none z-0 pointer-events-none">
          SENDRATASIK
        </div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#222] bg-[#0D0D0D]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FF3E00] flex items-center justify-center text-white font-black shadow-lg shadow-[#FF3E00]/25">
              <Music className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-bold block">
                MAN Purbalingga
              </span>
              <h1 className="text-base font-black text-[#F5F5F5] tracking-tighter uppercase">
                SENDRATASIK CBT PORTAL
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AAA] bg-[#161616] px-3.5 py-1.5 rounded-lg border border-[#2A2A2A]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3E00]" />
            <span>SJT Engine • Server-Side Scoring</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Brand Info Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[#FF3E00] mb-3">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#FF3E00] font-bold block mb-1">
              Seleksi Eksekutif 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
              CBT KEMAMPUAN ORGANISASI
            </h2>
            <p className="text-xs text-[#888] mt-1.5 max-w-md mx-auto leading-relaxed">
              Situational Judgment Test (SJT) & Evaluasi 12 Kompetensi Kepemimpinan
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#0A0A0A] p-1.5 rounded-xl border border-[#222] mb-6">
            <button
              onClick={() => { setActiveTab('peserta'); setError(null); setUsername(''); setPassword(''); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'peserta'
                  ? 'bg-[#FF3E00] text-white shadow-lg shadow-[#FF3E00]/25 font-black'
                  : 'text-[#777] hover:text-[#CCC] hover:bg-[#161616]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Peserta (NISN)</span>
            </button>

            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'register'
                  ? 'bg-[#FF3E00] text-white shadow-lg shadow-[#FF3E00]/25 font-black'
                  : 'text-[#777] hover:text-[#CCC] hover:bg-[#161616]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Baru</span>
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setError(null); setUsername('Pembina'); setPassword('123456789'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#FF3E00] text-white shadow-lg shadow-[#FF3E00]/25 font-black'
                  : 'text-[#777] hover:text-[#CCC] hover:bg-[#161616]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pembina</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#290F0F] border border-rose-800/50 text-rose-300 text-xs flex items-center space-x-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1 & 2: LOGIN FORM */}
          {(activeTab === 'peserta' || activeTab === 'admin') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  {activeTab === 'peserta' ? 'Nomor Induk Siswa Nasional (NISN)' : 'Username Pembina'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={activeTab === 'peserta' ? 'Contoh: 0071234561' : 'Pembina'}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#282828] text-sm text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={activeTab === 'peserta' ? 'Password awal adalah NISN Anda' : '123456789'}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#282828] text-sm text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] transition-colors font-medium"
                />
              </div>

              {activeTab === 'peserta' && (
                <p className="text-[11px] text-[#777] font-medium leading-relaxed">
                  * Untuk pendaftar baru, kata sandi bawaan sama dengan NISN Anda. Anda dapat menggantinya setelah login.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-lg font-black text-xs uppercase tracking-widest text-white bg-[#FF3E00] hover:bg-[#E03700] transition-all shadow-lg shadow-[#FF3E00]/25 flex items-center justify-center space-x-2 disabled:opacity-50 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>{activeTab === 'peserta' ? 'Masuk ke Ujian CBT' : 'Masuk Dashboard Pembina'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.nisn}
                    onChange={e => setRegData({ ...regData, nisn: e.target.value })}
                    placeholder="10 digit NISN"
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Nama sesuai presensi"
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.class_grade}
                    onChange={e => setRegData({ ...regData, class_grade: e.target.value })}
                    placeholder="Contoh: XI MIPA 2"
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Jurusan
                  </label>
                  <select
                    value={regData.major}
                    onChange={e => setRegData({ ...regData, major: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white focus:outline-hidden focus:border-[#FF3E00]"
                  >
                    <option value="MIPA">MIPA</option>
                    <option value="IPS">IPS</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={regData.gender}
                    onChange={e => setRegData({ ...regData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white focus:outline-hidden focus:border-[#FF3E00]"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                    placeholder="email@madrasah.id"
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                  Pilihan Posisi Utama *
                </label>
                <select
                  value={regData.primary_choice}
                  onChange={e => setRegData({ ...regData, primary_choice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white focus:outline-hidden focus:border-[#FF3E00]"
                >
                  {POSISI_CHOICES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                  Pilihan Posisi Alternatif
                </label>
                <select
                  value={regData.alternative_choice}
                  onChange={e => setRegData({ ...regData, alternative_choice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white focus:outline-hidden focus:border-[#FF3E00]"
                >
                  {POSISI_CHOICES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                  Motivasi Mengikuti Eksekutif SENDRATASIK
                </label>
                <textarea
                  rows={2}
                  value={regData.motivation}
                  onChange={e => setRegData({ ...regData, motivation: e.target.value })}
                  placeholder="Ceritakan motivasi dan komitmen Anda..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#282828] text-xs text-white placeholder-[#555] focus:outline-hidden focus:border-[#FF3E00] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-lg font-black text-xs uppercase tracking-widest text-white bg-[#FF3E00] hover:bg-[#E03700] transition-all shadow-lg shadow-[#FF3E00]/25 flex items-center justify-center space-x-2 disabled:opacity-50 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Daftar & Lanjutkan ke CBT</span>
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1C1C1C] py-4 text-center text-[10px] uppercase tracking-[0.25em] text-[#666] font-bold">
        © 2026 Ekstrakurikuler SENDRATASIK • Madrasah Aliyah Negeri (MAN) Purbalingga
      </footer>
    </div>
  );
};
