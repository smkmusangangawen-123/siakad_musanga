import React from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  MapPin,
  Download,
  Clock,
  Sparkles,
  School,
  Building2,
} from 'lucide-react';
import { User, NilaiSiswa, AbsensiRecord, TugasPelajaran, SchoolSettings, Kelas } from '../../types';

interface StudentDashboardProps {
  currentUser: User;
  grades: NilaiSiswa[];
  attendance: AbsensiRecord[];
  tugasList: TugasPelajaran[];
  schoolSettings?: SchoolSettings;
  classes?: Kelas[];
  allUsers?: User[];
  onNavigateTab: (tab: any) => void;
  onDownloadRaport: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  grades,
  attendance,
  tugasList,
  schoolSettings,
  classes = [],
  allUsers = [],
  onNavigateTab,
  onDownloadRaport,
}) => {
  const studentClass = classes.find(
    (c) => c.id === currentUser.kelasId || c.nama === currentUser.kelasNama
  ) || classes[0];

  const matchedWaliTeacher = allUsers.find(
    (u) => u.id === studentClass?.waliKelasId || u.name === studentClass?.waliKelasNama
  );

  const dynamicWaliKelasNama = studentClass?.waliKelasNama || matchedWaliTeacher?.name || 'Budi Santoso S.Pd';
  const dynamicWaliPhone = matchedWaliTeacher?.phone || '0812-3456-7890';
  const dynamicSchoolName = schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School';
  const dynamicKepalaSekolah = schoolSettings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd';

  const myGrades = grades.filter((g) => g.siswaId === currentUser.id || g.siswaNama === currentUser.name);
  const avgGrade =
    myGrades.length > 0 ? (myGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0) / myGrades.length).toFixed(1) : '92.5';

  const myAttendance = attendance.filter((a) => a.siswaId === currentUser.id || a.siswaNama === currentUser.name);
  const totalDays = myAttendance.length || 1;
  const presentDays = myAttendance.filter((a) => a.status === 'Hadir').length || 1;
  const attendancePercent = Math.round((presentDays / totalDays) * 100);

  // Filter tasks specifically for this student's class or universal assignments
  const studentClassName = studentClass?.nama || currentUser.kelasNama || '10 IPA 1';
  const myClassTugas = tugasList.filter((t) => {
    return (
      !t.kelasNama ||
      t.kelasNama === 'Semua Kelas' ||
      t.kelasId === 'all' ||
      t.kelasNama.toLowerCase() === studentClassName.toLowerCase() ||
      t.kelasId === studentClass?.id ||
      t.kelasId === currentUser.kelasId
    );
  });

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              Siswa Aktif • {studentClass?.nama || currentUser.kelasNama || '10 IPA 1'}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-slate-200">
              {dynamicSchoolName}
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2">Halo, {currentUser.name}!</h2>
          <p className="text-slate-300 text-xs mt-1">
            NISN: <span className="font-mono text-amber-300 font-bold">{currentUser.nisn || '0061234567'}</span> • Wali Kelas: <span className="font-bold text-white">{dynamicWaliKelasNama}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kepala Sekolah: {dynamicKepalaSekolah}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateTab('absensi')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4" /> Absensi GPS Hari Ini
          </button>
          <button
            onClick={onDownloadRaport}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Unduh E-Raport PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Rata-Rata Akademik</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{avgGrade}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Predikat Sangat Baik (A)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Kehadiran Sekolah (GPS)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{attendancePercent}%</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tepat Waktu & Valid</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Wali Kelas Anda</p>
          <h3 className="text-sm font-extrabold text-slate-900 mt-1">{dynamicWaliKelasNama}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">WA: {dynamicWaliPhone}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Tugas Menunggu</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{myClassTugas.length} Tugas</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Khusus Kelas {studentClassName}</p>
        </div>
      </div>

      {/* Student Academic Grades Summary & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Nilai Pelajaran Semester Ganjil
            </h3>
            <button
              onClick={() => onNavigateTab('analitik')}
              className="text-xs text-blue-700 hover:underline font-bold"
            >
              Lihat Grafik Analitik →
            </button>
          </div>

          <div className="space-y-3">
            {myGrades.map((g) => (
              <div
                key={g.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{g.mataPelajaranNama}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    NH: {Math.round(g.nilaiHarian.reduce((a, b) => a + b, 0) / g.nilaiHarian.length)} | UTS: {g.nilaiUTS} | UAS: {g.nilaiUAS}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-700">{g.nilaiAkhir}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    Predikat {g.predikat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Tugas & Praktikum
          </h3>

          <div className="space-y-3">
            {myClassTugas.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Tidak ada tugas aktif untuk kelas {studentClassName}.
              </p>
            ) : (
              myClassTugas.map((t) => (
                <div key={t.id} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      {t.mataPelajaranNama}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      🎯 {t.kelasNama || 'Kelas ' + studentClassName}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1">{t.judul}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{t.deskripsi}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> {t.deadline}
                    </span>
                    <button
                      onClick={() => onNavigateTab('materi-tugas')}
                      className="px-2.5 py-1 bg-blue-700 text-white rounded-lg text-[10px] font-bold hover:bg-blue-600 cursor-pointer"
                    >
                      Kumpul Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
