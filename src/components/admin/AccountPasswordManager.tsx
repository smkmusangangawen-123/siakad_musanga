import React, { useState, useMemo } from 'react';
import {
  Key,
  Shield,
  Search,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Printer,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  School,
  FileSpreadsheet,
  X,
  User,
  Camera,
} from 'lucide-react';
import { User as UserType, UserRole, Kelas, Jurusan } from '../../types';
import { exportToCSV } from '../../utils/csvHelper';
import { PhotoUploadField } from '../common/PhotoUploadField';
import { QuickPhotoModal } from '../common/QuickPhotoModal';

interface AccountPasswordManagerProps {
  users: UserType[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  onAddUser: (user: UserType) => void;
  onUpdateUser: (user: UserType) => void;
  onDeleteUser: (userId: string) => void;
}

export const AccountPasswordManager: React.FC<AccountPasswordManagerProps> = ({
  users,
  classes,
  jurusanList,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Password visibility set (stores user IDs whose password is visible)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [resettingUser, setResettingUser] = useState<UserType | null>(null);
  const [cardUser, setCardUser] = useState<UserType | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserType | null>(null);

  // Form States for Account Creation / Edit
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('siswa');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formNipNisn, setFormNipNisn] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formKelasId, setFormKelasId] = useState(classes[0]?.id || '');
  const [formJurusanId, setFormJurusanId] = useState(jurusanList[0]?.id || '');
  const [formSubject, setFormSubject] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [quickPhotoUser, setQuickPhotoUser] = useState<UserType | null>(null);
  const [formKategoriPegawai, setFormKategoriPegawai] = useState<
    'Guru' | 'Staf TU' | 'Pustakawan' | 'Laboran' | 'Keamanan' | 'Kebersihan' | 'Lainnya'
  >('Staf TU');

  // Form State for Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateRandomPassword = (length = 8) => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string, userId: string, label = 'Password') => {
    navigator.clipboard.writeText(text);
    setCopiedUserId(userId);
    showToast(`${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all') {
        if (roleFilter === 'staf') {
          if (!u.kategoriPegawai || u.kategoriPegawai === 'Guru') return false;
        } else if (roleFilter === 'guru') {
          if (u.role !== 'guru' || (u.kategoriPegawai && u.kategoriPegawai !== 'Guru')) return false;
        } else {
          if (u.role !== roleFilter) return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const userStatus = u.statusAkun || 'Aktif';
        if (userStatus !== statusFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchUsername = (u.username || '').toLowerCase().includes(q);
        const matchNip = (u.nip || '').toLowerCase().includes(q);
        const matchNisn = (u.nisn || '').toLowerCase().includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        const matchKelas = (u.kelasNama || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchUsername || matchNip || matchNisn || matchRole || matchKelas;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const defaultRole: UserRole = 'siswa';
    const randPass = generateRandomPassword(8);
    setFormName('');
    setFormRole(defaultRole);
    setFormEmail('');
    setFormUsername('');
    setFormPassword(randPass);
    setFormShowPassword(true);
    setFormPhone('');
    setFormNipNisn('');
    setFormStatus('Aktif');
    setFormKelasId(classes[0]?.id || '');
    setFormJurusanId(jurusanList[0]?.id || '');
    setFormSubject('Matematika Wajib');
    setFormJabatan('');
    setFormAvatar(`https://images.unsplash.com/photo-${1534528741775 + (users.length % 50)}?w=150`);
    setFormKategoriPegawai('Staf TU');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: UserType) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormRole(u.role);
    setFormEmail(u.email);
    setFormUsername(u?.username || u?.email?.split('@')[0] || '');
    setFormPassword(u?.password || '123456');
    setFormShowPassword(false);
    setFormPhone(u?.phone || '');
    setFormNipNisn(u?.nisn || u?.nip || '');
    setFormStatus(u?.statusAkun || 'Aktif');
    setFormKelasId(u?.kelasId || classes[0]?.id || '');
    setFormJurusanId(u?.jurusanId || jurusanList[0]?.id || '');
    setFormSubject(u?.subject || '');
    setFormJabatan(u?.jabatan || '');
    setFormAvatar(u?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`);
    setFormKategoriPegawai(u?.kategoriPegawai || 'Staf TU');
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (u: UserType) => {
    setResettingUser(u);
    const generated = generateRandomPassword(8);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowResetPassword(true);
  };

  // Save New Account
  const handleSaveNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert('Nama, Email, dan Password wajib diisi!');
      return;
    }

    const selectedKls = classes.find((c) => c.id === formKelasId);
    const selectedJur = jurusanList.find((j) => j.id === formJurusanId);
    const finalUsername = formUsername.trim() || formEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');

    const newUser: UserType = {
      id: `usr-${formRole}-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      username: finalUsername,
      password: formPassword.trim(),
      statusAkun: formStatus,
      role: formRole,
      avatar: formAvatar.trim() || `https://images.unsplash.com/photo-${1534528741775 + (users.length % 50)}?w=150`,
      phone: formPhone.trim() || '081234567890',
      nip: formRole !== 'siswa' && formRole !== 'orangtua' ? formNipNisn.trim() || '198501012015011001' : undefined,
      nisn: formRole === 'siswa' ? formNipNisn.trim() || '0061234567' : undefined,
      kelasId: formRole === 'siswa' ? formKelasId : undefined,
      kelasNama: formRole === 'siswa' ? selectedKls?.nama : undefined,
      jurusanId: formRole === 'siswa' ? formJurusanId : undefined,
      jurusanNama: formRole === 'siswa' ? selectedJur?.kode : undefined,
      subject: formRole === 'guru' ? formSubject.trim() || 'Guru Mata Pelajaran' : undefined,
      jabatan:
        formRole === 'guru'
          ? `Guru ${formSubject.trim()}`
          : formRole === 'admin'
          ? 'System Administrator'
          : formRole === 'siswa'
          ? `Siswa Kelas ${selectedKls?.nama || ''}`
          : formJabatan.trim() || formKategoriPegawai,
      kategoriPegawai: formRole === 'guru' ? 'Guru' : formKategoriPegawai,
    };

    onAddUser(newUser);
    setIsCreateModalOpen(false);
    showToast(`Akun ${newUser.name} berhasil dibuat dengan password baru!`);
  };

  // Save Edited Account
  const handleSaveEditedAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert('Nama, Email, dan Password tidak boleh kosong!');
      return;
    }

    const selectedKls = classes.find((c) => c.id === formKelasId);
    const selectedJur = jurusanList.find((j) => j.id === formJurusanId);

    const updated: UserType = {
      ...editingUser,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      username: formUsername.trim() || editingUser.username || formEmail.split('@')[0],
      password: formPassword.trim(),
      avatar: formAvatar.trim() || editingUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      statusAkun: formStatus,
      role: formRole,
      phone: formPhone.trim(),
      nip: formRole !== 'siswa' && formRole !== 'orangtua' ? formNipNisn.trim() : undefined,
      nisn: formRole === 'siswa' ? formNipNisn.trim() : undefined,
      kelasId: formRole === 'siswa' ? formKelasId : editingUser.kelasId,
      kelasNama: formRole === 'siswa' ? selectedKls?.nama : editingUser.kelasNama,
      jurusanId: formRole === 'siswa' ? formJurusanId : editingUser.jurusanId,
      jurusanNama: formRole === 'siswa' ? selectedJur?.kode : editingUser.jurusanNama,
      subject: formRole === 'guru' ? formSubject.trim() : editingUser.subject,
      jabatan: formJabatan.trim() || editingUser.jabatan,
      kategoriPegawai: formRole === 'guru' ? 'Guru' : formKategoriPegawai,
    };

    onUpdateUser(updated);
    setEditingUser(null);
    showToast(`Data akun dan password ${updated.name} berhasil diperbarui!`);
  };

  // Save Reset Password
  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (!newPassword.trim()) {
      alert('Password baru tidak boleh kosong!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok dengan password baru!');
      return;
    }

    const updated: UserType = {
      ...resettingUser,
      password: newPassword.trim(),
    };

    onUpdateUser(updated);
    setResettingUser(null);
    showToast(`Password untuk ${resettingUser.name} berhasil diubah menjadi: ${newPassword.trim()}`);
  };

  // Toggle Account Active/Inactive
  const handleToggleStatus = (u: UserType) => {
    const currentStatus = u.statusAkun || 'Aktif';
    const nextStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
    const updated: UserType = {
      ...u,
      statusAkun: nextStatus,
    };
    onUpdateUser(updated);
    showToast(`Status akun ${u.name} diubah menjadi: ${nextStatus}`);
  };

  // Export All Credentials
  const handleExportCredentials = () => {
    const headers = [
      'No',
      'Nama Pengguna',
      'Peran (Role)',
      'Username Login',
      'Password Login',
      'Email Sekolah',
      'NIP / NISN',
      'Kelas / Jabatan',
      'No Telepon / WA',
      'Status Akun',
    ];

    const rows = filteredUsers.map((u, idx) => [
      idx + 1,
      u.name,
      u.role.toUpperCase(),
      u.username || u.email.split('@')[0],
      u.password || '123456',
      u.email,
      u.nisn || u.nip || '-',
      u.kelasNama || u.jabatan || u.subject || '-',
      u.phone || '-',
      u.statusAkun || 'Aktif',
    ]);

    exportToCSV(`Kredensial_Akun_Password_SIAKAD_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast('Seluruh daftar akun & password berhasil diekspor ke CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Shield className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Khusus Administrator
            </span>
          </div>
          <h2 className="text-xl font-black mt-2">Pusat Manajemen Akun & Password Pengguna</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Kelola pembuatan akun baru, perbarui data login, reset kata sandi seluruh siswa, guru, staf, serta cetak kartu kredensial akses masuk sistem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCredentials}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Kredensial (.CSV)</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Akun & Password Baru</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Akun Terdaftar</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length} Akun</h3>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Semua Role Pengguna</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Akun Siswa</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">
            {users.filter((u) => u.role === 'siswa').length} Akun
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Login via NISN/Email</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Akun Guru & Pendidik</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">
            {users.filter((u) => u.role === 'guru' && (!u.kategoriPegawai || u.kategoriPegawai === 'Guru')).length} Akun
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Login via NIP/Email</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Staf TU & Admin</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {users.filter((u) => u.role === 'admin' || (u.kategoriPegawai && u.kategoriPegawai !== 'Guru')).length} Akun
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Hak Akses Sistem</p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, username, email, NIP, atau NISN..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Role & Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">🌟 Semua Role Pengguna</option>
              <option value="admin">👑 Administrator / Kepala Sekolah</option>
              <option value="guru">👨‍🏫 Guru Pengajar</option>
              <option value="staf">💼 Staf Tata Usaha & Karyawan</option>
              <option value="siswa">🎓 Siswa / Murid</option>
              <option value="orangtua">👪 Orang Tua / Wali</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">⚡ Semua Status</option>
              <option value="Aktif">🟢 Akun Aktif</option>
              <option value="Nonaktif">🔴 Akun Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users & Password Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Daftar Kredensial Login Pengguna ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Klik ikon mata (👁️) untuk melihat kata sandi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Pengguna / Nama</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Username & Email</th>
                <th className="py-3 px-3">NIP / NISN</th>
                <th className="py-3 px-3">Kata Sandi (Password)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <p className="font-bold text-slate-700">Tidak ada data pengguna yang sesuai pencarian.</p>
                    <p className="text-[11px] mt-1">Coba ubah kata kunci pencarian atau filter role.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVisible = visiblePasswords.has(u.id);
                  const isCopied = copiedUserId === u.id;
                  const currentPass = u.password || '123456';
                  const userStatus = u.statusAkun || 'Aktif';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setQuickPhotoUser(u)}
                            className="relative group cursor-pointer shrink-0"
                            title="Klik untuk ganti foto profil pengguna"
                          >
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 truncate">{u.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {u.kelasNama ? `Kelas ${u.kelasNama}` : u.jabatan || u.subject || 'Pengguna SIAKAD'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                            u.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : u.role === 'guru'
                              ? u.kategoriPegawai && u.kategoriPegawai !== 'Guru'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                              : u.role === 'siswa'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'guru' && u.kategoriPegawai && u.kategoriPegawai !== 'Guru'
                            ? u.kategoriPegawai
                            : u.role}
                        </span>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900 text-[11px]">
                          @{u.username || u.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{u.email}</div>
                      </td>

                      {/* NIP / NISN */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-700 text-[11px] font-medium">
                          {u.nisn || u.nip || '-'}
                        </div>
                      </td>

                      {/* Password Field with Show/Hide & Copy */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-[11px] text-slate-900 min-w-[70px]">
                            {isVisible ? currentPass : '••••••••'}
                          </span>

                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title={isVisible ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => copyToClipboard(currentPass, u.id, 'Password')}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
                            title="Salin Kata Sandi"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                            userStatus === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="Klik untuk ubah status akun"
                        >
                          {userStatus === 'Aktif' ? '🟢 Aktif' : '🔴 Nonaktif'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setQuickPhotoUser(u)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Unggah / Ubah Foto Profil"
                          >
                            <Camera className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenResetModal(u)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset / Ganti Kata Sandi"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCardUser(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Kartu Akses Login"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Akun"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {u.id !== 'usr-admin-1' && (
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Buat Akun & Password Pengguna Baru</h3>
                  <p className="text-xs text-slate-500">
                    Daftarkan akun login untuk Admin, Guru, Siswa, Orang Tua, atau Staf TU.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAccount} className="space-y-3.5">
              <PhotoUploadField
                currentAvatar={formAvatar}
                onAvatarChange={setFormAvatar}
                roleHint={formRole}
              />

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Akun (Role):</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="siswa">🎓 Siswa / Murid</option>
                  <option value="guru">👨‍🏫 Guru Pengajar</option>
                  <option value="guru_staf">💼 Staf Tata Usaha / Karyawan</option>
                  <option value="admin">👑 Administrator Sekolah</option>
                  <option value="orangtua">👪 Orang Tua Murid</option>
                </select>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama lengkap..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Sekolah / Login:</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      if (!formUsername) {
                        setFormUsername(e.target.value.split('@')[0]);
                      }
                    }}
                    placeholder="user@sekolah.sch.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-200">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Username Login:</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="nama.user"
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-blue-950">Password Akun:</label>
                    <button
                      type="button"
                      onClick={() => setFormPassword(generateRandomPassword(8))}
                      className="text-[10px] text-blue-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Acak
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={formShowPassword ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Password login..."
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-blue-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormShowPassword(!formShowPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {formShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Specific Fields */}
              {formRole === 'siswa' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NISN:</label>
                    <input
                      type="text"
                      value={formNipNisn}
                      onChange={(e) => setFormNipNisn(e.target.value)}
                      placeholder="0061234567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas:</label>
                    <select
                      value={formKelasId}
                      onChange={(e) => setFormKelasId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jurusan:</label>
                    <select
                      value={formJurusanId}
                      onChange={(e) => setFormJurusanId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.kode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formRole === 'guru' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIP Guru:</label>
                    <input
                      type="text"
                      value={formNipNisn}
                      onChange={(e) => setFormNipNisn(e.target.value)}
                      placeholder="198203152008011003"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Contoh: Fisika, Matematika"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Status & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Aktif">🟢 Aktif (Dapat Login)</option>
                    <option value="Nonaktif">🔴 Nonaktif (Login Diblokir)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Account */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Akun & Password Pengguna</h3>
                  <p className="text-xs text-slate-500">ID: {editingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedAccount} className="space-y-3.5">
              <PhotoUploadField
                currentAvatar={formAvatar}
                onAvatarChange={setFormAvatar}
                roleHint={formRole}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Login:</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">Username Login:</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-950">Password Akun:</label>
                    <button
                      type="button"
                      onClick={() => setFormPassword(generateRandomPassword(8))}
                      className="text-[10px] text-amber-800 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Acak
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={formShowPassword ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormShowPassword(!formShowPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {formShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Aktif">🟢 Aktif (Dapat Login)</option>
                    <option value="Nonaktif">🔴 Nonaktif (Login Diblokir)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Simpan Perubahan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Reset Kata Sandi Pengguna</h3>
                  <p className="text-xs text-slate-500">{resettingUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <img
                src={resettingUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={resettingUser.name}
                className="w-10 h-10 rounded-xl object-cover border"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">{resettingUser.name}</div>
                <div className="text-slate-500">
                  Username: <strong className="font-mono text-slate-800">@{resettingUser.username || resettingUser.email?.split('@')[0]}</strong>
                </div>
                <div className="text-slate-500">Email: {resettingUser.email}</div>
              </div>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password Baru:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generateRandomPassword(8);
                      setNewPassword(rand);
                      setConfirmPassword(rand);
                    }}
                    className="text-[10px] text-blue-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Buat Acak
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password Baru:</label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-4 h-4" /> Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cetak Kartu Akses Login Siswa/Guru */}
      {cardUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" /> Kartu Akses Login SIAKAD
              </h3>
              <button
                onClick={() => setCardUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Visual Printable Card */}
            <div
              id="printable-credential-card"
              className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl text-white shadow-xl border border-indigo-500/30 space-y-4 relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="font-black text-sm tracking-wide">KARTU AKSES SIAKAD</h4>
                  <p className="text-[10px] text-blue-200">Sistem Informasi Akademik Terpadu</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {cardUser.role}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={cardUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={cardUser.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
                />
                <div>
                  <h5 className="font-extrabold text-sm">{cardUser.name}</h5>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {cardUser.nisn ? `NISN: ${cardUser.nisn}` : cardUser.nip ? `NIP: ${cardUser.nip}` : cardUser.email}
                  </p>
                  {cardUser.kelasNama && (
                    <span className="text-[10px] text-emerald-300 font-bold">Kelas: {cardUser.kelasNama}</span>
                  )}
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/15 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans text-[11px]">Username / Email:</span>
                  <span className="font-bold text-white">@{cardUser.username || cardUser.email.split('@')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans text-[11px]">Password Akun:</span>
                  <span className="font-bold text-amber-300">{cardUser.password || '123456'}</span>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 text-center leading-tight">
                *Simpan kartu ini dengan baik dan jangan bagikan kata sandi Anda kepada orang lain.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setCardUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" /> Cetak / Print Kartu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-slate-900 text-sm">Hapus Akun Pengguna?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteConfirmUser.name}</strong> secara permanen dari sistem?
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2 border-t">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteUser(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                  showToast(`Akun ${deleteConfirmUser.name} telah dihapus.`);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Photo Upload / Change Modal */}
      <QuickPhotoModal
        user={quickPhotoUser}
        isOpen={!!quickPhotoUser}
        onClose={() => setQuickPhotoUser(null)}
        onSavePhoto={(updatedUser) => {
          onUpdateUser(updatedUser);
          setQuickPhotoUser(null);
          showToast(`Foto profil ${updatedUser.name} berhasil diperbarui!`);
        }}
      />
    </div>
  );
};
