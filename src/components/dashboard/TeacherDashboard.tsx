import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  FileCheck,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  MessageSquare,
  Download,
  Edit3,
  Search,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Filter,
  Upload,
  Camera,
  QrCode,
  Zap,
} from 'lucide-react';
import { User, NilaiSiswa, TugasPelajaran, AbsensiRecord, Kelas, Jurusan, SchoolSettings } from '../../types';
import { exportToCSV } from '../../utils/csvHelper';

interface TeacherDashboardProps {
  currentUser: User;
  allUsers: User[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  grades: NilaiSiswa[];
  tugasList: TugasPelajaran[];
  attendanceList: AbsensiRecord[];
  schoolSettings?: SchoolSettings;
  onNavigateTab: (tab: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  allUsers,
  classes,
  jurusanList,
  grades,
  tugasList,
  attendanceList,
  schoolSettings,
  onNavigateTab,
}) => {
  // Class selection for Teacher view
  const defaultClassId = currentUser.kelasId || classes[0]?.id || 'kls-10a';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedClassObj = classes.find((c) => c.id === selectedClassId) || classes[0];

  // All student users
  const allStudents = allUsers.filter((u) => u.role === 'siswa');

  // Students in selected class
  const classStudents = allStudents.filter((s) => {
    const matchesClass = s.kelasId === selectedClassId || s.kelasNama === selectedClassObj?.nama;
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(studentSearchQuery)) ||
      s.email.toLowerCase().includes(studentSearchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const classGrades = grades.filter((g) => g.kelasId === selectedClassId);
  const avgClassGrade =
    classGrades.length > 0
      ? (classGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0) / classGrades.length).toFixed(1)
      : '84.5';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Download Data Murid per Kelas (.CSV / Excel UTF-8 BOM)
  const handleDownloadClassData = () => {
    const rawClassStudents = allStudents.filter(
      (s) => s.kelasId === selectedClassId || s.kelasNama === selectedClassObj?.nama
    );

    const headers = ['No', 'NISN', 'Nama Lengkap Siswa', 'Kelas', 'Jurusan', 'Email Siswa', 'No WhatsApp / HP'];
    const rows = rawClassStudents.map((s, idx) => [
      idx + 1,
      s.nisn || '-',
      s.name,
      s.kelasNama || selectedClassObj?.nama || '-',
      s.jurusanNama || selectedClassObj?.jurusanNama || '-',
      s.email,
      s.phone || '-',
    ]);

    const cleanClassName = (selectedClassObj?.nama || 'Kelas').replace(/\s+/g, '_');
    exportToCSV(`Data_Siswa_${cleanClassName}_${Date.now()}.csv`, headers, rows);
    showToast(`Data siswa kelas ${selectedClassObj?.nama} berhasil diunduh format CSV/Excel.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                {currentUser.isWaliKelas ? `Wali Kelas ${currentUser.kelasNama || '10 IPA 1'}` : 'Guru Pengajar'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-slate-200">
                {schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Semester Ganjil 2025/2026
              </span>
            </div>
            <h2 className="text-2xl font-black mt-2">Selamat Datang, {currentUser.name}!</h2>
            <p className="text-slate-300 text-sm mt-1">
              Mata Pelajaran: <span className="font-bold text-amber-300">{currentUser.subject || 'Matematika Wajib'}</span> • Kepala Sekolah: {schoolSettings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('kartu-absensi')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-white ring-2 ring-emerald-400/40 animate-pulse"
            >
              <Zap className="w-4 h-4 text-amber-300" /> Stasiun Scan Barcode
            </button>
            <button
              onClick={() => onNavigateTab('nilai')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload & Input Nilai (CSV)
            </button>
            <button
              onClick={() => onNavigateTab('daftar-siswa')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer text-slate-200"
            >
              <Users className="w-4 h-4 text-purple-400" /> Data Siswa
            </button>
            {currentUser.isWaliKelas && (
              <>
                <button
                  onClick={() => onNavigateTab('upload-foto-siswa')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-white"
                >
                  <Camera className="w-4 h-4 text-indigo-200" /> Upload Foto Siswa
                </button>
                <button
                  onClick={() => onNavigateTab('eraport')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Cetak Raport PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Siswa Terdaftar (Kelas Ini)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{classStudents.length} Siswa</h3>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold">{selectedClassObj?.nama || '10 IPA 1'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Rata-Rata Nilai Akhir</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{avgClassGrade}</h3>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Diatas KKM (75)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Tugas Aktif Diampu</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{tugasList.length} Tugas</h3>
          <p className="text-[11px] text-amber-600 mt-1 font-semibold">Tersinkron dengan Siswa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">
            {currentUser.isWaliKelas ? 'Status E-Raport' : 'Peran Pengajar'}
          </p>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1 truncate">
            {currentUser.isWaliKelas ? 'Wali Kelas Aktif' : 'Guru Pengajar'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {currentUser.isWaliKelas ? `Kelas ${currentUser.kelasNama || selectedClassObj?.nama || '10 IPA 1'}` : (currentUser.subject || 'Mapel Umum')}
          </p>
        </div>
      </div>

      {/* STUDENT ROSTER SECTION (Read-Only untuk Guru, Download CSV Kelas Tersedia) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black text-slate-900">Daftar Murid Kelas Binaan</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Data peserta didik kelas binaan. Manajemen akun & kata sandi dikelola terpusat oleh Administrator TU.
            </p>
          </div>

          {/* Action Button: Download Data Kelas (.CSV) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadClassData}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Download Daftar Kelas (.CSV)
            </button>
          </div>
        </div>

        {/* Filter and Search Bar for Students */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Pilih Kelas:
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.jurusanNama || 'MIPA'}) - Wali: {c.waliKelasNama}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NISN murid..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Students Table (Read-Only) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Nama Murid</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Jurusan</th>
                <th className="py-3 px-4">Email Siswa</th>
                <th className="py-3 px-4">No. Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada murid yang terdaftar di {selectedClassObj?.nama}. Hubungi Administrator untuk sinkronisasi data siswa.
                  </td>
                </tr>
              ) : (
                classStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar || 'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-[11px] text-slate-400">ID: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.nisn || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.kelasNama || selectedClassObj?.nama}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.jurusanNama || selectedClassObj?.jurusanNama || 'MIPA'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="flex items-center gap-1 font-medium text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" /> {s.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="space-y-0.5 text-[11px]">
                        {s.phone ? (
                          <p className="flex items-center gap-1 text-slate-600 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" /> {s.phone}
                          </p>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Entry Table Quick Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Nilai Siswa Terbaru (Real-time Upload)</h3>
            <p className="text-xs text-slate-500">Mata Pelajaran: {currentUser.subject || 'Matematika Wajib'}</p>
          </div>
          <button
            onClick={() => onNavigateTab('nilai')}
            className="text-xs text-blue-700 hover:underline font-bold cursor-pointer"
          >
            Lihat Semua & Input Nilai →
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">NH (Rata2)</th>
                <th className="py-3 px-4">UTS</th>
                <th className="py-3 px-4">UAS</th>
                <th className="py-3 px-4">Nilai Akhir</th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 font-medium">
                    Belum ada entri nilai untuk kelas ini. Klik tombol Input Nilai untuk menambah.
                  </td>
                </tr>
              ) : (
                classGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{g.siswaNama}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{g.nisn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {Math.round(g.nilaiHarian.reduce((a, b) => a + b, 0) / g.nilaiHarian.length)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{g.nilaiUTS}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{g.nilaiUAS}</td>
                    <td className="py-3 px-4 font-black text-blue-700">{g.nilaiAkhir}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {g.predikat}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onNavigateTab('nilai')}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
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
