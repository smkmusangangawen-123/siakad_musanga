import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Database,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Server,
  HardDrive,
  FileText,
  Building2,
  Image as ImageIcon,
  Key,
  Camera,
} from 'lucide-react';
import { User, NilaiSiswa, AbsensiRecord, DatabaseBackupLog, SchoolSettings } from '../../types';

interface AdminDashboardProps {
  users: User[];
  grades: NilaiSiswa[];
  attendance: AbsensiRecord[];
  backups: DatabaseBackupLog[];
  onNavigateTab: (tab: any) => void;
  schoolSettings?: SchoolSettings;
  onOpenSchoolSettings?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  grades,
  attendance,
  backups,
  onNavigateTab,
  schoolSettings,
  onOpenSchoolSettings,
}) => {

  const totalStudents = users.filter((u) => u.role === 'siswa').length;
  const totalTeachers = users.filter((u) => u.role === 'guru').length;
  const totalParents = users.filter((u) => u.role === 'orangtua').length;
  const todayAttendance = attendance.filter((a) => a.tanggal === '2026-08-10');
  const presentCount = todayAttendance.filter((a) => a.status === 'Hadir').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> System Administrator & Database Manager
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <span>{schoolSettings?.namaSekolah || 'SIAKAD Smart School'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Admin Control
            </span>
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Sistem Informasi Sekolah terpadu dengan mesin database PostgreSQL, otomatisasi absensi GPS, notifikasi WhatsApp orang tua, dan pembacaan E-Raport digital.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('kop-raport' as any)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 border border-emerald-400/30"
            >
              <Building2 className="w-4 h-4 text-emerald-200" /> Kop Raport & Logo Kiri/Kanan
            </button>
            {onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 border border-blue-400/30"
              >
                <Building2 className="w-4 h-4 text-blue-200" /> Pengaturan Identitas & Logo Utama
              </button>
            )}
            <button
              onClick={() => onNavigateTab('upload-foto-siswa')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-indigo-200" /> Upload Foto Siswa
            </button>
            <button
              onClick={() => onNavigateTab('users')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 border border-amber-300/30"
            >
              <Key className="w-4 h-4 text-amber-100" /> CRUD Akun & Password Pengguna
            </button>
            <button
              onClick={() => onNavigateTab('users')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-purple-400" /> Kelola Data Master & Pengguna
            </button>
            <button
              onClick={() => onNavigateTab('backup')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 text-slate-200"
            >
              <Database className="w-4 h-4 text-emerald-400" /> PostgreSQL Backup Console
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-5 rounded-xl border-none shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-200 mb-1 uppercase tracking-wider">Total Siswa Aktif</p>
            <h3 className="text-2xl font-bold">{totalStudents} Siswa</h3>
            <p className="text-[10px] text-blue-100 font-bold mt-1">Kelas 10 IPA 1 & 2</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/40 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Guru & Pengajar</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalTeachers} Guru</h3>
            <p className="text-[10px] text-blue-600 font-bold mt-1">Pengajar & Sertifikasi</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Kehadiran Hari Ini (GPS)</p>
            <h3 className="text-2xl font-bold text-slate-800">{attendanceRate}%</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Presensi GPS Verified</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Database PostgreSQL</p>
            <h3 className="text-2xl font-bold text-slate-800">14.8 MB</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">PostgreSQL Nightly OK</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* School Profile & Master Identity Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden shrink-0">
              {schoolSettings?.logoUrl ? (
                <img src={schoolSettings.logoUrl} alt={schoolSettings.namaSekolah} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                {schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School'}
              </h3>
              <p className="text-xs text-slate-500">
                NPSN: <span className="font-mono font-bold text-slate-700">{schoolSettings?.npsn || '20108972'}</span> • Akreditasi: <span className="font-bold text-emerald-600">{schoolSettings?.akreditasi || 'A (Unggul)'}</span>
              </p>
            </div>
          </div>

          {onOpenSchoolSettings && (
            <button
              onClick={onOpenSchoolSettings}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-600" /> Kelola Identitas Sekolah & Kepala Sekolah
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Kepala Sekolah</p>
            <p className="font-extrabold text-slate-900 mt-0.5">{schoolSettings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd'}</p>
            <p className="text-[10px] text-slate-500 font-mono">NIP. {schoolSettings?.nipKepalaSekolah || '197508122001121001'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Alamat Sekolah</p>
            <p className="font-semibold text-slate-800 mt-0.5 truncate">{schoolSettings?.alamatSekolah || 'Jl. Pendidikan No. 45, Jakarta'}</p>
            <p className="text-[10px] text-slate-500 truncate">Kec. Gambir, Jakarta Pusat</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Kontak & Portal</p>
            <p className="font-semibold text-slate-800 mt-0.5 truncate">{schoolSettings?.telepon || '(021) 3840192'}</p>
            <p className="text-[10px] text-blue-600 truncate">{schoolSettings?.website || 'siakad.sch.id'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sinkronisasi Global</p>
            <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terintegrasi 100%
            </p>
            <p className="text-[10px] text-slate-500">Guru, Siswa, Ortu, Raport</p>
          </div>
        </div>
      </div>

      {/* System Status & Database Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" /> PostgreSQL Infrastructure Monitor
            </h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              System Health 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold uppercase">DBMS Engine</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">PostgreSQL 16.2</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold uppercase">Koneksi Aktif</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">12 Connection Pools</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold uppercase">Lokasi Server</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Jakarta Cloud Zone A</p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-700 mb-2">Riwayat Backup Otomatis Terakhir:</h4>
          <div className="space-y-2">
            {backups.slice(0, 3).map((bkp) => (
              <div
                key={bkp.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="font-bold text-slate-900">{bkp.fileName}</p>
                    <p className="text-[11px] text-slate-500">
                      {bkp.tipe} • Ukuran: {bkp.ukuranFile}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {bkp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Navigation Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" /> Akses Cepat Fitur Administrator
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('users')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-xs cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-900">Manajemen Pengguna & Pegawai</p>
                <p className="text-[11px] text-slate-500">Kelola data Guru, Staf TU, Siswa, Kelas & Jurusan</p>
              </div>
              <Users className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => onNavigateTab('absensi')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">Rekap Absensi GPS Lokasi</p>
                <p className="text-[11px] text-slate-500">Pantau verifikasi koordinat & jarak</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              onClick={() => onNavigateTab('eraport')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">E-Raport Digital & Cetak PDF</p>
                <p className="text-[11px] text-slate-500">Unduh PDF per-kelas atau per-siswa</p>
              </div>
              <FileText className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
