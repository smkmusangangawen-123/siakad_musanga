import React, { useState } from 'react';
import {
  GraduationCap,
  LogIn,
  MapPin,
  Award,
  BookOpen,
  Library,
  Calendar,
  Bell,
  Shield,
  Users,
  Database,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole, SchoolSettings } from '../../types';
import { LoginModal } from '../auth/LoginModal';
import { RaportValidationModal } from '../raport/RaportValidationModal';

interface PublicHomeProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  schoolSettings?: SchoolSettings;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ users, onLoginSuccess, schoolSettings }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [initialLoginRole, setInitialLoginRole] = useState<UserRole | 'all'>('all');

  const handleOpenLogin = (role: UserRole | 'all' = 'all') => {
    setInitialLoginRole(role);
    setIsLoginModalOpen(true);
  };

  const websiteTitle = schoolSettings?.websiteTitle || schoolSettings?.namaSekolah || 'SIAKAD Smart School';
  const websiteSubtitle = schoolSettings?.websiteSubtitle || 'Sistem Informasi Akademik & Portal Sekolah';
  const logoUrl = schoolSettings?.titleLogoUrl || schoolSettings?.logoUrl;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* School Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden border border-blue-500 shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={websiteTitle} className="w-full h-full object-cover p-0.5" />
                ) : (
                  <GraduationCap className="w-6 h-6" />
                )}
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  {websiteTitle}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {websiteSubtitle}
                </p>
              </div>
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <a href="#fitur" className="hover:text-blue-600 transition-colors">Layanan</a>
                <a href="#portal" className="hover:text-blue-600 transition-colors">Akses Akun</a>
                <a href="#pengumuman" className="hover:text-blue-600 transition-colors">Pengumuman</a>
              </nav>

              <button
                onClick={() => setIsValidationModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Pemeriksaan Validasi e-Raport"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Cek</span> Raport
              </button>

              <button
                onClick={() => handleOpenLogin('all')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white py-16 sm:py-20">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal Akademik & Pembelajaran Digital</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Sistem Informasi Akademik Sekolah
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Solusi terpadu untuk presensi harian, nilai & e-Raport, materi pembelajaran, serta informasi akademik sekolah secara mudah dan transparan.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleOpenLogin('all')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#portal"
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all text-center"
              >
                Pilih Akses Pengguna
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection / Quick Access Section */}
      <section id="portal" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Pilih Akses Akun
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Silakan pilih kategori akun Anda untuk masuk ke sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Admin */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Admin</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kelola master data, akun pengguna, sistem, dan backup data sekolah.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('admin')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Admin</span>
              </button>
            </div>

            {/* Guru */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Guru</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kelola nilai, presensi kelas, penugasan materi, dan e-Raport siswa.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('guru')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Guru</span>
              </button>
            </div>

            {/* Siswa */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Siswa</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Presensi harian, lihat nilai, tugas pelajaran, dan perpustakaan digital.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('siswa')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Siswa</span>
              </button>
            </div>

            {/* Orang Tua */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Orang Tua</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pantau kehadiran, nilai capaian anak, dan laporan e-Raport resmi.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('orangtua')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Orang Tua</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Feature Highlights */}
      <section id="fitur" className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Layanan & Fitur Utama
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fasilitas lengkap untuk mendukung proses belajar mengajar terintegrasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Presensi */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Presensi GPS</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pencatatan kehadiran harian berbasis lokasi GPS sekolah yang cepat dan akurat.
              </p>
            </div>

            {/* 2. Nilai & e-Raport */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Nilai & e-Raport</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengelolaan nilai harian, UTS, UAS, serta penerbitan e-Raport Kurikulum Merdeka.
              </p>
            </div>

            {/* 3. Materi & Tugas */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Materi & Tugas</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Distribusi modul pelajaran dan pengumpulan tugas online secara praktis.
              </p>
            </div>

            {/* 4. Perpustakaan */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                <Library className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Perpustakaan Digital</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Koleksi e-book kurikulum resmi yang dapat diakses langsung oleh siswa dan guru.
              </p>
            </div>

            {/* 5. Notifikasi WhatsApp */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-3">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Notifikasi Orang Tua</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemberitahuan otomatis kehadiran dan informasi nilai langsung ke nomor WhatsApp.
              </p>
            </div>

            {/* 6. Kalender */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Kalender Akademik</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jadwal kegiatan belajar, ujian semester, dan agenda penting sekolah sepanjang tahun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* School Announcements Section */}
      <section id="pengumuman" className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Pengumuman Sekolah
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Informasi dan agenda terkini kegiatan akademik.
              </p>
            </div>
            <button
              onClick={() => handleOpenLogin('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>10 Agustus 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Jadwal Penilaian Akhir Semester (PAS)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pelaksanaan PAS Ganjil akan dimulai sesuai kalender akademik. Kisi-kisi tersedia pada portal materi.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>08 Agustus 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Pemberlakuan Jam Presensi GPS
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Presensi lokasi GPS dibuka setiap hari sekolah pukul 06:30 - 07:15 WIB di area sekolah.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>05 Agustus 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Penambahan Buku Perpustakaan Digital
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Telah ditambahkan koleksi e-book Kurikulum Merdeka untuk semua jenjang kelas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{websiteTitle}</p>
              <p className="text-[11px] text-slate-400">{websiteSubtitle}</p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>© 2026 {websiteTitle}. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        schoolSettings={schoolSettings}
        initialRole={initialLoginRole}
        onLoginSuccess={(user) => {
          setIsLoginModalOpen(false);
          onLoginSuccess(user);
        }}
      />

      {/* Public Raport Validation Modal */}
      <RaportValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        schoolSettings={schoolSettings}
      />
    </div>
  );
};
