import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Barcode as BarcodeIcon,
  Printer,
  Download,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  RotateCw,
  Layers,
  Award,
  CheckSquare,
  Square,
  RefreshCw,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  Sliders,
  CreditCard,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  UserCheck,
  GraduationCap,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { User, Kelas, Jurusan, AbsensiRecord, SchoolSettings } from '../../types';
import { exportToCSV } from '../../utils/csvHelper';
import {
  downloadSingleStudentCardPDF,
  downloadBatchStudentCardsPDF,
  CardTheme,
  CardSideOption,
  CardPageLayout,
} from '../../utils/studentCardPdf';

interface KartuAbsensiSiswaProps {
  currentUser: User;
  users: User[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  attendanceList: AbsensiRecord[];
  onAddAttendance: (record: AbsensiRecord) => void;
  schoolSettings?: SchoolSettings;
}

type CardTab = 'studio' | 'massal' | 'scanner' | 'kartu-saya';

// Sub-component to render high-contrast 1D Barcode with JsBarcode
export const BarcodeRenderer: React.FC<{
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  lineColor?: string;
  background?: string;
}> = ({
  value,
  width = 1.3,
  height = 36,
  displayValue = true,
  fontSize = 10,
  lineColor = '#000000',
  background = 'transparent',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Sanitize value for Code128
        const cleanVal = value.trim() || '0000000000';
        JsBarcode(svgRef.current, cleanVal, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          font: 'monospace',
          lineColor,
          background,
          margin: 1,
        });
      } catch (err) {
        console.warn('JsBarcode render error:', err);
      }
    }
  }, [value, width, height, displayValue, fontSize, lineColor, background]);

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
};

// Web Audio API Beep Generator for instant auditory feedback
const playAudioFeedback = (type: 'success' | 'error' | 'already') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Pleasant high double beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.18);
      }, 90);
    } else if (type === 'already') {
      // Neutral double beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      // Low warning buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Ignore audio permission errors
  }
};

export const KartuAbsensiSiswa: React.FC<KartuAbsensiSiswaProps> = ({
  currentUser,
  users,
  classes,
  jurusanList,
  attendanceList,
  onAddAttendance,
  schoolSettings,
}) => {
  // Available students
  const allStudents = useMemo(() => users.filter((u) => u.role === 'siswa'), [users]);

  // Initial tab based on user role
  const isStudentOrParent = currentUser.role === 'siswa' || currentUser.role === 'orangtua';
  const [activeTab, setActiveTab] = useState<CardTab>(isStudentOrParent ? 'kartu-saya' : 'studio');

  // Selected student for Studio single view
  const initialStudent = useMemo(() => {
    if (currentUser.role === 'siswa') return currentUser;
    if (currentUser.role === 'orangtua' && currentUser.childStudentId) {
      return allStudents.find((s) => s.id === currentUser.childStudentId) || allStudents[0];
    }
    return allStudents[0] || currentUser;
  }, [currentUser, allStudents]);

  const [selectedStudent, setSelectedStudent] = useState<User>(initialStudent);
  const [cardSide, setCardSide] = useState<'depan' | 'belakang'>('depan');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('navy');

  // Card Customization Options
  const [showPhoto, setShowPhoto] = useState(true);
  const [show1DBarcode, setShow1DBarcode] = useState(true);
  const [showQRCode, setShowQRCode] = useState(true);
  const [qrSize, setQrSize] = useState<number>(60); // Default enlarged QR size (was 42px)
  const [qrErrorCorrection, setQrErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [cardLayout, setCardLayout] = useState<'standard' | 'qr-focus' | 'dual-scan'>('standard');
  const [showHologram, setShowHologram] = useState(true);
  const [showStampKepsek, setShowStampKepsek] = useState(true);
  const [customValidity, setCustomValidity] = useState('T.A. 2025 / 2026');

  // Batch Multi-Card Printing State
  const [batchKelasFilter, setBatchKelasFilter] = useState<string>('all');
  const [batchJurusanFilter, setBatchJurusanFilter] = useState<string>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');
  const [selectedStudentIdsForPrint, setSelectedStudentIdsForPrint] = useState<string[]>([]);
  const [batchPrintSide, setBatchPrintSide] = useState<'depan' | 'belakang' | 'bolak-balik'>('depan');
  const [cardsPerPage, setCardsPerPage] = useState<number>(8); // 8 or 10 per A4

  // Filtered Students for Batch Mode
  const filteredBatchStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (batchKelasFilter !== 'all' && s.kelasNama !== batchKelasFilter && s.kelasId !== batchKelasFilter) {
        return false;
      }
      if (batchJurusanFilter !== 'all') {
        const jName = s.jurusanNama || '';
        if (!jName.toLowerCase().includes(batchJurusanFilter.toLowerCase()) && s.jurusanId !== batchJurusanFilter) {
          return false;
        }
      }
      if (batchSearchQuery) {
        const q = batchSearchQuery.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          (s.nisn && s.nisn.includes(q)) ||
          (s.kelasNama && s.kelasNama.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allStudents, batchKelasFilter, batchJurusanFilter, batchSearchQuery]);

  // Handle select all for batch print
  const handleToggleSelectAll = () => {
    if (selectedStudentIdsForPrint.length === filteredBatchStudents.length && filteredBatchStudents.length > 0) {
      setSelectedStudentIdsForPrint([]);
    } else {
      setSelectedStudentIdsForPrint(filteredBatchStudents.map((s) => s.id));
    }
  };

  const handleSelectFirstN = (count: number) => {
    const slice = filteredBatchStudents.slice(0, count).map((s) => s.id);
    setSelectedStudentIdsForPrint(slice);
  };

  const handleClearSelection = () => {
    setSelectedStudentIdsForPrint([]);
  };

  const handleToggleStudentSelect = (studentId: string) => {
    setSelectedStudentIdsForPrint((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Scanner Station State
  const [scannerInput, setScannerInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedHistory, setScannedHistory] = useState<
    Array<{
      id: string;
      student: User;
      timestamp: string;
      status: 'Hadir' | 'Terlambat';
      message: string;
    }>
  >([]);

  // =========================================================================
  // DOWNLOAD KARTU MODAL & EXPORT STATE
  // =========================================================================
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<'selected' | 'filtered' | 'checked' | 'all'>('selected');
  const [downloadTargetStudentId, setDownloadTargetStudentId] = useState<string>(initialStudent?.id || '');
  const [downloadSide, setDownloadSide] = useState<CardSideOption>('depan');
  const [downloadLayout, setDownloadLayout] = useState<CardPageLayout>('pvc-single');
  const [downloadTheme, setDownloadTheme] = useState<CardTheme>('navy');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [toastDownloadMessage, setToastDownloadMessage] = useState<string | null>(null);

  // Show Toast Message Helper
  const showDownloadToast = (msg: string) => {
    setToastDownloadMessage(msg);
    setTimeout(() => {
      setToastDownloadMessage(null);
    }, 4000);
  };

  // Direct Download Single Card PDF Helper
  const handleDownloadSingleCardPDF = async (
    targetStudent: User = selectedStudent,
    side: CardSideOption = cardSide,
    layout: CardPageLayout = 'pvc-single',
    theme: CardTheme = selectedTheme
  ) => {
    try {
      setIsDownloading(true);
      await downloadSingleStudentCardPDF(targetStudent, {
        theme,
        side,
        layout,
        schoolSettings,
        classes,
        showPhoto,
        show1DBarcode,
        showQRCode,
        showHologram,
        showStampKepsek,
        customValidity,
      });
      showDownloadToast(`✅ Berhasil mengunduh Kartu Pelajar ${targetStudent.name} (${layout === 'pvc-single' ? 'PVC CR80' : 'Lembar A4'})!`);
    } catch (err) {
      console.error('Download card error:', err);
      alert('Gagal mengunduh kartu pelajar. Silakan coba kembali.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Direct Download Batch Cards PDF Helper
  const handleDownloadBatchCardsPDF = async (
    studentsToDownload: User[],
    side: CardSideOption = batchPrintSide,
    theme: CardTheme = selectedTheme,
    layout: CardPageLayout = 'a4-grid'
  ) => {
    if (studentsToDownload.length === 0) {
      alert('Pilih minimal satu siswa untuk diunduh.');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress({ current: 0, total: studentsToDownload.length });
      await downloadBatchStudentCardsPDF(
        studentsToDownload,
        {
          theme,
          side,
          layout,
          schoolSettings,
          classes,
          showPhoto,
          show1DBarcode,
          showQRCode,
          showHologram,
          showStampKepsek,
          customValidity,
        },
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );
      const formatLabel = layout === 'pvc-single' ? 'PDF Multi-Halaman PVC CR80' : 'PDF Lembar A4 Grid';
      showDownloadToast(`🎉 Berhasil mengunduh ${studentsToDownload.length} Kartu Siswa dalam berkas ${formatLabel}!`);
      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error('Batch download card error:', err);
      alert('Gagal membuat file PDF multi-halaman. Silakan coba kembali.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  // Trigger from Download Modal Form
  const handleExecuteModalDownload = async () => {
    if (downloadTarget === 'selected') {
      const targetStudent = allStudents.find((s) => s.id === downloadTargetStudentId) || selectedStudent;
      await handleDownloadSingleCardPDF(targetStudent, downloadSide, downloadLayout, downloadTheme);
      setIsDownloadModalOpen(false);
    } else if (downloadTarget === 'checked') {
      const targetStudents = allStudents.filter((s) => selectedStudentIdsForPrint.includes(s.id));
      if (targetStudents.length === 0) {
        alert('Belum ada siswa yang dicentang. Silakan centang siswa di tab Cetak Massal atau pilih opsi Semua Siswa.');
        return;
      }
      await handleDownloadBatchCardsPDF(targetStudents, downloadSide, downloadTheme, downloadLayout);
    } else if (downloadTarget === 'filtered') {
      await handleDownloadBatchCardsPDF(filteredBatchStudents, downloadSide, downloadTheme, downloadLayout);
    } else {
      // All students
      await handleDownloadBatchCardsPDF(allStudents, downloadSide, downloadTheme, downloadLayout);
    }
  };

  // Open Modal with specific preset
  const handleOpenDownloadModal = (presetTarget?: 'selected' | 'filtered' | 'checked' | 'all') => {
    if (presetTarget) {
      setDownloadTarget(presetTarget);
    }
    setDownloadTargetStudentId(selectedStudent.id);
    setDownloadTheme(selectedTheme);
    setIsDownloadModalOpen(true);
  };
  const [lastScannedResult, setLastScannedResult] = useState<{
    student: User;
    timestamp: string;
    status: 'Hadir' | 'Terlambat';
    isNew: boolean;
  } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Focus scanner input on scanner tab activation
  useEffect(() => {
    if (activeTab === 'scanner') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 300);
    }
  }, [activeTab]);

  // Handle Barcode Scanner Submission (from USB Gun or manual typing)
  const handleProcessBarcodeScan = (scannedCode: string) => {
    const cleanCode = scannedCode.trim();
    if (!cleanCode) return;

    // Search by NISN, ID, username, or parsed JSON QR
    let targetStudent: User | undefined;

    // Check if JSON QR Code payload
    if (cleanCode.startsWith('{') && cleanCode.includes('nisn')) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.nisn) {
          targetStudent = allStudents.find((s) => s.nisn === parsed.nisn || s.id === parsed.id);
        }
      } catch {
        // Not valid JSON, continue with string match
      }
    }

    if (!targetStudent) {
      targetStudent = allStudents.find(
        (s) =>
          s.nisn === cleanCode ||
          s.id === cleanCode ||
          s.username?.toLowerCase() === cleanCode.toLowerCase() ||
          s.name.toLowerCase() === cleanCode.toLowerCase()
      );
    }

    if (!targetStudent) {
      if (soundEnabled) playAudioFeedback('error');
      alert(`⚠️ Siswa dengan Barcode / NISN "${cleanCode}" tidak ditemukan dalam database.`);
      setScannerInput('');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Check if already checked in today
    const existingCheckIn = attendanceList.find((a) => a.siswaId === targetStudent!.id && a.tanggal === todayStr);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const isLate = currentHour > 7 || (currentHour === 7 && currentMin > 15); // Late after 07:15 WIB
    const attendanceStatus: 'Hadir' = 'Hadir';

    if (!existingCheckIn) {
      const newAttendanceRecord: AbsensiRecord = {
        id: `att-barcode-${Date.now()}-${targetStudent.id}`,
        siswaId: targetStudent.id,
        siswaNama: targetStudent.name,
        nisn: targetStudent.nisn || '',
        kelasId: targetStudent.kelasId || targetStudent.kelasNama || '',
        kelasNama: targetStudent.kelasNama || '',
        jurusanNama: targetStudent.jurusanNama || '',
        tanggal: todayStr,
        waktu: nowTimeStr,
        status: attendanceStatus,
        tipeAbsensi: 'Harian',
        jarakKeSekolahMeter: 0,
        metodePresensi: 'Barcode/QR Card Scan',
        catatan: isLate ? 'Presensi Barcode Gerbang (Terlambat)' : 'Presensi Barcode Gerbang (Tepat Waktu)',
      };

      onAddAttendance(newAttendanceRecord);
      if (soundEnabled) playAudioFeedback('success');

      setLastScannedResult({
        student: targetStudent,
        timestamp: nowTimeStr,
        status: isLate ? 'Terlambat' : 'Hadir',
        isNew: true,
      });

      setScannedHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          student: targetStudent!,
          timestamp: nowTimeStr,
          status: isLate ? 'Terlambat' : 'Hadir',
          message: isLate ? 'Hadir Terlambat' : 'Hadir Tepat Waktu',
        },
        ...prev,
      ]);
    } else {
      if (soundEnabled) playAudioFeedback('already');
      setLastScannedResult({
        student: targetStudent,
        timestamp: existingCheckIn.waktu || nowTimeStr,
        status: existingCheckIn.catatan?.includes('Terlambat') ? 'Terlambat' : 'Hadir',
        isNew: false,
      });
    }

    setScannerInput('');
    barcodeInputRef.current?.focus();
  };

  // Print Single Card
  const handlePrintSingleCard = () => {
    window.print();
  };

  // Export Scanned Attendance Log
  const handleExportScanLogs = () => {
    if (scannedHistory.length === 0) {
      alert('Belum ada data riwayat scan presensi pada sesi ini.');
      return;
    }
    const headers = ['No', 'Waktu Scan', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Status Presensi', 'Keterangan'];
    const rows = scannedHistory.map((item, idx) => [
      idx + 1,
      item.timestamp,
      item.student.nisn || '-',
      item.student.name,
      item.student.kelasNama || '-',
      item.student.jurusanNama || '-',
      item.status,
      item.message,
    ]);
    exportToCSV(`Log_Presensi_Barcode_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // School Metadata info from props
  const schoolName = schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN';
  const schoolNpsn = schoolSettings?.npsn || '20338514';
  const schoolAddress = schoolSettings?.alamatSekolah || 'Jl. Raya Ngawen KM 1, Gunungkidul, D.I. Yogyakarta';
  const schoolKepsek = schoolSettings?.kepalaSekolah || 'Drs. H. Bambang Sujarwo, M.Pd.';
  const schoolNipKepsek = schoolSettings?.nipKepalaSekolah || '1092837';
  const schoolTipeKepsek = schoolSettings?.tipeNomorKepalaSekolah || 'NBM';
  const schoolLogo = schoolSettings?.logoUrl;

  // Color Theme Mapping Classes
  const getThemeStyles = (theme: CardTheme) => {
    switch (theme) {
      case 'emerald':
        return {
          primaryBg: 'from-emerald-800 via-teal-800 to-emerald-950',
          accentBorder: 'border-emerald-400',
          headerBg: 'bg-emerald-900/90 text-emerald-100',
          badgeBg: 'bg-emerald-500 text-white',
          chipColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          sealColor: 'text-emerald-300',
          cardBackPattern: 'bg-emerald-950 text-emerald-100',
          footerLine: 'bg-emerald-500',
        };
      case 'crimson':
        return {
          primaryBg: 'from-rose-900 via-red-900 to-amber-950',
          accentBorder: 'border-amber-400',
          headerBg: 'bg-rose-950/90 text-rose-100',
          badgeBg: 'bg-amber-500 text-slate-900',
          chipColor: 'bg-rose-50 text-rose-950 border-amber-300',
          sealColor: 'text-amber-300',
          cardBackPattern: 'bg-rose-950 text-rose-100',
          footerLine: 'bg-amber-500',
        };
      case 'slate':
        return {
          primaryBg: 'from-slate-900 via-slate-800 to-zinc-950',
          accentBorder: 'border-cyan-400',
          headerBg: 'bg-slate-950/90 text-cyan-200',
          badgeBg: 'bg-cyan-500 text-slate-950',
          chipColor: 'bg-slate-100 text-slate-900 border-cyan-300',
          sealColor: 'text-cyan-400',
          cardBackPattern: 'bg-slate-950 text-slate-200',
          footerLine: 'bg-cyan-400',
        };
      case 'amber':
        return {
          primaryBg: 'from-amber-900 via-yellow-900 to-stone-950',
          accentBorder: 'border-amber-400',
          headerBg: 'bg-amber-950/90 text-amber-100',
          badgeBg: 'bg-amber-500 text-slate-900',
          chipColor: 'bg-amber-50 text-amber-950 border-amber-300',
          sealColor: 'text-amber-300',
          cardBackPattern: 'bg-amber-950 text-amber-100',
          footerLine: 'bg-amber-400',
        };
      case 'navy':
      default:
        return {
          primaryBg: 'from-blue-900 via-indigo-900 to-slate-950',
          accentBorder: 'border-sky-400',
          headerBg: 'bg-blue-950/90 text-sky-200',
          badgeBg: 'bg-sky-500 text-slate-950',
          chipColor: 'bg-sky-50 text-blue-950 border-sky-300',
          sealColor: 'text-sky-300',
          cardBackPattern: 'bg-slate-950 text-sky-100',
          footerLine: 'bg-sky-400',
        };
    }
  };

  const themeStyle = getThemeStyles(selectedTheme);

  // Helper to render ID Card Front
  const renderCardFront = (student: User, isMini: boolean = false) => {
    const studentNisn = student.nisn || '0061234567';
    const qrPayload = JSON.stringify({
      id: student.id,
      nisn: studentNisn,
      nama: student.name,
      kelas: student.kelasNama || '-',
      jurusan: student.jurusanNama || '-',
      sekolah: schoolName,
      type: 'SIAKAD_STUDENT_CARD_V1',
    });

    // Determine dynamic size for QR code
    const effectiveQrSize = isMini ? Math.min(qrSize, 48) : qrSize;

    const getWaliKelas = (s: User) => {
      const match = classes.find((c) => c.id === s.kelasId || c.nama === s.kelasNama);
      return match?.waliKelasNama || 'Budi Santoso S.Pd';
    };

    const studentWaliKelas = getWaliKelas(student);

    return (
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl border-2 ${themeStyle.accentBorder} bg-gradient-to-br ${themeStyle.primaryBg} text-white flex flex-col justify-between select-none print:shadow-none print:border print:m-1`}
        style={{
          width: isMini ? '100%' : '380px',
          height: isMini ? '240px' : '240px',
          aspectRatio: '85.6 / 53.98',
        }}
      >
        {/* Background Watermark Pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <GraduationCap className="w-56 h-56 text-white" />
        </div>
        <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Card Header */}
        <div className="px-3.5 pt-2 pb-1.5 flex items-center justify-between border-b border-white/15 bg-black/25 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="w-7 h-7 object-contain rounded-full bg-white p-0.5" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <h4 className="text-[9.5px] font-black uppercase tracking-tight leading-tight line-clamp-1">
                {schoolName}
              </h4>
              <p className="text-[7.5px] text-white/70 leading-none">NPSN: {schoolNpsn} • SIAKAD DIGITAL</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wider bg-white/20 border border-white/30 text-white inline-block">
              KARTU PELAJAR
            </span>
          </div>
        </div>

        {/* Card Body: Photo, Student Biodata & Enlarged QR Code */}
        <div className="px-3 py-1 flex items-center gap-2.5 relative z-10">
          {/* Student Photo */}
          {showPhoto && (
            <div className="relative shrink-0">
              <div
                className={`rounded-lg overflow-hidden border-2 border-white/80 shadow-md bg-slate-800 ${
                  effectiveQrSize > 65 ? 'w-14 h-18' : 'w-16 h-20'
                }`}
              >
                <img
                  src={student.avatar || `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
              {showHologram && (
                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-400 to-cyan-400 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Details - Presisi, Rapi, Terstruktur */}
          <div className="flex-1 min-w-0 text-left">
            <table className="w-full border-collapse text-[7.5px] leading-tight">
              <tbody>
                <tr>
                  <td className="w-[50px] text-white/70 font-semibold py-0.5 whitespace-nowrap">Nama</td>
                  <td className="w-[6px] text-white/60 font-bold py-0.5 text-center">:</td>
                  <td className="font-black text-white uppercase truncate max-w-[130px] py-0.5 tracking-tight text-[8.5px]">
                    {student.name}
                  </td>
                </tr>
                <tr>
                  <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">NISN</td>
                  <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                  <td className="font-bold text-amber-300 font-mono tracking-wider py-0.5 text-[8px]">
                    {studentNisn}
                  </td>
                </tr>
                <tr>
                  <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">Kelas</td>
                  <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                  <td className="font-bold text-white py-0.5">
                    <span className="bg-white/20 px-1 py-0.2 rounded inline-block text-[7.5px]">
                      {student.kelasNama || '10 TKJ 1'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-white/70 font-semibold py-0.5 whitespace-nowrap">Wali Kelas</td>
                  <td className="text-white/60 font-bold py-0.5 text-center">:</td>
                  <td className="font-medium text-white/95 truncate max-w-[130px] py-0.5 text-[7.5px]">
                    {studentWaliKelas}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Enlarged QR Code Box with Crisp High Contrast */}
          {showQRCode && (
            <div className="shrink-0 bg-white p-1 rounded-xl shadow-lg border-2 border-white/80 flex flex-col items-center justify-center">
              <QRCodeSVG
                value={qrPayload}
                size={effectiveQrSize}
                level={qrErrorCorrection}
                marginSize={1}
              />
              <span className="text-[6px] font-black text-slate-900 mt-0.5 tracking-tight uppercase bg-amber-300 px-1 rounded">
                SCAN SISWA
              </span>
            </div>
          )}
        </div>

        {/* Card Footer: 1D Barcode with White Container */}
        {show1DBarcode ? (
          <div className="mx-2.5 mb-1.5 p-0.5 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div className="w-full flex justify-center overflow-hidden">
              <BarcodeRenderer value={studentNisn} width={1.2} height={effectiveQrSize > 65 ? 20 : 24} fontSize={7.5} />
            </div>
          </div>
        ) : (
          <div className="h-2" />
        )}
      </div>
    );
  };

  // Helper to render ID Card Back
  const renderCardBack = (student: User, isMini: boolean = false) => {
    const studentNisn = student.nisn || '0061234567';
    const qrPayload = JSON.stringify({
      id: student.id,
      nisn: studentNisn,
      nama: student.name,
      kelas: student.kelasNama || '-',
      sekolah: schoolName,
      type: 'SIAKAD_STUDENT_CARD_V1',
    });

    const backQrSize = isMini ? 48 : Math.max(56, Math.min(78, qrSize + 4));

    return (
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl border-2 ${themeStyle.accentBorder} ${themeStyle.cardBackPattern} flex flex-col justify-between select-none p-3 print:shadow-none print:border print:m-1`}
        style={{
          width: isMini ? '100%' : '380px',
          height: isMini ? '240px' : '240px',
          aspectRatio: '85.6 / 53.98',
        }}
      >
        {/* Top Header */}
        <div className="border-b border-white/20 pb-1 flex items-center justify-between">
          <div>
            <h4 className="text-[9px] font-black tracking-wide uppercase text-amber-300">
              KETENTUAN KARTU PRESENSI
            </h4>
            <p className="text-[7px] text-white/70">Sistem Informasi Akademik & Presensi Gerbang</p>
          </div>
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          </div>
        </div>

        {/* Rules Body & Enlarged Back QR Code */}
        <div className="grid grid-cols-12 gap-2 py-1 items-center">
          <div className="col-span-7 space-y-1 text-[7px] text-white/90 leading-tight">
            <p>1. Wajib dibawa setiap hari sekolah untuk presensi barcode gerbang & kelas.</p>
            <p>2. Dilarang memindahtangankan kartu kepada siswa lain.</p>
            <p>3. Kartu ini juga berfungsi sebagai kartu akses Perpustakaan Digital.</p>
            <p>4. Jika kartu hilang, segera lapor ke Tata Usaha / Admin.</p>
          </div>

          {/* Enlarged Quick Verification QR Code */}
          <div className="col-span-5 flex flex-col items-center justify-center bg-white/10 p-1.5 rounded-xl border border-white/20 shadow-sm">
            <div className="bg-white p-1 rounded-lg shadow">
              <QRCodeSVG
                value={qrPayload}
                size={backQrSize}
                level={qrErrorCorrection}
                marginSize={1}
              />
            </div>
            <span className="text-[6.5px] font-extrabold text-amber-200 mt-1 uppercase tracking-wider text-center">
              NISN: {studentNisn}
            </span>
          </div>
        </div>

        {/* Footer: Kepsek Signature Box & Address */}
        <div className="border-t border-white/20 pt-1 flex items-end justify-between text-[7px]">
          <div className="space-y-0.5">
            <p className="text-[6.5px] text-white/60 line-clamp-1">{schoolAddress}</p>
            <p className="text-[6.5px] text-white/60">Portal: {schoolSettings?.website || 'siakad.sch.id'}</p>
          </div>

          {showStampKepsek && (
            <div className="text-center relative pr-2">
              <p className="text-[6.5px] text-white/80">Kepala Sekolah,</p>
              <div className="h-3.5 flex items-center justify-center my-0.5">
                <span className="font-serif italic text-[8.5px] text-sky-200 font-bold tracking-widest opacity-85">
                  [Ttd & Cap]
                </span>
              </div>
              <p className="font-bold underline text-[7px] text-white leading-none">{schoolKepsek}</p>
              <p className="text-[6px] text-white/70">
                {schoolTipeKepsek === 'Tanpa Nomor' || !schoolNipKepsek
                  ? '-'
                  : `${schoolTipeKepsek}. ${schoolNipKepsek}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10">
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>SISTEM KARTU PRESENSI SISWA & BARCODE SCANNER</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Kartu Pelajar & Presensi Barcode Digital
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Cetak kartu tanda siswa resmi dilengkapi Barcode 1D (Code 128) dan QR Code 2D untuk presensi instan gerbang sekolah, perpustakaan digital, serta pemindai barcode otomatis dengan scanner kamera maupun USB barcode gun.
            </p>
          </div>

          {/* Header Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenDownloadModal('selected')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Unduh Kartu (Semua / Persiswa)</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-emerald-600/30"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Stasiun Scan Barcode</span>
            </button>

            <button
              onClick={() => setActiveTab('massal')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Massal Rombel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Studio Desain Kartu</span>
          </button>

          <button
            onClick={() => setActiveTab('massal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'massal'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>2. Cetak Lembar Massal A4</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-100 text-indigo-800 font-semibold">
              {allStudents.length} Siswa
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>3. Stasiun Scan Presensi</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800 font-semibold animate-pulse">
              Live Scanner
            </span>
          </button>

          {isStudentOrParent && (
            <button
              onClick={() => setActiveTab('kartu-saya')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kartu-saya'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Kartu Digital Saya</span>
            </button>
          )}
        </div>

        {/* Current Active Student Selector (For Studio Mode) */}
        {activeTab === 'studio' && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Pilih Siswa:</span>
            <select
              value={selectedStudent.id}
              onChange={(e) => {
                const found = allStudents.find((s) => s.id === e.target.value);
                if (found) setSelectedStudent(found);
              }}
              className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none max-w-[220px]"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.kelasNama || '10 IPA 1'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDIO DESAIN & PREVIEW KARTU                                      */}
      {/* ========================================================================= */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Card Stage & Flip View */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
              {/* Subtle background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

              {/* Front / Back Toggle Buttons Floating */}
              <div className="relative z-10 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 mb-6 shadow-md">
                <button
                  onClick={() => setCardSide('depan')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardSide === 'depan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tampak Depan (Biodata & Barcode)
                </button>
                <button
                  onClick={() => setCardSide('belakang')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardSide === 'belakang' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tampak Belakang (Ketentuan & QR)
                </button>
              </div>

              {/* Rendered Live Card Component */}
              <div className="relative z-10 transform transition-all duration-300 hover:scale-[1.02]">
                {cardSide === 'depan' ? renderCardFront(selectedStudent) : renderCardBack(selectedStudent)}
              </div>

              {/* Card Specs Badge */}
              <div className="relative z-10 mt-6 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Ukuran Standar ID Card PVC: 85.6 × 54 mm (CR80)</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Barcode Code 128 Siap Scan
                </span>
              </div>
            </div>

            {/* Quick Action Bar under Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Format siap cetak printer thermal ID Card PVC (CR80) atau lembar A4.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDownloadSingleCardPDF(selectedStudent, cardSide, 'pvc-single', selectedTheme)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="Unduh file PDF ukuran ID Card PVC standar 85.6 x 54 mm"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Unduh PDF PVC ({cardSide === 'depan' ? 'Depan' : 'Belakang'})</span>
                </button>

                <button
                  onClick={() => handleDownloadSingleCardPDF(selectedStudent, 'bolak-balik', 'a4-grid', selectedTheme)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="Unduh lembar A4 berisi tampak depan & belakang siap potong"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Unduh PDF Lembar A4</span>
                </button>

                <button
                  onClick={() => handleOpenDownloadModal('selected')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  title="Opsi unduh kartu lengkap..."
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Opsi Unduh...</span>
                </button>

                <button
                  onClick={handlePrintSingleCard}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Student Biodata */}
          <div className="lg:col-span-5 space-y-5">
            {/* Theme Presets */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Pilih Tema & Gaya Warna Kartu</span>
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {(
                  [
                    { id: 'navy', label: 'Royal Navy', color: 'bg-blue-900' },
                    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-800' },
                    { id: 'crimson', label: 'Crimson', color: 'bg-rose-900' },
                    { id: 'slate', label: 'Titanium', color: 'bg-slate-900' },
                    { id: 'amber', label: 'Bronze', color: 'bg-amber-800' },
                  ] as const
                ).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${theme.color} shadow-sm`} />
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Size & Sharpness Customizer Section */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan Ukuran & Ketajaman QR Code</span>
                </h3>
                <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {qrSize} px
                </span>
              </div>

              {/* Quick Size Preset Buttons */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">Pilihan Cepat Ukuran QR Code:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Kecil', size: 44, desc: '44px' },
                    { label: 'Standar', size: 56, desc: '56px' },
                    { label: 'Besar', size: 68, desc: '68px' },
                    { label: 'Jumbo', size: 82, desc: '82px' },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => {
                        setQrSize(preset.size);
                        if (!showQRCode) setShowQRCode(true);
                      }}
                      className={`px-2 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        qrSize === preset.size
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <span className="text-xs leading-tight">{preset.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Exact QR Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Presisi Ukuran Manual (Slider)</span>
                  <span className="text-slate-500 font-mono">{qrSize}px (Rentang 36px - 88px)</span>
                </div>
                <input
                  type="range"
                  min={36}
                  max={88}
                  step={2}
                  value={qrSize}
                  onChange={(e) => {
                    setQrSize(Number(e.target.value));
                    if (!showQRCode) setShowQRCode(true);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Error Correction Level */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-600">
                  Tingkat Koreksi Error (Kecepatan & Daya Tahan Scan):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQrErrorCorrection('H')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      qrErrorCorrection === 'H'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Level H (Anti-Lecet / 30%)</span>
                    {qrErrorCorrection === 'H' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrErrorCorrection('M')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      qrErrorCorrection === 'M'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Level M (Standar Cepat)</span>
                    {qrErrorCorrection === 'M' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Elements & Validity */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Opsi Tampilan & Elemen Keamanan</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                  <span className="font-semibold">Foto Profil Siswa</span>
                  <input
                    type="checkbox"
                    checked={showPhoto}
                    onChange={(e) => setShowPhoto(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                  <span className="font-semibold">Barcode 1D (Code 128 - NISN)</span>
                  <input
                    type="checkbox"
                    checked={show1DBarcode}
                    onChange={(e) => setShow1DBarcode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                  <span className="font-semibold">QR Code 2D (Verifikasi Digital)</span>
                  <input
                    type="checkbox"
                    checked={showQRCode}
                    onChange={(e) => setShowQRCode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                  <span className="font-semibold">Lencana Hologram Anti-Pemalsuan</span>
                  <input
                    type="checkbox"
                    checked={showHologram}
                    onChange={(e) => setShowHologram(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                  <span className="font-semibold">Tanda Tangan & Stempel Kepala Sekolah</span>
                  <input
                    type="checkbox"
                    checked={showStampKepsek}
                    onChange={(e) => setShowStampKepsek(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Masa Berlaku Kartu</label>
                <input
                  type="text"
                  value={customValidity}
                  onChange={(e) => setCustomValidity(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="Contoh: T.A. 2025 / 2026 atau Selama Menjadi Siswa"
                />
              </div>
            </div>

            {/* Selected Student Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Informasi Siswa Terpilih</span>
                <span className="text-xs text-blue-600 font-semibold">{selectedStudent.kelasNama || '10 IPA 1'}</span>
              </h3>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{selectedStudent.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {selectedStudent.nisn || '-'}</p>
                  <p className="text-[11px] text-slate-500">{selectedStudent.jurusanNama || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CETAK MASSAL LEMBAR A4                                            */}
      {/* ========================================================================= */}
      {activeTab === 'massal' && (
        <div className="space-y-5">
          {/* Controls Bar for Batch Printing */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cetak Massal Kartu Siswa Lembar A4 (Grid Layout)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih rombel kelas, checklist siswa yang ingin dicetak, lalu klik cetak untuk mencetak layout A4 otomatis dengan garis potong.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleSelectAll}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {selectedStudentIdsForPrint.length === filteredBatchStudents.length && filteredBatchStudents.length > 0 ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      <span>Batal Pilih Semua</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>Pilih Semua ({filteredBatchStudents.length})</span>
                    </>
                  )}
                </button>

                {filteredBatchStudents.length > 10 && (
                  <button
                    onClick={() => handleSelectFirstN(10)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                    title="Pilih 10 siswa pertama"
                  >
                    10 Pertama
                  </button>
                )}

                {filteredBatchStudents.length > 25 && (
                  <button
                    onClick={() => handleSelectFirstN(25)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                    title="Pilih 25 siswa pertama"
                  >
                    25 Pertama
                  </button>
                )}

                {selectedStudentIdsForPrint.length > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-all"
                  >
                    Reset ({selectedStudentIdsForPrint.length})
                  </button>
                )}

                <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                {/* Download A4 Grid */}
                <button
                  onClick={() => {
                    const targetList =
                      selectedStudentIdsForPrint.length > 0
                        ? allStudents.filter((s) => selectedStudentIdsForPrint.includes(s.id))
                        : filteredBatchStudents;
                    handleDownloadBatchCardsPDF(targetList, batchPrintSide, selectedTheme, 'a4-grid');
                  }}
                  disabled={isDownloading || (selectedStudentIdsForPrint.length === 0 && filteredBatchStudents.length === 0)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  title="Unduh berkas PDF Lembar Cetak A4 Grid untuk siswa yang dipilih"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>
                    Unduh PDF A4 ({selectedStudentIdsForPrint.length > 0 ? `${selectedStudentIdsForPrint.length} Siswa` : `Semua ${filteredBatchStudents.length}`})
                  </span>
                </button>

                {/* Download Multi-Page PVC CR80 */}
                <button
                  onClick={() => {
                    const targetList =
                      selectedStudentIdsForPrint.length > 0
                        ? allStudents.filter((s) => selectedStudentIdsForPrint.includes(s.id))
                        : filteredBatchStudents;
                    handleDownloadBatchCardsPDF(targetList, batchPrintSide, selectedTheme, 'pvc-single');
                  }}
                  disabled={isDownloading || (selectedStudentIdsForPrint.length === 0 && filteredBatchStudents.length === 0)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  title="Unduh berkas PDF Multi-Halaman PVC CR80 (1 kartu/halaman) untuk printer ID Card"
                >
                  <CreditCard className="w-4 h-4 text-indigo-200" />
                  <span>Unduh PDF PVC ({selectedStudentIdsForPrint.length > 0 ? selectedStudentIdsForPrint.length : filteredBatchStudents.length})</span>
                </button>

                {/* Open Modal with Options */}
                <button
                  onClick={() => handleOpenDownloadModal(selectedStudentIdsForPrint.length > 0 ? 'checked' : 'filtered')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Buka pengaturan unduhan custom (sisi, tema, layout)"
                >
                  <Sliders className="w-3.5 h-3.5 text-sky-300" />
                  <span>Opsi Lengkap...</span>
                </button>

                {/* Direct Print */}
                <button
                  onClick={() => window.print()}
                  disabled={selectedStudentIdsForPrint.length === 0}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Browser ({selectedStudentIdsForPrint.length})</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter Rombel Kelas</label>
                <select
                  value={batchKelasFilter}
                  onChange={(e) => setBatchKelasFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Kelas ({allStudents.length} Siswa)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.nama}>
                      {cls.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter Jurusan</label>
                <select
                  value={batchJurusanFilter}
                  onChange={(e) => setBatchJurusanFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Jurusan</option>
                  {jurusanList.map((j) => (
                    <option key={j.id} value={j.nama}>
                      {j.nama} ({j.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sisi yang Dicetak</label>
                <select
                  value={batchPrintSide}
                  onChange={(e) => setBatchPrintSide(e.target.value as 'depan' | 'belakang' | 'bolak-balik')}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="depan">Tampak Depan Saja (Biodata & Barcode)</option>
                  <option value="belakang">Tampak Belakang Saja (Ketentuan & QR)</option>
                  <option value="bolak-balik">Bolak-Balik (Depan & Belakang)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari Nama / NISN</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik nama atau NISN..."
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Grid Cards for Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBatchStudents.map((student) => {
              const isSelected = selectedStudentIdsForPrint.includes(student.id);

              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudentSelect(student.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Selection Checkbox Pill */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {student.kelasNama || '10 IPA 1'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center gap-3 my-1">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{student.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn || '-'}</p>
                    </div>
                  </div>

                  {/* Mini Preview Barcode & Quick Download */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-lg">
                    <div className="flex-1 overflow-hidden">
                      <BarcodeRenderer value={student.nisn || '0000000000'} width={0.8} height={18} displayValue={false} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingleCardPDF(student, 'depan', 'pvc-single', selectedTheme);
                      }}
                      title={`Unduh PDF Kartu ${student.name}`}
                      className="p-1.5 rounded-md bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-all shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Sticky Action Bar for Selected Students */}
          {selectedStudentIdsForPrint.length > 0 && (
            <div className="sticky bottom-6 z-30 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                  {selectedStudentIdsForPrint.length}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {selectedStudentIdsForPrint.length} Siswa Terpilih
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Siap diexport sebagai satu berkas PDF multi-halaman
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetList = allStudents.filter((s) => selectedStudentIdsForPrint.includes(s.id));
                    handleDownloadBatchCardsPDF(targetList, batchPrintSide, selectedTheme, 'a4-grid');
                  }}
                  disabled={isDownloading}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Unduh PDF A4</span>
                </button>

                <button
                  onClick={() => {
                    const targetList = allStudents.filter((s) => selectedStudentIdsForPrint.includes(s.id));
                    handleDownloadBatchCardsPDF(targetList, batchPrintSide, selectedTheme, 'pvc-single');
                  }}
                  disabled={isDownloading}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-indigo-200" />
                  <span>Unduh PDF PVC (Multi-Halaman)</span>
                </button>

                <button
                  onClick={() => handleOpenDownloadModal('checked')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-sky-300" />
                  <span>Opsi Lengkap...</span>
                </button>

                <button
                  onClick={handleClearSelection}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all ml-1"
                  title="Batalkan Pilihan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Printable Container for A4 Sheet Batch Print (Optimized with CSS for print media) */}
          <div className="hidden print:block print:w-full">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #print-sheet-area, #print-sheet-area * {
                  visibility: visible;
                }
                #print-sheet-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 10mm;
                  background: white;
                }
                .print-card-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 8mm;
                  page-break-inside: avoid;
                }
                .print-card-item {
                  page-break-inside: avoid;
                  border: 1px dashed #cbd5e1;
                  padding: 2mm;
                  border-radius: 8px;
                }
              }
            `}</style>

            <div id="print-sheet-area">
              <div className="text-center mb-4 border-b pb-2">
                <h2 className="text-lg font-bold">{schoolName}</h2>
                <p className="text-xs text-gray-600">Lembar Cetak Kartu Pelajar & Presensi Barcode Siswa</p>
              </div>

              <div className="print-card-grid">
                {allStudents
                  .filter((s) => selectedStudentIdsForPrint.includes(s.id))
                  .map((student) => (
                    <div key={student.id} className="print-card-item flex flex-col items-center">
                      {(batchPrintSide === 'depan' || batchPrintSide === 'bolak-balik') && (
                        <div className="mb-2">{renderCardFront(student, false)}</div>
                      )}
                      {(batchPrintSide === 'belakang' || batchPrintSide === 'bolak-balik') && (
                        <div>{renderCardBack(student, false)}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STASIUN SCANNER PRESENSI BARCODE CEPAT                             */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Scanner Input Box & Visualizer */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pemindai Barcode Gerbang & Kelas</h3>
                    <p className="text-xs text-slate-400">
                      Mendukung Pemindai USB Barcode Gun Fisik & Input Cepat Kamera
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Suara Beep"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden sm:inline">{soundEnabled ? 'Audio Aktif' : 'Mute'}</span>
                </button>
              </div>

              {/* Barcode Scanner Input Field (Auto Focused) */}
              <div className="bg-slate-950 p-4 rounded-xl border-2 border-emerald-500/50 shadow-inner space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <BarcodeIcon className="w-4 h-4" />
                  <span>Arahkan Scanner Fisik / Ketik Barcode NISN</span>
                </label>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessBarcodeScan(scannerInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Scan kartu siswa atau ketik NISN lalu tekan ENTER..."
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-base font-mono font-bold text-emerald-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-emerald-600/30 shrink-0"
                  >
                    Scan / Catat
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Stasiun Scanner Siap Menerima Sinyal Barcode
                  </span>
                  <span>Tekan Enter untuk konfirmasi instan</span>
                </div>
              </div>

              {/* Quick Simulation Buttons for Demo Testing */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Simulasi Cepat Siswa (Klik untuk Uji Scan):
                </span>
                <div className="flex flex-wrap gap-2">
                  {allStudents.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleProcessBarcodeScan(s.nisn || s.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <BarcodeIcon className="w-3 h-3 text-sky-400" />
                      <span>{s.name.split(' ')[0]} ({s.nisn || 'NISN'})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Last Scanned Result Display Popup */}
            {lastScannedResult && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4">
                  <img
                    src={lastScannedResult.student.avatar}
                    alt={lastScannedResult.student.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                  />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lastScannedResult.isNew ? 'PRESENSI BERHASIL DICATAT' : 'SUDAH PRESENSI HARI INI'}</span>
                    </div>
                    <h3 className="text-base font-bold text-emerald-950 leading-tight">
                      {lastScannedResult.student.name}
                    </h3>
                    <p className="text-xs text-emerald-800 font-mono">
                      NISN: {lastScannedResult.student.nisn} • Kelas: {lastScannedResult.student.kelasNama}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-emerald-700 font-semibold block">Waktu Tercatat:</span>
                  <span className="text-lg font-black text-emerald-900 font-mono">{lastScannedResult.timestamp} WIB</span>
                  <span className={`text-[11px] font-bold block ${lastScannedResult.status === 'Terlambat' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    Status: {lastScannedResult.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Scanned Session Log Stream */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Log Presensi Sesi Ini ({scannedHistory.length})
                  </h3>
                </div>

                <button
                  onClick={handleExportScanLogs}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {scannedHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BarcodeIcon className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Belum ada kartu siswa yang discan pada sesi ini.</p>
                  <p className="text-[11px] text-slate-400">Arahkan scanner ke barcode kartu siswa untuk mulai mencatat.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {scannedHistory.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{item.student.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {item.student.nisn} • {item.student.kelasNama}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-800 block">{item.timestamp}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            item.status === 'Terlambat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KARTU DIGITAL SAYA (KHUSUS SISWA & ORANG TUA)                      */}
      {/* ========================================================================= */}
      {activeTab === 'kartu-saya' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kartu Pelajar & Presensi Digital Anda</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tunjukkan barcode di bawah ini ke layar scanner petugas gerbang sekolah atau kamera presensi kelas untuk konfirmasi kehadiran otomatis.
              </p>
            </div>

            <div className="flex justify-center py-4">
              {renderCardFront(selectedStudent)}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCardSide(cardSide === 'depan' ? 'belakang' : 'depan')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Balik Kartu ({cardSide === 'depan' ? 'Lihat Belakang' : 'Lihat Depan'})</span>
              </button>

              <button
                onClick={() => handleDownloadSingleCardPDF(selectedStudent, 'depan', 'pvc-single', selectedTheme)}
                disabled={isDownloading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Unduh PDF Kartu PVC (CR80)</span>
              </button>

              <button
                onClick={() => handleDownloadSingleCardPDF(selectedStudent, 'bolak-balik', 'a4-grid', selectedTheme)}
                disabled={isDownloading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Unduh PDF Lembar A4</span>
              </button>

              <button
                onClick={handlePrintSingleCard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UNDUH KARTU SISWA (SEMUA ATAU PERSISWA)                            */}
      {/* ========================================================================= */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unduh Kartu Pelajar & Presensi</h3>
                  <p className="text-xs text-slate-500">Pilih opsi unduhan per siswa individu atau massal semua siswa.</p>
                </div>
              </div>
              <button
                onClick={() => !isDownloading && setIsDownloadModalOpen(false)}
                disabled={isDownloading}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              {/* Target Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">1. Pilih Sasaran Siswa yang Diunduh</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      downloadTarget === 'selected'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="downloadTarget"
                      checked={downloadTarget === 'selected'}
                      onChange={() => setDownloadTarget('selected')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Satu Siswa (Per Siswa)</span>
                      <span className="text-[11px] text-slate-500">Unduh kartu untuk satu siswa tertentu.</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      downloadTarget === 'all'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="downloadTarget"
                      checked={downloadTarget === 'all'}
                      onChange={() => setDownloadTarget('all')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Semua Siswa ({allStudents.length} Siswa)</span>
                      <span className="text-[11px] text-slate-500">Unduh seluruh siswa di semua rombel.</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      downloadTarget === 'filtered'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="downloadTarget"
                      checked={downloadTarget === 'filtered'}
                      onChange={() => setDownloadTarget('filtered')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Rombel / Filter Aktif ({filteredBatchStudents.length} Siswa)</span>
                      <span className="text-[11px] text-slate-500">
                        {batchKelasFilter === 'all' ? 'Seluruh Kelas' : `Kelas ${batchKelasFilter}`}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      downloadTarget === 'checked'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="downloadTarget"
                      checked={downloadTarget === 'checked'}
                      onChange={() => setDownloadTarget('checked')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Siswa Dicentang ({selectedStudentIdsForPrint.length} Siswa)</span>
                      <span className="text-[11px] text-slate-500">Hanya siswa yang telah Anda checklist.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Student Dropdown if "selected" */}
              {downloadTarget === 'selected' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-800">Pilih Siswa Spesifik:</label>
                  <select
                    value={downloadTargetStudentId}
                    onChange={(e) => setDownloadTargetStudentId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.kelasNama || '10 IPA 1'} (NISN: {s.nisn || '-'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format & Layout Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">2. Format & Ukuran Dokumen</label>
                  <select
                    value={downloadLayout}
                    onChange={(e) => setDownloadLayout(e.target.value as CardPageLayout)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="a4-grid">Lembar Cetak A4 Grid (8 Kartu / Lembar Siap Potong)</option>
                    <option value="pvc-single">Standard ID Card PVC (CR80: 85.6 × 54 mm Multi-Halaman)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {downloadLayout === 'a4-grid'
                      ? 'Format Lembar A4 efisien untuk diprint pada kertas/stiker A4 lalu dipotong.'
                      : 'Format CR80 PVC 1 kartu per halaman, pas untuk mesin cetak kartu identitas PVC.'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">3. Sisi Kartu</label>
                  <select
                    value={downloadSide}
                    onChange={(e) => setDownloadSide(e.target.value as CardSideOption)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="depan">Tampak Depan Saja (Biodata, Barcode & QR)</option>
                    <option value="belakang">Tampak Belakang Saja (Ketentuan & Ttd Kepsek)</option>
                    <option value="bolak-balik">Bolak-Balik (Depan & Belakang)</option>
                  </select>
                  <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                    Estimasi: ~
                    {(() => {
                      const count =
                        downloadTarget === 'selected'
                          ? 1
                          : downloadTarget === 'checked'
                          ? selectedStudentIdsForPrint.length
                          : downloadTarget === 'filtered'
                          ? filteredBatchStudents.length
                          : allStudents.length;

                      if (downloadLayout === 'pvc-single') {
                        const pages = downloadSide === 'bolak-balik' ? count * 2 : count;
                        return `${pages} Halaman PVC (${count} Siswa)`;
                      } else {
                        const sheets = downloadSide === 'bolak-balik' ? Math.ceil(count / 4) * 2 : Math.ceil(count / 8);
                        return `${sheets} Lembar A4 (${count} Siswa)`;
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">4. Tema Warna Desain Kartu</label>
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'navy', label: 'Royal Navy', color: 'bg-blue-900' },
                      { id: 'emerald', label: 'Emerald', color: 'bg-emerald-800' },
                      { id: 'crimson', label: 'Crimson', color: 'bg-rose-900' },
                      { id: 'slate', label: 'Titanium', color: 'bg-slate-900' },
                      { id: 'amber', label: 'Bronze', color: 'bg-amber-800' },
                    ] as const
                  ).map((th) => (
                    <button
                      type="button"
                      key={th.id}
                      onClick={() => setDownloadTheme(th.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        downloadTheme === th.id
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/60 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${th.color} shadow-sm`} />
                      <span className="text-[10px] text-slate-700">{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar (When Generating) */}
              {isDownloading && downloadProgress && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Membuat dokumen PDF Kartu Siswa...
                    </span>
                    <span>
                      {downloadProgress.current} / {downloadProgress.total} Siswa
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{
                        width: `${Math.round((downloadProgress.current / downloadProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Mohon tunggu beberapa detik, berkas PDF sedang di-render dengan resolusi tinggi...
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                disabled={isDownloading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteModalDownload}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Memproses...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-sky-200" />
                    <span>Mulai Unduh PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastDownloadMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastDownloadMessage}</span>
          <button onClick={() => setToastDownloadMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
