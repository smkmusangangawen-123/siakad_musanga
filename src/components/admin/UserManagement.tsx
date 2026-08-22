import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  X,
  School,
  Key,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { User, UserRole, Kelas, Jurusan, AbsensiRecord } from '../../types';
import { exportToCSV } from '../../utils/csvHelper';
import { AccountPasswordManager } from './AccountPasswordManager';
import { PhotoUploadField, PRESET_AVATARS } from '../common/PhotoUploadField';
import { QuickPhotoModal } from '../common/QuickPhotoModal';

interface UserManagementProps {
  users: User[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  attendance?: AbsensiRecord[];
  onNavigateTab?: (tab: any) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddClass: (newClass: Kelas) => void;
  onUpdateClass: (updatedClass: Kelas) => void;
  onDeleteClass: (classId: string) => void;
  onAddJurusan: (newJurusan: Jurusan) => void;
  onUpdateJurusan: (updatedJurusan: Jurusan) => void;
  onDeleteJurusan: (jurusanId: string) => void;
  onOpenSchoolSettings?: () => void;
}

type MasterTab = 'semua_akun' | 'siswa' | 'guru' | 'karyawan' | 'kelas' | 'jurusan';

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  classes,
  jurusanList,
  attendance = [],
  onNavigateTab,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddJurusan,
  onUpdateJurusan,
  onDeleteJurusan,
  onOpenSchoolSettings,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('semua_akun');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterJurusan, setFilterJurusan] = useState<string>('all');
  const [filterKaryawanKat, setFilterKaryawanKat] = useState<string>('all');

  // Modal States
  const [modalType, setModalType] = useState<
    'add_siswa' | 'edit_siswa' |
    'add_guru' | 'edit_guru' |
    'add_karyawan' | 'edit_karyawan' |
    'add_kelas' | 'edit_kelas' |
    'add_jurusan' | 'edit_jurusan' | null
  >(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'user' | 'kelas' | 'jurusan';
    id: string;
    name: string;
  } | null>(null);

  // Quick Photo Change Modal
  const [quickPhotoUser, setQuickPhotoUser] = useState<User | null>(null);

  // Form states - User
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNipNisn, setFormNipNisn] = useState('');
  const [formTipeIdentitas, setFormTipeIdentitas] = useState<string>('NBM');
  const [formKelasId, setFormKelasId] = useState('');
  const [formJurusanId, setFormJurusanId] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formIsWaliKelas, setFormIsWaliKelas] = useState(false);
  const [formJabatan, setFormJabatan] = useState('');
  const [formKategoriPegawai, setFormKategoriPegawai] = useState<
    'Staf TU' | 'Pustakawan' | 'Laboran' | 'Keamanan' | 'Kebersihan' | 'Lainnya'
  >('Staf TU');

  // Form states - Kelas
  const [formKelasObjId, setFormKelasObjId] = useState('');
  const [formKelasNama, setFormKelasNama] = useState('');
  const [formKelasTingkat, setFormKelasTingkat] = useState<number>(10);
  const [formKelasJurusanId, setFormKelasJurusanId] = useState('');
  const [formKelasWaliId, setFormKelasWaliId] = useState('');
  const [formKelasJumlahSiswa, setFormKelasJumlahSiswa] = useState<number>(36);
  const [formKelasTahunAjaran, setFormKelasTahunAjaran] = useState('2025/2026');
  const [formKelasRuangan, setFormKelasRuangan] = useState('');

  // Form states - Jurusan
  const [formJurusanObjId, setFormJurusanObjId] = useState('');
  const [formJurusanKode, setFormJurusanKode] = useState('');
  const [formJurusanNama, setFormJurusanNama] = useState('');
  const [formJurusanKaprog, setFormJurusanKaprog] = useState('');
  const [formJurusanDeskripsi, setFormJurusanDeskripsi] = useState('');
  const [formJurusanKuota, setFormJurusanKuota] = useState<number>(72);

  // Filtered Lists
  const studentUsers = users.filter((u) => u.role === 'siswa');
  const teacherUsers = users.filter((u) => u.role === 'guru' && (!u.kategoriPegawai || u.kategoriPegawai === 'Guru'));
  const staffUsers = users.filter((u) => u.kategoriPegawai && u.kategoriPegawai !== 'Guru');

  const filteredStudents = studentUsers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchQuery)) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || s.kelasId === filterClass || s.kelasNama === filterClass;
    const matchesJur = filterJurusan === 'all' || s.jurusanId === filterJurusan || s.jurusanNama === filterJurusan;
    return matchesSearch && matchesClass && matchesJur;
  });

  const filteredTeachers = teacherUsers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nip && t.nip.includes(searchQuery)) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredStaff = staffUsers.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.nip && k.nip.includes(searchQuery)) ||
      k.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.jabatan && k.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesKat = filterKaryawanKat === 'all' || k.kategoriPegawai === filterKaryawanKat;
    return matchesSearch && matchesKat;
  });

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.waliKelasNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ruangan && c.ruangan.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesJur = filterJurusan === 'all' || c.jurusanId === filterJurusan || c.jurusanNama === filterJurusan;
    return matchesSearch && matchesJur;
  });

  const filteredJurusan = jurusanList.filter((j) => {
    return (
      j.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.kepalaJurusan && j.kepalaJurusan.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Open User Modal Handlers
  const handleOpenAddStudent = () => {
    setFormUserId('');
    setFormName('');
    setFormAvatar(PRESET_AVATARS.siswaPria[0].url);
    setFormEmail('');
    setFormUsername('');
    setFormPassword('siswa123');
    setFormPhone('');
    setFormNipNisn('');
    setFormKelasId(classes[0]?.id || '');
    setFormJurusanId(jurusanList[0]?.id || '');
    setModalType('add_siswa');
  };

  const handleOpenEditStudent = (student: User) => {
    setFormUserId(student.id);
    setFormName(student.name);
    setFormAvatar(student.avatar || PRESET_AVATARS.siswaPria[0].url);
    setFormEmail(student.email);
    setFormUsername(student.username || student.email.split('@')[0]);
    setFormPassword(student.password || 'siswa123');
    setFormPhone(student.phone || '');
    setFormNipNisn(student.nisn || '');

    const foundClass = classes.find((c) => c.id === student.kelasId || c.nama === student.kelasNama);
    const foundJurusan = jurusanList.find(
      (j) => j.id === student.jurusanId || j.nama === student.jurusanNama || j.kode === student.jurusanNama
    );

    setFormKelasId(foundClass?.id || classes[0]?.id || '');
    setFormJurusanId(foundJurusan?.id || jurusanList[0]?.id || '');
    setModalType('edit_siswa');
  };

  const handleOpenAddTeacher = () => {
    setFormUserId('');
    setFormName('');
    setFormAvatar(PRESET_AVATARS.guruPria[0].url);
    setFormEmail('');
    setFormUsername('');
    setFormPassword('guru123');
    setFormPhone('');
    setFormNipNisn('');
    setFormTipeIdentitas('NBM');
    setFormSubject('Matematika Wajib');
    setFormIsWaliKelas(false);
    setFormKelasId(classes[0]?.id || '');
    setModalType('add_guru');
  };

  const handleOpenEditTeacher = (teacher: User) => {
    setFormUserId(teacher.id);
    setFormName(teacher.name);
    setFormAvatar(teacher.avatar || PRESET_AVATARS.guruPria[0].url);
    setFormEmail(teacher.email);
    setFormUsername(teacher.username || teacher.email.split('@')[0]);
    setFormPassword(teacher.password || 'guru123');
    setFormPhone(teacher.phone || '');
    setFormNipNisn(teacher.nip || '');
    setFormTipeIdentitas(teacher.tipeIdentitasPegawai || 'NBM');
    setFormSubject(teacher.subject || '');
    setFormIsWaliKelas(!!teacher.isWaliKelas);
    setFormKelasId(teacher.kelasId || '');
    setModalType('edit_guru');
  };

  const handleOpenAddStaff = () => {
    setFormUserId('');
    setFormName('');
    setFormAvatar(PRESET_AVATARS.guruPria[1].url);
    setFormEmail('');
    setFormUsername('');
    setFormPassword('staf123');
    setFormPhone('');
    setFormNipNisn('');
    setFormTipeIdentitas('NBM');
    setFormJabatan('Staf Administrasi Tata Usaha');
    setFormKategoriPegawai('Staf TU');
    setModalType('add_karyawan');
  };

  const handleOpenEditStaff = (staff: User) => {
    setFormUserId(staff.id);
    setFormName(staff.name);
    setFormAvatar(staff.avatar || PRESET_AVATARS.guruPria[1].url);
    setFormEmail(staff.email);
    setFormUsername(staff.username || staff.email.split('@')[0]);
    setFormPassword(staff.password || 'staf123');
    setFormPhone(staff.phone || '');
    setFormNipNisn(staff.nip || '');
    setFormTipeIdentitas(staff.tipeIdentitasPegawai || 'NBM');
    setFormJabatan(staff.jabatan || '');
    setFormKategoriPegawai((staff.kategoriPegawai as any) || 'Staf TU');
    setModalType('edit_karyawan');
  };

  // Open Kelas Modal Handlers
  const handleOpenAddClass = () => {
    setFormKelasObjId('');
    setFormKelasNama('');
    setFormKelasTingkat(10);
    setFormKelasJurusanId(jurusanList[0]?.id || '');
    setFormKelasWaliId(teacherUsers[0]?.id || '');
    setFormKelasJumlahSiswa(36);
    setFormKelasTahunAjaran('2025/2026');
    setFormKelasRuangan('Gedung A - R.101');
    setModalType('add_kelas');
  };

  const handleOpenEditClass = (c: Kelas) => {
    setFormKelasObjId(c.id);
    setFormKelasNama(c.nama);
    setFormKelasTingkat(c.tingkat);
    setFormKelasJurusanId(c.jurusanId || jurusanList[0]?.id || '');
    setFormKelasWaliId(c.waliKelasId);
    setFormKelasJumlahSiswa(c.jumlahSiswa);
    setFormKelasTahunAjaran(c.tahunAjaran);
    setFormKelasRuangan(c.ruangan || '');
    setModalType('edit_kelas');
  };

  // Open Jurusan Modal Handlers
  const handleOpenAddJurusan = () => {
    setFormJurusanObjId('');
    setFormJurusanKode('');
    setFormJurusanNama('');
    setFormJurusanKaprog(teacherUsers[0]?.name || 'Dr. Hendra Wijaya M.Pd');
    setFormJurusanDeskripsi('');
    setFormJurusanKuota(72);
    setModalType('add_jurusan');
  };

  const handleOpenEditJurusan = (j: Jurusan) => {
    setFormJurusanObjId(j.id);
    setFormJurusanKode(j.kode);
    setFormJurusanNama(j.nama);
    setFormJurusanKaprog(j.kepalaJurusan || '');
    setFormJurusanDeskripsi(j.deskripsi || '');
    setFormJurusanKuota(j.kuotaSiswa || 72);
    setModalType('edit_jurusan');
  };

  // Submit Handlers
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const selectedKls = classes.find((c) => c.id === formKelasId || c.nama === formKelasId);
    const selectedJur = jurusanList.find((j) => j.id === formJurusanId || j.nama === formJurusanId || j.kode === formJurusanId);

    if (modalType === 'add_siswa') {
      const newStudent: User = {
        id: `usr-siswa-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        username: formUsername.trim() || formEmail.split('@')[0],
        password: formPassword.trim() || 'siswa123',
        statusAkun: 'Aktif',
        role: 'siswa',
        avatar: formAvatar.trim() || `https://images.unsplash.com/photo-${1534528741775 + (users.length % 50)}?w=150`,
        nisn: formNipNisn.trim() || `006${Math.floor(1000000 + Math.random() * 9000000)}`,
        phone: formPhone.trim() || '085711223344',
        kelasId: formKelasId || selectedKls?.id || '',
        kelasNama: selectedKls?.nama || '10 IPA 1',
        jurusanId: formJurusanId || selectedJur?.id || '',
        jurusanNama: selectedJur?.nama || selectedJur?.kode || 'MIPA',
      };
      onAddUser(newStudent);
    } else if (modalType === 'edit_siswa') {
      const existing = users.find((u) => u.id === formUserId);
      if (existing) {
        onUpdateUser({
          ...existing,
          name: formName.trim(),
          email: formEmail.trim(),
          avatar: formAvatar.trim() || existing.avatar,
          username: formUsername.trim() || existing.username || formEmail.split('@')[0],
          password: formPassword.trim() || existing.password || 'siswa123',
          phone: formPhone.trim(),
          nisn: formNipNisn.trim(),
          kelasId: formKelasId || selectedKls?.id || existing.kelasId,
          kelasNama: selectedKls?.nama || existing.kelasNama,
          jurusanId: formJurusanId || selectedJur?.id || existing.jurusanId,
          jurusanNama: selectedJur?.nama || selectedJur?.kode || existing.jurusanNama,
        });
      }
    }
    setModalType(null);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const selectedKls = classes.find((c) => c.id === formKelasId);

    if (modalType === 'add_guru') {
      const newTeacher: User = {
        id: `usr-guru-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        username: formUsername.trim() || formEmail.split('@')[0],
        password: formPassword.trim() || 'guru123',
        statusAkun: 'Aktif',
        role: 'guru',
        avatar: formAvatar.trim() || `https://images.unsplash.com/photo-${1507003211169 + (users.length % 50)}?w=150`,
        nip: formNipNisn.trim() || `198${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
        tipeIdentitasPegawai: formTipeIdentitas,
        phone: formPhone.trim() || '081234567890',
        subject: formSubject.trim() || 'Mata Pelajaran Umum',
        isWaliKelas: formIsWaliKelas,
        kelasId: formIsWaliKelas ? formKelasId : undefined,
        kelasNama: formIsWaliKelas ? selectedKls?.nama : undefined,
        jabatan: `Guru ${formSubject.trim()} ${formIsWaliKelas ? `/ Wali Kelas ${selectedKls?.nama || ''}` : ''}`,
        kategoriPegawai: 'Guru',
      };
      onAddUser(newTeacher);
    } else if (modalType === 'edit_guru') {
      const existing = users.find((u) => u.id === formUserId);
      if (existing) {
        onUpdateUser({
          ...existing,
          name: formName.trim(),
          email: formEmail.trim(),
          avatar: formAvatar.trim() || existing.avatar,
          username: formUsername.trim() || existing.username || formEmail.split('@')[0],
          password: formPassword.trim() || existing.password || 'guru123',
          phone: formPhone.trim(),
          nip: formNipNisn.trim(),
          tipeIdentitasPegawai: formTipeIdentitas,
          subject: formSubject.trim(),
          isWaliKelas: formIsWaliKelas,
          kelasId: formIsWaliKelas ? formKelasId : undefined,
          kelasNama: formIsWaliKelas ? selectedKls?.nama : undefined,
          jabatan: `Guru ${formSubject.trim()} ${formIsWaliKelas ? `/ Wali Kelas ${selectedKls?.nama || ''}` : ''}`,
          kategoriPegawai: 'Guru',
        });
      }
    }
    setModalType(null);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (modalType === 'add_karyawan') {
      const newStaff: User = {
        id: `usr-staf-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        username: formUsername.trim() || formEmail.split('@')[0],
        password: formPassword.trim() || 'staf123',
        statusAkun: 'Aktif',
        role: 'guru', // Uses staff dashboard permissions
        avatar: formAvatar.trim() || `https://images.unsplash.com/photo-${1472099645785 + (users.length % 50)}?w=150`,
        nip: formNipNisn.trim() || `199${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
        tipeIdentitasPegawai: formTipeIdentitas,
        phone: formPhone.trim() || '081300001111',
        jabatan: formJabatan.trim() || formKategoriPegawai,
        kategoriPegawai: formKategoriPegawai,
      };
      onAddUser(newStaff);
    } else if (modalType === 'edit_karyawan') {
      const existing = users.find((u) => u.id === formUserId);
      if (existing) {
        onUpdateUser({
          ...existing,
          name: formName.trim(),
          email: formEmail.trim(),
          avatar: formAvatar.trim() || existing.avatar,
          username: formUsername.trim() || existing.username || formEmail.split('@')[0],
          password: formPassword.trim() || existing.password || 'staf123',
          phone: formPhone.trim(),
          nip: formNipNisn.trim(),
          tipeIdentitasPegawai: formTipeIdentitas,
          jabatan: formJabatan.trim(),
          kategoriPegawai: formKategoriPegawai,
        });
      }
    }
    setModalType(null);
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKelasNama.trim()) return;

    const waliTeacher = teacherUsers.find((t) => t.id === formKelasWaliId);
    const selectedJur = jurusanList.find((j) => j.id === formKelasJurusanId);

    if (modalType === 'add_kelas') {
      const newClass: Kelas = {
        id: `kls-${Date.now()}`,
        nama: formKelasNama.trim(),
        tingkat: formKelasTingkat,
        jurusanId: formKelasJurusanId,
        jurusanNama: selectedJur?.kode || selectedJur?.nama || 'Umum',
        waliKelasId: formKelasWaliId,
        waliKelasNama: waliTeacher?.name || 'Belum Ditentukan',
        jumlahSiswa: Number(formKelasJumlahSiswa) || 36,
        tahunAjaran: formKelasTahunAjaran.trim() || '2025/2026',
        ruangan: formKelasRuangan.trim() || 'Ruang Kelas',
      };
      onAddClass(newClass);
    } else if (modalType === 'edit_kelas') {
      const existing = classes.find((c) => c.id === formKelasObjId);
      if (existing) {
        onUpdateClass({
          ...existing,
          nama: formKelasNama.trim(),
          tingkat: formKelasTingkat,
          jurusanId: formKelasJurusanId,
          jurusanNama: selectedJur?.kode || selectedJur?.nama || existing.jurusanNama,
          waliKelasId: formKelasWaliId,
          waliKelasNama: waliTeacher?.name || existing.waliKelasNama,
          jumlahSiswa: Number(formKelasJumlahSiswa) || existing.jumlahSiswa,
          tahunAjaran: formKelasTahunAjaran.trim() || existing.tahunAjaran,
          ruangan: formKelasRuangan.trim() || existing.ruangan,
        });
      }
    }
    setModalType(null);
  };

  const handleSaveJurusan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJurusanNama.trim() || !formJurusanKode.trim()) return;

    if (modalType === 'add_jurusan') {
      const newJurusan: Jurusan = {
        id: `jur-${Date.now()}`,
        kode: formJurusanKode.trim().toUpperCase(),
        nama: formJurusanNama.trim(),
        kepalaJurusan: formJurusanKaprog.trim(),
        deskripsi: formJurusanDeskripsi.trim(),
        kuotaSiswa: Number(formJurusanKuota) || 72,
      };
      onAddJurusan(newJurusan);
    } else if (modalType === 'edit_jurusan') {
      const existing = jurusanList.find((j) => j.id === formJurusanObjId);
      if (existing) {
        onUpdateJurusan({
          ...existing,
          kode: formJurusanKode.trim().toUpperCase(),
          nama: formJurusanNama.trim(),
          kepalaJurusan: formJurusanKaprog.trim(),
          deskripsi: formJurusanDeskripsi.trim(),
          kuotaSiswa: Number(formJurusanKuota) || existing.kuotaSiswa,
        });
      }
    }
    setModalType(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'user') {
      onDeleteUser(deleteConfirm.id);
    } else if (deleteConfirm.type === 'kelas') {
      onDeleteClass(deleteConfirm.id);
    } else if (deleteConfirm.type === 'jurusan') {
      onDeleteJurusan(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // Export helper for current active tab
  const handleExportData = () => {
    if (activeTab === 'siswa') {
      const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Email', 'No Telepon'];
      const rows = filteredStudents.map((s, idx) => [
        idx + 1,
        s.nisn || '-',
        s.name,
        s.kelasNama || '-',
        s.jurusanNama || '-',
        s.email,
        s.phone || '-',
      ]);
      exportToCSV('Data_Siswa_Master.csv', headers, rows);
    } else if (activeTab === 'guru') {
      const headers = ['No', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Wali Kelas', 'Email', 'No Telepon'];
      const rows = filteredTeachers.map((t, idx) => [
        idx + 1,
        t.nip || '-',
        t.name,
        t.subject || '-',
        t.isWaliKelas ? t.kelasNama || 'Ya' : 'Bukan Wali Kelas',
        t.email,
        t.phone || '-',
      ]);
      exportToCSV('Data_Guru_Master.csv', headers, rows);
    } else if (activeTab === 'karyawan') {
      const headers = ['No', 'NIP/NIPTT', 'Nama Karyawan', 'Kategori Pegawai', 'Jabatan', 'Email', 'No Telepon'];
      const rows = filteredStaff.map((k, idx) => [
        idx + 1,
        k.nip || '-',
        k.name,
        k.kategoriPegawai || 'Staf TU',
        k.jabatan || '-',
        k.email,
        k.phone || '-',
      ]);
      exportToCSV('Data_Karyawan_Master.csv', headers, rows);
    } else if (activeTab === 'kelas') {
      const headers = ['No', 'Nama Kelas', 'Tingkat', 'Jurusan', 'Wali Kelas', 'Jumlah Siswa', 'Ruangan', 'Tahun Ajaran'];
      const rows = filteredClasses.map((c, idx) => [
        idx + 1,
        c.nama,
        c.tingkat,
        c.jurusanNama || '-',
        c.waliKelasNama,
        c.jumlahSiswa,
        c.ruangan || '-',
        c.tahunAjaran,
      ]);
      exportToCSV('Data_Kelas_Master.csv', headers, rows);
    } else if (activeTab === 'jurusan') {
      const headers = ['No', 'Kode Jurusan', 'Nama Jurusan', 'Kepala Jurusan', 'Kuota Siswa', 'Deskripsi'];
      const rows = filteredJurusan.map((j, idx) => [
        idx + 1,
        j.kode,
        j.nama,
        j.kepalaJurusan || '-',
        j.kuotaSiswa || 72,
        j.deskripsi || '-',
      ]);
      exportToCSV('Data_Jurusan_Master.csv', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <School className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900">Data Master & Manajemen Pengguna</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data terpadu untuk Siswa, Guru, Karyawan/Staf, Rombel Kelas, dan Jurusan/Program Keahlian.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-blue-600" /> Profil Sekolah
              </button>
            )}
            <button
              onClick={handleExportData}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Unduh .CSV
            </button>
          </div>
        </div>

        {/* Master Data Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 mt-6 pt-2 pb-0">
          <button
            onClick={() => {
              setActiveTab('semua_akun');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'semua_akun'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-500" /> Pusat Akun & Password ({users.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('siswa');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'siswa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Data Siswa ({studentUsers.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('guru');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'guru'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Data Guru ({teacherUsers.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('karyawan');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'karyawan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Karyawan & Staf ({staffUsers.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('kelas');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'kelas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Data Kelas ({classes.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('jurusan');
              setSearchQuery('');
            }}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'jurusan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Jurusan & Keahlian ({jurusanList.length})
          </button>
        </div>
      </div>

      {/* 0. PUSAT AKUN & PASSWORD SEMUA PENGGUNA (CRUD AKUN & PASSWORD) */}
      {activeTab === 'semua_akun' && (
        <AccountPasswordManager
          users={users}
          classes={classes}
          jurusanList={jurusanList}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      )}

      {/* Other Tabs Rendering */}
      {activeTab !== 'semua_akun' && (
        <>
          {/* Control Bar (Search, Filters, Action Button) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Cari nama, NIP/NISN, atau kata kunci ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
          </div>

          {activeTab === 'siswa' && (
            <>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold">Kelas:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold">Jurusan:</span>
                <select
                  value={filterJurusan}
                  onChange={(e) => setFilterJurusan(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Jurusan</option>
                  {jurusanList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.kode} - {j.nama}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'karyawan' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold">Kategori:</span>
              <select
                value={filterKaryawanKat}
                onChange={(e) => setFilterKaryawanKat(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori Pegawai</option>
                <option value="Staf TU">Staf TU</option>
                <option value="Pustakawan">Pustakawan</option>
                <option value="Laboran">Laboran</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}
        </div>

        {/* Add Button depending on Tab */}
        <div>
          {activeTab === 'siswa' && (
            <button
              onClick={handleOpenAddStudent}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Siswa Baru
            </button>
          )}
          {activeTab === 'guru' && (
            <button
              onClick={handleOpenAddTeacher}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Guru Baru
            </button>
          )}
          {activeTab === 'karyawan' && (
            <button
              onClick={handleOpenAddStaff}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Karyawan / Staf
            </button>
          )}
          {activeTab === 'kelas' && (
            <button
              onClick={handleOpenAddClass}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Kelas Baru
            </button>
          )}
          {activeTab === 'jurusan' && (
            <button
              onClick={handleOpenAddJurusan}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Jurusan Baru
            </button>
          )}
        </div>
      </div>

      {/* Main Content Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* 1. DATA SISWA */}
        {activeTab === 'siswa' && (
          <div>
            <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Data Terintegrasi & Sinkron:</strong> Perubahan data siswa di sini otomatis tersinkronisasi ke <strong>Daftar Siswa</strong> dan <strong>Rekap Absensi</strong>.
                </span>
              </div>
              {onNavigateTab && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateTab('daftar-siswa')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors shadow-xs"
                  >
                    Buka Daftar Siswa →
                  </button>
                  <button
                    onClick={() => onNavigateTab('absensi')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Buka Rekap Absensi →
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jurusan</th>
                    <th className="py-3 px-4">Rekap Presensi</th>
                    <th className="py-3 px-4">Kontak / Email</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada data siswa yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const studentAtt = attendance.filter((a) => a.siswaId === s.id);
                      const hadirCount = studentAtt.filter((a) => a.status === 'Hadir').length;
                      const totalAtt = studentAtt.length;
                      const presenceRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 100;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                onClick={() => setQuickPhotoUser(s)}
                                className="relative group cursor-pointer shrink-0"
                                title="Klik untuk ganti foto profil siswa"
                              >
                                <img
                                  src={s.avatar}
                                  alt={s.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{s.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium">ID: {s.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.nisn || '-'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              {s.kelasNama || '10 IPA 1'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.jurusanNama || 'MIPA'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                  presenceRate >= 90
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : presenceRate >= 75
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {totalAtt > 0 ? `${presenceRate}% (${hadirCount}/${totalAtt} Hadir)` : 'Belum Ada Record'}
                              </span>
                              {onNavigateTab && (
                                <button
                                  onClick={() => onNavigateTab('absensi')}
                                  className="text-[10px] text-blue-600 hover:underline font-bold"
                                  title="Lihat detail di Rekap Absensi"
                                >
                                  Detail →
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="space-y-0.5">
                              <p className="text-[11px] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {s.email}
                              </p>
                              {s.phone && (
                                <p className="text-[11px] flex items-center gap-1 text-slate-500">
                                  <Phone className="w-3 h-3 text-slate-400" /> {s.phone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setQuickPhotoUser(s)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Unggah / Ubah Foto Profil"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditStudent(s)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Data Siswa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'user',
                                    id: s.id,
                                    name: s.name,
                                  })
                                }
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        )}

        {/* 2. DATA GURU */}
        {activeTab === 'guru' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-4">Nomor Identitas (NBM/NIP)</th>
                  <th className="py-3 px-4">Mata Pelajaran Diampu</th>
                  <th className="py-3 px-4">Status Wali Kelas</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data guru yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => setQuickPhotoUser(t)}
                            className="relative group cursor-pointer shrink-0"
                            title="Klik untuk ganti foto profil guru"
                          >
                            <img
                              src={t.avatar}
                              alt={t.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <p className="text-[11px] text-slate-400">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                            {t.tipeIdentitasPegawai || 'NBM'}
                          </span>
                          <span className="font-mono font-bold text-slate-700">{t.nip || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.subject || 'Semua Mata Pelajaran'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.isWaliKelas ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Wali Kelas ({t.kelasNama || '10 IPA 1'})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Guru Mata Pelajaran
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{t.phone || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setQuickPhotoUser(t)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Unggah / Ubah Foto Profil"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditTeacher(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'user',
                                id: t.id,
                                name: t.name,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. DATA KARYAWAN & STAF */}
        {activeTab === 'karyawan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Pegawai / Karyawan</th>
                  <th className="py-3 px-4">Nomor Identitas (NBM/NIP)</th>
                  <th className="py-3 px-4">Kategori Pegawai</th>
                  <th className="py-3 px-4">Jabatan & Posisi</th>
                  <th className="py-3 px-4">Kontak / No Telepon</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data karyawan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => setQuickPhotoUser(k)}
                            className="relative group cursor-pointer shrink-0"
                            title="Klik untuk ganti foto profil karyawan"
                          >
                            <img
                              src={k.avatar}
                              alt={k.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{k.name}</p>
                            <p className="text-[11px] text-slate-400">{k.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            {k.tipeIdentitasPegawai || 'NBM'}
                          </span>
                          <span className="font-mono font-bold text-slate-700">{k.nip || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          {k.kategoriPegawai || 'Staf TU'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{k.jabatan || '-'}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{k.phone || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setQuickPhotoUser(k)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Unggah / Ubah Foto Profil"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditStaff(k)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Karyawan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'user',
                                id: k.id,
                                name: k.name,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. DATA KELAS */}
        {activeTab === 'kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Jurusan / Program</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Jumlah Siswa</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data kelas yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">{c.nama}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">Kelas {c.tingkat}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {c.jurusanNama || 'MIPA'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.waliKelasNama}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{c.jumlahSiswa} Siswa</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{c.ruangan || 'Ruang Standar'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditClass(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Kelas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'kelas',
                                id: c.id,
                                name: c.nama,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. DATA JURUSAN */}
        {activeTab === 'jurusan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Kode Jurusan</th>
                  <th className="py-3 px-4">Nama Jurusan / Program Keahlian</th>
                  <th className="py-3 px-4">Kepala Program (Kaprog)</th>
                  <th className="py-3 px-4">Kuota Siswa</th>
                  <th className="py-3 px-4">Deskripsi Kompetensi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJurusan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada data jurusan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredJurusan.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                          {j.kode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{j.nama}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{j.kepalaJurusan || '-'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{j.kuotaSiswa || 72} Siswa</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{j.deskripsi || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditJurusan(j)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Jurusan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'jurusan',
                                id: j.id,
                                name: `${j.kode} - ${j.nama}`,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Jurusan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

      {/* MODALS */}
      {/* 1. Modal Add/Edit Siswa */}
      {(modalType === 'add_siswa' || modalType === 'edit_siswa') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                {modalType === 'add_siswa' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
              <PhotoUploadField
                currentAvatar={formAvatar}
                onAvatarChange={setFormAvatar}
                roleHint="siswa"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN (10 Digit) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0061234567"
                    value={formNipNisn}
                    onChange={(e) => setFormNipNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="085711223344"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Email Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="farhan@siswa.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Akun *</label>
                  <input
                    type="text"
                    required
                    placeholder="Password login siswa"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rombel / Kelas *</label>
                  <select
                    value={formKelasId}
                    onChange={(e) => setFormKelasId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} ({c.jurusanNama || 'MIPA'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jurusan / Keahlian *</label>
                  <select
                    value={formJurusanId}
                    onChange={(e) => setFormJurusanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.kode} - {j.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Add/Edit Guru */}
      {(modalType === 'add_guru' || modalType === 'edit_guru') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {modalType === 'add_guru' ? 'Tambah Guru Baru' : 'Edit Data Guru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4 mt-4 text-xs">
              <PhotoUploadField
                currentAvatar={formAvatar}
                onAvatarChange={setFormAvatar}
                roleHint="guru"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar Guru *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso S.Pd, M.M"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Nomor Identitas</label>
                  <select
                    value={formTipeIdentitas}
                    onChange={(e) => setFormTipeIdentitas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900 bg-white"
                  >
                    <option value="NBM">NBM (Nomor Baku Muhammadiyah)</option>
                    <option value="NIP">NIP (Nomor Induk Pegawai)</option>
                    <option value="NUPTK">NUPTK (Nomor Unik Pendidik)</option>
                    <option value="NIY">NIY (Nomor Induk Yayasan)</option>
                    <option value="NIGB">NIGB (Nomor Induk Guru Bantu)</option>
                    <option value="NRG">NRG (Nomor Registrasi Guru)</option>
                    <option value="Tanpa Nomor">Tanpa Nomor (-)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {formTipeIdentitas === 'Tanpa Nomor' ? 'Keterangan' : `Nomor ${formTipeIdentitas}`}
                  </label>
                  <input
                    type="text"
                    disabled={formTipeIdentitas === 'Tanpa Nomor'}
                    placeholder={
                      formTipeIdentitas === 'NBM'
                        ? '1087654'
                        : formTipeIdentitas === 'NIP'
                        ? '198203152008011003'
                        : 'Nomor Identitas'
                    }
                    value={formNipNisn}
                    onChange={(e) => setFormNipNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Email Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="budi.guru@sekolah.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Akun *</label>
                  <input
                    type="text"
                    required
                    placeholder="Password login guru"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran Diampu *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Wajib / Fisika Dasar"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsWaliKelas}
                    onChange={(e) => setFormIsWaliKelas(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Tugaskan sebagai Wali Kelas
                </label>

                {formIsWaliKelas && (
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Pilih Kelas Binaan</label>
                    <select
                      value={formKelasId}
                      onChange={(e) => setFormKelasId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama} - {c.jurusanNama || 'MIPA'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Add/Edit Karyawan */}
      {(modalType === 'add_karyawan' || modalType === 'edit_karyawan') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                {modalType === 'add_karyawan' ? 'Tambah Karyawan / Staf' : 'Edit Data Karyawan'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 mt-4 text-xs">
              <PhotoUploadField
                currentAvatar={formAvatar}
                onAvatarChange={setFormAvatar}
                roleHint="karyawan"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Karyawan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Supriadi S.SE"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Nomor Identitas</label>
                  <select
                    value={formTipeIdentitas}
                    onChange={(e) => setFormTipeIdentitas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900 bg-white"
                  >
                    <option value="NBM">NBM (Nomor Baku Muhammadiyah)</option>
                    <option value="NIP">NIP (Nomor Induk Pegawai)</option>
                    <option value="NUPTK">NUPTK (Nomor Unik Pendidik)</option>
                    <option value="NIY">NIY (Nomor Induk Yayasan)</option>
                    <option value="NIGB">NIGB (Nomor Induk Guru Bantu)</option>
                    <option value="NRG">NRG (Nomor Registrasi Pegawai)</option>
                    <option value="Tanpa Nomor">Tanpa Nomor (-)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {formTipeIdentitas === 'Tanpa Nomor' ? 'Keterangan' : `Nomor ${formTipeIdentitas}`}
                  </label>
                  <input
                    type="text"
                    disabled={formTipeIdentitas === 'Tanpa Nomor'}
                    placeholder={
                      formTipeIdentitas === 'NBM'
                        ? '1088990'
                        : formTipeIdentitas === 'NIP'
                        ? '198804122012011002'
                        : 'Nomor Identitas'
                    }
                    value={formNipNisn}
                    onChange={(e) => setFormNipNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Pegawai *</label>
                  <select
                    value={formKategoriPegawai}
                    onChange={(e) => setFormKategoriPegawai(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Staf TU">Staf Tata Usaha</option>
                    <option value="Pustakawan">Pustakawan</option>
                    <option value="Laboran">Laboran</option>
                    <option value="Keamanan">Keamanan / Satpam</option>
                    <option value="Kebersihan">Kebersihan / CS</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi Spesifik *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepala Bagian Tata Usaha Keuangan"
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="bambang.tu@sekolah.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Akun *</label>
                  <input
                    type="text"
                    required
                    placeholder="Password login staf"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="081311223344"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Add/Edit Kelas */}
      {(modalType === 'add_kelas' || modalType === 'edit_kelas') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                {modalType === 'add_kelas' ? 'Tambah Rombel Kelas Baru' : 'Edit Data Kelas'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKelas} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Rombel Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10 TKJ 1 / 10 IPA 1"
                    value={formKelasNama}
                    onChange={(e) => setFormKelasNama(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat *</label>
                  <select
                    value={formKelasTingkat}
                    onChange={(e) => setFormKelasTingkat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value={10}>Kelas 10</option>
                    <option value={11}>Kelas 11</option>
                    <option value={12}>Kelas 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jurusan / Program *</label>
                  <select
                    value={formKelasJurusanId}
                    onChange={(e) => setFormKelasJurusanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.kode} - {j.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wali Kelas *</label>
                  <select
                    value={formKelasWaliId}
                    onChange={(e) => setFormKelasWaliId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {teacherUsers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kapasitas / Siswa</label>
                  <input
                    type="number"
                    value={formKelasJumlahSiswa}
                    onChange={(e) => setFormKelasJumlahSiswa(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ruang Kelas</label>
                  <input
                    type="text"
                    placeholder="Gedung A - R.101"
                    value={formKelasRuangan}
                    onChange={(e) => setFormKelasRuangan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    placeholder="2025/2026"
                    value={formKelasTahunAjaran}
                    onChange={(e) => setFormKelasTahunAjaran(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Add/Edit Jurusan */}
      {(modalType === 'add_jurusan' || modalType === 'edit_jurusan') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {modalType === 'add_jurusan' ? 'Tambah Jurusan / Program Keahlian' : 'Edit Data Jurusan'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJurusan} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Jurusan *</label>
                  <input
                    type="text"
                    required
                    placeholder="TKJ / RPL / AKL"
                    value={formJurusanKode}
                    onChange={(e) => setFormJurusanKode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Jurusan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Teknik Komputer dan Jaringan"
                    value={formJurusanNama}
                    onChange={(e) => setFormJurusanNama(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kepala Program (Kaprog) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso S.Pd"
                    value={formJurusanKaprog}
                    onChange={(e) => setFormJurusanKaprog(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Kuota Siswa</label>
                  <input
                    type="number"
                    value={formJurusanKuota}
                    onChange={(e) => setFormJurusanKuota(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi & Kompetensi Keahlian</label>
                <textarea
                  rows={3}
                  placeholder="Fokus keahlian, teknologi yang dipelajari, dan prospek karir siswa..."
                  value={formJurusanDeskripsi}
                  onChange={(e) => setFormJurusanDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Jurusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus data dari database.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Apakah Anda yakin ingin menghapus data <strong className="text-slate-900 font-bold">{deleteConfirm.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-sm text-xs"
              >
                Ya, Hapus Data
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
        }}
      />
    </div>
  );
};
