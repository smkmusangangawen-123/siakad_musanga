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
  loadSubjects,
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

import {
  subscribeCollection,
  subscribeDoc,
  saveDocToFirestore,
  deleteDocFromFirestore,
  batchSaveToFirestore,
  forceFullCloudSync,
  onSyncStatusChange,
  SyncStatus,
} from './lib/firestoreSync';

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
import { ManajemenMapel } from './components/admin/ManajemenMapel';
import { DatabaseBackupConsole } from './components/admin/DatabaseBackup';
import { KopRaportSettings } from './components/admin/KopRaportSettings';
import { PublicHome } from './components/home/PublicHome';

export default function App() {
  // State Initialization from localStorage / Defaults
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [classes, setClasses] = useState<Kelas[]>(loadClasses);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>(loadJurusan);
  const [subjects, setSubjects] = useState<MataPelajaran[]>(loadSubjects);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');

  // Track Firestore connection status
  useEffect(() => {
    const unsub = onSyncStatusChange((status) => {
      setSyncStatus(status);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore Subscriptions for all school collections
  useEffect(() => {
    const unsubs = [
      subscribeCollection<User>('users', (data) => setUsers(data), loadUsers()),
      subscribeCollection<Kelas>('classes', (data) => setClasses(data), loadClasses()),
      subscribeCollection<Jurusan>('jurusan', (data) => setJurusanList(data), loadJurusan()),
      subscribeCollection<MataPelajaran>('subjects', (data) => setSubjects(data), loadSubjects()),
      subscribeCollection<NilaiSiswa>('grades', (data) => setGrades(data), loadGrades()),
      subscribeCollection<AbsensiRecord>('attendance', (data) => setAttendance(data), loadAttendance()),
      subscribeCollection<AbsensiPegawaiRecord>('staff_attendance', (data) => setStaffAttendance(data), loadStaffAttendance()),
      subscribeCollection<BukuDigital>('books', (data) => setBooks(data), loadBooks()),
      subscribeCollection<PeminjamanBuku>('peminjaman', (data) => setPeminjaman(data), loadPeminjaman()),
      subscribeCollection<MateriPelajaran>('materi', (data) => setMateri(data), loadMateri()),
      subscribeCollection<TugasPelajaran>('tugas', (data) => setTugas(data), loadTugas()),
      subscribeCollection<PengumpulanTugas>('pengumpulan', (data) => setPengumpulan(data), loadPengumpulan()),
      subscribeCollection<ForumDiskusi>('forum', (data) => setForum(data), loadForum()),
      subscribeCollection<NotificationLog>('notifications', (data) => setNotifications(data), loadNotifications()),
      subscribeCollection<DatabaseBackupLog>('backups', (data) => setBackups(data), loadBackups()),
      subscribeDoc<SchoolSettings>('school_settings', 'main_config', (data) => setSchoolSettings(data), loadSchoolSettings()),
    ];

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, []);

  // Sync state to localStorage on updates (for fast offline fallback cache)
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
    setStoredData('subjects', subjects);
  }, [subjects]);

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

  // Handlers for data mutations with cascading synchronization and Cloud Firestore persistence
  const handleAddUser = (newUser: User) => {
    setUsers([newUser, ...users]);
    saveDocToFirestore('users', newUser.id, newUser);
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);
    const targetUser = updated.find((u) => u.id === userId);
    if (targetUser) {
      saveDocToFirestore('users', targetUser.id, targetUser);
    }
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    // 1. Update users state & Cloud Firestore
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveDocToFirestore('users', updatedUser.id, updatedUser);

    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    // 2. Cascade synchronize student attendance records
    if (updatedUser.role === 'siswa') {
      const updatedAttendance = attendance.map((rec) => {
        if (rec.siswaId === updatedUser.id) {
          const uRec = {
            ...rec,
            siswaNama: updatedUser.name,
            nisn: updatedUser.nisn || rec.nisn,
            kelasId: updatedUser.kelasId || rec.kelasId,
            kelasNama: updatedUser.kelasNama || rec.kelasNama,
            jurusanNama: updatedUser.jurusanNama || rec.jurusanNama,
          };
          saveDocToFirestore('attendance', uRec.id, uRec);
          return uRec;
        }
        return rec;
      });
      setAttendance(updatedAttendance);

      // 3. Cascade synchronize student grades
      const updatedGrades = grades.map((g) => {
        if (g.siswaId === updatedUser.id) {
          const uGrade = {
            ...g,
            siswaNama: updatedUser.name,
            nisn: updatedUser.nisn || g.nisn,
            kelasId: updatedUser.kelasId || g.kelasId,
          };
          saveDocToFirestore('grades', uGrade.id, uGrade);
          return uGrade;
        }
        return g;
      });
      setGrades(updatedGrades);
    } else {
      // 4. Cascade synchronize staff/teacher attendance records
      const updatedStaff = staffAttendance.map((rec) => {
        if (rec.pegawaiId === updatedUser.id) {
          const uStaff = {
            ...rec,
            pegawaiNama: updatedUser.name,
            nipOrNik: updatedUser.nip || rec.nipOrNik,
            jabatan: updatedUser.jabatan || rec.jabatan,
            kategori: updatedUser.kategoriPegawai || rec.kategori,
          };
          saveDocToFirestore('staff_attendance', uStaff.id, uStaff);
          return uStaff;
        }
        return rec;
      });
      setStaffAttendance(updatedStaff);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const filtered = users.filter((u) => u.id !== userId);
    setUsers(filtered);
    deleteDocFromFirestore('users', userId);

    if (currentUser.id === userId && filtered.length > 0) {
      setCurrentUser(filtered[0]);
    }
    // Clean up attendance and grades for deleted student/staff
    setAttendance((prev) => prev.filter((a) => a.siswaId !== userId));
    setGrades((prev) => prev.filter((g) => g.siswaId !== userId));
    setStaffAttendance((prev) => prev.filter((s) => s.pegawaiId !== userId));
  };

  const handleImportStudents = (newStudents: User[]) => {
    setUsers([...newStudents, ...users]);
    batchSaveToFirestore('users', newStudents);
  };

  // CRUD Kelas Handlers with Cascading Synchronization
  const handleAddClass = (newKelas: Kelas) => {
    setClasses([...classes, newKelas]);
    saveDocToFirestore('classes', newKelas.id, newKelas);
  };

  const handleUpdateClass = (updatedKelas: Kelas) => {
    const oldClass = classes.find((c) => c.id === updatedKelas.id);
    const oldNama = oldClass?.nama;

    setClasses(classes.map((c) => (c.id === updatedKelas.id ? updatedKelas : c)));
    saveDocToFirestore('classes', updatedKelas.id, updatedKelas);

    // Cascade update class name in users
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.kelasId === updatedKelas.id || (oldNama && u.kelasNama === oldNama)) {
          const uUser = {
            ...u,
            kelasId: updatedKelas.id,
            kelasNama: updatedKelas.nama,
            jurusanId: updatedKelas.jurusanId || u.jurusanId,
            jurusanNama: updatedKelas.jurusanNama || u.jurusanNama,
          };
          saveDocToFirestore('users', uUser.id, uUser);
          return uUser;
        }
        return u;
      })
    );

    // Cascade update class name in student attendance records
    setAttendance((prevAttendance) =>
      prevAttendance.map((a) => {
        if (a.kelasId === updatedKelas.id || (oldNama && a.kelasNama === oldNama)) {
          const uAtt = {
            ...a,
            kelasId: updatedKelas.id,
            kelasNama: updatedKelas.nama,
          };
          saveDocToFirestore('attendance', uAtt.id, uAtt);
          return uAtt;
        }
        return a;
      })
    );

    // Cascade update class in grades
    setGrades((prevGrades) =>
      prevGrades.map((g) => {
        if (g.kelasId === updatedKelas.id || (oldNama && g.kelasId === oldNama)) {
          const uG = {
            ...g,
            kelasId: updatedKelas.id,
          };
          saveDocToFirestore('grades', uG.id, uG);
          return uG;
        }
        return g;
      })
    );
  };

  const handleDeleteClass = (kelasId: string) => {
    setClasses(classes.filter((c) => c.id !== kelasId));
    deleteDocFromFirestore('classes', kelasId);
  };

  // CRUD Jurusan Handlers with Cascading Synchronization
  const handleAddJurusan = (newJurusan: Jurusan) => {
    setJurusanList([...jurusanList, newJurusan]);
    saveDocToFirestore('jurusan', newJurusan.id, newJurusan);
  };

  const handleUpdateJurusan = (updatedJurusan: Jurusan) => {
    const oldJurusan = jurusanList.find((j) => j.id === updatedJurusan.id);
    const oldNama = oldJurusan?.nama;
    const oldKode = oldJurusan?.kode;

    setJurusanList(jurusanList.map((j) => (j.id === updatedJurusan.id ? updatedJurusan : j)));
    saveDocToFirestore('jurusan', updatedJurusan.id, updatedJurusan);

    // Cascade update jurusan in classes
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (
          c.jurusanId === updatedJurusan.id ||
          (oldNama && c.jurusanNama === oldNama) ||
          (oldKode && c.jurusanNama === oldKode)
        ) {
          const uC = {
            ...c,
            jurusanId: updatedJurusan.id,
            jurusanNama: updatedJurusan.nama,
          };
          saveDocToFirestore('classes', uC.id, uC);
          return uC;
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
          const uU = {
            ...u,
            jurusanId: updatedJurusan.id,
            jurusanNama: updatedJurusan.nama,
          };
          saveDocToFirestore('users', uU.id, uU);
          return uU;
        }
        return u;
      })
    );
  };

  const handleDeleteJurusan = (jurusanId: string) => {
    setJurusanList(jurusanList.filter((j) => j.id !== jurusanId));
    deleteDocFromFirestore('jurusan', jurusanId);
  };

  // CRUD Mata Pelajaran (Subjects) Handlers with Cascading Synchronization
  const handleAddSubject = (newSubject: MataPelajaran) => {
    setSubjects([newSubject, ...subjects]);
    saveDocToFirestore('subjects', newSubject.id, newSubject);
  };

  const handleUpdateSubject = (updatedSubject: MataPelajaran) => {
    const oldSubject = subjects.find((s) => s.id === updatedSubject.id);
    const oldNama = oldSubject?.nama;
    const oldKode = oldSubject?.kode;

    setSubjects(subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)));
    saveDocToFirestore('subjects', updatedSubject.id, updatedSubject);

    // Cascade update subject in grades
    setGrades((prevGrades) =>
      prevGrades.map((g) => {
        if (
          g.mataPelajaranId === updatedSubject.id ||
          (oldNama && g.mataPelajaranNama === oldNama) ||
          (oldKode && g.mataPelajaranId === oldKode)
        ) {
          const uG = {
            ...g,
            mataPelajaranId: updatedSubject.id,
            mataPelajaranNama: updatedSubject.nama,
          };
          saveDocToFirestore('grades', uG.id, uG);
          return uG;
        }
        return g;
      })
    );

    // Cascade update subject in learning materials (materi)
    setMateri((prevMateri) =>
      prevMateri.map((m) => {
        if (
          m.mataPelajaranId === updatedSubject.id ||
          (oldNama && m.mataPelajaranNama === oldNama)
        ) {
          const uM = {
            ...m,
            mataPelajaranId: updatedSubject.id,
            mataPelajaranNama: updatedSubject.nama,
          };
          saveDocToFirestore('materi', uM.id, uM);
          return uM;
        }
        return m;
      })
    );

    // Cascade update subject in assignments (tugas)
    setTugas((prevTugas) =>
      prevTugas.map((t) => {
        if (
          t.mataPelajaranId === updatedSubject.id ||
          (oldNama && t.mataPelajaranNama === oldNama)
        ) {
          const uT = {
            ...t,
            mataPelajaranId: updatedSubject.id,
            mataPelajaranNama: updatedSubject.nama,
          };
          saveDocToFirestore('tugas', uT.id, uT);
          return uT;
        }
        return t;
      })
    );
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId));
    deleteDocFromFirestore('subjects', subjectId);
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
    saveDocToFirestore('grades', newGrade.id, newGrade);

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
    saveDocToFirestore('notifications', newNotif.id, newNotif);
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
    batchSaveToFirestore('grades', newGrades);

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
    saveDocToFirestore('notifications', newNotif.id, newNotif);
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
    deleteDocFromFirestore('grades', gradeId);
  };

  const handleAddAttendance = (record: AbsensiRecord) => {
    setAttendance([record, ...attendance]);
    saveDocToFirestore('attendance', record.id, record);

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
    saveDocToFirestore('notifications', newNotif.id, newNotif);
  };

  const handleAddStaffAttendance = (record: AbsensiPegawaiRecord) => {
    setStaffAttendance([record, ...staffAttendance]);
    saveDocToFirestore('staff_attendance', record.id, record);
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
    batchSaveToFirestore('attendance', newRecords);
  };

  const handleUpdateStaffAttendance = (updatedRecord: AbsensiPegawaiRecord) => {
    setStaffAttendance(
      staffAttendance.map((rec) => (rec.id === updatedRecord.id ? updatedRecord : rec))
    );
    saveDocToFirestore('staff_attendance', updatedRecord.id, updatedRecord);
  };

  const handleAddMateri = (newMat: MateriPelajaran) => {
    setMateri([newMat, ...materi]);
    saveDocToFirestore('materi', newMat.id, newMat);
  };

  const handleDeleteMateri = (materiId: string) => {
    setMateri(materi.filter((m) => m.id !== materiId));
    deleteDocFromFirestore('materi', materiId);
  };

  const handleAddTugas = (newTgs: TugasPelajaran) => {
    setTugas([newTgs, ...tugas]);
    saveDocToFirestore('tugas', newTgs.id, newTgs);
  };

  const handleDeleteTugas = (tugasId: string) => {
    setTugas(tugas.filter((t) => t.id !== tugasId));
    deleteDocFromFirestore('tugas', tugasId);
  };

  const handleAddPengumpulan = (newPgm: PengumpulanTugas) => {
    setPengumpulan([newPgm, ...pengumpulan]);
    saveDocToFirestore('pengumpulan', newPgm.id, newPgm);
  };

  const handleUpdatePengumpulan = (updatedPgm: PengumpulanTugas) => {
    setPengumpulan(pengumpulan.map((p) => (p.id === updatedPgm.id ? updatedPgm : p)));
    saveDocToFirestore('pengumpulan', updatedPgm.id, updatedPgm);
  };

  const handleDeletePengumpulan = (pgmId: string) => {
    setPengumpulan(pengumpulan.filter((p) => p.id !== pgmId));
    deleteDocFromFirestore('pengumpulan', pgmId);
  };

  const handleAddForum = (newFrm: ForumDiskusi) => {
    setForum([newFrm, ...forum]);
    saveDocToFirestore('forum', newFrm.id, newFrm);
  };

  const handleAddComment = (forumId: string, newComment: KomentarForum) => {
    const updated = forum.map((f) => {
      if (f.id === forumId) {
        const uF = {
          ...f,
          komentarList: [...f.komentarList, newComment],
        };
        saveDocToFirestore('forum', uF.id, uF);
        return uF;
      }
      return f;
    });
    setForum(updated);
  };

  const handleBorrowBook = (bukuId: string) => {
    const updatedBooks = books.map((b) => {
      if (b.id === bukuId && b.stokTersedia > 0) {
        const uB = { ...b, stokTersedia: b.stokTersedia - 1 };
        saveDocToFirestore('books', uB.id, uB);
        return uB;
      }
      return b;
    });
    setBooks(updatedBooks);
  };

  const handleAddBook = (newBook: BukuDigital) => {
    setBooks([newBook, ...books]);
    saveDocToFirestore('books', newBook.id, newBook);
  };

  const handleUpdateBook = (updatedBook: BukuDigital) => {
    setBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
    saveDocToFirestore('books', updatedBook.id, updatedBook);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter((b) => b.id !== bookId));
    deleteDocFromFirestore('books', bookId);
  };

  const handleUpdateSchoolSettings = (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    saveDocToFirestore('school_settings', 'main_config', newSettings);
  };

  const handleTriggerManualBackup = () => {
    const newBackup: DatabaseBackupLog = {
      id: `bkp-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      ukuranFile: '14.9 MB',
      tipe: 'Manual Admin',
      status: 'Berhasil',
      databaseName: 'cloud_firestore_siakad',
      fileName: `siakad_cloud_backup_${Date.now()}.json`,
    };
    setBackups([newBackup, ...backups]);
    saveDocToFirestore('backups', newBackup.id, newBackup);
  };

  const handleRestoreData = (data: any) => {
    if (data.users) setUsers(data.users);
    if (data.classes) setClasses(data.classes);
    if (data.jurusan) setJurusanList(data.jurusan);
    if (data.subjects) setSubjects(data.subjects);
    if (data.grades) setGrades(data.grades);
    if (data.attendance) setAttendance(data.attendance);
    if (data.staffAttendance) setStaffAttendance(data.staffAttendance);
    if (data.books) setBooks(data.books);
    if (data.peminjaman) setPeminjaman(data.peminjaman);
    if (data.materi) setMateri(data.materi);
    if (data.tugas) setTugas(data.tugas);
    if (data.pengumpulan) setPengumpulan(data.pengumpulan);
    if (data.forum) setForum(data.forum);
    if (data.notifications) setNotifications(data.notifications);
    if (data.backups) setBackups(data.backups);
    if (data.schoolSettings) setSchoolSettings(data.schoolSettings);

    // Sync whole restored dataset to cloud
    forceFullCloudSync({
      users: data.users || users,
      classes: data.classes || classes,
      jurusan: data.jurusan || jurusanList,
      subjects: data.subjects || subjects,
      grades: data.grades || grades,
      attendance: data.attendance || attendance,
      staffAttendance: data.staffAttendance || staffAttendance,
      books: data.books || books,
      peminjaman: data.peminjaman || peminjaman,
      materi: data.materi || materi,
      tugas: data.tugas || tugas,
      pengumpulan: data.pengumpulan || pengumpulan,
      forum: data.forum || forum,
      notifications: data.notifications || notifications,
      backups: data.backups || backups,
      schoolSettings: data.schoolSettings || schoolSettings,
    });
  };

  const handleTriggerCloudSync = async () => {
    try {
      await forceFullCloudSync({
        users,
        classes,
        jurusan: jurusanList,
        subjects,
        grades,
        attendance,
        staffAttendance,
        books,
        peminjaman,
        materi,
        tugas,
        pengumpulan,
        forum,
        notifications,
        backups,
        schoolSettings,
      });
      alert('Sinkronisasi Berhasil!\nSemua data sekolah telah disinkronkan secara online ke Google Cloud Firestore.');
    } catch (e: any) {
      alert('Gagal menyinkronkan data ke Cloud: ' + (e.message || String(e)));
    }
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
          syncStatus={syncStatus}
          onTriggerCloudSync={handleTriggerCloudSync}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={currentUser.role}
            isWaliKelas={isCurrentUserWaliKelas}
            schoolSettings={schoolSettings}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
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
              subjects={subjects}
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

          {activeTab === 'kartu-absensi' && (currentUser.role === 'admin' || currentUser.role === 'guru') && (
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

          {activeTab === 'mapel' && (currentUser.role === 'admin' || currentUser.role === 'guru') && (
            <ManajemenMapel
              subjects={subjects}
              teachers={users.filter((u) => u.role === 'guru')}
              classes={classes}
              jurusanList={jurusanList}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'nilai' && (
            <InputNilai
              currentUser={currentUser}
              grades={grades}
              subjects={subjects}
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
              subjects={subjects}
              schoolSettings={schoolSettings}
              classes={classes}
              allUsers={users}
              onUpdateUser={handleUpdateUser}
              onUpdateSchoolSettings={handleUpdateSchoolSettings}
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
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
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

          {activeTab === 'users' && currentUser.role === 'admin' && (
            <UserManagement
              users={users}
              classes={classes}
              jurusanList={jurusanList}
              subjects={subjects}
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
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
              onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
            />
          )}

          {activeTab === 'kop-raport' && (
            <KopRaportSettings
              currentUser={currentUser}
              schoolSettings={schoolSettings}
              onSaveSchoolSettings={handleUpdateSchoolSettings}
            />
          )}

          {activeTab === 'backup' && (
            <DatabaseBackupConsole
              backups={backups}
              onTriggerBackup={handleTriggerManualBackup}
              syncStatus={syncStatus}
              allAppData={{
                users,
                classes,
                jurusan: jurusanList,
                subjects,
                grades,
                attendance,
                staffAttendance,
                books,
                peminjaman,
                materi,
                tugas,
                pengumpulan,
                forum,
                notifications,
                backups,
                schoolSettings,
              }}
              onRestoreData={handleRestoreData}
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
        onSaveSchoolSettings={handleUpdateSchoolSettings}
      />
      </div>
    </div>
  );
}

