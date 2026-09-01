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
  KalenderEvent,
  JadwalPelajaran,
  NotificationLog,
  DatabaseBackupLog,
  RaportData,
  SchoolSettings,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_JURUSAN,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_BOOKS,
  INITIAL_PEMINJAMAN,
  INITIAL_MATERI,
  INITIAL_TUGAS,
  INITIAL_PENGUMPULAN,
  INITIAL_FORUM,
  INITIAL_EVENTS,
  INITIAL_JADWAL,
  INITIAL_NOTIFICATIONS,
  INITIAL_BACKUPS,
  INITIAL_SCHOOL_SETTINGS,
  MOCK_RAPORT,
} from '../data/initialData';

const PREFIX = 'siakad_school_app_v1_';

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export function resetAllStoredData(): void {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(PREFIX)) {
      localStorage.removeItem(k);
    }
  });
  window.location.reload();
}

// Initializers
export function loadUsers(): User[] {
  return getStoredData('users', INITIAL_USERS);
}

export function loadGrades(): NilaiSiswa[] {
  return getStoredData('grades', INITIAL_GRADES);
}

export function loadAttendance(): AbsensiRecord[] {
  return getStoredData('attendance', INITIAL_ATTENDANCE);
}

export function loadStaffAttendance(): AbsensiPegawaiRecord[] {
  return getStoredData('staff_attendance', INITIAL_STAFF_ATTENDANCE);
}

export function loadBooks(): BukuDigital[] {
  return getStoredData('books', INITIAL_BOOKS);
}

export function loadPeminjaman(): PeminjamanBuku[] {
  return getStoredData('peminjaman', INITIAL_PEMINJAMAN);
}

export function loadMateri(): MateriPelajaran[] {
  return getStoredData('materi', INITIAL_MATERI);
}

export function loadTugas(): TugasPelajaran[] {
  return getStoredData('tugas', INITIAL_TUGAS);
}

export function loadPengumpulan(): PengumpulanTugas[] {
  return getStoredData('pengumpulan', INITIAL_PENGUMPULAN);
}

export function loadForum(): ForumDiskusi[] {
  return getStoredData('forum', INITIAL_FORUM);
}

export function loadNotifications(): NotificationLog[] {
  return getStoredData('notifications', INITIAL_NOTIFICATIONS);
}

export function loadBackups(): DatabaseBackupLog[] {
  return getStoredData('backups', INITIAL_BACKUPS);
}

export function loadSchoolSettings(): SchoolSettings {
  const loaded = getStoredData<SchoolSettings>('school_settings', INITIAL_SCHOOL_SETTINGS);
  // Auto-clean any oversized base64 image strings (> 200,000 chars) that might have been saved in past session
  if (loaded) {
    if (typeof loaded.bgImageUrl === 'string' && loaded.bgImageUrl.length > 200000) {
      loaded.bgImageUrl = INITIAL_SCHOOL_SETTINGS.bgImageUrl;
    }
    if (typeof loaded.logoUrl === 'string' && loaded.logoUrl.length > 200000) {
      loaded.logoUrl = INITIAL_SCHOOL_SETTINGS.logoUrl;
    }
    if (typeof loaded.titleLogoUrl === 'string' && loaded.titleLogoUrl.length > 200000) {
      loaded.titleLogoUrl = INITIAL_SCHOOL_SETTINGS.titleLogoUrl;
    }
    if (typeof loaded.logoKiriUrl === 'string' && loaded.logoKiriUrl.length > 200000) {
      loaded.logoKiriUrl = INITIAL_SCHOOL_SETTINGS.logoKiriUrl;
    }
    if (typeof loaded.logoKananUrl === 'string' && loaded.logoKananUrl.length > 200000) {
      loaded.logoKananUrl = INITIAL_SCHOOL_SETTINGS.logoKananUrl;
    }
  }
  return loaded;
}

export function loadClasses(): Kelas[] {
  return getStoredData('classes', INITIAL_CLASSES);
}

export function loadJurusan(): Jurusan[] {
  return getStoredData('jurusan', INITIAL_JURUSAN);
}

export function loadSubjects(): MataPelajaran[] {
  return getStoredData('subjects', INITIAL_SUBJECTS);
}
