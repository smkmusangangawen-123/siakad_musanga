import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Award,
  BarChart3,
  BookOpen,
  Library,
  MessageSquare,
  Calendar,
  Bell,
  Users,
  Database,
  FileCheck,
  QrCode,
  GraduationCap,
  Building2,
  Camera,
} from 'lucide-react';
import { UserRole, SchoolSettings } from '../types';

export type TabType =
  | 'dashboard'
  | 'daftar-siswa'
  | 'upload-foto-siswa'
  | 'kartu-absensi'
  | 'absensi'
  | 'nilai'
  | 'analitik'
  | 'eraport'
  | 'kop-raport'
  | 'materi-tugas'
  | 'forum'
  | 'perpustakaan'
  | 'kalender'
  | 'notifikasi'
  | 'users'
  | 'backup';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  isWaliKelas?: boolean;
  schoolSettings?: SchoolSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  isWaliKelas,
  schoolSettings,
}) => {

  const getNavItems = () => {
    const items = [
      {
        id: 'dashboard' as TabType,
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Command Center',
      },
      {
        id: 'daftar-siswa' as TabType,
        label: 'Daftar Siswa & Rekap Absensi',
        icon: GraduationCap,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        badge: 'Rekap & Mapel',
        section: 'Command Center',
      },
      {
        id: 'upload-foto-siswa' as TabType,
        label: 'Upload Foto Siswa',
        icon: Camera,
        roles: ['admin', 'guru'],
        badge: 'Admin & Walas',
        section: 'Command Center',
      },
      {
        id: 'kartu-absensi' as TabType,
        label: 'Kartu Siswa & Barcode',
        icon: QrCode,
        roles: ['admin'],
        badge: 'Barcode & QR',
        section: 'Command Center',
      },
      {
        id: 'absensi' as TabType,
        label: 'Absensi GPS Real-time',
        icon: MapPin,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        badge: 'GPS Valid',
        section: 'Command Center',
      },
      {
        id: 'nilai' as TabType,
        label: 'Manajemen Nilai',
        icon: Award,
        roles: ['admin', 'guru'],
        section: 'Command Center',
      },
      {
        id: 'analitik' as TabType,
        label: 'Analitik Perkembangan',
        icon: BarChart3,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Command Center',
      },
      {
        id: 'eraport' as TabType,
        label: 'E-Raport Digital & PDF',
        icon: FileCheck,
        roles: ['admin', 'guru'],
        badge: 'Cetak PDF',
        section: 'Command Center',
      },
      {
        id: 'materi-tugas' as TabType,
        label: 'Materi & Tugas Pelajaran',
        icon: BookOpen,
        roles: ['admin', 'guru', 'siswa'],
        section: 'Resource Library',
      },
      {
        id: 'forum' as TabType,
        label: 'Ruang Diskusi Q&A',
        icon: MessageSquare,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Resource Library',
      },
      {
        id: 'perpustakaan' as TabType,
        label: 'Perpustakaan Digital',
        icon: Library,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Resource Library',
      },
      {
        id: 'kalender' as TabType,
        label: 'Kalender & Jadwal Akademik',
        icon: Calendar,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Resource Library',
      },
      {
        id: 'notifikasi' as TabType,
        label: 'Notifikasi Orang Tua',
        icon: Bell,
        roles: ['admin', 'guru', 'orangtua'],
        badge: 'WhatsApp',
        section: 'System Admin',
      },
      {
        id: 'users' as TabType,
        label: 'Data Master & Pengguna',
        icon: Users,
        roles: ['admin'],
        badge: 'Master Data',
        section: 'System Admin',
      },
      {
        id: 'kop-raport' as TabType,
        label: 'Kop Raport & Logo Kiri/Kanan',
        icon: Building2,
        roles: ['admin'],
        badge: 'Khusus Admin',
        section: 'System Admin',
      },
      {
        id: 'backup' as TabType,
        label: 'Backup Database PostgreSQL',
        icon: Database,
        roles: ['admin'],
        badge: 'Nightly',
        section: 'System Admin',
      },
    ];

    return items.filter((item) => {
      if (!item.roles.includes(userRole)) return false;
      if (item.id === 'eraport' || item.id === 'upload-foto-siswa') {
        if (userRole === 'admin') return true;
        if (userRole === 'guru' && isWaliKelas) return true;
        return false;
      }
      return true;
    });
  };

  const navItems = getNavItems();
  const sections = Array.from(new Set(navItems.map((i) => i.section)));

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 flex flex-col justify-between rounded-xl shadow-md lg:min-h-[calc(100vh-5rem)]">
      <div>
        {/* Brand Header */}
        <div className="p-3 mb-3 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm overflow-hidden border border-blue-500 shrink-0">
            {schoolSettings?.logoUrl ? (
              <img src={schoolSettings.logoUrl} alt={schoolSettings.namaSekolah} className="w-full h-full object-cover p-0.5" />
            ) : (
              <GraduationCap className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white tracking-tight block truncate">
              {schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">SIAKAD Engine v3.8</span>
          </div>
        </div>

        {/* Access Role Mode Indicator */}
        <div className="px-3 py-2 mb-3 bg-slate-800/50 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] font-semibold text-slate-200 capitalize">
              Role: <span className="text-blue-400 font-bold">{userRole}</span>
              {isWaliKelas && ' (Wali Kelas)'}
            </p>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            PROD
          </span>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-3">
          {sections.map((sec) => {
            const secItems = navItems.filter((item) => item.section === sec);
            return (
              <div key={sec}>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1.5">
                  {sec}
                </div>
                <div className="space-y-1 mt-0.5">
                  {secItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider shrink-0 ${
                              isActive
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="mt-6 pt-3 border-t border-slate-800">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            BACKUP STATUS
          </div>
          <div className="text-xs flex items-center gap-2 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Terjadwal: 00:00 WIB</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
