import React, { useState, useMemo, useRef } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  Printer,
  Users,
  CheckSquare,
  RefreshCw,
  Eye,
  Sparkles,
  Check,
  X,
  Building2,
  Phone,
  Mail,
  UserCheck,
  FileText,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  QrCode,
  Barcode,
} from 'lucide-react';
import { User, Kelas, Jurusan, AbsensiRecord, MataPelajaran, SchoolSettings } from '../../types';
import { exportToCSV, parseCSVText } from '../../utils/csvHelper';
import { BarcodeRenderer } from '../kartu/KartuAbsensiSiswa';
import { QRCodeSVG } from 'qrcode.react';
import {
  downloadSingleStudentCardPDF,
  downloadBatchStudentCardsPDF,
} from '../../utils/studentCardPdf';

interface DaftarSiswaProps {
  currentUser: User;
  users: User[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  attendanceList: AbsensiRecord[];
  subjects?: MataPelajaran[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onBatchImportStudents: (students: User[]) => void;
  onSaveBatchAttendance: (records: AbsensiRecord[]) => void;
  schoolSettings?: SchoolSettings;
}

type ViewMode = 'harian' | 'mapel' | 'mingguan' | 'bulanan';
type SortOption = 'nama-asc' | 'nama-desc' | 'nisn-asc' | 'kelas-asc' | 'jurusan-asc' | 'kehadiran-desc' | 'kehadiran-asc' | 'alpa-desc';

export const DaftarSiswa: React.FC<DaftarSiswaProps> = ({
  currentUser,
  users,
  classes,
  jurusanList,
  attendanceList,
  subjects = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onBatchImportStudents,
  onSaveBatchAttendance,
  schoolSettings,
}) => {
  // Current active date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeView, setActiveView] = useState<ViewMode>('harian');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [selectedJurusan, setSelectedJurusan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('nama-asc');

  // Mapel Attendance Specific State
  const defaultTeacherSubject = currentUser.subject || (subjects.length > 0 ? subjects[0].nama : 'Matematika Wajib');
  const [selectedMapel, setSelectedMapel] = useState<string>(defaultTeacherSubject);
  const [mapelMeetingNo, setMapelMeetingNo] = useState<number>(1);
  const [mapelTopic, setMapelTopic] = useState<string>('');
  const [mapelJam, setMapelJam] = useState<string>('07:30 - 09:00 WIB');
  const [mapelHistoryOpen, setMapelHistoryOpen] = useState(false);

  // Local draft changes for attendance before commit
  const [localAttendanceDraft, setLocalAttendanceDraft] = useState<Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'; catatan?: string }>>({});
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<User | null>(null);

  // Form State for Manual Add / Edit
  const [studentForm, setStudentForm] = useState<{
    name: string;
    nisn: string;
    email: string;
    kelasNama: string;
    jurusanNama: string;
    phone: string;
    gender: 'L' | 'P';
    address?: string;
  }>({
    name: '',
    nisn: '',
    email: '',
    kelasNama: classes[0]?.nama || '10 IPA 1',
    jurusanNama: jurusanList[0]?.nama || 'Teknik Komputer dan Jaringan',
    phone: '',
    gender: 'L',
    address: '',
  });

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<Array<{
    name: string;
    nisn: string;
    email: string;
    kelasNama: string;
    jurusanNama: string;
    phone: string;
    gender: string;
  }>>([]);
  const [importFileName, setImportFileName] = useState('');
  const [defaultImportKelas, setDefaultImportKelas] = useState(classes[0]?.nama || '10 IPA 1');
  const [defaultImportJurusan, setDefaultImportJurusan] = useState(jurusanList[0]?.nama || 'Teknik Komputer dan Jaringan');

  // Month and Year for Monthly Rekap
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [cardModalStudent, setCardModalStudent] = useState<User | null>(null);

  // Filter only students
  const allStudents = useMemo(() => {
    return users.filter((u) => u.role === 'siswa');
  }, [users]);

  // Derive Jurusan names list
  const availableJurusanNames = useMemo(() => {
    const fromJurusanList = jurusanList.map((j) => j.nama);
    const fromClasses = classes.map((c) => c.jurusanNama).filter(Boolean) as string[];
    const fromStudents = allStudents.map((s) => s.jurusanNama).filter(Boolean) as string[];
    return Array.from(new Set([...fromJurusanList, ...fromClasses, ...fromStudents]));
  }, [jurusanList, classes, allStudents]);

  // Helper to get student's attendance record for specific criteria
  const getAttendanceRecord = (studentId: string, date: string, isMapel: boolean = false, mapelName?: string, meetingNo?: number): AbsensiRecord | undefined => {
    if (isMapel) {
      return attendanceList.find(
        (a) =>
          a.siswaId === studentId &&
          a.tanggal === date &&
          a.tipeAbsensi === 'Mapel' &&
          (mapelName ? a.mataPelajaranNama === mapelName : true) &&
          (meetingNo !== undefined ? a.pertemuanKe === meetingNo : true)
      );
    }
    return attendanceList.find(
      (a) => a.siswaId === studentId && a.tanggal === date && (!a.tipeAbsensi || a.tipeAbsensi === 'Harian')
    );
  };

  // Helper to get monthly statistics for a student
  const getStudentMonthlyStats = (studentId: string, month: number, year: number) => {
    const studentRecords = attendanceList.filter((a) => {
      if (a.siswaId !== studentId) return false;
      if (a.tipeAbsensi === 'Mapel') return false; // Focus on daily attendance for monthly rekap
      const d = new Date(a.tanggal);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const hadir = studentRecords.filter((a) => a.status === 'Hadir').length;
    const izin = studentRecords.filter((a) => a.status === 'Izin').length;
    const sakit = studentRecords.filter((a) => a.status === 'Sakit').length;
    const alpa = studentRecords.filter((a) => a.status === 'Alpa').length;
    const totalRecorded = studentRecords.length;

    // Assumption of effective school days in a month if recorded is less
    const effectiveDays = Math.max(totalRecorded, 22);
    const presenceRate = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 100;

    return { hadir, izin, sakit, alpa, totalRecorded, effectiveDays, presenceRate };
  };

  // Helper for weekly dates calculation
  const currentWeekDays = useMemo(() => {
    const baseDate = new Date(selectedDate);
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const weekDays: Array<{ dayName: string; dateStr: string; formatted: string }> = [];
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const formatted = `${d.getDate()}/${d.getMonth() + 1}`;
      weekDays.push({
        dayName: dayNames[i],
        dateStr,
        formatted,
      });
    }

    return weekDays;
  }, [selectedDate]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return allStudents
      .filter((student) => {
        // Search query
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          student.name.toLowerCase().includes(q) ||
          (student.nisn && student.nisn.toLowerCase().includes(q)) ||
          (student.email && student.email.toLowerCase().includes(q)) ||
          (student.kelasNama && student.kelasNama.toLowerCase().includes(q)) ||
          (student.phone && student.phone.includes(q));

        if (!matchesQuery) return false;

        // Kelas Filter
        if (selectedKelas !== 'all') {
          if (student.kelasNama !== selectedKelas && student.kelasId !== selectedKelas) {
            return false;
          }
        }

        // Jurusan Filter
        if (selectedJurusan !== 'all') {
          const studentJurusan = student.jurusanNama || '';
          if (!studentJurusan.toLowerCase().includes(selectedJurusan.toLowerCase()) && student.jurusanId !== selectedJurusan) {
            return false;
          }
        }

        // Filter Status for Current Selected Date
        if (filterStatus !== 'all') {
          const isMapel = activeView === 'mapel';
          const rec = getAttendanceRecord(
            student.id,
            selectedDate,
            isMapel,
            isMapel ? selectedMapel : undefined,
            isMapel ? mapelMeetingNo : undefined
          );
          const currentStatus = localAttendanceDraft[student.id]?.status || rec?.status;

          if (filterStatus === 'Belum Absen') {
            if (currentStatus) return false;
          } else {
            if (currentStatus !== filterStatus) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nama-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'nama-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'nisn-asc') return (a.nisn || '').localeCompare(b.nisn || '');
        if (sortBy === 'kelas-asc') return (a.kelasNama || '').localeCompare(b.kelasNama || '');
        if (sortBy === 'jurusan-asc') return (a.jurusanNama || '').localeCompare(b.jurusanNama || '');

        const statsA = getStudentMonthlyStats(a.id, selectedMonth, selectedYear);
        const statsB = getStudentMonthlyStats(b.id, selectedMonth, selectedYear);

        if (sortBy === 'kehadiran-desc') return statsB.presenceRate - statsA.presenceRate;
        if (sortBy === 'kehadiran-asc') return statsA.presenceRate - statsB.presenceRate;
        if (sortBy === 'alpa-desc') return statsB.alpa - statsA.alpa;

        return 0;
      });
  }, [
    allStudents,
    searchQuery,
    selectedKelas,
    selectedJurusan,
    filterStatus,
    sortBy,
    activeView,
    selectedDate,
    selectedMapel,
    mapelMeetingNo,
    localAttendanceDraft,
    selectedMonth,
    selectedYear,
    attendanceList,
  ]);

  // Daily Stats for the selected date & view
  const currentViewStats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let belum = 0;

    const isMapel = activeView === 'mapel';

    filteredStudents.forEach((student) => {
      const rec = getAttendanceRecord(
        student.id,
        selectedDate,
        isMapel,
        isMapel ? selectedMapel : undefined,
        isMapel ? mapelMeetingNo : undefined
      );
      const status = localAttendanceDraft[student.id]?.status || rec?.status;

      if (status === 'Hadir') hadir++;
      else if (status === 'Izin') izin++;
      else if (status === 'Sakit') sakit++;
      else if (status === 'Alpa') alpa++;
      else belum++;
    });

    const total = filteredStudents.length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { total, hadir, izin, sakit, alpa, belum, rate };
  }, [filteredStudents, activeView, selectedDate, selectedMapel, mapelMeetingNo, localAttendanceDraft, attendanceList]);

  // Handler to update single student attendance draft
  const handleMarkStudentAttendance = (studentId: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa', catatan?: string) => {
    setLocalAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        status,
        catatan: catatan !== undefined ? catatan : prev[studentId]?.catatan,
      },
    }));
  };

  // Handler to mark ALL currently visible students as 'Hadir'
  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'; catatan?: string }> = { ...localAttendanceDraft };
    filteredStudents.forEach((student) => {
      updated[student.id] = {
        status: 'Hadir',
        catatan: updated[student.id]?.catatan || '',
      };
    });
    setLocalAttendanceDraft(updated);
    showToast(`Berhasil menandai ${filteredStudents.length} siswa sebagai HADIR.`);
  };

  // Handler to reset current draft
  const handleResetDraft = () => {
    setLocalAttendanceDraft({});
    showToast('Draft presensi telah direset ke data tersimpan.');
  };

  // Handler to commit & save batch attendance to App state
  const handleSaveAttendanceChanges = () => {
    const isMapel = activeView === 'mapel';
    const recordsToSave: AbsensiRecord[] = [];

    filteredStudents.forEach((student) => {
      const draft = localAttendanceDraft[student.id];
      const existing = getAttendanceRecord(
        student.id,
        selectedDate,
        isMapel,
        isMapel ? selectedMapel : undefined,
        isMapel ? mapelMeetingNo : undefined
      );

      // Determine final status
      const finalStatus = draft?.status || existing?.status || 'Hadir';
      const finalCatatan = draft?.catatan !== undefined ? draft.catatan : existing?.catatan || '';

      const newRecord: AbsensiRecord = {
        id: existing?.id || `att-${Date.now()}-${student.id}-${Math.random().toString(36).substring(2, 6)}`,
        siswaId: student.id,
        siswaNama: student.name,
        nisn: student.nisn || '',
        kelasId: student.kelasId || student.kelasNama || '',
        kelasNama: student.kelasNama || '',
        jurusanNama: student.jurusanNama || '',
        tanggal: selectedDate,
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: finalStatus,
        tipeAbsensi: isMapel ? 'Mapel' : 'Harian',
        mataPelajaranNama: isMapel ? selectedMapel : undefined,
        guruId: currentUser.id,
        guruNama: currentUser.name,
        pertemuanKe: isMapel ? mapelMeetingNo : undefined,
        materiMapel: isMapel ? mapelTopic : undefined,
        catatan: finalCatatan,
      };

      recordsToSave.push(newRecord);
    });

    onSaveBatchAttendance(recordsToSave);
    setLocalAttendanceDraft({});
    showToast(`✅ Berhasil menyimpan presensi ${recordsToSave.length} siswa untuk tanggal ${selectedDate}!`);
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
    }, 4000);
  };

  // Export Daily / Monthly Rekap to CSV
  const handleExportCSV = () => {
    if (activeView === 'bulanan') {
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Hadir (H)', 'Izin (I)', 'Sakit (S)', 'Alpa (A)', 'Total Hari', 'Persentase Kehadiran (%)', 'Keterangan'];
      const rows = filteredStudents.map((student, idx) => {
        const stats = getStudentMonthlyStats(student.id, selectedMonth, selectedYear);
        let statusKeterangan = 'Sangat Baik';
        if (stats.presenceRate < 60) statusKeterangan = 'Kritis (Perlu Pemanggilan Ortu)';
        else if (stats.presenceRate < 75) statusKeterangan = 'Cukup (Perlu Pembinaan)';
        else if (stats.presenceRate < 90) statusKeterangan = 'Baik';

        return [
          idx + 1,
          student.nisn || '-',
          student.name,
          student.kelasNama || '-',
          student.jurusanNama || '-',
          stats.hadir,
          stats.izin,
          stats.sakit,
          stats.alpa,
          stats.totalRecorded,
          `${stats.presenceRate}%`,
          statusKeterangan,
        ];
      });

      exportToCSV(`Rekap_Presensi_Bulanan_${monthNames[selectedMonth]}_${selectedYear}_${selectedKelas}`, headers, rows);
    } else {
      const isMapel = activeView === 'mapel';
      const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Tanggal', 'Tipe Presensi', 'Mata Pelajaran', 'Pertemuan Ke', 'Status Kehadiran', 'Waktu', 'Catatan'];
      const rows = filteredStudents.map((student, idx) => {
        const rec = getAttendanceRecord(
          student.id,
          selectedDate,
          isMapel,
          isMapel ? selectedMapel : undefined,
          isMapel ? mapelMeetingNo : undefined
        );
        const status = localAttendanceDraft[student.id]?.status || rec?.status || 'Belum Presensi';
        const catatan = localAttendanceDraft[student.id]?.catatan || rec?.catatan || '-';

        return [
          idx + 1,
          student.nisn || '-',
          student.name,
          student.kelasNama || '-',
          student.jurusanNama || '-',
          selectedDate,
          isMapel ? 'Mata Pelajaran' : 'Harian Sekolah',
          isMapel ? selectedMapel : '-',
          isMapel ? mapelMeetingNo : '-',
          status,
          rec?.waktu || '-',
          catatan,
        ];
      });

      exportToCSV(`Daftar_Presensi_${selectedDate}_${selectedKelas}`, headers, rows);
    }
  };

  // Download Sample Template for Students Import
  const handleDownloadTemplate = () => {
    const headers = ['nama', 'nisn', 'email', 'kelas', 'jurusan', 'jenis_kelamin', 'telepon', 'alamat'];
    const sampleRows = [
      ['Ahmad Fauzi', '0061234567', 'ahmad.fauzi@smartschool.sch.id', '10 IPA 1', 'Matematika dan Ilmu Pengetahuan Alam', 'L', '081234567890', 'Jl. Merdeka No. 10'],
      ['Siti Aisyah', '0061234568', 'siti.aisyah@smartschool.sch.id', '10 IPA 1', 'Matematika dan Ilmu Pengetahuan Alam', 'P', '081234567891', 'Jl. Sudirman No. 15'],
      ['Budi Pratama', '0061234569', 'budi.pratama@smartschool.sch.id', '10 TKJ 1', 'Teknik Komputer dan Jaringan', 'L', '081234567892', 'Jl. Thamrin No. 20'],
      ['Dewi Lestari', '0061234570', 'dewi.lestari@smartschool.sch.id', '10 RPL', 'Rekayasa Perangkat Lunak', 'P', '081234567893', 'Jl. Gatot Subroto No. 5'],
    ];

    exportToCSV('Template_Upload_Data_Siswa_SIAKAD.csv', headers, sampleRows);
  };

  // File CSV Reader for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const { headers, rows } = parseCSVText(text);
        if (rows.length === 0) {
          alert('Berkas CSV kosong atau tidak memiliki baris data!');
          return;
        }

        // Map column indices safely
        const lowerHeaders = headers.map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
        const nameIdx = lowerHeaders.findIndex((h) => h.includes('nama') || h.includes('name'));
        const nisnIdx = lowerHeaders.findIndex((h) => h.includes('nisn') || h.includes('nis'));
        const emailIdx = lowerHeaders.findIndex((h) => h.includes('email') || h.includes('surel'));
        const kelasIdx = lowerHeaders.findIndex((h) => h.includes('kelas') || h.includes('class') || h.includes('rombel'));
        const jurusanIdx = lowerHeaders.findIndex((h) => h.includes('jurusan') || h.includes('prodi') || h.includes('kejuruan'));
        const genderIdx = lowerHeaders.findIndex((h) => h.includes('gender') || h.includes('kelamin') || h.includes('jk') || h.includes('sex'));
        const phoneIdx = lowerHeaders.findIndex((h) => h.includes('telepon') || h.includes('phone') || h.includes('hp') || h.includes('wa'));

        const parsedList = rows.map((row) => {
          const name = (nameIdx >= 0 ? row[nameIdx] : row[0]) || 'Siswa Baru';
          const nisn = (nisnIdx >= 0 ? row[nisnIdx] : row[1]) || `006${Math.floor(1000000 + Math.random() * 9000000)}`;
          const email = (emailIdx >= 0 ? row[emailIdx] : row[2]) || `${name.toLowerCase().replace(/\s+/g, '.')}@smartschool.sch.id`;
          const kelasNama = (kelasIdx >= 0 ? row[kelasIdx] : row[3]) || defaultImportKelas;
          const jurusanNama = (jurusanIdx >= 0 ? row[jurusanIdx] : row[4]) || defaultImportJurusan;
          const gender = (genderIdx >= 0 ? row[genderIdx] : row[5]) || 'L';
          const phone = (phoneIdx >= 0 ? row[phoneIdx] : row[6]) || '0812' + Math.floor(10000000 + Math.random() * 90000000);

          return {
            name: name.trim(),
            nisn: nisn.trim(),
            email: email.trim(),
            kelasNama: kelasNama.trim() || defaultImportKelas,
            jurusanNama: jurusanNama.trim() || defaultImportJurusan,
            gender: gender.toUpperCase().startsWith('P') ? 'P' : 'L',
            phone: phone.trim(),
          };
        });

        setCsvPreviewData(parsedList);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        alert('Gagal memproses format CSV. Pastikan file valid berformat koma (,) atau titik koma (;).');
      }
    };

    reader.readAsText(file);
  };

  // Submit CSV Import to Users
  const handleExecuteImport = () => {
    if (csvPreviewData.length === 0) {
      alert('Tidak ada data siswa yang siap diimpor.');
      return;
    }

    const newUsers: User[] = csvPreviewData.map((item, idx) => {
      // Find matching class ID
      const matchedClass = classes.find((c) => c.nama.toLowerCase() === item.kelasNama.toLowerCase());
      const matchedJurusan = jurusanList.find((j) => j.nama.toLowerCase().includes(item.jurusanNama.toLowerCase()) || j.kode.toLowerCase() === item.jurusanNama.toLowerCase());

      return {
        id: `usr-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        nisn: item.nisn,
        email: item.email,
        username: item.nisn || item.email.split('@')[0],
        password: 'password123',
        role: 'siswa',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (idx % 10)}?w=150&auto=format&fit=crop&q=80`,
        kelasId: matchedClass?.id || item.kelasNama,
        kelasNama: item.kelasNama || defaultImportKelas,
        jurusanId: matchedJurusan?.id || item.jurusanNama,
        jurusanNama: item.jurusanNama || defaultImportJurusan,
        phone: item.phone,
        statusAkun: 'Aktif',
      };
    });

    onBatchImportStudents(newUsers);
    setIsUploadModalOpen(false);
    setCsvPreviewData([]);
    setImportFileName('');
    showToast(`🎉 Berhasil mengimpor ${newUsers.length} data siswa ke dalam sistem SIAKAD!`);
  };

  // Submit Manual Add / Edit Student Form
  const handleSaveStudentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.nisn) {
      alert('Nama lengkap dan NISN wajib diisi!');
      return;
    }

    const matchedClass = classes.find((c) => c.nama === studentForm.kelasNama);
    const matchedJurusan = jurusanList.find((j) => j.nama === studentForm.jurusanNama);

    if (isEditModalOpen && selectedStudentForAction) {
      const updated: User = {
        ...selectedStudentForAction,
        name: studentForm.name,
        nisn: studentForm.nisn,
        email: studentForm.email || selectedStudentForAction.email,
        kelasNama: studentForm.kelasNama,
        kelasId: matchedClass?.id || selectedStudentForAction.kelasId,
        jurusanNama: studentForm.jurusanNama,
        jurusanId: matchedJurusan?.id || selectedStudentForAction.jurusanId,
        phone: studentForm.phone,
      };

      onUpdateUser(updated);
      setIsEditModalOpen(false);
      setSelectedStudentForAction(null);
      showToast(`✅ Data siswa "${studentForm.name}" berhasil diperbarui.`);
    } else {
      const newUser: User = {
        id: `usr-siswa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: studentForm.name,
        nisn: studentForm.nisn,
        username: studentForm.nisn,
        password: 'password123',
        email: studentForm.email || `${studentForm.name.toLowerCase().replace(/\s+/g, '.')}@smartschool.sch.id`,
        role: 'siswa',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        kelasNama: studentForm.kelasNama,
        kelasId: matchedClass?.id || studentForm.kelasNama,
        jurusanNama: studentForm.jurusanNama,
        jurusanId: matchedJurusan?.id || studentForm.jurusanNama,
        phone: studentForm.phone,
        statusAkun: 'Aktif',
      };

      onAddUser(newUser);
      setIsAddModalOpen(false);
      showToast(`🎉 Siswa baru "${studentForm.name}" berhasil ditambahkan.`);
    }

    // Reset Form
    setStudentForm({
      name: '',
      nisn: '',
      email: '',
      kelasNama: classes[0]?.nama || '10 IPA 1',
      jurusanNama: jurusanList[0]?.nama || 'Teknik Komputer dan Jaringan',
      phone: '',
      gender: 'L',
      address: '',
    });
  };

  // Open Edit Modal with Prepopulated Data
  const handleOpenEditModal = (student: User) => {
    setSelectedStudentForAction(student);
    setStudentForm({
      name: student.name,
      nisn: student.nisn || '',
      email: student.email,
      kelasNama: student.kelasNama || classes[0]?.nama || '10 IPA 1',
      jurusanNama: student.jurusanNama || jurusanList[0]?.nama || 'Teknik Komputer dan Jaringan',
      phone: student.phone || '',
      gender: 'L',
      address: '',
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (student: User) => {
    setSelectedStudentForAction(student);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Student
  const handleConfirmDelete = () => {
    if (!selectedStudentForAction) return;
    onDeleteUser(selectedStudentForAction.id);
    setIsDeleteModalOpen(false);
    showToast(`🗑️ Data siswa "${selectedStudentForAction.name}" telah dihapus.`);
    setSelectedStudentForAction(null);
  };

  // Student Card PDF Download in DaftarSiswa
  const [isCardDownloadModalOpen, setIsCardDownloadModalOpen] = useState(false);
  const [cardDownloadTarget, setCardDownloadTarget] = useState<'filtered' | 'all' | 'single'>('filtered');
  const [cardDownloadStudent, setCardDownloadStudent] = useState<User | null>(null);
  const [cardDownloadSide, setCardDownloadSide] = useState<'depan' | 'belakang' | 'bolak-balik'>('depan');
  const [cardDownloadLayout, setCardDownloadLayout] = useState<'pvc-single' | 'a4-grid'>('a4-grid');
  const [isCardDownloading, setIsCardDownloading] = useState(false);
  const [cardDownloadProgress, setCardDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  const handleQuickDownloadSingleCard = async (student: User) => {
    try {
      setIsCardDownloading(true);
      await downloadSingleStudentCardPDF(student, {
        schoolSettings,
        classes,
        side: 'depan',
        layout: 'pvc-single',
      });
      showToast(`✅ Berhasil mengunduh Kartu Pelajar ${student.name}!`);
    } catch (err) {
      console.error('Error download student card:', err);
      alert('Gagal mengunduh kartu pelajar siswa.');
    } finally {
      setIsCardDownloading(false);
    }
  };

  const handleExecuteCardDownload = async () => {
    try {
      setIsCardDownloading(true);
      if (cardDownloadTarget === 'single') {
        const target = cardDownloadStudent || filteredStudents[0];
        if (!target) return;
        await downloadSingleStudentCardPDF(target, {
          schoolSettings,
          classes,
          side: cardDownloadSide,
          layout: cardDownloadLayout,
        });
        showToast(`✅ Berhasil mengunduh Kartu Pelajar ${target.name}!`);
      } else {
        const listToDownload = cardDownloadTarget === 'all' ? allStudents : filteredStudents;
        if (listToDownload.length === 0) {
          alert('Tidak ada siswa pada filter yang dipilih.');
          return;
        }
        setCardDownloadProgress({ current: 0, total: listToDownload.length });
        await downloadBatchStudentCardsPDF(
          listToDownload,
          {
            schoolSettings,
            classes,
            side: cardDownloadSide,
          },
          (current, total) => {
            setCardDownloadProgress({ current, total });
          }
        );
        showToast(`🎉 Berhasil mengunduh ${listToDownload.length} Kartu Siswa Lembar A4!`);
      }
      setIsCardDownloadModalOpen(false);
    } catch (err) {
      console.error('Error generating card pdfs:', err);
      alert('Gagal membuat berkas PDF Kartu Siswa.');
    } finally {
      setIsCardDownloading(false);
      setCardDownloadProgress(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Popup */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setShowSaveToast(false)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-sky-300" />
              <span>DIREKTORI SISWA & MANAJEMEN PRESENSI LENGKAP</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Daftar Siswa & Rekap Absensi Terpadu
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Kelola data seluruh rombongan belajar, filter berdasarkan kelas dan jurusan, lakukan presensi harian serta per mata pelajaran guru, serta lihat rekapitulasi harian, mingguan, dan bulanan secara terstruktur.
            </p>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setCardDownloadTarget('filtered');
                setCardDownloadStudent(filteredStudents[0] || null);
                setIsCardDownloadModalOpen(true);
              }}
              title="Unduh Kartu Siswa untuk rombel ini atau semua siswa"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <QrCode className="w-4 h-4 text-emerald-200" />
              <span>Unduh Kartu Siswa (PDF)</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              title="Unduh format template CSV siswa"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/15 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Template CSV</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-sky-500/25"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Siswa (CSV)</span>
            </button>

            <button
              onClick={() => {
                setStudentForm({
                  name: '',
                  nisn: '',
                  email: '',
                  kelasNama: classes[0]?.nama || '10 IPA 1',
                  jurusanNama: jurusanList[0]?.nama || 'Teknik Komputer dan Jaringan',
                  phone: '',
                  gender: 'L',
                  address: '',
                });
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Harian, Mapel Guru, Mingguan, Bulanan) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveView('harian')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'harian'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>1. Presensi Harian Rombel</span>
          </button>

          <button
            onClick={() => setActiveView('mapel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'mapel'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Presensi Mapel Guru</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-100 text-indigo-800 font-semibold">
              {currentUser.role === 'guru' ? currentUser.subject || 'Mapel' : 'Guru'}
            </span>
          </button>

          <button
            onClick={() => setActiveView('mingguan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'mingguan'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Rekap Mingguan Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('bulanan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'bulanan'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Rekap Bulanan & Persentase</span>
          </button>
        </div>

        {/* Quick Date / Month Navigator on the Right */}
        <div className="flex items-center gap-3 px-2">
          {activeView === 'bulanan' ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
                ].map((m, idx) => (
                  <option key={idx} value={idx}>
                    Bulan: {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Pilih Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <button
            onClick={handleExportCSV}
            title="Ekspor data saat ini ke Excel/CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Special Sub-Header for "Presensi Mapel Guru" */}
      {activeView === 'mapel' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-950">
                  Presensi Mata Pelajaran:{' '}
                  <span className="text-indigo-700">{selectedMapel}</span>
                </h3>
                <p className="text-xs text-indigo-700">
                  Pengajar: <strong>{currentUser.name}</strong> • Sesuai Jadwal Jam Mengajar & Jurnal Kelas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapelHistoryOpen(!mapelHistoryOpen)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100/60 transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{mapelHistoryOpen ? 'Tutup Riwayat Pertemuan' : 'Lihat Riwayat Jurnal Mapel'}</span>
              </button>
            </div>
          </div>

          {/* Meeting Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-indigo-100">
            <div>
              <label className="block text-[11px] font-bold text-indigo-900 mb-1">Mata Pelajaran</label>
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <option key={sub.id} value={sub.nama}>
                      {sub.nama} ({sub.kode})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Matematika Wajib">Matematika Wajib</option>
                    <option value="Pemrograman Web & Mobile">Pemrograman Web & Mobile</option>
                    <option value="Infrastruktur Jaringan Komputer">Infrastruktur Jaringan Komputer</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Fisika Terapan">Fisika Terapan</option>
                    <option value="Praktikum Akuntansi Lembaga">Praktikum Akuntansi Lembaga</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-900 mb-1">Pertemuan Ke-</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={mapelMeetingNo}
                  onChange={(e) => setMapelMeetingNo(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-xs font-bold px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 text-center"
                />
                <input
                  type="text"
                  placeholder="Waktu: 07:30 - 09:00 WIB"
                  value={mapelJam}
                  onChange={(e) => setMapelJam(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                Topik / Materi Pembelajaran Hari Ini
              </label>
              <input
                type="text"
                placeholder="Contoh: Bab 4 - Penerapan Routing OSPF pada Router Cisco & Mikrotik"
                value={mapelTopic}
                onChange={(e) => setMapelTopic(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Collapsible History of Mapel Meetings */}
          {mapelHistoryOpen && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Jurnal Pertemuan & Absensi Mapel Sebelumnya</span>
                </h4>
                <span className="text-[11px] text-slate-500">Mata Pelajaran: {selectedMapel}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { meeting: 1, date: '12/08/2026', topic: 'Kontrak Belajar & Pengantar Kurikulum', hadir: 34, izin: 1, sakit: 1, alpa: 0 },
                  { meeting: 2, date: '15/08/2026', topic: 'Konsep Dasar Arsitektur & Teori Dasar', hadir: 35, izin: 1, sakit: 0, alpa: 0 },
                  { meeting: 3, date: '18/08/2026', topic: 'Praktikum Mandiri & Diskusi Kelompok', hadir: 33, izin: 2, sakit: 1, alpa: 0 },
                ].map((item) => (
                  <div key={item.meeting} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Pertemuan #{item.meeting}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{item.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1 italic">"{item.topic}"</p>
                    <div className="flex items-center gap-2 text-[10px] pt-1">
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">H: {item.hadir}</span>
                      <span className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-medium">I: {item.izin}</span>
                      <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium">S: {item.sakit}</span>
                      <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-medium">A: {item.alpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary KPI Stats Cards for Current View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Siswa</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{currentViewStats.total}</span>
            <span className="text-[11px] text-slate-500 block">Siswa Terpilih</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">Hadir (H)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-900">{currentViewStats.hadir}</span>
            <span className="text-[11px] text-emerald-700 block font-medium">
              {currentViewStats.total > 0 ? Math.round((currentViewStats.hadir / currentViewStats.total) * 100) : 0}% Kehadiran
            </span>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-bold">Izin (I)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-blue-900">{currentViewStats.izin}</span>
            <span className="text-[11px] text-blue-700 block font-medium">Izin Terkonfirmasi</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">Sakit (S)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-900">{currentViewStats.sakit}</span>
            <span className="text-[11px] text-amber-700 block font-medium">Surat / Keterangan</span>
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold">Alpa (A)</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-900">{currentViewStats.alpa}</span>
            <span className="text-[11px] text-rose-700 block font-medium">Tanpa Keterangan</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold">Persentase</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-400">{currentViewStats.rate}%</span>
            <span className="text-[11px] text-slate-300 block">Efektivitas Kelas</span>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Controls Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, email, atau no. telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Batch Buttons (Hadir Semua, Reset, Simpan) */}
          {(activeView === 'harian' || activeView === 'mapel') && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMarkAllHadir}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tandai Semua Hadir</span>
              </button>

              {Object.keys(localAttendanceDraft).length > 0 && (
                <button
                  onClick={handleResetDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Draft</span>
                </button>
              )}

              <button
                onClick={handleSaveAttendanceChanges}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-blue-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Presensi ({filteredStudents.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Filter Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              <span>Filter Rombel / Kelas:</span>
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Kelas ({allStudents.length} Siswa)</option>
              {classes.map((cls) => {
                const count = allStudents.filter((s) => s.kelasNama === cls.nama || s.kelasId === cls.id).length;
                return (
                  <option key={cls.id} value={cls.nama}>
                    {cls.nama} ({count} Siswa)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Jurusan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span>Filter Jurusan:</span>
            </label>
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Jurusan / Peminatan</option>
              {availableJurusanNames.map((jur, idx) => (
                <option key={idx} value={jur}>
                  {jur}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Presensi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>Filter Status Kehadiran:</span>
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpa">Alpa</option>
              <option value="Belum Absen">Belum Terisi</option>
            </select>
          </div>

          {/* Sorting Option */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-purple-600" />
              <span>Urutkan Berdasarkan:</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="nama-asc">Nama Siswa (A - Z)</option>
              <option value="nama-desc">Nama Siswa (Z - A)</option>
              <option value="nisn-asc">NISN Terurut</option>
              <option value="kelas-asc">Rombel / Kelas</option>
              <option value="jurusan-asc">Jurusan</option>
              <option value="kehadiran-desc">Kehadiran Tertinggi (%)</option>
              <option value="kehadiran-asc">Kehadiran Terendah (%)</option>
              <option value="alpa-desc">Alpa Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Active View */}
      {/* ---------------------------------------------------- */}
      {/* VIEW 1 & 2: Presensi Harian & Presensi Mapel Guru   */}
      {/* ---------------------------------------------------- */}
      {(activeView === 'harian' || activeView === 'mapel') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                Daftar Presensi {activeView === 'mapel' ? `Mapel: ${selectedMapel}` : 'Harian Rombel'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {filteredStudents.length} Siswa
              </span>
              <span className="text-xs text-slate-500">
                • Tanggal: <strong>{selectedDate}</strong>
              </span>
            </div>

            <div className="text-xs text-slate-500">
              💡 <em>Klik tombol status (H/I/S/A) di bawah lalu klik "Simpan Presensi" untuk menerapkan.</em>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">Tidak ada siswa yang sesuai dengan filter saat ini</p>
              <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian, pilihan kelas, atau jurusan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                    <th className="py-3.5 px-4">Kelas & Jurusan</th>
                    <th className="py-3.5 px-4 text-center">Status Presensi</th>
                    <th className="py-3.5 px-4">Catatan / Keterangan</th>
                    <th className="py-3.5 px-4 text-center w-28">Aksi Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((student, idx) => {
                    const isMapel = activeView === 'mapel';
                    const rec = getAttendanceRecord(
                      student.id,
                      selectedDate,
                      isMapel,
                      isMapel ? selectedMapel : undefined,
                      isMapel ? mapelMeetingNo : undefined
                    );

                    const draft = localAttendanceDraft[student.id];
                    const currentStatus = draft?.status || rec?.status || 'Hadir';
                    const currentCatatan = draft?.catatan !== undefined ? draft.catatan : rec?.catatan || '';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar || `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`}
                              alt={student.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{student.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] block w-fit mb-0.5">
                            {student.kelasNama || '-'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[200px]" title={student.jurusanNama}>
                            {student.jurusanNama || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map((st) => {
                              const isSelected = currentStatus === st;
                              let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent';

                              if (isSelected) {
                                if (st === 'Hadir') btnStyle = 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30';
                                else if (st === 'Izin') btnStyle = 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30';
                                else if (st === 'Sakit') btnStyle = 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-600/30';
                                else if (st === 'Alpa') btnStyle = 'bg-rose-600 text-white font-bold shadow-sm shadow-rose-600/30';
                              }

                              return (
                                <button
                                  key={st}
                                  onClick={() => handleMarkStudentAttendance(student.id, st)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${btnStyle}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={currentCatatan}
                            onChange={(e) => handleMarkStudentAttendance(student.id, currentStatus, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-all placeholder-slate-400"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setCardModalStudent(student)}
                              title="Lihat & Cetak Kartu Pelajar Barcode"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(student)}
                              title="Edit Data Siswa"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(student)}
                              title="Hapus Siswa Manual"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 3: Rekap Mingguan Matrix                       */}
      {/* ---------------------------------------------------- */}
      {activeView === 'mingguan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rekap Matriks Mingguan: {currentWeekDays[0]?.formatted} - {currentWeekDays[5]?.formatted}
              </h3>
              <p className="text-xs text-slate-500">
                Daftar status harian seluruh siswa dari hari Senin hingga Sabtu pada minggu terpilih.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> H = Hadir
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> I = Izin
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> S = Sakit
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> A = Alpa
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4 min-w-[200px]">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  {currentWeekDays.map((wd) => (
                    <th key={wd.dateStr} className="py-3 px-2 text-center">
                      <span className="block font-bold">{wd.dayName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{wd.formatted}</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student, idx) => {
                  let weekHadir = 0;
                  let weekTotal = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                          {student.kelasNama || '-'}
                        </span>
                      </td>
                      {currentWeekDays.map((wd) => {
                        const rec = getAttendanceRecord(student.id, wd.dateStr);
                        const status = rec?.status || 'Hadir'; // Default to Hadir if normal school day
                        weekTotal++;
                        if (status === 'Hadir') weekHadir++;

                        let badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                        let initial = 'H';
                        if (status === 'Izin') {
                          badgeColor = 'bg-blue-100 text-blue-800 font-bold';
                          initial = 'I';
                        } else if (status === 'Sakit') {
                          badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                          initial = 'S';
                        } else if (status === 'Alpa') {
                          badgeColor = 'bg-rose-100 text-rose-800 font-bold';
                          initial = 'A';
                        }

                        return (
                          <td key={wd.dateStr} className="py-3 px-2 text-center">
                            <span className={`inline-block w-7 h-7 leading-7 rounded-lg text-xs ${badgeColor}`}>
                              {initial}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                          <span>{Math.round((weekHadir / (weekTotal || 1)) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 4: Rekap Bulanan & Persentase Kehadiran       */}
      {/* ---------------------------------------------------- */}
      {activeView === 'bulanan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rekapitulasi Bulanan: {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][selectedMonth]} {selectedYear}
              </h3>
              <p className="text-xs text-slate-500">
                Akumulasi kehadiran per siswa untuk laporan bulanan wali kelas dan bimbingan konseling.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap Bulanan (.CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                  <th className="py-3.5 px-4">Kelas & Jurusan</th>
                  <th className="py-3.5 px-3 text-center text-emerald-700">Hadir</th>
                  <th className="py-3.5 px-3 text-center text-blue-700">Izin</th>
                  <th className="py-3.5 px-3 text-center text-amber-700">Sakit</th>
                  <th className="py-3.5 px-3 text-center text-rose-700">Alpa</th>
                  <th className="py-3.5 px-4 text-center">Tingkat Kehadiran (%)</th>
                  <th className="py-3.5 px-4 text-center">Status Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student, idx) => {
                  const stats = getStudentMonthlyStats(student.id, selectedMonth, selectedYear);

                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Sangat Baik
                    </span>
                  );

                  if (stats.presenceRate < 60 || stats.alpa >= 3) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit mx-auto">
                        <AlertTriangle className="w-3 h-3" /> Kritis / Panggilan
                      </span>
                    );
                  } else if (stats.presenceRate < 75) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        Cukup / Perhatian
                      </span>
                    );
                  } else if (stats.presenceRate < 90) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        Baik
                      </span>
                    );
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{student.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn || '-'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] block w-fit mb-0.5">
                          {student.kelasNama || '-'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[200px]" title={student.jurusanNama}>
                          {student.jurusanNama || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">{stats.hadir}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-blue-700">{stats.izin}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-700">{stats.sakit}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-700">{stats.alpa}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-32 mx-auto space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>{stats.presenceRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                stats.presenceRate >= 90
                                  ? 'bg-emerald-500'
                                  : stats.presenceRate >= 75
                                  ? 'bg-blue-500'
                                  : stats.presenceRate >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(stats.presenceRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Tambah / Edit Siswa Manual                 */}
      {/* ==================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {isEditModalOpen ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isEditModalOpen ? 'Edit Data Siswa Manual' : 'Tambah Siswa Baru Manual'}
                  </h3>
                  <p className="text-xs text-slate-500">Lengkapi biodata dan informasi akademik siswa</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentForm} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN (Nomor Induk Siswa Nasional) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0061234567"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Siswa (Opsional)</label>
                  <input
                    type="email"
                    placeholder="nama.siswa@smartschool.sch.id"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rombel / Kelas *</label>
                  <select
                    value={studentForm.kelasNama}
                    onChange={(e) => setStudentForm({ ...studentForm, kelasNama: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.nama}>
                        {c.nama} (Tingkat {c.tingkat})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jurusan / Kompetensi *</label>
                  <select
                    value={studentForm.jurusanNama}
                    onChange={(e) => setStudentForm({ ...studentForm, jurusanNama: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                  >
                    {availableJurusanNames.map((j, idx) => (
                      <option key={idx} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp Siswa</label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={studentForm.gender === 'L'}
                        onChange={() => setStudentForm({ ...studentForm, gender: 'L' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Laki-laki (L)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={studentForm.gender === 'P'}
                        onChange={() => setStudentForm({ ...studentForm, gender: 'P' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Perempuan (P)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {isEditModalOpen ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Upload Data Siswa (CSV Template Import)     */}
      {/* ==================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Import Data Siswa Massal (CSV)</h3>
                  <p className="text-xs text-slate-500">Unggah berkas CSV sesuai format template yang disediakan</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Template Download Prompt */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-sky-900 block">Belum punya format CSV?</span>
                  <span className="text-[11px] text-sky-700 block">
                    Unduh file template resmi dengan kolom nama, nisn, kelas, dan jurusan.
                  </span>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Drag & Drop File Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {importFileName ? `Berkas terpilih: ${importFileName}` : 'Klik untuk memilih berkas CSV dari komputer'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">Mendukung format koma (,) atau titik koma (;)</span>
                </div>
              </div>

              {/* Preview Table if file parsed */}
              {csvPreviewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({csvPreviewData.length} Siswa Terdeteksi)
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Siap diimpor
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Nama</th>
                          <th className="py-2 px-3">NISN</th>
                          <th className="py-2 px-3">Kelas</th>
                          <th className="py-2 px-3">Jurusan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreviewData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-800">{row.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{row.nisn}</td>
                            <td className="py-2 px-3 text-blue-700">{row.kelasNama}</td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">{row.jurusanNama}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreviewData.length > 10 && (
                    <p className="text-[11px] text-slate-400 text-center">
                      ...dan {csvPreviewData.length - 10} baris data lainnya
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={csvPreviewData.length === 0}
                onClick={handleExecuteImport}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Impor {csvPreviewData.length} Siswa Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Delete Student Confirmation                 */}
      {/* ==================================================== */}
      {isDeleteModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Data Siswa?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus data siswa{' '}
                <strong className="text-slate-800 font-bold">{selectedStudentForAction.name}</strong> (NISN:{' '}
                {selectedStudentForAction.nisn || '-'})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {cardModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Kartu Pelajar & Barcode Presensi</h3>
                  <p className="text-xs text-slate-500">{cardModalStudent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setCardModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rendered Card in modal */}
            <div className="flex justify-center p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
              <div
                className="relative overflow-hidden rounded-xl shadow-xl border-2 border-sky-400 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white flex flex-col justify-between p-3.5 select-none"
                style={{ width: '340px', height: '215px', aspectRatio: '85.6 / 53.98' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-300" />
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-tight">SMK MUHAMMADIYAH 1 NGAWEN</h4>
                      <p className="text-[7.5px] text-white/70">NPSN: 20338514 • SIAKAD DIGITAL</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-white/20 text-white">
                    KARTU PELAJAR
                  </span>
                </div>

                {/* Body */}
                <div className="flex items-center gap-2.5 py-1">
                  <img
                    src={cardModalStudent.avatar}
                    alt={cardModalStudent.name}
                    className="w-14 h-17 rounded-lg object-cover border border-white/80 shadow shrink-0"
                  />
                  <div className="min-w-0 text-left text-white flex-1">
                    <table className="w-full border-collapse text-[7.5px] leading-tight">
                      <tbody>
                        <tr>
                          <td className="w-[48px] text-white/70 font-semibold py-0.5 whitespace-nowrap">Nama</td>
                          <td className="w-[6px] text-white/60 font-bold py-0.5 text-center">:</td>
                          <td className="font-black text-white uppercase truncate max-w-[120px] py-0.5 tracking-tight text-[8px]">
                            {cardModalStudent.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">NISN</td>
                          <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                          <td className="font-bold text-amber-300 font-mono tracking-wider py-0.5 text-[8px]">
                            {cardModalStudent.nisn || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">Kelas</td>
                          <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                          <td className="font-bold text-white py-0.5">
                            <span className="bg-white/20 px-1 py-0.2 rounded inline-block text-[7.5px]">
                              {cardModalStudent.kelasNama || '-'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">Wali Kelas</td>
                          <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                          <td className="font-medium text-white/95 truncate max-w-[120px] py-0.5 text-[7.5px]">
                            {classes.find(c => c.id === cardModalStudent.kelasId || c.nama === cardModalStudent.kelasNama)?.waliKelasNama || 'Budi Santoso S.Pd'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="shrink-0 bg-white p-1 rounded-xl shadow-md border-2 border-white/80 ml-auto flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={JSON.stringify({ id: cardModalStudent.id, nisn: cardModalStudent.nisn, nama: cardModalStudent.name })}
                      size={54}
                      level="H"
                      marginSize={1}
                    />
                    <span className="text-[6px] font-black text-slate-900 mt-0.5 tracking-tight uppercase bg-amber-300 px-1 rounded">
                      SCAN SISWA
                    </span>
                  </div>
                </div>

                {/* Barcode Footer */}
                <div className="bg-white p-1 rounded-lg flex justify-center overflow-hidden">
                  <BarcodeRenderer value={cardModalStudent.nisn || '0000000000'} width={1.1} height={22} fontSize={7.5} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">Mendukung scan kamera & barcode 1D</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDownloadSingleCard(cardModalStudent)}
                  disabled={isCardDownloading}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-sky-300" />
                  <span>Unduh PDF PVC</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadSingleStudentCardPDF(cardModalStudent, {
                      schoolSettings,
                      classes,
                      side: 'bolak-balik',
                      layout: 'a4-grid',
                    });
                    showToast(`✅ Berhasil mengunduh Kartu Pelajar ${cardModalStudent.name} (Lembar A4)!`);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Unduh Lembar A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Batch / Single Card Download (DaftarSiswa)  */}
      {/* ==================================================== */}
      {isCardDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unduh Kartu Siswa (PDF)</h3>
                  <p className="text-xs text-slate-500">Pilihan unduh semua siswa atau per rombel/siswa.</p>
                </div>
              </div>
              <button
                onClick={() => !isCardDownloading && setIsCardDownloadModalOpen(false)}
                disabled={isCardDownloading}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-2">1. Pilih Target Siswa</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardDownloadTarget('filtered')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cardDownloadTarget === 'filtered'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold">Rombel Aktif</span>
                    <span className="text-[10px] text-slate-500">{filteredStudents.length} Siswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardDownloadTarget('all')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cardDownloadTarget === 'all'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold">Semua Siswa</span>
                    <span className="text-[10px] text-slate-500">{allStudents.length} Siswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardDownloadTarget('single')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cardDownloadTarget === 'single'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold">Satu Siswa</span>
                    <span className="text-[10px] text-slate-500">Pilih nama</span>
                  </button>
                </div>
              </div>

              {cardDownloadTarget === 'single' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pilih Siswa:</label>
                  <select
                    value={cardDownloadStudent?.id || filteredStudents[0]?.id}
                    onChange={(e) => {
                      const found = allStudents.find((s) => s.id === e.target.value);
                      if (found) setCardDownloadStudent(found);
                    }}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.kelasNama || '-'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">2. Sisi Kartu</label>
                  <select
                    value={cardDownloadSide}
                    onChange={(e) => setCardDownloadSide(e.target.value as 'depan' | 'belakang' | 'bolak-balik')}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="depan">Depan Saja</option>
                    <option value="belakang">Belakang Saja</option>
                    <option value="bolak-balik">Bolak-Balik</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">3. Format PDF</label>
                  <select
                    value={cardDownloadLayout}
                    onChange={(e) => setCardDownloadLayout(e.target.value as 'pvc-single' | 'a4-grid')}
                    disabled={cardDownloadTarget !== 'single'}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl disabled:opacity-60"
                  >
                    <option value="a4-grid">Lembar A4 Grid</option>
                    <option value="pvc-single">ID Card PVC (85.6 × 54 mm)</option>
                  </select>
                </div>
              </div>

              {isCardDownloading && cardDownloadProgress && (
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      Membuat berkas PDF...
                    </span>
                    <span>
                      {cardDownloadProgress.current} / {cardDownloadProgress.total} Siswa
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-200"
                      style={{
                        width: `${Math.round((cardDownloadProgress.current / cardDownloadProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCardDownloadModalOpen(false)}
                disabled={isCardDownloading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCardDownload}
                disabled={isCardDownloading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                {isCardDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Membuat PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Unduh PDF Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
