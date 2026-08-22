import React from 'react';
import {
  Heart,
  Award,
  MapPin,
  MessageSquare,
  Download,
  CheckCircle2,
  Bell,
  BarChart3,
  UserCheck,
  TrendingUp,
  School,
  Building2,
} from 'lucide-react';
import { User, NilaiSiswa, AbsensiRecord, NotificationLog, SchoolSettings, Kelas } from '../../types';

interface ParentDashboardProps {
  currentUser: User;
  childStudent: User | undefined;
  childGrades: NilaiSiswa[];
  childAttendance: AbsensiRecord[];
  parentNotifications: NotificationLog[];
  schoolSettings?: SchoolSettings;
  classes?: Kelas[];
  allUsers?: User[];
  onNavigateTab: (tab: any) => void;
  onDownloadRaport: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentUser,
  childStudent,
  childGrades,
  childAttendance,
  parentNotifications,
  schoolSettings,
  classes = [],
  allUsers = [],
  onNavigateTab,
  onDownloadRaport,
}) => {
  const childName = childStudent?.name || currentUser.childName || 'Ahmad Fauzi';

  const childClass = classes.find(
    (c) => c.id === childStudent?.kelasId || c.nama === childStudent?.kelasNama
  ) || classes[0];

  const matchedWaliTeacher = allUsers.find(
    (u) => u.id === childClass?.waliKelasId || u.name === childClass?.waliKelasNama
  );

  const dynamicWaliKelasNama = childClass?.waliKelasNama || matchedWaliTeacher?.name || 'Budi Santoso S.Pd';
  const dynamicWaliPhone = matchedWaliTeacher?.phone || '0812-3456-7890';
  const dynamicSchoolName = schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School';
  const dynamicKepalaSekolah = schoolSettings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd';

  const avgScore =
    childGrades.length > 0
      ? (childGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0) / childGrades.length).toFixed(1)
      : '92.5';

  return (
    <div className="space-y-6">
      {/* Welcome Parent Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
              Portal Orang Tua / Wali Murid
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-slate-200">
              {dynamicSchoolName}
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2">Selamat Datang, {currentUser.name}!</h2>
          <p className="text-amber-100 text-xs mt-1">
            Memantau Perkembangan Ananda: <span className="font-bold text-white underline">{childName}</span> ({childClass?.nama || '10 IPA 1'})
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Wali Kelas: <span className="text-amber-200 font-bold">{dynamicWaliKelasNama}</span> • Kepala Sekolah: {dynamicKepalaSekolah}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadRaport}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Unduh E-Raport PDF ({childName})
          </button>
          <button
            onClick={() => onNavigateTab('analitik')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" /> Analitik Grafik Nilai
          </button>
        </div>
      </div>

      {/* Quick Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Rata-Rata Nilai Ananda</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{avgScore}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Sangat Memuaskan (A)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Kehadiran Hari Ini (GPS)</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">Hadir (06:45)</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified Radius {dynamicSchoolName}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Wali Kelas Ananda</p>
          <h3 className="text-sm font-extrabold text-slate-900 mt-1">{dynamicWaliKelasNama}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Kontak WA: {dynamicWaliPhone}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Notifikasi WhatsApp</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">Aktif & Terintegrasi</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Nomor WA: {currentUser.phone}</p>
        </div>
      </div>

      {/* Grade Updates Feed & Real-time Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Grades */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Hasil Penilaian Akademik Terbaru
            </h3>
            <button
              onClick={() => onNavigateTab('analitik')}
              className="text-xs text-blue-700 hover:underline font-bold"
            >
              Detail Analitik →
            </button>
          </div>

          <div className="space-y-3">
            {childGrades.map((g) => (
              <div key={g.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{g.mataPelajaranNama}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900">
                    Nilai Akhir: {g.nilaiAkhir} ({g.predikat})
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200">
                  <div>Rata2 NH: <span className="font-bold text-slate-900">{Math.round(g.nilaiHarian.reduce((a, b) => a + b, 0) / g.nilaiHarian.length)}</span></div>
                  <div>UTS: <span className="font-bold text-slate-900">{g.nilaiUTS}</span></div>
                  <div>UAS: <span className="font-bold text-slate-900">{g.nilaiUAS}</span></div>
                </div>
                {g.catatanGuru && (
                  <p className="text-[11px] text-slate-500 mt-2 italic bg-amber-50/50 p-2 rounded border border-amber-200">
                    Catatan Guru: "{g.catatanGuru}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Notification Feed Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Log Notifikasi WhatsApp Terkirim
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Auto Sync
            </span>
          </div>

          <div className="space-y-3">
            {parentNotifications.map((ntf) => (
              <div key={ntf.id} className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold mb-1">
                  <span>{ntf.channel} Notification</span>
                  <span>{ntf.waktu}</span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200">
                  {ntf.pesan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
