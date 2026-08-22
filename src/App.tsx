import React, { useState, useEffect } from 'react';
import {
  User,
  Jurusan,
  Kelas,
  MataPelajaran,
  NilaiSiswa,
  AbsensiRecord,
  AbsensiPegawaiRecord,
  BukuDigital,
  PeminjamanBuku,
  MateriPelajaran,
  TugasPelajaran,
  PengumpulanTugas,
  ForumDiskusi,
  KomentarForum,
  NotificationLog,
  DatabaseBackupLog,
  UserRole,
  SchoolSettings,
} from './types';

import {
  loadUsers,
  loadClasses,
  loadJurusan,
  loadGrades,
  loadAttendance,
  loadStaffAttendance,
  loadBooks,
  loadPeminjaman,
  loadMateri,
  loadTugas,
  loadPengumpulan,
  loadForum,
  loadNotifications,
  loadBackups,
  loadSchoolSettings,
  setStoredData,
  resetAllStoredData,
} from './utils/storage';

import { INITIAL_CLASSES, INITIAL_SUBJECTS, INITIAL_EVENTS, INITIAL_JADWAL, MOCK_RAPORT } from './data/initialData';
import { generateRaportPDF } from './utils/pdfGenerator';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SchoolSettingsModal } from './components/admin/SchoolSettingsModal';


import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';

import { AbsensiOnline } from './components/absensi/AbsensiOnline';
import { DaftarSiswa } from './components/siswa/DaftarSiswa';
import { UploadFotoSiswa } from './components/siswa/UploadFotoSiswa';
import { KartuAbsensiSiswa } from './components/kartu/KartuAbsensiSiswa';
import { InputNilai } from './components/nilai/InputNilai';
import { AnalitikNilai } from './components/nilai/AnalitikNilai';
import { EraportManager } from './components/raport/EraportManager';
import { MateriDanTugas } from './components/portal/MateriDanTugas';
import { ForumDiskusiView } from './components/forum/ForumDiskusi';
import { PerpustakaanDigital } from './components/perpustakaan/PerpustakaanDigital';
import { KalenderAkademik } from './components/kalender/KalenderAkademik';
import { UserManagement } from './components/admin/UserManagement';
import { DatabaseBackupConsole } from './components/admin/DatabaseBackup';
import { KopRaportSettings } from './components/admin/KopRaportSettings';
import { PublicHome } from './components/home/PublicHome';

export default function App() {
  // State Initialization from localStorage / Defaults
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [classes, setClasses] = useState<Kelas[]>(loadClasses);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>(loadJurusan);
  const [currentUser, setCurrentUser] = useState<User>(users[0] || loadUsers()[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [grades, setGrades] = useState<NilaiSiswa[]>(loadGrades);
  const [attendance, setAttendance] = useState<AbsensiRecord[]>(loadAttendance);
  const [staffAttendance, setStaffAttendance] = useState<AbsensiPegawaiRecord[]>(loadStaffAttendance);
  const [books, setBooks] = useState<BukuDigital[]>(loadBooks);
  const [peminjaman, setPeminjaman] = useState<PeminjamanBuku[]>(loadPeminjaman);
  const [materi, setMateri] = useState<MateriPelajaran[]>(loadMateri);
  const [tugas, setTugas] = useState<TugasPelajaran[]>(loadTugas);
  const [pengumpulan, setPengumpulan] = useState<PengumpulanTugas[]>(loadPengumpulan);
  const [forum, setForum] = useState<ForumDiskusi[]>(loadForum);
  const [notifications, setNotifications] = useState<NotificationLog[]>(loadNotifications);
  const [backups, setBackups] = useState<DatabaseBackupLog[]>(loadBackups);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(loadSchoolSettings);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);

  // Sync state to localStorage on updates
  useEffect(() => {
    setStoredData('school_settings', schoolSettings);
  }, [schoolSettings]);

  // Sync website title to browser tab title
  useEffect(() => {
    const title = schoolSettings.websiteTitle || schoolSettings.namaSekolah || 'SIAKAD SMA Negeri 1 Smart School';
    document.title = title;
  }, [schoolSettings.websiteTitle, schoolSettings.namaSekolah]);

  useEffect(() => {
    setStoredData('users', users);
  }, [users]);

  useEffect(() => {
    setStoredData('classes', classes);
  }, [classes]);

  useEffect(() => {
    setStoredData('jurusan', jurusanList);
  }, [jurusanList]);

  useEffect(() => {
    setStoredData('grades', grades);
  }, [grades]);

  useEffect(() => {
    setStoredData('attendance', attendance);
  }, [attendance]);

  useEffect(() => {
    setStoredData('staff_attendance', staffAttendance);
  }, [staffAttendance]);

  useEffect(() => {
    setStoredData('books', books);
  }, [books]);

  useEffect(() => {
    setStoredData('materi', materi);
  }, [materi]);

  useEffect(() => {
    setStoredData('tugas', tugas);
  }, [tugas]);

  useEffect(() => {
    setStoredData('pengumpulan', pengumpulan);
  }, [pengumpulan]);

  useEffect(() => {
    setStoredData('forum', forum);
  }, [forum]);

  useEffect(() => {
    setStoredData('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredData('backups', backups);
  }, [backups]);

  // Handlers for data mutations with cascading synchronization
  const handleAddUser = (newUser: User) => {
    setUsers([newUser, ...users]);
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    // 1. Update users state
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    // 2. Cascade synchronize student attendance records
    if (updatedUser.role === 'siswa') {
      setAttendance((prevAttendance) =>
        prevAttendance.map((rec) => {
          if (rec.siswaId === updatedUser.id) {
            return {
              ...rec,
              siswaNama: updatedUser.name,
              nisn: updatedUser.nisn || rec.nisn,
              kelasId: updatedUser.kelasId || rec.kelasId,
              kelasNama: updatedUser.kelasNama || rec.kelasNama,
              jurusanNama: updatedUser.jurusanNama || rec.jurusanNama,
            };
          }
          return rec;
        })
      );

      // 3. Cascade synchronize student grades
      setGrades((prevGrades) =>
        prevGrades.map((g) => {
          if (g.siswaId === updatedUser.id) {
            return {
              ...g,
              siswaNama: updatedUser.name,
              nisn: updatedUser.nisn || g.nisn,
              kelasId: updatedUser.kelasId || g.kelasId,
            };
          }
          return g;
        })
      );
    } else {
      // 4. Cascade synchronize staff/teacher attendance records
      setStaffAttendance((prevStaff) =>
        prevStaff.map((rec) => {
          if (rec.pegawaiId === updatedUser.id) {
            return {
              ...rec,
              pegawaiNama: updatedUser.name,
              nipOrNik: updatedUser.nip || rec.nipOrNik,
              jabatan: updatedUser.jabatan || rec.jabatan,
              kategori: updatedUser.kategoriPegawai || rec.kategori,
            };
          }
          return rec;
        })
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    const filtered = users.filter((u) => u.id !== userId);
    setUsers(filtered);
    if (currentUser.id === userId && filtered.length > 0) {
      setCurrentUser(filtered[0]);
    }
    // Clean up attendance and grades for deleted student/staff to prevent orphaned records
    setAttendance((prev) => prev.filter((a) => a.siswaId !== userId));
    setGrades((prev) => prev.filter((g) => g.siswaId !== userId));
    setStaffAttendance((prev) => prev.filter((s) => s.pegawaiId !== userId));
  };

  const handleImportStudents = (newStudents: User[]) => {
    setUsers([...newStudents, ...users]);
  };

  // CRUD Kelas Handlers with Cascading Synchronization
  const handleAddClass = (newKelas: Kelas) => {
    setClasses([...classes, newKelas]);
  };

  const handleUpdateClass = (updatedKelas: Kelas) => {
    const oldClass = classes.find((c) => c.id === updatedKelas.id);
    const oldNama = oldClass?.nama;

    setClasses(classes.map((c) => (c.id === updatedKelas.id ? updatedKelas : c)));

    // Cascade update class name in users
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.kelasId === updatedKelas.id || (oldNama && u.kelasNama === oldNama)) {
          return {
            ...u,
            kelasId: updatedKelas.id,
            kelasNama: updatedKelas.nama,
            jurusanId: updatedKelas.jurusanId || u.jurusanId,
            jurusanNama: updatedKelas.jurusanNama || u.jurusanNama,
          };
        }
        return u;
      })
    );

    // Cascade update class name in student attendance records
    setAttendance((prevAttendance) =>
      prevAttendance.map((a) => {
        if (a.kelasId === updatedKelas.id || (oldNama && a.kelasNama === oldNama)) {
          return {
            ...a,
            kelasId: updatedKelas.id,
            kelasNama: updatedKelas.nama,
          };
        }
        return a;
      })
    );

    // Cascade update class in grades
    setGrades((prevGrades) =>
      prevGrades.map((g) => {
        if (g.kelasId === updatedKelas.id || (oldNama && g.kelasId === oldNama)) {
          return {
            ...g,
            kelasId: updatedKelas.id,
          };
        }
        return g;
      })
    );
  };

  const handleDeleteClass = (kelasId: string) => {
    setClasses(classes.filter((c) => c.id !== kelasId));
  };

  // CRUD Jurusan Handlers with Cascading Synchronization
  const handleAddJurusan = (newJurusan: Jurusan) => {
    setJurusanList([...jurusanList, newJurusan]);
  };

  const handleUpdateJurusan = (updatedJurusan: Jurusan) => {
    const oldJurusan = jurusanList.find((j) => j.id === updatedJurusan.id);
    const oldNama = oldJurusan?.nama;
    const oldKode = oldJurusan?.kode;

    setJurusanList(jurusanList.map((j) => (j.id === updatedJurusan.id ? updatedJurusan : j)));

    // Cascade update jurusan in classes
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (
          c.jurusanId === updatedJurusan.id ||
          (oldNama && c.jurusanNama === oldNama) ||
          (oldKode && c.jurusanNama === oldKode)
        ) {
          return {
            ...c,
            jurusanId: updatedJurusan.id,
            jurusanNama: updatedJurusan.nama,
          };
        }
        return c;
      })
    );

    // Cascade update jurusan in users
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (
          u.jurusanId === updatedJurusan.id ||
          (oldNama && u.jurusanNama === oldNama) ||
          (oldKode && u.jurusanNama === oldKode)
        ) {
          return {
            ...u,
            jurusanId: updatedJurusan.id,
            jurusanNama: updatedJurusan.nama,
          };
        }
        return u;
      })
    );

    // Cascade update jurusan in attendance
    setAttendance((prevAttendance) =>
      prevAttendance.map((a) => {
        if (
          (oldNama && a.jurusanNama === oldNama) ||
          (oldKode && a.jurusanNama === oldKode)
        ) {
          return {
            ...a,
            jurusanNama: updatedJurusan.nama,
          };
        }
        return a;
      })
    );
  };

  const handleDeleteJurusan = (jurusanId: string) => {
    setJurusanList(jurusanList.filter((j) => j.id !== jurusanId));
  };

  const handleSaveGrade = (newGrade: NilaiSiswa) => {
    const existingIndex = grades.findIndex(
      (g) => g.siswaId === newGrade.siswaId && g.mataPelajaranId === newGrade.mataPelajaranId
    );

    let updatedGrades: NilaiSiswa[];
    if (existingIndex >= 0) {
      updatedGrades = [...grades];
      updatedGrades[existingIndex] = newGrade;
    } else {
      updatedGrades = [newGrade, ...grades];
    }
    setGrades(updatedGrades);

    // Automated Parent WhatsApp & Email Notification Trigger!
    const newNotif: NotificationLog = {
      id: `ntf-${Date.now()}`,
      channel: 'WhatsApp',
      penerimaNama: 'Ibu Rahmawati (Orang Tua)',
      penerimaKontak: '+6281288990011',
      siswaNama: newGrade.siswaNama,
      pesan: `Nilai ${newGrade.mataPelajaranNama} ${newGrade.siswaNama} telah diinput: Nilai Akhir ${newGrade.nilaiAkhir} (Predikat ${newGrade.predikat}). Terima kasih.`,
      waktu: new Date().toLocaleString('id-ID'),
      status: 'Terkirim',
      tipe: 'Nilai',
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleSaveBatchGrades = (newGrades: NilaiSiswa[]) => {
    let updatedGrades = [...grades];
    newGrades.forEach((newG) => {
      const existingIndex = updatedGrades.findIndex(
        (g) => g.siswaId === newG.siswaId && g.mataPelajaranId === newG.mataPelajaranId
      );
      if (existingIndex >= 0) {
        updatedGrades[existingIndex] = newG;
      } else {
        updatedGrades.unshift(newG);
      }
    });
    setGrades(updatedGrades);

    // Add batch notification
    const newNotif: NotificationLog = {
      id: `ntf-${Date.now()}`,
      channel: 'WhatsApp',
      penerimaNama: `Wali Murid (${newGrades.length} Siswa)`,
      penerimaKontak: 'Broadcast WhatsApp Gateway',
      siswaNama: `${newGrades.length} Siswa`,
      pesan: `Upload Nilai Massal ${newGrades[0]?.mataPelajaranNama || 'Mata Pelajaran'} berhasil diproses (${newGrades.length} data siswa diperbarui).`,
      waktu: new Date().toLocaleString('id-ID'),
      status: 'Terkirim',
      tipe: 'Nilai',
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
  };

  const handleAddAttendance = (record: AbsensiRecord) => {
    setAttendance([record, ...attendance]);

    // Automated Parent WhatsApp Notification Trigger for Attendance!
    const newNotif: NotificationLog = {
      id: `ntf-${Date.now()}`,
      channel: 'WhatsApp',
      penerimaNama: 'Ibu Rahmawati (Orang Tua)',
      penerimaKontak: '+6281288990011',
      siswaNama: record.siswaNama,
      pesan: `Absensi GPS: ${record.siswaNama} telah melakukan presensi (${record.status}) di SMA Negeri 1 pada pkl ${record.waktu} WIB. Jarak ke lokasi: ${record.jarakKeSekolahMeter}m.`,
      waktu: new Date().toLocaleString('id-ID'),
      status: 'Terkirim',
      tipe: 'Absensi',
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleAddStaffAttendance = (record: AbsensiPegawaiRecord) => {
    setStaffAttendance([record, ...staffAttendance]);
  };

  const handleSaveBatchAttendance = (newRecords: AbsensiRecord[]) => {
    let updatedAttendance = [...attendance];
    newRecords.forEach((record) => {
      const existingIdx = updatedAttendance.findIndex(
        (a) =>
          a.siswaId === record.siswaId &&
          a.tanggal === record.tanggal &&
          (record.tipeAbsensi === 'Mapel'
            ? a.tipeAbsensi === 'Mapel' &&
              a.mataPelajaranNama === record.mataPelajaranNama &&
              a.pertemuanKe === record.pertemuanKe
            : !a.tipeAbsensi || a.tipeAbsensi === 'Harian')
      );
      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = record;
      } else {
        updatedAttendance.unshift(record);
      }
    });
    setAttendance(updatedAttendance);
  };

  const handleUpdateStaffAttendance = (updatedRecord: AbsensiPegawaiRecord) => {
    setStaffAttendance(
      staffAttendance.map((rec) => (rec.id === updatedRecord.id ? updatedRecord : rec))
    );
  };

  const handleAddMateri = (newMat: MateriPelajaran) => {
    setMateri([newMat, ...materi]);
  };

  const handleDeleteMateri = (materiId: string) => {
    setMateri(materi.filter((m) => m.id !== materiId));
  };

  const handleAddTugas = (newTgs: TugasPelajaran) => {
    setTugas([newTgs, ...tugas]);
  };

  const handleDeleteTugas = (tugasId: string) => {
    setTugas(tugas.filter((t) => t.id !== tugasId));
  };

  const handleAddPengumpulan = (newPgm: PengumpulanTugas) => {
    setPengumpulan([newPgm, ...pengumpulan]);
  };

  const handleUpdatePengumpulan = (updatedPgm: PengumpulanTugas) => {
    setPengumpulan(pengumpulan.map((p) => (p.id === updatedPgm.id ? updatedPgm : p)));
  };

  const handleDeletePengumpulan = (pgmId: string) => {
    setPengumpulan(pengumpulan.filter((p) => p.id !== pgmId));
  };

  const handleAddForum = (newFrm: ForumDiskusi) => {
    setForum([newFrm, ...forum]);
  };

  const handleAddComment = (forumId: string, newComment: KomentarForum) => {
    const updated = forum.map((f) => {
      if (f.id === forumId) {
        return {
          ...f,
          komentarList: [...f.komentarList, newComment],
        };
      }
      return f;
    });
    setForum(updated);
  };

  const handleBorrowBook = (bukuId: string) => {
    const updatedBooks = books.map((b) => {
      if (b.id === bukuId && b.stokTersedia > 0) {
        return { ...b, stokTersedia: b.stokTersedia - 1 };
      }
      return b;
    });
    setBooks(updatedBooks);
  };

  const handleTriggerManualBackup = () => {
    const newBackup: DatabaseBackupLog = {
      id: `bkp-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      ukuranFile: '14.9 MB',
      tipe: 'Manual Admin',
      status: 'Berhasil',
      databaseName: 'postgresql_siakad_production',
      fileName: `siakad_pg_dump_${Date.now()}.sql.gz`,
    };
    setBackups([newBackup, ...backups]);
  };

  const handleDownloadChildRaport = () => {
    // Generate dynamic raport for current student or child with active school identity
    const targetStudent = currentUser.role === 'siswa' 
      ? currentUser 
      : (users.find((u) => u.role === 'siswa') || { name: 'Ahmad Fauzi', nisn: '0061234567', kelasNama: '10 IPA 1' });
    
    const studentClass = classes.find((c) => c.nama === (targetStudent.kelasNama || '10 IPA 1')) || classes[0];
    const waliTeacher = users.find((u) => u.id === studentClass?.waliKelasId || u.name === studentClass?.waliKelasNama);
    
    const dynamicRaportData: any = {
      ...MOCK_RAPORT,
      namaSiswa: targetStudent.name,
      nisn: targetStudent.nisn || '0061234567',
      kelas: studentClass?.nama || '10 IPA 1',
      waliKelasNama: studentClass?.waliKelasNama || waliTeacher?.name || 'Budi Santoso S.Pd',
      waliKelasNip: waliTeacher?.nip || '198203152008011005',
      kepalaSekolahNama: schoolSettings.kepalaSekolah,
      kepalaSekolahNip: schoolSettings.nipKepalaSekolah,
    };

    generateRaportPDF(dynamicRaportData, schoolSettings);
  };

  const childStudentObj = users.find((u) => u.role === 'siswa');

  // When user is not logged in, render the Public Home page first!
  if (!isLoggedIn) {
    return (
      <PublicHome
        users={users}
        schoolSettings={schoolSettings}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const bgType = schoolSettings.bgType || 'solid';
  const bgColor = schoolSettings.bgColor || '#f8fafc';
  const bgGradient = schoolSettings.bgGradient || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
  const bgImageUrl = schoolSettings.bgImageUrl || '';
  const bgAttachment = schoolSettings.bgAttachment || 'fixed';
  const bgSize = schoolSettings.bgSize || 'cover';
  const bgOverlayColor = schoolSettings.bgOverlayColor || '#ffffff';
  const bgOverlayOpacity = (schoolSettings.bgOverlayOpacity ?? 60) / 100;
  const bgImageBlur = schoolSettings.bgImageBlur ?? 0;

  const isCurrentUserWaliKelas =
    Boolean(currentUser.isWaliKelas) ||
    (currentUser.role === 'guru' &&
      classes.some(
        (c) =>
          c.waliKelasId === currentUser.id ||
          c.waliKelasNama === currentUser.name ||
          (currentUser.name && c.waliKelasNama && currentUser.name.toLowerCase().includes(c.waliKelasNama.toLowerCase()))
      ));

  const canAccessEraport = currentUser.role === 'admin' || isCurrentUserWaliKelas;
  const canAccessUploadFoto = currentUser.role === 'admin' || isCurrentUserWaliKelas;

  return (
    <div
      className="min-h-screen font-sans text-slate-900 flex flex-col relative transition-all duration-300"
      style={{
        backgroundColor: bgType === 'solid' ? bgColor : undefined,
        backgroundImage:
          bgType === 'gradient'
            ? bgGradient
            : bgType === 'image' && bgImageUrl
            ? `url(${bgImageUrl})`
            : undefined,
        backgroundAttachment: bgAttachment,
        backgroundSize: bgSize,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Image Overlay & Opacity Layer for readability */}
      {bgType === 'image' && bgImageUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            backgroundColor: bgOverlayColor,
            opacity: bgOverlayOpacity,
            backdropFilter: bgImageBlur > 0 ? `blur(${bgImageBlur}px)` : undefined,
          }}
        />
      )}

      {/* Main Content Layout (Above the background overlay) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <Header
          currentUser={currentUser}
          unreadCount={notifications.length}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onLogout={() => setIsLoggedIn(false)}
          schoolSettings={schoolSettings}
          onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
          onUpdateCurrentUser={handleUpdateUser}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={currentUser.role}
            isWaliKelas={isCurrentUserWaliKelas}
            schoolSettings={schoolSettings}
          />

          {/* Dynamic Main View */}
          <div className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <>
              {currentUser.role === 'admin' && (
                <AdminDashboard
                  users={users}
                  grades={grades}
                  attendance={attendance}
                  backups={backups}
                  onNavigateTab={setActiveTab}
                  schoolSettings={schoolSettings}
                  onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
                />
              )}

              {currentUser.role === 'guru' && (
                <TeacherDashboard
                  currentUser={currentUser}
                  allUsers={users}
                  classes={classes}
                  jurusanList={jurusanList}
                  grades={grades}
                  tugasList={tugas}
                  attendanceList={attendance}
                  schoolSettings={schoolSettings}
                  onNavigateTab={setActiveTab}
                />
              )}
              {currentUser.role === 'siswa' && (
                <StudentDashboard
                  currentUser={currentUser}
                  grades={grades}
                  attendance={attendance}
                  tugasList={tugas}
                  schoolSettings={schoolSettings}
                  classes={classes}
                  allUsers={users}
                  onNavigateTab={setActiveTab}
                  onDownloadRaport={handleDownloadChildRaport}
                />
              )}
              {currentUser.role === 'orangtua' && (
                <ParentDashboard
                  currentUser={currentUser}
                  childStudent={childStudentObj}
                  childGrades={grades.filter((g) => g.siswaNama === 'Ahmad Fauzi' || g.siswaNama === currentUser.childName)}
                  childAttendance={attendance.filter((a) => a.siswaNama === 'Ahmad Fauzi' || a.siswaNama === currentUser.childName)}
                  parentNotifications={notifications}
                  schoolSettings={schoolSettings}
                  classes={classes}
                  allUsers={users}
                  onNavigateTab={setActiveTab}
                  onDownloadRaport={handleDownloadChildRaport}
                />
              )}
            </>
          )}

          {activeTab === 'daftar-siswa' && (
            <DaftarSiswa
              currentUser={currentUser}
              users={users}
              classes={classes}
              jurusanList={jurusanList}
              attendanceList={attendance}
              subjects={INITIAL_SUBJECTS}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onBatchImportStudents={handleImportStudents}
              onSaveBatchAttendance={handleSaveBatchAttendance}
              schoolSettings={schoolSettings}
            />
          )}

          {activeTab === 'upload-foto-siswa' && canAccessUploadFoto && (
            <UploadFotoSiswa
              currentUser={currentUser}
              users={users}
              classes={classes}
              jurusanList={jurusanList}
              onUpdateUser={handleUpdateUser}
              schoolSettings={schoolSettings}
            />
          )}

          {activeTab === 'kartu-absensi' && currentUser.role === 'admin' && (
            <KartuAbsensiSiswa
              currentUser={currentUser}
              users={users}
              classes={classes}
              jurusanList={jurusanList}
              attendanceList={attendance}
              onAddAttendance={handleAddAttendance}
              schoolSettings={schoolSettings}
            />
          )}

          {activeTab === 'absensi' && (
            <AbsensiOnline
              currentUser={currentUser}
              attendanceList={attendance}
              onAddAttendance={handleAddAttendance}
              onSaveBatchAttendance={handleSaveBatchAttendance}
              staffAttendanceList={staffAttendance}
              onAddStaffAttendance={handleAddStaffAttendance}
              onUpdateStaffAttendance={handleUpdateStaffAttendance}
              allUsers={users}
              classes={classes}
              jurusanList={jurusanList}
              schoolSettings={schoolSettings}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'nilai' && (
            <InputNilai
              currentUser={currentUser}
              grades={grades}
              subjects={INITIAL_SUBJECTS}
              classes={classes}
              allUsers={users}
              onSaveGrade={handleSaveGrade}
              onSaveBatchGrades={handleSaveBatchGrades}
              onDeleteGrade={handleDeleteGrade}
            />
          )}

          {activeTab === 'analitik' && (
            <AnalitikNilai
              currentUser={currentUser}
              grades={grades.filter((g) => g.siswaNama === 'Ahmad Fauzi')}
            />
          )}

          {activeTab === 'eraport' && canAccessEraport && (
            <EraportManager
              currentUser={currentUser}
              grades={grades}
              schoolSettings={schoolSettings}
              classes={classes}
              allUsers={users}
              onUpdateUser={handleUpdateUser}
              onUpdateSchoolSettings={setSchoolSettings}
            />
          )}


          {activeTab === 'materi-tugas' && (
            <MateriDanTugas
              currentUser={currentUser}
              materiList={materi}
              tugasList={tugas}
              pengumpulanList={pengumpulan}
              classes={classes}
              onAddMateri={handleAddMateri}
              onAddTugas={handleAddTugas}
              onAddPengumpulan={handleAddPengumpulan}
              onUpdatePengumpulan={handleUpdatePengumpulan}
              onDeletePengumpulan={handleDeletePengumpulan}
              onDeleteMateri={handleDeleteMateri}
              onDeleteTugas={handleDeleteTugas}
            />
          )}

          {activeTab === 'forum' && (
            <ForumDiskusiView
              currentUser={currentUser}
              forumList={forum}
              onAddForum={handleAddForum}
              onAddComment={handleAddComment}
            />
          )}

          {activeTab === 'perpustakaan' && (
            <PerpustakaanDigital
              currentUser={currentUser}
              books={books}
              peminjamanList={peminjaman}
              onBorrowBook={handleBorrowBook}
            />
          )}

          {activeTab === 'kalender' && (
            <KalenderAkademik events={INITIAL_EVENTS} jadwal={INITIAL_JADWAL} />
          )}

          {activeTab === 'notifikasi' && (
            <NotificationDrawer
              isOpen={true}
              onClose={() => setActiveTab('dashboard')}
              notifications={notifications}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              classes={classes}
              jurusanList={jurusanList}
              attendance={attendance}
              onNavigateTab={setActiveTab}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              onAddJurusan={handleAddJurusan}
              onUpdateJurusan={handleUpdateJurusan}
              onDeleteJurusan={handleDeleteJurusan}
              onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
            />
          )}

          {activeTab === 'kop-raport' && (
            <KopRaportSettings
              currentUser={currentUser}
              schoolSettings={schoolSettings}
              onSaveSchoolSettings={(newSettings) => setSchoolSettings(newSettings)}
            />
          )}

          {activeTab === 'backup' && (
            <DatabaseBackupConsole
              backups={backups}
              onTriggerBackup={handleTriggerManualBackup}
            />
          )}
        </div>
      </main>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />

      {/* School Name & Logo Editor Modal (Admin Only) */}
      <SchoolSettingsModal
        isOpen={isSchoolSettingsOpen}
        onClose={() => setIsSchoolSettingsOpen(false)}
        userRole={currentUser.role}
        schoolSettings={schoolSettings}
        onSaveSchoolSettings={(newSettings) => setSchoolSettings(newSettings)}
      />
      </div>
    </div>
  );
}

