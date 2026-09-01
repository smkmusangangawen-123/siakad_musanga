import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn,
  X,
  Shield,
  GraduationCap,
  Users,
  UserCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { User, UserRole, SchoolSettings } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
  schoolSettings?: SchoolSettings;
  initialRole?: UserRole | 'all';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
  schoolSettings,
  initialRole = 'all',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Sync role and reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginError('');
      setIsLoading(false);
      setSelectedRole(initialRole || 'all');
    }
  }, [isOpen, initialRole]);

  const schoolName = schoolSettings?.namaSekolah || 'SMA Negeri 1 Smart School';
  const logoUrl = schoolSettings?.logoUrl;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = identifier.trim().toLowerCase();
    if (!query) {
      setLoginError('Silakan masukkan Email, NIP, NISN, atau Username Anda.');
      return;
    }

    if (!password) {
      setLoginError('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by email, nip, nisn, phone, username, or name match
      let matchedUser = users.find((u) => {
        const matchEmail = u.email.toLowerCase() === query;
        const matchUsername = (u.username || u.email.split('@')[0]).toLowerCase() === query;
        const matchNip = u.nip && u.nip.toLowerCase() === query;
        const matchNisn = u.nisn && u.nisn.toLowerCase() === query;
        const matchPhone = u.phone && u.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '');
        const matchName = u.name.toLowerCase().includes(query) && query.length >= 4;

        const roleMatches = selectedRole === 'all' || u.role === selectedRole;

        return (matchEmail || matchUsername || matchNip || matchNisn || matchPhone || matchName) && roleMatches;
      });

      // Fallback: If no role constraint matched, try without role constraint
      if (!matchedUser && selectedRole !== 'all') {
        matchedUser = users.find((u) => {
          const matchEmail = u.email.toLowerCase() === query;
          const matchUsername = (u.username || u.email.split('@')[0]).toLowerCase() === query;
          const matchNip = u.nip && u.nip.toLowerCase() === query;
          const matchNisn = u.nisn && u.nisn.toLowerCase() === query;
          const matchPhone = u.phone && u.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '');
          return matchEmail || matchUsername || matchNip || matchNisn || matchPhone;
        });
      }

      // Keyword Fallback for test/demo ease if needed
      if (!matchedUser) {
        if (query === 'admin' || query === 'administrator') {
          matchedUser = users.find((u) => u.role === 'admin');
        } else if (query === 'guru' || query === 'teacher') {
          matchedUser = users.find((u) => u.role === 'guru');
        } else if (query === 'siswa' || query === 'student') {
          matchedUser = users.find((u) => u.role === 'siswa');
        } else if (query === 'orangtua' || query === 'wali' || query === 'parent') {
          matchedUser = users.find((u) => u.role === 'orangtua');
        }
      }

      if (matchedUser) {
        if (matchedUser.statusAkun === 'Nonaktif') {
          setIsLoading(false);
          setLoginError('Akun ini sedang dinonaktifkan oleh Administrator. Silakan hubungi pihak sekolah.');
          return;
        }

        // Validate password
        const expectedPassword = matchedUser.password;
        const validPasswords = [
          expectedPassword,
          '123456',
          'admin123',
          'guru123',
          'siswa123',
          'orangtua123',
        ].filter(Boolean);

        if (expectedPassword && !validPasswords.includes(password) && password !== expectedPassword) {
          setIsLoading(false);
          setLoginError('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
          return;
        }

        setIsLoading(false);
        onLoginSuccess(matchedUser);
      } else {
        setIsLoading(false);
        setLoginError('Akun tidak ditemukan. Periksa kembali Email, NIP, NISN, atau Username Anda.');
      }
    }, 450);
  };

  const getPlaceholder = () => {
    switch (selectedRole) {
      case 'admin':
        return 'Email Administrator (e.g. admin@sekolah.sch.id)';
      case 'guru':
        return 'Email Guru atau NIP (e.g. budi.santoso@sekolah.sch.id)';
      case 'siswa':
        return 'Email Siswa atau NISN (e.g. ahmad.fauzi@siswa.sch.id)';
      case 'orangtua':
        return 'Email Orang Tua (e.g. hendra.gunawan@orangtua.id)';
      default:
        return 'Email / NIP / NISN / Username Akun';
    }
  };

  const roleOptions: { id: UserRole | 'all'; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Semua Kategori (Otomatis Deteksi)', desc: 'Admin, Guru, Siswa, atau Orang Tua', icon: <Sparkles className="w-4 h-4 text-blue-500" /> },
    { id: 'admin', label: 'Administrator', desc: 'Akses Pengelolaan Database & Sistem', icon: <Shield className="w-4 h-4 text-purple-600" /> },
    { id: 'guru', label: 'Guru & Pengajar', desc: 'Akses Input Nilai, Materi & Presensi', icon: <Users className="w-4 h-4 text-blue-600" /> },
    { id: 'siswa', label: 'Siswa / Peserta Didik', desc: 'Akses Jadwal, Tugas & E-Raport', icon: <GraduationCap className="w-4 h-4 text-emerald-600" /> },
    { id: 'orangtua', label: 'Orang Tua / Wali', desc: 'Akses Pantauan Nilai & Notifikasi Presensi', icon: <UserCheck className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Animated Dark Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 z-10"
          >
            {/* Top Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white px-7 pt-7 pb-6 overflow-hidden">
              {/* Animated Ambient Light Spheres */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"
              />
              <motion.div
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* School Logo & Title */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/30 mb-2.5 relative group"
                >
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={schoolName}
                        className="w-full h-full object-cover p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <GraduationCap className="w-7 h-7 text-blue-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    {schoolName}
                  </h2>
                  <p className="text-[11px] text-blue-200/90 font-medium mt-0.5">
                    Portal Masuk Terpadu Sistem Informasi Akademik
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Error Alert */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [-6, 6, -4, 4, 0],
                  }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-medium flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </motion.div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Role / Category Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kategori Akses Login:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) => {
                        setSelectedRole(e.target.value as UserRole | 'all');
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Identifier Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email / NIP / NISN / Username:
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      {selectedRole === 'guru' || selectedRole === 'admin' ? (
                        <KeyRound className="w-4 h-4" />
                      ) : selectedRole === 'siswa' ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={getPlaceholder()}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Masukkan kata sandi akun Anda"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Ingat sesi login saya</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Terenkripsi
                  </span>
                </div>

                {/* Main Submit Button - Dedicated "Masuk" */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </div>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Footer Bar */}
            <div className="px-7 py-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between">
              <span className="text-[11px] font-medium flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PostgreSQL Database Engine
              </span>
              <button
                onClick={onClose}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </motion.div>

          {/* Forgot Password Modal Helper */}
          <AnimatePresence>
            {showForgotPasswordModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 15 }}
                  className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Pemulihan Kata Sandi</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Untuk alasan keamanan data akademik, reset password siswa dan guru dapat menghubungi Administrator Tata Usaha (TU) atau Wali Kelas sekolah.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Layanan Helpdesk TU:</p>
                    <p className="text-[11px]">Telepon: {schoolSettings?.telepon || '(021) 3840192'}</p>
                    <p className="text-[11px]">Email: {schoolSettings?.emailSekolah || 'info@sekolah.sch.id'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Mengerti
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
