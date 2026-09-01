import React, { useState, useRef, useEffect } from 'react';
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
  Pin,
  PinOff,
  ChevronRight,
  Menu,
  MousePointer,
  Sparkles,
  X,
} from 'lucide-react';
import { UserRole, SchoolSettings } from '../types';

export type TabType =
  | 'dashboard'
  | 'daftar-siswa'
  | 'upload-foto-siswa'
  | 'kartu-absensi'
  | 'absensi'
  | 'mapel'
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  isWaliKelas,
  schoolSettings,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Desktop Auto-hide & Hover state
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [justClicked, setJustClicked] = useState<boolean>(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveMobileOpen = isMobileOpen || internalMobileOpen;

  const closeMobileMenu = () => {
    setInternalMobileOpen(false);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Derived visibility for Desktop: expanded if pinned OR hovered (unless just clicked)
  const isExpanded = isPinned || (isHovered && !justClicked);

  const handleSelectMenu = (tabId: TabType) => {
    setActiveTab(tabId);
    closeMobileMenu();

    if (!isPinned) {
      setJustClicked(true);
      setIsHovered(false);
      setTimeout(() => {
        setJustClicked(false);
      }, 300);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!justClicked) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setJustClicked(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getNavItems = () => {
    const items = [
      {
        id: 'dashboard' as TabType,
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Utama',
      },
      {
        id: 'daftar-siswa' as TabType,
        label: 'Data Siswa',
        icon: GraduationCap,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Utama',
      },
      {
        id: 'absensi' as TabType,
        label: 'Presensi GPS',
        icon: MapPin,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Utama',
      },
      {
        id: 'kartu-absensi' as TabType,
        label: 'Kartu Siswa',
        icon: QrCode,
        roles: ['admin'],
        section: 'Utama',
      },
      {
        id: 'upload-foto-siswa' as TabType,
        label: 'Foto Siswa',
        icon: Camera,
        roles: ['admin', 'guru'],
        section: 'Utama',
      },
      {
        id: 'mapel' as TabType,
        label: 'Mata Pelajaran',
        icon: BookOpen,
        roles: ['admin', 'guru'],
        section: 'Akademik',
      },
      {
        id: 'nilai' as TabType,
        label: 'Nilai Siswa',
        icon: Award,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Akademik',
      },
      {
        id: 'eraport' as TabType,
        label: 'e-Raport',
        icon: FileCheck,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Akademik',
      },
      {
        id: 'analitik' as TabType,
        label: 'Analitik Nilai',
        icon: BarChart3,
        roles: ['admin', 'guru'],
        section: 'Akademik',
      },
      {
        id: 'materi-tugas' as TabType,
        label: 'Materi & Tugas',
        icon: BookOpen,
        roles: ['admin', 'guru', 'siswa'],
        section: 'Pembelajaran',
      },
      {
        id: 'perpustakaan' as TabType,
        label: 'Perpustakaan',
        icon: Library,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Pembelajaran',
      },
      {
        id: 'kalender' as TabType,
        label: 'Kalender Akademik',
        icon: Calendar,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Pembelajaran',
      },
      {
        id: 'forum' as TabType,
        label: 'Forum Diskusi',
        icon: MessageSquare,
        roles: ['admin', 'guru', 'siswa', 'orangtua'],
        section: 'Pembelajaran',
      },
      {
        id: 'notifikasi' as TabType,
        label: 'Notifikasi WA',
        icon: Bell,
        roles: ['admin', 'guru', 'orangtua'],
        section: 'Sistem',
      },
      {
        id: 'users' as TabType,
        label: 'Data Pengguna',
        icon: Users,
        roles: ['admin'],
        section: 'Sistem',
      },
      {
        id: 'kop-raport' as TabType,
        label: 'Kop Raport',
        icon: Building2,
        roles: ['admin'],
        section: 'Sistem',
      },
      {
        id: 'backup' as TabType,
        label: 'Backup Data',
        icon: Database,
        roles: ['admin'],
        section: 'Sistem',
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
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (Visible on screens lg: and above)    */}
      {/* ======================================================== */}
      <div
        className="hidden lg:block relative shrink-0 z-40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Mini Collapsed Bar (Visible when NOT expanded on Desktop) */}
        <div
          className={`flex flex-col items-center justify-between bg-slate-900 text-slate-300 py-3.5 px-2 rounded-2xl shadow-xl border border-slate-800 transition-all duration-300 cursor-pointer ${
            isExpanded ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : 'w-16 min-h-[calc(100vh-6.5rem)]'
          }`}
          onClick={() => setIsHovered(true)}
          title="Arahkan kursor untuk membuka menu"
        >
          <div className="flex flex-col items-center w-full space-y-4">
            {/* Mini Logo Icon */}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md border border-blue-400/30 overflow-hidden group">
              {schoolSettings?.logoUrl ? (
                <img
                  src={schoolSettings.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover p-0.5 group-hover:scale-110 transition-transform"
                />
              ) : (
                <GraduationCap className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Hover Trigger */}
            <div className="flex flex-col items-center gap-1 py-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-none mt-1">
                Menu
              </span>
            </div>

            {/* Mini Quick-Access Icon Rail */}
            <div className="w-full flex flex-col items-center space-y-1.5 pt-2 border-t border-slate-800/80">
              {navItems.slice(0, 8).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMenu(item.id);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    {/* Tooltip on hover in mini rail */}
                    <span className="absolute left-12 ml-2 px-2.5 py-1 bg-slate-850 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Bottom Hint */}
          <div className="flex flex-col items-center gap-1 pt-3 border-t border-slate-800/80 text-slate-500 hover:text-blue-400 transition-colors">
            <MousePointer className="w-3.5 h-3.5 animate-bounce" />
            <span className="text-[8px] font-bold text-center tracking-wider uppercase">
              Buka
            </span>
          </div>
        </div>

        {/* Full Expanded Sidebar (Shown on Hover or when Pinned on Desktop) */}
        <aside
          className={`w-64 bg-slate-900 text-slate-300 p-4 shrink-0 flex flex-col justify-between rounded-2xl shadow-2xl border border-slate-800 transition-all duration-300 ease-out z-50 ${
            isExpanded
              ? 'absolute top-0 left-0 min-h-[calc(100vh-6.5rem)] opacity-100 scale-100 translate-x-0'
              : 'hidden opacity-0 scale-95 -translate-x-4 pointer-events-none'
          }`}
        >
          <div>
            {/* Header Bar with Pin/Unpin Toggle */}
            <div className="p-2.5 mb-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm overflow-hidden border border-blue-400 shrink-0">
                  {schoolSettings?.logoUrl ? (
                    <img
                      src={schoolSettings.logoUrl}
                      alt={schoolSettings.namaSekolah}
                      className="w-full h-full object-cover p-0.5"
                    />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white tracking-tight block truncate">
                    {schoolSettings?.namaSekolah || 'SIAKAD Sekolah'}
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium block">
                    Menu Sistem
                  </span>
                </div>
              </div>

              {/* Pin Button */}
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={isPinned ? 'Lepas Kunci (Auto-hide)' : 'Kunci Menu'}
              >
                {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Navigation Items grouped by clean sections */}
            <nav className="space-y-3.5 max-h-[calc(100vh-17rem)] overflow-y-auto pr-1">
              {sections.map((sec) => {
                const secItems = navItems.filter((item) => item.section === sec);
                return (
                  <div key={sec}>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2.5 py-1">
                      {sec}
                    </div>
                    <div className="space-y-1 mt-0.5">
                      {secItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectMenu(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                              isActive
                                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/20'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-opacity ${
                                isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-60 text-slate-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom Simple User Role Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span className="text-slate-300 text-[11px] font-medium capitalize">
                Role: <span className="text-blue-400 font-bold">{userRole}</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {isPinned ? 'Terkunci' : 'Auto-hide'}
            </span>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER SLIDE-OVER (Visible on < lg screens)    */}
      {/* ======================================================== */}
      {effectiveMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Slide-in Drawer Container */}
          <div className="fixed inset-y-0 left-0 max-w-[80vw] w-72 bg-slate-900 text-slate-200 shadow-2xl border-r border-slate-800 flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-200 ease-out">
            <div>
              {/* Drawer Top Header */}
              <div className="p-2.5 mb-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm overflow-hidden border border-blue-400 shrink-0">
                    {schoolSettings?.logoUrl ? (
                      <img
                        src={schoolSettings.logoUrl}
                        alt={schoolSettings.namaSekolah}
                        className="w-full h-full object-cover p-0.5"
                      />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white tracking-tight block truncate">
                      {schoolSettings?.namaSekolah || 'SIAKAD Mobile'}
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium block">
                      Navigasi Menu
                    </span>
                  </div>
                </div>

                {/* Close Drawer Button */}
                <button
                  onClick={closeMobileMenu}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation List */}
              <nav className="space-y-3.5 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 pb-4">
                {sections.map((sec) => {
                  const secItems = navItems.filter((item) => item.section === sec);
                  return (
                    <div key={sec}>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                        {sec}
                      </div>
                      <div className="space-y-1 mt-0.5">
                        {secItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectMenu(item.id)}
                              className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30'
                                  : 'text-slate-200 hover:bg-slate-800 active:bg-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="truncate text-left text-xs">{item.label}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Info */}
            <div className="pt-2.5 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500">
                SIAKAD Mobile • {schoolSettings?.namaSekolah || 'Sistem Sekolah'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MOBILE BOTTOM DOCKED BAR (Visible on < lg screens)    */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-2 shadow-2xl flex items-center justify-around">
        {/* Quick Button 1: Dashboard */}
        <button
          onClick={() => handleSelectMenu('dashboard')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] leading-none">Dashboard</span>
        </button>

        {/* Quick Button 2: Siswa */}
        <button
          onClick={() => handleSelectMenu('daftar-siswa')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'daftar-siswa'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px] leading-none">Siswa</span>
        </button>

        {/* Quick Button 3: Presensi */}
        <button
          onClick={() => handleSelectMenu('absensi')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'absensi'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] leading-none">Presensi</span>
        </button>

        {/* Quick Button 4: Nilai */}
        <button
          onClick={() => handleSelectMenu('nilai')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'nilai' || activeTab === 'eraport'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] leading-none">Nilai</span>
        </button>

        {/* Quick Button 5: Open Full Menu Drawer */}
        <button
          onClick={() => setInternalMobileOpen(true)}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            effectiveMobileOpen
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] leading-none">Menu</span>
        </button>
      </div>
    </>
  );
};
