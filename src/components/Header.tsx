import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Database,
  LogOut,
  Palette,
  Shield,
  Camera,
} from 'lucide-react';
import { User, UserRole, SchoolSettings } from '../types';
import { QuickPhotoModal } from './common/QuickPhotoModal';

interface HeaderProps {
  currentUser: User;
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout?: () => void;
  schoolSettings?: SchoolSettings;
  onOpenSchoolSettings?: () => void;
  onUpdateCurrentUser?: (updatedUser: User) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount,
  onOpenNotifications,
  onLogout,
  schoolSettings,
  onOpenSchoolSettings,
  onUpdateCurrentUser,
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator System';
      case 'guru':
        return currentUser.isWaliKelas ? 'Guru & Wali Kelas' : 'Guru Mata Pelajaran';
      case 'siswa':
        return `Siswa (${currentUser.kelasNama || '10 IPA 1'})`;
      case 'orangtua':
        return 'Orang Tua Siswa';
    }
  };

  const websiteTitle = schoolSettings?.websiteTitle || schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School';
  const websiteSubtitle = schoolSettings?.websiteSubtitle || 'Integrated SIAKAD Engine';
  const logoUrl = schoolSettings?.titleLogoUrl || schoolSettings?.logoUrl;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Context Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden border border-blue-500 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={websiteTitle} className="w-full h-full object-cover p-0.5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-none truncate max-w-xs sm:max-w-md">
                  {websiteTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <Database className="w-3 h-3 mr-1 text-emerald-600" /> PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5 truncate max-w-md">
                {websiteSubtitle} • {schoolSettings?.akreditasi ? `Akreditasi ${schoolSettings.akreditasi}` : 'Unggul & Terakreditasi'}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin-Only Edit School Name, Title, Logo & Background Button */}
            {currentUser.role === 'admin' && onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-900 border border-purple-200/80 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                title="Kustomisasi Title, Logo & Background Website (Khusus Admin)"
              >
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Title, Logo & Background</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-600 text-white uppercase font-extrabold shadow-2xs">
                  Admin
                </span>
              </button>
            )}

            {/* System Status Indicators */}
            <div className="hidden xl:flex items-center gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>WhatsApp Active</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
            </div>


            {/* Notification Toggle */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              title="Notifikasi Orang Tua & Sistem"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Current Authenticated User Profile Info & Logout */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div
                onClick={() => setIsPhotoModalOpen(true)}
                className="relative group cursor-pointer shrink-0"
                title="Klik untuk ganti foto profil akun Anda"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-xs font-bold text-slate-800 max-w-[130px] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{getRoleLabel(currentUser.role)}</p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1 sm:ml-2 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Keluar / Logout dari Sistem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Photo Upload Modal for Current Logged In User */}
      <QuickPhotoModal
        user={currentUser}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSavePhoto={(updatedUser) => {
          if (onUpdateCurrentUser) {
            onUpdateCurrentUser(updatedUser);
          }
          setIsPhotoModalOpen(false);
        }}
      />
    </header>
  );
};
