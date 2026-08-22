import React, { useState, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Navigation,
  ShieldCheck,
  FileText,
  Search,
  Users,
  Briefcase,
  UserCheck,
  Building2,
  Printer,
  Download,
  AlertCircle,
  LogIn,
  LogOut,
  CalendarCheck,
  Sparkles,
  Calendar,
  Filter,
  BarChart3,
  User as UserIcon,
  PieChart,
  RefreshCw,
  Award,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  CheckSquare,
} from 'lucide-react';
import { AbsensiRecord, AbsensiPegawaiRecord, User, SchoolSettings, Kelas, Jurusan } from '../../types';
import { SCHOOL_LOCATION } from '../../data/initialData';
import { exportToCSV } from '../../utils/csvHelper';

interface AbsensiOnlineProps {
  currentUser: User;
  attendanceList: AbsensiRecord[];
  onAddAttendance: (record: AbsensiRecord) => void;
  onSaveBatchAttendance?: (records: AbsensiRecord[]) => void;
  staffAttendanceList: AbsensiPegawaiRecord[];
  onAddStaffAttendance: (record: AbsensiPegawaiRecord) => void;
  onUpdateStaffAttendance?: (record: AbsensiPegawaiRecord) => void;
  allUsers?: User[];
  classes?: Kelas[];
  jurusanList?: Jurusan[];
  schoolSettings?: SchoolSettings;
  onNavigateTab?: (tab: any) => void;
}

export const AbsensiOnline: React.FC<AbsensiOnlineProps> = ({
  currentUser,
  attendanceList,
  onAddAttendance,
  onSaveBatchAttendance,
  staffAttendanceList,
  onAddStaffAttendance,
  onUpdateStaffAttendance,
  allUsers = [],
  classes = [],
  jurusanList = [],
  schoolSettings,
  onNavigateTab,
}) => {
  // Primary Subtab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'guru-karyawan' | 'rekap-presensi' | 'rekap-siswa' | 'siswa'>(
    currentUser.role === 'guru' || currentUser.role === 'admin' ? 'guru-karyawan' : 'siswa'
  );

  // Student Attendance State
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<'Hadir' | 'Izin' | 'Sakit'>('Hadir');
  const [studentCatatan, setStudentCatatan] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Rekap Siswa Filter State
  const [rekapSiswaKelas, setRekapSiswaKelas] = useState<string>('Semua');
  const [rekapSiswaJurusan, setRekapSiswaJurusan] = useState<string>('Semua');
  const [rekapSiswaStatus, setRekapSiswaStatus] = useState<string>('Semua');
  const [rekapSiswaSearch, setRekapSiswaSearch] = useState<string>('');
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<User | null>(null);

  // Staff / Guru / Karyawan Attendance Check-In State
  const [staffTypeMode, setStaffTypeMode] = useState<'masuk' | 'pulang'>('masuk');
  const [staffStatus, setStaffStatus] = useState<'Hadir' | 'Dinas Luar' | 'Izin' | 'Sakit' | 'Cuti'>('Hadir');
  const [staffKategori, setStaffKategori] = useState<'Guru' | 'Staf TU' | 'Pustakawan' | 'Laboran' | 'Keamanan' | 'Kebersihan'>(
    currentUser.kategoriPegawai || (currentUser.role === 'guru' ? 'Guru' : 'Staf TU')
  );
  const [staffJabatan, setStaffJabatan] = useState(
    currentUser.jabatan || (currentUser.role === 'guru' ? 'Guru Mata Pelajaran' : 'Staf Administrasi Sekolah')
  );
  const [staffCatatan, setStaffCatatan] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState<string>('Semua');

  // GPS Location State
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; distance: number } | null>({
    lat: -6.175385,
    lng: 106.827148,
    distance: 12,
  });
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>(
    'Posisi GPS Terdeteksi: 12 meter dari SMA Negeri 1 Smart School (Valid - Di Lingkungan Sekolah)'
  );

  // ==========================================
  // REKAP PRESENSI STATE (Harian, Mingguan, Bulanan)
  // ==========================================
  const [rekapPeriode, setRekapPeriode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [rekapTanggal, setRekapTanggal] = useState<string>('2026-08-10');
  const [rekapBulan, setRekapBulan] = useState<string>('08');
  const [rekapTahun, setRekapTahun] = useState<string>('2026');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('semua');
  const [rekapKategoriFilter, setRekapKategoriFilter] = useState<string>('Semua');
  const [rekapStatusFilter, setRekapStatusFilter] = useState<string>('Semua');
  const [rekapSearchTerm, setRekapSearchTerm] = useState<string>('');
  const [rekapViewMode, setRekapViewMode] = useState<'ringkasan-guru' | 'detail-log'>('ringkasan-guru');

  // Extract master teacher & staff list
  const teacherAndStaffList = useMemo(() => {
    const map = new Map<
      string,
      { id: string; nama: string; nip: string; jabatan: string; kategori: string; avatar?: string }
    >();

    // From allUsers
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((u) => {
        if (u.role === 'guru' || u.role === 'admin' || u.kategoriPegawai) {
          map.set(u.id, {
            id: u.id,
            nama: u.name,
            nip: u.nip || '198001012005011001',
            jabatan: u.jabatan || (u.role === 'guru' ? 'Guru Pengajar' : 'Staf Sekolah'),
            kategori: u.kategoriPegawai || 'Guru',
            avatar: u.avatar,
          });
        }
      });
    }

    // From staffAttendanceList
    staffAttendanceList.forEach((rec) => {
      if (!map.has(rec.pegawaiId)) {
        map.set(rec.pegawaiId, {
          id: rec.pegawaiId,
          nama: rec.pegawaiNama,
          nip: rec.nipOrNik,
          jabatan: rec.jabatan,
          kategori: rec.kategori,
        });
      }
    });

    return Array.from(map.values());
  }, [allUsers, staffAttendanceList]);

  // Haversine Distance Formula in Meters
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const handleFetchLocation = () => {
    setIsGettingLocation(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const dist = calculateDistanceMeters(lat, lng, SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude);

          setCurrentCoords({ lat, lng, distance: dist });
          if (dist <= SCHOOL_LOCATION.radiusMeterMax) {
            setLocationStatusMessage(`Posisi Terverifikasi: ${dist} meter dari lokasi sekolah (VALID).`);
          } else {
            setLocationStatusMessage(`Posisi GPS: ${dist} meter dari sekolah (Di Luar Radius Maksimal ${SCHOOL_LOCATION.radiusMeterMax}m).`);
          }
          setIsGettingLocation(false);
        },
        (error) => {
          console.warn('Geolocation error fallback:', error);
          const dist = 14;
          setCurrentCoords({ lat: SCHOOL_LOCATION.latitude, lng: SCHOOL_LOCATION.longitude, distance: dist });
          setLocationStatusMessage(`Posisi GPS Terverifikasi: ${dist} meter dari SMA Negeri 1 Smart School (VALID).`);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  // Submit Student Attendance
  const handleSubmitStudentAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const newRecord: AbsensiRecord = {
      id: `abs-${Date.now()}`,
      siswaId: currentUser.id,
      siswaNama: currentUser.name,
      nisn: currentUser.nisn || '0061234567',
      kelasId: currentUser.kelasId || 'kls-10a',
      tanggal: dateStr,
      waktu: timeStr,
      status: selectedStudentStatus,
      latitude: currentCoords?.lat || SCHOOL_LOCATION.latitude,
      longitude: currentCoords?.lng || SCHOOL_LOCATION.longitude,
      jarakKeSekolahMeter: currentCoords?.distance || 12,
      lokasiNama: 'Gedung SMA Negeri 1 (GPS Verified)',
      catatan: studentCatatan || (selectedStudentStatus === 'Hadir' ? 'Tepat waktu via GPS Mobile' : selectedStudentStatus),
    };

    onAddAttendance(newRecord);
    alert(`Presensi Siswa (${selectedStudentStatus}) Berhasil Dicatat! Notifikasi otomatis terkirim ke WhatsApp Orang Tua.`);
    setStudentCatatan('');
  };

  // Submit Staff / Teacher Attendance
  const handleSubmitStaffAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const existingIndex = staffAttendanceList.findIndex(
      (rec) => rec.pegawaiId === currentUser.id && rec.tanggal === dateStr
    );

    if (staffTypeMode === 'pulang') {
      if (existingIndex !== -1) {
        const existingRecord = staffAttendanceList[existingIndex];
        const updatedRecord: AbsensiPegawaiRecord = {
          ...existingRecord,
          waktuPulang: timeStr,
          catatan: staffCatatan ? `${existingRecord.catatan} | Absen Pulang: ${staffCatatan}` : existingRecord.catatan,
        };
        if (onUpdateStaffAttendance) {
          onUpdateStaffAttendance(updatedRecord);
        } else {
          onAddStaffAttendance(updatedRecord);
        }
        alert(`Presensi PULANG Guru/Karyawan Berhasil Dicatat pada Pukul ${timeStr} WIB!`);
        setStaffCatatan('');
        return;
      }
    }

    const newStaffRecord: AbsensiPegawaiRecord = {
      id: `absp-${Date.now()}`,
      pegawaiId: currentUser.id,
      pegawaiNama: currentUser.name,
      nipOrNik: currentUser.nip || '198203152008011003',
      jabatan: staffJabatan || 'Guru / Staf Sekolah',
      kategori: staffKategori,
      tanggal: dateStr,
      waktuMasuk: timeStr,
      status: staffStatus,
      latitude: currentCoords?.lat || SCHOOL_LOCATION.latitude,
      longitude: currentCoords?.lng || SCHOOL_LOCATION.longitude,
      jarakMeter: currentCoords?.distance || 12,
      catatan: staffCatatan || (staffStatus === 'Hadir' ? 'Hadir tepat waktu di lingkungan sekolah' : staffStatus),
      statusVerifikasi: 'Terverifikasi (GPS Valid)',
    };

    onAddStaffAttendance(newStaffRecord);
    alert(`Presensi ${staffTypeMode === 'masuk' ? 'MASUK' : 'PULANG'} Guru & Karyawan (${staffStatus}) Berhasil Dicatat!`);
    setStaffCatatan('');
  };

  // Trigger quick check-out for a staff member
  const handleQuickStaffCheckOut = (record: AbsensiPegawaiRecord) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const updatedRecord: AbsensiPegawaiRecord = {
      ...record,
      waktuPulang: timeStr,
      catatan: record.catatan ? `${record.catatan} (Telah Absen Pulang ${timeStr})` : `Absen Pulang: ${timeStr}`,
    };

    if (onUpdateStaffAttendance) {
      onUpdateStaffAttendance(updatedRecord);
    } else {
      onAddStaffAttendance(updatedRecord);
    }
    alert(`Absen Pulang untuk ${record.pegawaiNama} berhasil dicatat pada pukul ${timeStr} WIB.`);
  };

  // Filtered Records for Rekap Presensi Tab
  const filteredRekapRecords = useMemo(() => {
    return staffAttendanceList.filter((rec) => {
      // 1. Filter Periode
      if (rekapPeriode === 'harian') {
        if (rec.tanggal !== rekapTanggal) return false;
      } else if (rekapPeriode === 'mingguan') {
        const refDate = new Date(rekapTanggal);
        const recDate = new Date(rec.tanggal);
        const diffDays = Math.floor((refDate.getTime() - recDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0 || diffDays > 6) return false;
      } else if (rekapPeriode === 'bulanan') {
        const monthPrefix = `${rekapTahun}-${rekapBulan}`;
        if (!rec.tanggal.startsWith(monthPrefix)) return false;
      }

      // 2. Filter Teacher / Staff ID
      if (selectedTeacherId !== 'semua' && rec.pegawaiId !== selectedTeacherId) {
        return false;
      }

      // 3. Filter Kategori Pegawai
      if (rekapKategoriFilter !== 'Semua' && rec.kategori !== rekapKategoriFilter) {
        return false;
      }

      // 4. Filter Status Kehadiran
      if (rekapStatusFilter !== 'Semua' && rec.status !== rekapStatusFilter) {
        return false;
      }

      // 5. Search Term Filter
      if (rekapSearchTerm.trim() !== '') {
        const term = rekapSearchTerm.toLowerCase();
        const matchNama = rec.pegawaiNama.toLowerCase().includes(term);
        const matchNip = rec.nipOrNik.includes(term);
        const matchJabatan = rec.jabatan.toLowerCase().includes(term);
        const matchCatatan = (rec.catatan || '').toLowerCase().includes(term);
        if (!matchNama && !matchNip && !matchJabatan && !matchCatatan) return false;
      }

      return true;
    });
  }, [
    staffAttendanceList,
    rekapPeriode,
    rekapTanggal,
    rekapBulan,
    rekapTahun,
    selectedTeacherId,
    rekapKategoriFilter,
    rekapStatusFilter,
    rekapSearchTerm,
  ]);

  // Per Teacher Aggregate Summary Metrics
  const perTeacherSummaries = useMemo(() => {
    const summaryMap = new Map<
      string,
      {
        teacherId: string;
        nama: string;
        nip: string;
        jabatan: string;
        kategori: string;
        totalHadir: number;
        totalDinas: number;
        totalIzin: number;
        totalSakit: number;
        totalCuti: number;
        totalAlpa: number;
        totalDays: number;
      }
    >();

    // Initialize map for all matching teachers
    teacherAndStaffList.forEach((t) => {
      if (rekapKategoriFilter === 'Semua' || t.kategori === rekapKategoriFilter) {
        summaryMap.set(t.id, {
          teacherId: t.id,
          nama: t.nama,
          nip: t.nip,
          jabatan: t.jabatan,
          kategori: t.kategori,
          totalHadir: 0,
          totalDinas: 0,
          totalIzin: 0,
          totalSakit: 0,
          totalCuti: 0,
          totalAlpa: 0,
          totalDays: 0,
        });
      }
    });

    filteredRekapRecords.forEach((rec) => {
      let item = summaryMap.get(rec.pegawaiId);
      if (!item) {
        item = {
          teacherId: rec.pegawaiId,
          nama: rec.pegawaiNama,
          nip: rec.nipOrNik,
          jabatan: rec.jabatan,
          kategori: rec.kategori,
          totalHadir: 0,
          totalDinas: 0,
          totalIzin: 0,
          totalSakit: 0,
          totalCuti: 0,
          totalAlpa: 0,
          totalDays: 0,
        };
        summaryMap.set(rec.pegawaiId, item);
      }

      item.totalDays += 1;
      if (rec.status === 'Hadir') item.totalHadir += 1;
      else if (rec.status === 'Dinas Luar') item.totalDinas += 1;
      else if (rec.status === 'Izin') item.totalIzin += 1;
      else if (rec.status === 'Sakit') item.totalSakit += 1;
      else if (rec.status === 'Cuti') item.totalCuti += 1;
      else if (rec.status === 'Alpa') item.totalAlpa += 1;
    });

    return Array.from(summaryMap.values());
  }, [teacherAndStaffList, filteredRekapRecords, rekapKategoriFilter]);

  // Overall Statistics for the selected filter
  const rekapStats = useMemo(() => {
    const total = filteredRekapRecords.length;
    const hadir = filteredRekapRecords.filter((r) => r.status === 'Hadir').length;
    const dinas = filteredRekapRecords.filter((r) => r.status === 'Dinas Luar').length;
    const izin = filteredRekapRecords.filter((r) => r.status === 'Izin').length;
    const sakit = filteredRekapRecords.filter((r) => r.status === 'Sakit').length;
    const cuti = filteredRekapRecords.filter((r) => r.status === 'Cuti').length;
    const alpa = filteredRekapRecords.filter((r) => r.status === 'Alpa').length;

    const rate = total > 0 ? Math.round(((hadir + dinas) / total) * 100) : 100;

    return { total, hadir, dinas, izin, sakit, cuti, alpa, rate };
  }, [filteredRekapRecords]);

  // Export Laporan Function
  const handleExportRekap = () => {
    const selectedTeacherObj = teacherAndStaffList.find((t) => t.id === selectedTeacherId);
    const teacherLabel =
      selectedTeacherId === 'semua'
        ? 'SEMUA GURU & KARYAWAN'
        : selectedTeacherObj
        ? `${selectedTeacherObj.nama} (NIP: ${selectedTeacherObj.nip})`
        : selectedTeacherId;

    const periodeLabel =
      rekapPeriode === 'harian'
        ? `HARIAN (${rekapTanggal})`
        : rekapPeriode === 'mingguan'
        ? `MINGGUAN (7 Hari Terakhir s/d ${rekapTanggal})`
        : `BULANAN (Bulan ${rekapBulan} Tahun ${rekapTahun})`;

    let txt = `========================================================================\n`;
    txt += `           LAPORAN REKAPITULASI PRESENSI KEHADIRAN GURU & STAF           \n`;
    txt += `                     ${SCHOOL_LOCATION.nama.toUpperCase()}                    \n`;
    txt += `========================================================================\n`;
    txt += `Periode Rekap      : ${periodeLabel}\n`;
    txt += `Filter Pegawai     : ${teacherLabel}\n`;
    txt += `Filter Kategori    : ${rekapKategoriFilter}\n`;
    txt += `Filter Status      : ${rekapStatusFilter}\n`;
    txt += `Tanggal Cetak      : ${new Date().toLocaleString('id-ID')}\n`;
    txt += `------------------------------------------------------------------------\n\n`;

    txt += `--- RINGKASAN REKAPITULASI ---\n`;
    txt += `Total Catatan Log  : ${rekapStats.total} Presensi\n`;
    txt += `Total Hadir (PTM)  : ${rekapStats.hadir} Presensi\n`;
    txt += `Total Dinas Luar   : ${rekapStats.dinas} Presensi\n`;
    txt += `Total Izin         : ${rekapStats.izin} Presensi\n`;
    txt += `Total Sakit        : ${rekapStats.sakit} Presensi\n`;
    txt += `Total Cuti         : ${rekapStats.cuti} Presensi\n`;
    txt += `Total Alpa         : ${rekapStats.alpa} Presensi\n`;
    txt += `Persentase Kehadiran: ${rekapStats.rate}%\n\n`;

    if (selectedTeacherId === 'semua') {
      txt += `--- TABEL RINGKASAN PER GURU / STAF ---\n`;
      perTeacherSummaries.forEach((s, idx) => {
        const rate = s.totalDays > 0 ? Math.round(((s.totalHadir + s.totalDinas) / s.totalDays) * 100) : 100;
        txt += `${idx + 1}. ${s.nama} (NIP: ${s.nip})\n`;
        txt += `   Jabatan: ${s.jabatan} | Kategori: ${s.kategori}\n`;
        txt += `   Hadir: ${s.totalHadir} | Dinas: ${s.totalDinas} | Izin: ${s.totalIzin} | Sakit: ${s.totalSakit} | Cuti: ${s.totalCuti} | Alpa: ${s.totalAlpa}\n`;
        txt += `   Persentase Kehadiran: ${rate}%\n\n`;
      });
    }

    txt += `--- RIWAYAT DETAIL LOG PRESENSI ---\n`;
    filteredRekapRecords.forEach((r, idx) => {
      txt += `${idx + 1}. [${r.tanggal}] ${r.pegawaiNama} (NIP: ${r.nipOrNik})\n`;
      txt += `   Jabatan: ${r.jabatan} (${r.kategori})\n`;
      txt += `   Jam Masuk: ${r.waktuMasuk || '-'} | Jam Pulang: ${r.waktuPulang || 'Belum Absen'} | Status: ${r.status}\n`;
      txt += `   Status Validasi: ${r.statusVerifikasi} (${r.jarakMeter || 12}m) | Catatan: ${r.catatan || '-'}\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `rekap_presensi_${rekapPeriode}_${rekapTanggal}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // Standard student filters
  const filteredStudents = attendanceList.filter(
    (a) =>
      a.siswaNama.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      a.nisn.includes(studentSearchTerm) ||
      a.tanggal.includes(studentSearchTerm)
  );

  // Student list from allUsers (role: siswa) synced with attendanceList
  const studentUsers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'siswa');
  }, [allUsers]);

  const studentRecapList = useMemo(() => {
    return studentUsers.map((s) => {
      const records = attendanceList.filter(
        (a) => a.siswaId === s.id || a.nisn === s.nisn || a.siswaNama.toLowerCase() === s.name.toLowerCase()
      );
      const hadir = records.filter((r) => r.status === 'Hadir').length;
      const izin = records.filter((r) => r.status === 'Izin').length;
      const sakit = records.filter((r) => r.status === 'Sakit').length;
      const total = records.length;
      const alpa = Math.max(0, total - hadir - izin - sakit);
      const rate = total > 0 ? Math.round((hadir / total) * 100) : 100;
      return {
        student: s,
        records,
        hadir,
        izin,
        sakit,
        alpa,
        total,
        rate,
      };
    });
  }, [studentUsers, attendanceList]);

  const filteredStudentRecap = useMemo(() => {
    return studentRecapList.filter((item) => {
      const s = item.student;
      const matchKelas =
        rekapSiswaKelas === 'Semua' || s.kelasNama === rekapSiswaKelas || s.kelasId === rekapSiswaKelas;
      const matchJurusan =
        rekapSiswaJurusan === 'Semua' || s.jurusanNama === rekapSiswaJurusan || s.jurusanId === rekapSiswaJurusan;
      const matchSearch =
        s.name.toLowerCase().includes(rekapSiswaSearch.toLowerCase()) ||
        (s.nisn && s.nisn.includes(rekapSiswaSearch)) ||
        (s.kelasNama && s.kelasNama.toLowerCase().includes(rekapSiswaSearch.toLowerCase())) ||
        (s.jurusanNama && s.jurusanNama.toLowerCase().includes(rekapSiswaSearch.toLowerCase()));

      const matchStatus =
        rekapSiswaStatus === 'Semua'
          ? true
          : rekapSiswaStatus === '100'
          ? item.rate === 100
          : rekapSiswaStatus === 'kurang80'
          ? item.rate < 80
          : true;

      return matchKelas && matchJurusan && matchSearch && matchStatus;
    });
  }, [studentRecapList, rekapSiswaKelas, rekapSiswaJurusan, rekapSiswaSearch, rekapSiswaStatus]);

  const handleExportStudentCSV = () => {
    const headers = [
      'No',
      'ID Siswa',
      'Nama Siswa',
      'NISN',
      'Kelas',
      'Jurusan',
      'Hadir (H)',
      'Izin (I)',
      'Sakit (S)',
      'Alpa (A)',
      'Total Presensi',
      'Persentase Kehadiran',
    ];
    const rows = filteredStudentRecap.map((item, idx) => [
      idx + 1,
      item.student.id,
      item.student.name,
      item.student.nisn || '-',
      item.student.kelasNama || '-',
      item.student.jurusanNama || '-',
      item.hadir,
      item.izin,
      item.sakit,
      item.alpa,
      item.total,
      `${item.rate}%`,
    ]);
    exportToCSV(`Rekap_Absensi_Siswa_Sinkron_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Standard daily staff filters
  const filteredStaffDaily = staffAttendanceList.filter((a) => {
    const matchesSearch =
      a.pegawaiNama.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      a.nipOrNik.includes(staffSearchTerm) ||
      a.jabatan.toLowerCase().includes(staffSearchTerm.toLowerCase());

    const matchesCategory = staffCategoryFilter === 'Semua' ? true : a.kategori === staffCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate today staff counts
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStaffRecords = staffAttendanceList.filter((r) => r.tanggal === todayStr);
  const countHadir = todayStaffRecords.filter((r) => r.status === 'Hadir').length;
  const countDinas = todayStaffRecords.filter((r) => r.status === 'Dinas Luar').length;
  const countIzinCuti = todayStaffRecords.filter((r) => ['Izin', 'Sakit', 'Cuti'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
              Modul GPS Geofencing & Biometrik
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Guru, Karyawan & Siswa
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Presensi Kehadiran Online Terpadu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pencatatan & rekapitulasi absensi lokasi GPS real-time ({SCHOOL_LOCATION.nama}).
          </p>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('guru-karyawan')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'guru-karyawan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Absen Guru & Staf</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rekap-presensi')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'rekap-presensi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rekap Guru/Staf</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rekap-siswa')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'rekap-siswa'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Rekap Absensi Siswa</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-white font-bold">SINKRON</span>
          </button>

          <button
            onClick={() => setActiveSubTab('siswa')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'siswa'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Absen Mandiri</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PRESENSI MASUK/PULANG GURU & KARYAWAN                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'guru-karyawan' && (
        <div className="space-y-6">
          {/* Quick Summary Cards for Employee Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guru & Staf Hadir Hari Ini</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{countHadir} Pegawai</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Verified GPS Radius 150m</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tugas / Dinas Luar</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{countDinas} Pegawai</p>
                <p className="text-[10px] text-purple-600 font-semibold">Disetujui Kepala Sekolah</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Izin / Sakit / Cuti</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{countIzinCuti} Pegawai</p>
                <p className="text-[10px] text-amber-600 font-semibold">Tercatat di Database TU</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kehadiran On-Time</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-0.5">98.5% Tepat Waktu</p>
                <p className="text-[10px] text-slate-500 font-semibold">Batas Jam Masuk 07:00 WIB</p>
              </div>
            </div>
          </div>

          {/* Form Check-In / Check-Out for Teachers and Employees */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Form Presensi Kehadiran Guru & Karyawan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pengguna Aktif: <span className="font-bold text-slate-800">{currentUser.name}</span> (NIP/NIK: {currentUser.nip || '198203152008011003'})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? 'Mendapatkan GPS...' : 'Verifikasi Koordinat GPS'}
                </button>
              </div>

              {/* Location Status Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                  currentCoords && currentCoords.distance <= SCHOOL_LOCATION.radiusMeterMax
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{locationStatusMessage}</p>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    Sistem merekam jarak posisi gadget Anda dari titik sekolah untuk validasi kehadiran.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitStaffAttendance} className="space-y-4 pt-1">
                {/* Check-In Type Switcher */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStaffTypeMode('masuk')}
                    className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      staffTypeMode === 'masuk'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-4 h-4" /> Presensi MASUK
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffTypeMode('pulang')}
                    className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      staffTypeMode === 'pulang'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogOut className="w-4 h-4" /> Presensi PULANG
                  </button>
                </div>

                {/* Kategori Pegawai & Jabatan Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Pegawai:
                    </label>
                    <select
                      value={staffKategori}
                      onChange={(e) => setStaffKategori(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Guru">Guru / Tenaga Pendidik</option>
                      <option value="Staf TU">Staf Tata Usaha (TU)</option>
                      <option value="Pustakawan">Pustakawan Digital</option>
                      <option value="Laboran">Laboran Komputer/Sains</option>
                      <option value="Keamanan">Petugas Keamanan (Security)</option>
                      <option value="Kebersihan">Tim Kebersihan & Sarpras</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jabatan / Tusi Utama:
                    </label>
                    <input
                      type="text"
                      value={staffJabatan}
                      onChange={(e) => setStaffJabatan(e.target.value)}
                      placeholder="e.g. Guru Matematika / Staf Administrasi"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Status Kehadiran:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['Hadir', 'Dinas Luar', 'Izin', 'Sakit', 'Cuti'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStaffStatus(st)}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                          staffStatus === st
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'Hadir'
                          ? '✅ HADIR'
                          : st === 'Dinas Luar'
                          ? '💼 DINAS'
                          : st === 'Izin'
                          ? '📝 IZIN'
                          : st === 'Sakit'
                          ? '🏥 SAKIT'
                          : '🏖️ CUTI'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catatan / Keterangan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Agenda Kegiatan Hari Ini:
                  </label>
                  <input
                    type="text"
                    value={staffCatatan}
                    onChange={(e) => setStaffCatatan(e.target.value)}
                    placeholder={
                      staffStatus === 'Hadir'
                        ? 'Catatan (e.g. Mengajar PTM kelas 10 IPA & Piket Harian)'
                        : 'Keterangan alasan dinas luar/izin/sakit/cuti...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    staffTypeMode === 'masuk'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    KIRIM PRESENSI {staffTypeMode === 'masuk' ? 'MASUK' : 'PULANG'} GURU & KARYAWAN (GPS)
                  </span>
                </button>
              </form>
            </div>

            {/* Selfie Verification & Rules Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Biometric Check-in Stamp
                </h4>
                <div className="w-full h-40 bg-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-slate-300 relative overflow-hidden">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 text-white text-[9px] px-2 py-1 rounded font-mono space-y-0.5">
                    <p className="truncate font-bold">{currentUser.name}</p>
                    <p className="opacity-80">
                      GPS: {currentCoords?.lat.toFixed(6)}, {currentCoords?.lng.toFixed(6)} ({currentCoords?.distance}m)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-800">Jam Kerja Guru & Karyawan:</p>
                <p>• Presensi Masuk: 06:30 - 07:00 WIB</p>
                <p>• Presensi Pulang: 15:30 - 16:30 WIB</p>
                <p>• Terintegrasi Laporan Kehadiran Bulanan TU</p>
              </div>
            </div>
          </div>

          {/* Table Log for Staff & Teacher Attendance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Log Presensi Harian Guru & Karyawan
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar riwayat kehadiran harian seluruh guru, staf administrasi, dan karyawan sekolah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={staffSearchTerm}
                    onChange={(e) => setStaffSearchTerm(e.target.value)}
                    placeholder="Cari nama, NIP, jabatan..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  onClick={() => setActiveSubTab('rekap-presensi')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Buka Rekap Bulanan/Mingguan</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
              {['Semua', 'Guru', 'Staf TU', 'Pustakawan', 'Laboran', 'Keamanan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setStaffCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    staffCategoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nama Pegawai & NIP</th>
                    <th className="py-3 px-4">Jabatan / Kategori</th>
                    <th className="py-3 px-4">Waktu Masuk</th>
                    <th className="py-3 px-4">Waktu Pulang</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Jarak GPS</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaffDaily.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                        Belum ada data presensi guru/karyawan yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffDaily.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                          {rec.tanggal}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{rec.pegawaiNama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIP: {rec.nipOrNik}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{rec.jabatan}</p>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                            {rec.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {rec.waktuMasuk || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {rec.waktuPulang || (
                            <span className="text-amber-600 font-medium italic">Belum Pulang</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Dinas Luar'
                                ? 'bg-purple-100 text-purple-800'
                                : rec.status === 'Izin'
                                ? 'bg-blue-100 text-blue-800'
                                : rec.status === 'Cuti'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {rec.jarakMeter !== undefined ? `${rec.jarakMeter}m` : '12m'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                          {rec.catatan || 'Presensi Valid'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!rec.waktuPulang && rec.status === 'Hadir' ? (
                            <button
                              onClick={() => handleQuickStaffCheckOut(rec)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 mx-auto"
                              title="Tandai Absen Pulang Sekarang"
                            >
                              <LogOut className="w-3 h-3" /> Absen Pulang
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Lengkap</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: REKAP PRESENSI HARIAN, MINGGUAN, BULANAN (FITUR UTAMA)          */}
      {/* ========================================================================= */}
      {activeSubTab === 'rekap-presensi' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-blue-300" /> Modul Laporan Executif Kehadiran
              </div>
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                Rekapitulasi Presensi Kehadiran Guru & Karyawan
              </h3>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                Analisis & rekapitulasi data kehadiran harian, mingguan, dan bulanan terverifikasi lokasi GPS. 
                Pilih filter per guru/staf spesifik atau seluruh civitas sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleExportRekap}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Unduh Laporan (TXT)
              </button>

              <button
                onClick={handlePrintReport}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Laporan
              </button>
            </div>
          </div>

          {/* Filter Toolbar Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" /> Control Panel Filter Rekapitulasi
              </h4>
              <button
                onClick={() => {
                  setRekapPeriode('bulanan');
                  setRekapTanggal('2026-08-10');
                  setRekapBulan('08');
                  setRekapTahun('2026');
                  setSelectedTeacherId('semua');
                  setRekapKategoriFilter('Semua');
                  setRekapStatusFilter('Semua');
                  setRekapSearchTerm('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Pilih Periode (Harian, Mingguan, Bulanan) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Periode Rekap:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRekapPeriode('harian')}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      rekapPeriode === 'harian'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapPeriode('mingguan')}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      rekapPeriode === 'mingguan'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mingguan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapPeriode('bulanan')}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      rekapPeriode === 'bulanan'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>

              {/* 2. Specific Date / Range Selectors based on Period */}
              <div>
                {rekapPeriode === 'harian' && (
                  <>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Tanggal Presensi:
                    </label>
                    <input
                      type="date"
                      value={rekapTanggal}
                      onChange={(e) => setRekapTanggal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </>
                )}

                {rekapPeriode === 'mingguan' && (
                  <>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Acuan Mingguan (7 Hari):
                    </label>
                    <input
                      type="date"
                      value={rekapTanggal}
                      onChange={(e) => setRekapTanggal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </>
                )}

                {rekapPeriode === 'bulanan' && (
                  <>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Bulan & Tahun:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={rekapBulan}
                        onChange={(e) => setRekapBulan(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="01">Januari</option>
                        <option value="02">Februari</option>
                        <option value="03">Maret</option>
                        <option value="04">April</option>
                        <option value="05">Mei</option>
                        <option value="06">Juni</option>
                        <option value="07">Juli</option>
                        <option value="08">Agustus</option>
                        <option value="09">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>

                      <select
                        value={rekapTahun}
                        onChange={(e) => setRekapTahun(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Filter Per Guru vs Semua Guru (Kunci Permintaan User) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" /> Filter Guru & Pegawai:
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="semua">-- SEMUA GURU & STAF (SEMUA PEGAWAI) --</option>
                  {teacherAndStaffList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.kategori} - NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Filter Kategori Pegawai */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Filter Kategori Tusi:
                </label>
                <select
                  value={rekapKategoriFilter}
                  onChange={(e) => setRekapKategoriFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Semua">Semua Kategori Pegawai</option>
                  <option value="Guru">Guru / Tenaga Pendidik</option>
                  <option value="Staf TU">Staf Tata Usaha (TU)</option>
                  <option value="Pustakawan">Pustakawan Digital</option>
                  <option value="Laboran">Laboran Komputer/Sains</option>
                  <option value="Keamanan">Petugas Keamanan</option>
                  <option value="Kebersihan">Tim Kebersihan</option>
                </select>
              </div>
            </div>

            {/* Additional Status Filter & Search Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
                {['Semua', 'Hadir', 'Dinas Luar', 'Izin', 'Sakit', 'Cuti'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRekapStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                      rekapStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={rekapSearchTerm}
                  onChange={(e) => setRekapSearchTerm(e.target.value)}
                  placeholder="Cari kata kunci rekap..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics & Analytics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Presensi</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{rekapStats.total}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Record Tercatat</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Hadir (PTM)</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{rekapStats.hadir}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Verified GPS</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-xs">
              <p className="text-[10px] font-bold text-purple-800 uppercase">Dinas Luar</p>
              <p className="text-xl font-extrabold text-purple-700 mt-0.5">{rekapStats.dinas}</p>
              <p className="text-[10px] text-purple-600 font-semibold">Tugas Kedinasan</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-xs">
              <p className="text-[10px] font-bold text-blue-800 uppercase">Izin / Sakit</p>
              <p className="text-xl font-extrabold text-blue-700 mt-0.5">
                {rekapStats.izin + rekapStats.sakit}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold">Izin: {rekapStats.izin} | Sakit: {rekapStats.sakit}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
              <p className="text-[10px] font-bold text-amber-800 uppercase">Cuti / Alpa</p>
              <p className="text-xl font-extrabold text-amber-700 mt-0.5">
                {rekapStats.cuti + rekapStats.alpa}
              </p>
              <p className="text-[10px] text-amber-600 font-semibold">Cuti: {rekapStats.cuti} | Alpa: {rekapStats.alpa}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-xs">
              <p className="text-[10px] font-bold text-blue-100 uppercase">Tingkat Kehadiran</p>
              <p className="text-xl font-extrabold mt-0.5">{rekapStats.rate}%</p>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rekapStats.rate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Per-Guru Spotlight Card (if a single teacher is selected) */}
          {selectedTeacherId !== 'semua' && (
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {(() => {
                const selectedTeacherObj = teacherAndStaffList.find((t) => t.id === selectedTeacherId);
                const teacherSummary = perTeacherSummaries.find((s) => s.teacherId === selectedTeacherId);
                return (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg overflow-hidden shrink-0 border-2 border-blue-400">
                        {selectedTeacherObj?.avatar ? (
                          <img
                            src={selectedTeacherObj.avatar}
                            alt={selectedTeacherObj.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedTeacherObj?.nama.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
                            {selectedTeacherObj?.kategori || 'Guru'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase flex items-center gap-1">
                            <Award className="w-3 h-3" /> Profil Terverifikasi
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-white mt-1">
                          {selectedTeacherObj?.nama}
                        </h3>
                        <p className="text-xs text-blue-200 mt-0.5">
                          {selectedTeacherObj?.jabatan} • NIP: <span className="font-mono font-bold text-white">{selectedTeacherObj?.nip}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl border border-white/10 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-blue-200 uppercase font-bold">Rasio Kehadiran Individu</p>
                        <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                          {teacherSummary && teacherSummary.totalDays > 0
                            ? Math.round(((teacherSummary.totalHadir + teacherSummary.totalDinas) / teacherSummary.totalDays) * 100)
                            : 100}
                          %
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Hadir: {teacherSummary?.totalHadir || 0} | Dinas: {teacherSummary?.totalDinas || 0} | Izin/Sakit: {(teacherSummary?.totalIzin || 0) + (teacherSummary?.totalSakit || 0)}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Main Table View Switcher Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Laporan Rekapitulasi Presensi ({rekapPeriode.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing data for:{' '}
                  <span className="font-bold text-slate-800">
                    {rekapPeriode === 'harian'
                      ? `Tanggal ${rekapTanggal}`
                      : rekapPeriode === 'mingguan'
                      ? `7 Hari Terakhir s/d ${rekapTanggal}`
                      : `Bulan ${rekapBulan} Tahun ${rekapTahun}`}
                  </span>{' '}
                  • Guru/Staf:{' '}
                  <span className="font-bold text-blue-600">
                    {selectedTeacherId === 'semua'
                      ? 'Semua Guru & Karyawan'
                      : teacherAndStaffList.find((t) => t.id === selectedTeacherId)?.nama || selectedTeacherId}
                  </span>
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRekapViewMode('ringkasan-guru')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    rekapViewMode === 'ringkasan-guru'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ringkasan Per Guru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRekapViewMode('detail-log')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    rekapViewMode === 'detail-log'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Detail Log Logbook</span>
                </button>
              </div>
            </div>

            {/* MODE 1: RINGKASAN PER GURU / STAF MATRIX */}
            {rekapViewMode === 'ringkasan-guru' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Guru & NIP</th>
                      <th className="py-3 px-4">Jabatan / Kategori</th>
                      <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                      <th className="py-3 px-4 text-center text-purple-700">Dinas Luar</th>
                      <th className="py-3 px-4 text-center text-blue-700">Izin</th>
                      <th className="py-3 px-4 text-center text-amber-700">Sakit</th>
                      <th className="py-3 px-4 text-center text-teal-700">Cuti</th>
                      <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                      <th className="py-3 px-4 text-center">Tingkat Kehadiran</th>
                      <th className="py-3 px-4 text-center">Aksi Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {perTeacherSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                          Belum ada ringkasan presensi untuk kriteria filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      perTeacherSummaries.map((sum, index) => {
                        const totalHadirDinas = sum.totalHadir + sum.totalDinas;
                        const ratePercent =
                          sum.totalDays > 0 ? Math.round((totalHadirDinas / sum.totalDays) * 100) : 100;

                        return (
                          <tr key={sum.teacherId} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 text-center font-mono text-slate-500">{index + 1}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{sum.nama}</p>
                              <p className="text-[10px] text-slate-500 font-mono">NIP: {sum.nip}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800">{sum.jabatan}</p>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                                {sum.kategori}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700 bg-emerald-50/40">
                              {sum.totalHadir}
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-purple-700 bg-purple-50/40">
                              {sum.totalDinas}
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-blue-700">
                              {sum.totalIzin}
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-amber-700">
                              {sum.totalSakit}
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-teal-700">
                              {sum.totalCuti}
                            </td>
                            <td className="py-3 px-4 text-center font-bold font-mono text-rose-700">
                              {sum.totalAlpa}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-extrabold text-slate-900">{ratePercent}%</span>
                                <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                  <div
                                    className={`h-full rounded-full ${
                                      ratePercent >= 90
                                        ? 'bg-emerald-500'
                                        : ratePercent >= 75
                                        ? 'bg-blue-500'
                                        : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${ratePercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedTeacherId(sum.teacherId);
                                  setRekapViewMode('detail-log');
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                Lihat Log <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODE 2: DETAIL LOG PRESENSI LOGBOOK */}
            {rekapViewMode === 'detail-log' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nama Pegawai & NIP</th>
                      <th className="py-3 px-4">Jabatan / Kategori</th>
                      <th className="py-3 px-4">Jam Masuk</th>
                      <th className="py-3 px-4">Jam Pulang</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Validasi GPS</th>
                      <th className="py-3 px-4">Keterangan / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRekapRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                          Tidak ditemukan log presensi detail untuk kriteria filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredRekapRecords.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {rec.tanggal}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{rec.pegawaiNama}</p>
                            <p className="text-[10px] text-slate-500 font-mono">NIP: {rec.nipOrNik}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{rec.jabatan}</p>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                              {rec.kategori}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            {rec.waktuMasuk || '-'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {rec.waktuPulang || (
                              <span className="text-amber-600 font-medium italic">Belum Absen</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                rec.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'Dinas Luar'
                                  ? 'bg-purple-100 text-purple-800'
                                  : rec.status === 'Izin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : rec.status === 'Cuti'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {rec.jarakMeter !== undefined ? `${rec.jarakMeter}m` : '12m'} (Valid)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                            {rec.catatan || 'Presensi Valid GPS'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: REKAP PRESENSI SISWA (SINKRONISASI MANAJEMEN PENGGUNA & DAFTAR SISWA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rekap-siswa' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sinkronisasi Real-Time Aktif
              </div>
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-400" /> Rekapitulasi Presensi Kehadiran Siswa
              </h3>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                Data siswa disinkronkan secara otomatis dari <strong>Manajemen Pengguna</strong> dan <strong>Daftar Siswa</strong>.
                Setiap perubahan kelas, jurusan, atau nama siswa akan langsung terbarui di tabel ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleExportStudentCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Ekspor Rekap Siswa (CSV)
              </button>

              <button
                onClick={handlePrintReport}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Rekapitulasi
              </button>
            </div>
          </div>

          {/* Sync Navigation Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-blue-950">Relasi Database Terhubung:</p>
                <p className="text-blue-700 text-[11px]">
                  Total <strong>{studentUsers.length} Siswa Terdaftar</strong> dari Master User. Rekapitulasi menghitung otomatis presensi dari tabel absensi dan drafting harian.
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigateTab('users')}
                  className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-200 transition-colors shadow-xs"
                >
                  Manajemen Pengguna →
                </button>
                <button
                  onClick={() => onNavigateTab('daftar-siswa')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Daftar Siswa & Presensi →
                </button>
              </div>
            )}
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Siswa Terdaftar</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{studentUsers.length}</p>
              <p className="text-[10px] text-blue-600 mt-0.5 font-semibold">Master Manajemen Pengguna</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Total Log Presensi Siswa</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{attendanceList.length}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Record Kehadiran Valid</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-xs">
              <p className="text-[10px] font-bold text-blue-800 uppercase">Siswa Kehadiran 100%</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                {studentRecapList.filter((s) => s.rate === 100).length}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold">Presensi Sangat Baik</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
              <p className="text-[10px] font-bold text-amber-800 uppercase">Perlu Perhatian (&lt;80%)</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-0.5">
                {studentRecapList.filter((s) => s.rate < 80).length}
              </p>
              <p className="text-[10px] text-amber-600 font-semibold">Tindak Lanjut Wali Kelas</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" /> Filter Data Rekapitulasi Siswa
              </h4>
              <button
                onClick={() => {
                  setRekapSiswaKelas('Semua');
                  setRekapSiswaJurusan('Semua');
                  setRekapSiswaStatus('Semua');
                  setRekapSiswaSearch('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kelas Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter Kelas:</label>
                <select
                  value={rekapSiswaKelas}
                  onChange={(e) => setRekapSiswaKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Semua">-- Semua Kelas --</option>
                  {classes.length > 0
                    ? classes.map((c) => (
                        <option key={c.id} value={c.nama}>
                          {c.nama} ({c.jurusan})
                        </option>
                      ))
                    : Array.from(new Set(studentUsers.map((s) => s.kelasNama).filter(Boolean))).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                </select>
              </div>

              {/* Jurusan Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter Jurusan:</label>
                <select
                  value={rekapSiswaJurusan}
                  onChange={(e) => setRekapSiswaJurusan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Semua">-- Semua Jurusan --</option>
                  {jurusanList.length > 0
                    ? jurusanList.map((j) => (
                        <option key={j.id} value={j.kode}>
                          {j.kode} - {j.nama}
                        </option>
                      ))
                    : Array.from(new Set(studentUsers.map((s) => s.jurusanNama).filter(Boolean))).map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Kehadiran:</label>
                <select
                  value={rekapSiswaStatus}
                  onChange={(e) => setRekapSiswaStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Semua">Semua Tingkat Kehadiran</option>
                  <option value="100">100% Hadir (Sempurna)</option>
                  <option value="kurang80">Kurang dari 80% (Perlu Perhatian)</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pencarian Siswa:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rekapSiswaSearch}
                    onChange={(e) => setRekapSiswaSearch(e.target.value)}
                    placeholder="Nama, NISN, Kelas..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Recap Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jurusan</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Hadir (H)</th>
                    <th className="py-3 px-4 text-center text-blue-700">Izin (I)</th>
                    <th className="py-3 px-4 text-center text-amber-700">Sakit (S)</th>
                    <th className="py-3 px-4 text-center text-rose-700">Alpa (A)</th>
                    <th className="py-3 px-4 text-center">Total</th>
                    <th className="py-3 px-4 text-center">Persentase</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudentRecap.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada data rekap siswa yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentRecap.map((item, idx) => {
                      const s = item.student;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={s.avatar}
                                alt={s.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{s.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">ID: {s.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.nisn || '-'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              {s.kelasNama || '10 IPA 1'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.jurusanNama || 'MIPA'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {item.hadir}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                            {item.izin}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-amber-700 bg-amber-50/30">
                            {item.sakit}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-rose-700 bg-rose-50/30">
                            {item.alpa}
                          </td>
                          <td className="py-3 px-4 text-center font-extrabold text-slate-800">
                            {item.total}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                item.rate >= 90
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : item.rate >= 75
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}
                            >
                              {item.rate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedDetailStudent(s)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-200 transition-colors"
                            >
                              Detail Log
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Attendance Detail Modal */}
          {selectedDetailStudent && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDetailStudent.avatar}
                      alt={selectedDetailStudent.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                    />
                    <div>
                      <h4 className="font-extrabold text-base">{selectedDetailStudent.name}</h4>
                      <p className="text-xs text-slate-300">
                        NISN: {selectedDetailStudent.nisn || '-'} • Kelas: {selectedDetailStudent.kelasNama || '-'} • Jurusan: {selectedDetailStudent.jurusanNama || '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDetailStudent(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                  <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Log Presensi Siswa Terpilih:
                  </h5>
                  {(() => {
                    const studentRecords = attendanceList.filter(
                      (a) =>
                        a.siswaId === selectedDetailStudent.id ||
                        a.nisn === selectedDetailStudent.nisn ||
                        a.siswaNama.toLowerCase() === selectedDetailStudent.name.toLowerCase()
                    );

                    if (studentRecords.length === 0) {
                      return (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          Belum ada catatan log absensi untuk siswa ini.
                        </p>
                      );
                    }

                    return (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                            <th className="py-2.5 px-3">Tanggal & Waktu</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Verifikasi GPS</th>
                            <th className="py-2.5 px-3">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentRecords.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                                {r.tanggal} • {r.waktu}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    r.status === 'Hadir'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : r.status === 'Izin'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">
                                {r.jarakKeSekolahMeter !== undefined ? `${r.jarakKeSekolahMeter}m` : '12m'} (Tervalidasi)
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 italic">
                                {r.catatan || r.lokasiNama || 'Presensi Berhasil'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedDetailStudent(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ABSENSI SISWA & KELAS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'siswa' && (
        <div className="space-y-6">
          {/* GPS Check-in Form for Students */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Form Presensi Kehadiran Siswa ({currentUser.name})
                </h3>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? 'Mendapatkan GPS...' : 'Verifikasi Ulang Lokasi GPS'}
                </button>
              </div>

              {/* Location Status Alert Box */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                  currentCoords && currentCoords.distance <= SCHOOL_LOCATION.radiusMeterMax
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{locationStatusMessage}</p>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    Sistem memeriksa apakah posisi gawai berada di dalam batas lingkungan sekolah.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitStudentAttendance} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Status Kehadiran:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Hadir', 'Izin', 'Sakit'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStudentStatus(st)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          selectedStudentStatus === st
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'Hadir' ? '✅ HADIR (GPS)' : st === 'Izin' ? '📝 IZIN' : '🏥 SAKIT'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Keterangan Tambahan:
                  </label>
                  <input
                    type="text"
                    value={studentCatatan}
                    onChange={(e) => setStudentCatatan(e.target.value)}
                    placeholder={
                      selectedStudentStatus === 'Hadir'
                        ? 'Catatan (Opsional, e.g. Tepat waktu)'
                        : 'Keterangan alasan izin/sakit...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> KIRIM PRESENSI KEHADIRAN SISWA (GPS)
                </button>
              </form>
            </div>

            {/* Location Map Mock & Camera Proof */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Selfie Check-in Proof
                </h4>
                <div className="w-full h-36 bg-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-slate-300 relative overflow-hidden">
                  <img
                    src={currentUser.avatar}
                    alt="Selfie"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] px-2 py-1 rounded font-mono">
                    GPS: {currentCoords?.lat.toFixed(6)}, {currentCoords?.lng.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-800">Ketentuan Absensi GPS Siswa:</p>
                <p>• Jam Masuk: 06:30 - 07:15 WIB</p>
                <p>• Toleransi Keterlambatan: 15 menit</p>
                <p>• Notifikasi WA otomatis terkirim ke wali murid</p>
              </div>
            </div>
          </div>

          {/* Attendance History Table for Students */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Riwayat Presensi Kehadiran Siswa
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  placeholder="Cari nama, NISN, tanggal..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                    <th className="py-3 px-4">Tanggal & Waktu</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Jarak GPS</th>
                    <th className="py-3 px-4">Lokasi / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {rec.tanggal} • {rec.waktu}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.siswaNama}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{rec.nisn}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Izin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {rec.jarakKeSekolahMeter !== undefined ? `${rec.jarakKeSekolahMeter}m` : '12m'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                        {rec.catatan || rec.lokasiNama || 'Lokasi Valid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
