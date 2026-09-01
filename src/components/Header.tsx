import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Database,
  Cloud,
  CheckCircle2,
  LogOut,
  Palette,
  Shield,
  Camera,
  RefreshCw,
  Menu,
} from 'lucide-react';
import { User, UserRole, SchoolSettings } from '../types';
import { QuickPhotoModal } from './common/QuickPhotoModal';
import { SyncStatus } from '../lib/firestoreSync';

interface HeaderProps {
  currentUser: User;
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout?: () => void;
  schoolSettings?: SchoolSettings;
  onOpenSchoolSettings?: () => void;
  onUpdateCurrentUser?: (updatedUser: User) => void;
  syncStatus?: SyncStatus;
  onTriggerCloudSync?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount,
  onOpenNotifications,
  onLogout,
  schoolSettings,
  onOpenSchoolSettings,
  onUpdateCurrentUser,
  syncStatus = 'connected',
  onTriggerCloudSync,
  onOpenMobileMenu,
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'guru':
        return currentUser?.isWaliKelas ? 'Guru (Wali Kelas)' : 'Guru';
      case 'siswa':
        return `Siswa (${currentUser?.kelasNama || '10 IPA 1'})`;
      case 'orangtua':
        return 'Orang Tua';
      default:
        return 'Pengguna';
    }
  };

  const websiteTitle = schoolSettings?.websiteTitle || schoolSettings?.namaSekolah || 'SIAKAD Smart School';
  const websiteSubtitle = schoolSettings?.websiteSubtitle || 'Sistem Informasi Akademik';
  const logoUrl = schoolSettings?.titleLogoUrl || schoolSettings?.logoUrl;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo, Hamburger & Context Header */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors border border-slate-200 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                title="Buka Menu"
                aria-label="Buka Menu"
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>
            )}

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden border border-blue-500 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={websiteTitle} className="w-full h-full object-cover p-0.5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate max-w-[160px] sm:max-w-md">
                  {websiteTitle}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block mt-0.5 truncate max-w-md">
                {websiteSubtitle} {schoolSettings?.akreditasi ? `• Akreditasi ${schoolSettings.akreditasi}` : ''}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin-Only Edit School Settings Button */}
            {currentUser.role === 'admin' && onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Pengaturan Identitas & Tampilan Sekolah"
              >
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Pengaturan</span>
              </button>
            )}

            {/* Notification Toggle */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              title="Notifikasi"
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
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-xs font-bold text-slate-800 max-w-[130px] truncate">{currentUser?.name || 'Pengguna'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{currentUser?.role ? getRoleLabel(currentUser.role) : ''}</p>
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
      {currentUser && (
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
      )}
    </header>
  );
};
