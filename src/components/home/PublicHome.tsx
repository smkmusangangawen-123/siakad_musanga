import React, { useState } from 'react';
import {
  GraduationCap,
  LogIn,
  MapPin,
  Award,
  BookOpen,
  MessageSquare,
  Library,
  Calendar,
  Bell,
  Shield,
  CheckCircle2,
  Users,
  Database,
  ArrowRight,
  Sparkles,
  PhoneCall,
  FileCheck,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { User, UserRole, SchoolSettings } from '../../types';
import { LoginModal } from '../auth/LoginModal';

interface PublicHomeProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  schoolSettings?: SchoolSettings;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ users, onLoginSuccess, schoolSettings }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [initialLoginRole, setInitialLoginRole] = useState<UserRole | 'all'>('all');

  const handleOpenLogin = (role: UserRole | 'all' = 'all') => {
    setInitialLoginRole(role);
    setIsLoginModalOpen(true);
  };

  const websiteTitle = schoolSettings?.websiteTitle || schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School';
  const websiteSubtitle = schoolSettings?.websiteSubtitle || 'Sistem Informasi Akademik & Portal Pembelajaran Digital Terpadu';
  const logoUrl = schoolSettings?.titleLogoUrl || schoolSettings?.logoUrl;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 overflow-hidden border border-blue-500 shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={websiteTitle} className="w-full h-full object-cover p-0.5" />
                ) : (
                  <GraduationCap className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                    {websiteTitle}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    SIAKAD Pro v3.8
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                  {websiteSubtitle}
                </p>
              </div>
            </div>

            {/* Public Links & Login Button */}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur Unggulan</a>
                <a href="#portal" className="hover:text-blue-600 transition-colors">Akses Akun</a>
                <a href="#pengumuman" className="hover:text-blue-600 transition-colors">Pengumuman</a>
                <a href="#statistik" className="hover:text-blue-600 transition-colors">Statistik</a>
              </nav>

              <button
                onClick={() => handleOpenLogin('all')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
        {/* Background Subtle Mesh Decorative Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Platform Pendidikan Terintegrasi PostgreSQL & WhatsApp Gateway</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Sistem Akademik Cerdas & Pembelajaran Digital
              </h1>

              <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Memudahkan seluruh aktivitas sekolah dalam satu genggaman: presensi GPS lokasi real-time, kelola nilai & e-Raport Kurikulum Merdeka, perpustakaan e-book digital, serta notifikasi WhatsApp otomatis ke orang tua.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => handleOpenLogin('all')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#fitur"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all text-center"
                >
                  Jelajahi Fitur Unggulan
                </a>
              </div>

              {/* Status Badge Pills */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Presensi GPS Geofencing Active
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Database className="w-4 h-4" /> Database PostgreSQL Online
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Bell className="w-4 h-4" /> WhatsApp Notification Ready
                </span>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-2xl space-y-5 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-300 ml-2">SIAKAD Real-time Dashboard</span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LIVE SYSTEM
                  </span>
                </div>

                {/* Quick Cards inside Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Siswa Terdaftar</p>
                    <p className="text-xl font-extrabold text-white mt-1">1.248 Siswa</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">X, XI, XII IPA/IPS</p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Presensi GPS</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">98.2% Valid</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Radius Radius 50m OK</p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">E-Raport Digital</p>
                    <p className="text-xl font-extrabold text-blue-400 mt-1">100% Siap</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Format PDF Resmi</p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">E-Book Perpustakaan</p>
                    <p className="text-xl font-extrabold text-purple-400 mt-1">142 Koleksi</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kurikulum Merdeka</p>
                  </div>
                </div>

                {/* Quick login trigger inside preview card */}
                <div className="p-4 bg-blue-900/40 border border-blue-700/50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Akses Sistem SIAKAD</p>
                    <p className="text-[11px] text-blue-200">Masuk menggunakan akun terdaftar sekolah Anda.</p>
                  </div>
                  <button
                    onClick={() => handleOpenLogin('all')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Solusi Digital Lengkap
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              6 Fitur Utama Sistem Informasi Akademik
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Dirancang khusus untuk memenuhi standar administrasi sekolah modern dan Kurikulum Merdeka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Presensi GPS Real-time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan kehadiran berbasis lokasi GPS geofencing radius 50m dari titik sekolah, dilengkapi selfie presensi dan rekapitulasi otomatis.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Manajemen Nilai & E-Raport</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Input nilai harian, UTS, UAS, kalkulasi bobot otomatis, serta generate dokumen e-Raport resmi berformat PDF siap cetak.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">WhatsApp Gateway Orang Tua</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengiriman pesan WhatsApp otomatis ke nomor orang tua siswa saat ada penginputan nilai baru atau laporan keterlambatan presensi.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Portal Pembelajaran & Tugas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guru dapat mengunggah modul materi dan tugas pembelajaran, sementara siswa dapat mengumpulkan lembar jawaban secara online.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Perpustakaan Digital (E-Book)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akses buku teks pelajaran digital, e-book Kurikulum Merdeka, dan fitur peminjaman online langsung melalui gadget siswa.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Role Access Control & Backup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sistem RBAC dengan hak akses ketat untuk Admin, Guru, Siswa, dan Orang Tua, terhubung ke database PostgreSQL dengan nightly backup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection / Portal Section */}
      <section id="portal" className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Portal Masuk Pengguna
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pintu Masuk Terpadu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Silakan klik tombol Masuk untuk membuka formulir login resmi sesuai akun Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Administrator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kelola data pengguna, atur hak akses role (RBAC), monitoring presensi sekolah, serta trigger backup database PostgreSQL.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('admin')}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>

            {/* Guru */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Guru & Pengajar</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Input nilai mata pelajaran, rekap presensi kelas, buat penugasan siswa, upload materi modul, dan verifikasi e-Raport.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('guru')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>

            {/* Siswa */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Siswa</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Melakukan presensi GPS harian, lihat jadwal pelajaran, kumpulkan tugas online, pinjam e-book, dan unduh e-Raport PDF.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('siswa')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>

            {/* Orang Tua */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Orang Tua</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pantau kehadiran anak real-time, pantau rekapitulasi nilai, terima notifikasi WhatsApp, dan unduh e-Raport resmi anak.
                </p>
              </div>
              <button
                onClick={() => handleOpenLogin('orangtua')}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* School Announcements Section */}
      <section id="pengumuman" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Informasi Akademik
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Pengumuman Terbaru Sekolah
              </h2>
            </div>
            <button
              onClick={() => handleOpenLogin('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <span>Masuk untuk Detail Pengumuman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>10 Agustus 2026 • Kurikulum</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Jadwal Penilaian Akhir Semester (PAS) Ganjil T.A. 2026/2027
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                PAS Ganjil akan diselenggarakan mulai tanggal 1 Desember 2026. Seluruh kisi-kisi dan materi dapat diunduh pada portal materi siswa.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>08 Agustus 2026 • Presensi GPS</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Pemberlakuan Jam Presensi GPS Tepat Waktu Pukul 07:00 WIB
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Presensi lokasi GPS dibuka mulai pukul 06:30 - 07:15 WIB. Keterlambatan di atas pukul 07:15 WIB akan terkirim notifikasi otomatis ke WhatsApp orang tua.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>05 Agustus 2026 • E-Library</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                Penambahan 25 Judul E-Book Kurikulum Merdeka Terbaru
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Perpustakaan Digital SMA Negeri 1 kini memiliki penambahan modul digital Matematika Tingkat Lanjut, Fisika Modern, dan Sastra Indonesia.
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
              <p className="text-[11px] text-slate-400">SIAKAD Integrated Education Management System</p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>© 2026 {websiteTitle}. Hak Cipta Dilindungi.</p>
            <p className="mt-0.5 text-slate-400">Engine: PostgreSQL Database • Real-time WhatsApp Notification</p>
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
    </div>
  );
};
