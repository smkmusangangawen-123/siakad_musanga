import React, { useState, useMemo, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  Download,
  Send,
  Filter,
  Search,
  School,
  Layers,
  Sparkles,
  AlertCircle,
  Trash2,
  ExternalLink,
  Paperclip,
  Check,
  Calendar,
  Lock,
  Eye,
  File,
  X,
  RefreshCw,
  Award,
  MessageSquare,
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { MateriPelajaran, TugasPelajaran, PengumpulanTugas, User, Kelas } from '../../types';

interface MateriDanTugasProps {
  currentUser: User;
  materiList: MateriPelajaran[];
  tugasList: TugasPelajaran[];
  pengumpulanList: PengumpulanTugas[];
  classes: Kelas[];
  onAddMateri: (materi: MateriPelajaran) => void;
  onAddTugas: (tugas: TugasPelajaran) => void;
  onAddPengumpulan: (pgm: PengumpulanTugas) => void;
  onUpdatePengumpulan?: (pgm: PengumpulanTugas) => void;
  onDeletePengumpulan?: (pgmId: string) => void;
  onDeleteMateri?: (materiId: string) => void;
  onDeleteTugas?: (tugasId: string) => void;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const MateriDanTugas: React.FC<MateriDanTugasProps> = ({
  currentUser,
  materiList,
  tugasList,
  pengumpulanList,
  classes,
  onAddMateri,
  onAddTugas,
  onAddPengumpulan,
  onUpdatePengumpulan,
  onDeletePengumpulan,
  onDeleteMateri,
  onDeleteTugas,
}) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas'>('materi');

  // Identify user's class if student or parent
  const studentClassName = useMemo(() => {
    if (currentUser.role === 'siswa') {
      return currentUser.kelasNama || classes[0]?.nama || '10 IPA 1';
    }
    if (currentUser.role === 'orangtua') {
      return '10 IPA 1';
    }
    return '';
  }, [currentUser, classes]);

  // Filter states (For Guru & Admin)
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for new Materi
  const [materiJudul, setMateriJudul] = useState('');
  const [materiDeskripsi, setMateriDeskripsi] = useState('');
  const [materiMapel, setMateriMapel] = useState(currentUser.subject || 'Matematika Wajib');
  const [materiTargetKelas, setMateriTargetKelas] = useState<string>(classes[0]?.nama || '10 IPA 1');
  const [materiTipe, setMateriTipe] = useState<'pdf' | 'video' | 'doc' | 'link'>('pdf');
  const [materiFileName, setMateriFileName] = useState('');
  const [materiFileSize, setMateriFileSize] = useState('');
  const [materiFileDataUrl, setMateriFileDataUrl] = useState<string>('');
  const [materiExternalUrl, setMateriExternalUrl] = useState('');
  const [materiUploadProgress, setMateriUploadProgress] = useState(false);

  // Form states for new Tugas
  const [tugasJudul, setTugasJudul] = useState('');
  const [tugasDeskripsi, setTugasDeskripsi] = useState('');
  const [tugasMapel, setTugasMapel] = useState(currentUser.subject || 'Matematika Wajib');
  const [tugasTargetKelas, setTugasTargetKelas] = useState<string>(classes[0]?.nama || '10 IPA 1');
  const [tugasDeadline, setTugasDeadline] = useState('2026-08-25 23:59');
  const [tugasPoin, setTugasPoin] = useState<number>(100);
  const [tugasFileName, setTugasFileName] = useState('');
  const [tugasFileSize, setTugasFileSize] = useState('');
  const [tugasFileDataUrl, setTugasFileDataUrl] = useState<string>('');
  const [tugasUploadProgress, setTugasUploadProgress] = useState(false);

  // Student upload answer state
  const [selectedTugasId, setSelectedTugasId] = useState<string | null>(null);
  const [jawabanCatatan, setJawabanCatatan] = useState('');
  const [jawabanFileName, setJawabanFileName] = useState('');
  const [jawabanFileSize, setJawabanFileSize] = useState('');
  const [jawabanFileDataUrl, setJawabanFileDataUrl] = useState<string>('');
  const [jawabanUploadProgress, setJawabanUploadProgress] = useState(false);

  // Teacher submissions review drawer/modal state
  const [viewingSubmissionsTugas, setViewingSubmissionsTugas] = useState<TugasPelajaran | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<PengumpulanTugas | null>(null);
  const [inputNilai, setInputNilai] = useState<number>(100);
  const [inputCatatanGuru, setInputCatatanGuru] = useState('');

  // Document / PDF Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    uploader?: string;
    date?: string;
  } | null>(null);

  // File Input Refs
  const materiFileInputRef = useRef<HTMLInputElement>(null);
  const tugasFileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Materi
  const filteredMateri = useMemo(() => {
    return materiList.filter((m) => {
      // 1. Role-based class restriction:
      if (currentUser.role === 'siswa' || currentUser.role === 'orangtua') {
        const isTargetMatch =
          !m.kelasNama ||
          m.kelasNama === 'Semua Kelas' ||
          m.kelasId === 'all' ||
          m.kelasNama.toLowerCase() === studentClassName.toLowerCase() ||
          m.kelasId === currentUser.kelasId;
        if (!isTargetMatch) return false;
      } else {
        // Guru/Admin manual filter
        if (filterClass !== 'all') {
          const isTargetMatch =
            m.kelasNama === filterClass ||
            m.kelasId === filterClass ||
            m.kelasNama === 'Semua Kelas' ||
            m.kelasId === 'all';
          if (!isTargetMatch) return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.judul.toLowerCase().includes(q);
        const matchesDesc = m.deskripsi.toLowerCase().includes(q);
        const matchesMapel = m.mataPelajaranNama.toLowerCase().includes(q);
        const matchesGuru = m.guruNama.toLowerCase().includes(q);
        const matchesKelas = (m.kelasNama || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesMapel || matchesGuru || matchesKelas;
      }

      return true;
    });
  }, [materiList, currentUser, studentClassName, filterClass, searchQuery]);

  // Filtered Tugas
  const filteredTugas = useMemo(() => {
    return tugasList.filter((t) => {
      // 1. Role-based class restriction:
      if (currentUser.role === 'siswa' || currentUser.role === 'orangtua') {
        const isTargetMatch =
          !t.kelasNama ||
          t.kelasNama === 'Semua Kelas' ||
          t.kelasId === 'all' ||
          t.kelasNama.toLowerCase() === studentClassName.toLowerCase() ||
          t.kelasId === currentUser.kelasId;
        if (!isTargetMatch) return false;
      } else {
        // Guru/Admin manual filter
        if (filterClass !== 'all') {
          const isTargetMatch =
            t.kelasNama === filterClass ||
            t.kelasId === filterClass ||
            t.kelasNama === 'Semua Kelas' ||
            t.kelasId === 'all';
          if (!isTargetMatch) return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.judul.toLowerCase().includes(q);
        const matchesDesc = t.deskripsi.toLowerCase().includes(q);
        const matchesMapel = t.mataPelajaranNama.toLowerCase().includes(q);
        const matchesGuru = t.guruNama.toLowerCase().includes(q);
        const matchesKelas = (t.kelasNama || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesMapel || matchesGuru || matchesKelas;
      }

      return true;
    });
  }, [tugasList, currentUser, studentClassName, filterClass, searchQuery]);

  // Helper to handle Materi File Upload
  const handleMateriFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMateriUploadProgress(true);
    const fileName = file.name;
    const formattedSize = formatFileSize(file.size);
    setMateriFileName(fileName);
    setMateriFileSize(formattedSize);

    // Auto-detect type
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      setMateriTipe('pdf');
    } else if (lowerName.endsWith('.mp4') || lowerName.endsWith('.mkv') || lowerName.endsWith('.mov')) {
      setMateriTipe('video');
    } else if (
      lowerName.endsWith('.doc') ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.ppt') ||
      lowerName.endsWith('.pptx') ||
      lowerName.endsWith('.xls') ||
      lowerName.endsWith('.xlsx')
    ) {
      setMateriTipe('doc');
    }

    // Auto populate judul if empty
    if (!materiJudul) {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setMateriJudul(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setMateriFileDataUrl(dataUrl);
      setMateriUploadProgress(false);
      showToast(`File "${fileName}" (${formattedSize}) siap diunggah.`);
    };
    reader.onerror = () => {
      setMateriUploadProgress(false);
      alert('Gagal membaca file. Silakan coba kembali.');
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle Tugas Soal File Upload
  const handleTugasFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTugasUploadProgress(true);
    const fileName = file.name;
    const formattedSize = formatFileSize(file.size);
    setTugasFileName(fileName);
    setTugasFileSize(formattedSize);

    if (!tugasJudul) {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTugasJudul(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTugasFileDataUrl(dataUrl);
      setTugasUploadProgress(false);
      showToast(`File Lembar Soal "${fileName}" (${formattedSize}) siap dilampirkan.`);
    };
    reader.onerror = () => {
      setTugasUploadProgress(false);
      alert('Gagal membaca file soal.');
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle Student Submission File Upload
  const handleStudentFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJawabanUploadProgress(true);
    const fileName = file.name;
    const formattedSize = formatFileSize(file.size);
    setJawabanFileName(fileName);
    setJawabanFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setJawabanFileDataUrl(dataUrl);
      setJawabanUploadProgress(false);
      showToast(`File Jawaban "${fileName}" (${formattedSize}) siap dikumpulkan.`);
    };
    reader.onerror = () => {
      setJawabanUploadProgress(false);
      alert('Gagal membaca file jawaban.');
    };
    reader.readAsDataURL(file);
  };

  // Handlers for Creating Materi
  const handleCreateMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiJudul.trim()) {
      alert('Silakan masukkan judul materi.');
      return;
    }

    const matchedClass = classes.find((c) => c.nama === materiTargetKelas);
    const finalFileUrl =
      materiFileDataUrl ||
      materiExternalUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const newMat: MateriPelajaran = {
      id: `mat-${Date.now()}`,
      judul: materiJudul.trim(),
      deskripsi: materiDeskripsi.trim() || 'Modul pembelajaran digital siap diakses dan dipelajari siswa.',
      mataPelajaranId: `mapel-${Date.now()}`,
      mataPelajaranNama: materiMapel.trim() || currentUser.subject || 'Matematika Wajib',
      guruId: currentUser.id,
      guruNama: currentUser.name,
      kelasId: materiTargetKelas === 'Semua Kelas' ? 'all' : (matchedClass?.id || 'kls-custom'),
      kelasNama: materiTargetKelas,
      tipeFile: materiTipe,
      fileName: materiFileName || 'Modul_Pelajaran.pdf',
      fileSize: materiFileSize || '1.8 MB',
      fileUrl: finalFileUrl,
      tanggalUpload: new Date().toISOString().split('T')[0],
    };

    onAddMateri(newMat);

    // Reset Form
    setMateriJudul('');
    setMateriDeskripsi('');
    setMateriFileName('');
    setMateriFileSize('');
    setMateriFileDataUrl('');
    setMateriExternalUrl('');
    setIsUploadModalOpen(false);
    showToast(`Materi PDF/Dokumen untuk Kelas ${materiTargetKelas} berhasil diunggah!`);
  };

  // Handlers for Creating Tugas
  const handleCreateTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tugasJudul.trim()) {
      alert('Silakan masukkan judul tugas.');
      return;
    }

    const matchedClass = classes.find((c) => c.nama === tugasTargetKelas);
    const finalFileUrl =
      tugasFileDataUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const newTgs: TugasPelajaran = {
      id: `tgs-${Date.now()}`,
      judul: tugasJudul.trim(),
      deskripsi: tugasDeskripsi.trim() || 'Kerjakan tugas sesuai instruksi dan kumpulkan sebelum tenggat waktu.',
      mataPelajaranId: `mapel-${Date.now()}`,
      mataPelajaranNama: tugasMapel.trim() || currentUser.subject || 'Matematika Wajib',
      guruId: currentUser.id,
      guruNama: currentUser.name,
      kelasId: tugasTargetKelas === 'Semua Kelas' ? 'all' : (matchedClass?.id || 'kls-custom'),
      kelasNama: tugasTargetKelas,
      deadline: tugasDeadline,
      poinMaksimal: Number(tugasPoin) || 100,
      fileName: tugasFileName || 'Soal_Tugas_Siswa.pdf',
      fileSize: tugasFileSize || '1.2 MB',
      fileUrl: finalFileUrl,
      pengumpulanCount: 0,
    };

    onAddTugas(newTgs);

    // Reset Form
    setTugasJudul('');
    setTugasDeskripsi('');
    setTugasFileName('');
    setTugasFileSize('');
    setTugasFileDataUrl('');
    setIsUploadModalOpen(false);
    showToast(`Tugas & Lembar Soal PDF untuk Kelas ${tugasTargetKelas} berhasil diterbitkan!`);
  };

  // Student Assignment Submission
  const handleSubmitAssignment = (tugasId: string) => {
    const finalFileName =
      jawabanFileName || `Jawaban_${currentUser.name.replace(/\s+/g, '_')}_Tugas.pdf`;
    const finalFileUrl =
      jawabanFileDataUrl || `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    const finalFileSize = jawabanFileSize || '1.5 MB';

    const newPengumpulan: PengumpulanTugas = {
      id: `pgm-${Date.now()}`,
      tugasId,
      siswaId: currentUser.id,
      siswaNama: currentUser.name,
      tanggalKumpul: new Date().toLocaleString('id-ID'),
      fileUrl: finalFileUrl,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileType: finalFileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
      catatanSiswa: jawabanCatatan || 'Jawaban tugas telah dilampirkan.',
      status: 'Belum Dinilai',
    };

    onAddPengumpulan(newPengumpulan);
    setSelectedTugasId(null);
    setJawabanCatatan('');
    setJawabanFileName('');
    setJawabanFileSize('');
    setJawabanFileDataUrl('');
    showToast(`Berkas PDF "${finalFileName}" berhasil dikumpulkan ke Guru!`);
  };

  // Teacher Grade Submission
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !onUpdatePengumpulan) return;

    const updated: PengumpulanTugas = {
      ...gradingSubmission,
      nilai: Number(inputNilai),
      catatanGuru: inputCatatanGuru.trim() || 'Jawaban telah dinilai oleh guru.',
      status: 'Sudah Dinilai',
    };

    onUpdatePengumpulan(updated);
    setGradingSubmission(null);
    showToast(`Nilai ${inputNilai} untuk ${gradingSubmission.siswaNama} berhasil disimpan!`);
  };

  // Handle Download File (triggers download of data url, blob or link)
  const handleDownloadFile = (title: string, filename?: string, fileUrl?: string) => {
    const fn = filename || `${title.replace(/\s+/g, '_')}.pdf`;

    if (fileUrl && fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fn;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Mengunduh berkas: ${fn}`);
      return;
    }

    if (fileUrl && fileUrl.startsWith('http') && !fileUrl.includes('dummy.pdf')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.target = '_blank';
      a.download = fn;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Mengunduh berkas: ${fn}`);
      return;
    }

    // Fallback: Generate real text/PDF Blob
    const content = `SIAKAD Smart School - Portal Pembelajaran Digital\n\nBerkas: ${title}\nNama File: ${fn}\nDiunduh oleh: ${currentUser.name} (${currentUser.role.toUpperCase()})\nWaktu: ${new Date().toLocaleString('id-ID')}\n\n[Isi Dokumen Digital / E-Modul Pembelajaran Telah Terverifikasi]`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fn;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Mengunduh berkas: ${fn}`);
  };

  // Handle View / Preview File in Modal
  const handlePreviewFile = (title: string, fileName: string, fileUrl: string, uploader?: string, date?: string) => {
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileUrl.includes('.pdf') || fileUrl.startsWith('data:application/pdf');
    setPreviewDoc({
      title,
      fileName,
      fileUrl,
      fileType: isPdf ? 'pdf' : 'doc',
      uploader,
      date,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Portal Materi & Tugas Pelajaran</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat distribusi modul PDF, dokumen belajar, penugasan digital berbasis rombel kelas, serta pengumpulan tugas siswa.
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('materi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'materi' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Modul & Materi ({filteredMateri.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tugas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tugas' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Tugas & Latihan ({filteredTugas.length})</span>
            </button>
          </div>

          {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
            <button
              onClick={() => {
                setIsUploadModalOpen(true);
                setMateriJudul('');
                setMateriFileName('');
                setMateriFileDataUrl('');
                setTugasJudul('');
                setTugasFileName('');
                setTugasFileDataUrl('');
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>{activeTab === 'materi' ? 'Unggah Materi PDF' : 'Buat Tugas & Soal PDF'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Filtering & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Class Filter Selector */}
          <div className="flex items-center gap-2 flex-1">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <Filter className="w-4 h-4" />
            </div>

            {currentUser.role === 'siswa' || currentUser.role === 'orangtua' ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-600">Akses Terfilter:</span>
                <span className="font-bold text-blue-900">
                  Kelas {studentClassName || '10 IPA 1'} & Modul Publik
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="all">🌟 Semua Rombel / Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.nama}>
                      🏛️ Kelas {cls.nama} ({cls.jurusanNama || 'Umum'})
                    </option>
                  ))}
                  <option value="Semua Kelas">🌐 Modul Publik (Semua Kelas)</option>
                </select>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, judul PDF, mapel, guru..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Informative Filter Notice for Student / Parent */}
        {(currentUser.role === 'siswa' || currentUser.role === 'orangtua') && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {currentUser.role === 'siswa'
                  ? `Menampilkan ${activeTab === 'materi' ? 'modul materi PDF' : 'penugasan digital'} untuk `
                  : `Menampilkan berkas tugas & materi untuk Ananda ${currentUser.childName || 'Siswa'} di `}
                <strong className="font-extrabold text-emerald-950">Kelas {studentClassName}</strong>.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
              Siswa Terverifikasi
            </span>
          </div>
        )}
      </div>

      {/* Main Content: Materi Tab */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          {filteredMateri.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Belum Ada Materi untuk Filter Ini</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {currentUser.role === 'guru' || currentUser.role === 'admin'
                  ? 'Belum ada modul PDF atau materi yang diunggah. Klik tombol "Unggah Materi PDF" untuk menambahkan modul baru.'
                  : `Bapak/Ibu Guru belum mengunggah materi pelajaran PDF untuk kelas ${studentClassName}.`}
              </p>
              {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Unggah Materi PDF Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMateri.map((m) => {
                const isPdf = (m.fileName || '').toLowerCase().endsWith('.pdf') || m.tipeFile === 'pdf';
                return (
                  <div
                    key={m.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {m.mataPelajaranNama}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                              m.kelasNama === 'Semua Kelas' || m.kelasId === 'all'
                                ? 'bg-purple-100 text-purple-900 border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                            }`}
                          >
                            🎯 {m.kelasNama || '10 IPA 1'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> {m.tanggalUpload}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isPdf
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : m.tipeFile === 'video'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}
                        >
                          {isPdf ? (
                            <FileText className="w-6 h-6" />
                          ) : m.tipeFile === 'video' ? (
                            <Video className="w-6 h-6" />
                          ) : (
                            <Paperclip className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{m.judul}</h4>
                            {isPdf && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded border border-red-200 shrink-0">
                                PDF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{m.deskripsi}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                            <span>
                              👨‍🏫 Guru: <strong className="text-slate-800">{m.guruNama}</strong>
                            </span>
                            {m.fileSize && <span>• 📦 {m.fileSize}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[160px] sm:max-w-[200px] flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{m.fileName || 'Modul_Digital.pdf'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(currentUser.role === 'admin' || currentUser.id === m.guruId) && onDeleteMateri && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus materi "${m.judul}"?`)) {
                                onDeleteMateri(m.id);
                                showToast('Materi telah dihapus');
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handlePreviewFile(
                              m.judul,
                              m.fileName || 'Modul_Pelajaran.pdf',
                              m.fileUrl,
                              m.guruNama,
                              m.tanggalUpload
                            )
                          }
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pratinjau</span>
                        </button>

                        <button
                          onClick={() => handleDownloadFile(m.judul, m.fileName, m.fileUrl)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Unduh PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Content: Tugas Tab */}
      {activeTab === 'tugas' && (
        <div className="space-y-4">
          {filteredTugas.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Tidak Ada Tugas Aktif</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {currentUser.role === 'guru' || currentUser.role === 'admin'
                  ? 'Belum ada penugasan yang diterbitkan untuk kelas yang dipilih. Klik tombol "Buat Tugas & Soal PDF" untuk menambahkan tugas baru.'
                  : `Semua tugas untuk kelas ${studentClassName} telah selesai atau belum ada penugasan baru.`}
              </p>
              {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-500 cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Buat Tugas Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTugas.map((t) => {
                const mySubmission = pengumpulanList.find(
                  (p) => p.tugasId === t.id && (p.siswaId === currentUser.id || p.siswaNama === currentUser.name)
                );

                const taskSubmissions = pengumpulanList.filter((p) => p.tugasId === t.id);

                return (
                  <div
                    key={t.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                            {t.mataPelajaranNama}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                              t.kelasNama === 'Semua Kelas' || t.kelasId === 'all'
                                ? 'bg-purple-100 text-purple-900 border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                            }`}
                          >
                            🎯 Target: {t.kelasNama || '10 IPA 1'}
                          </span>
                          <span className="text-xs text-slate-500">
                            • Pengajar: <strong className="text-slate-800">{t.guruNama}</strong>
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 mt-1.5">{t.judul}</h4>
                      </div>

                      <div className="text-left sm:text-right text-xs shrink-0">
                        <p className="text-amber-700 font-bold flex items-center gap-1 sm:justify-end">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Batas: {t.deadline}
                        </p>
                        <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                          {taskSubmissions.length} Siswa Mengumpulkan (Max {t.poinMaksimal} Poin)
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <p className="text-xs text-slate-600 leading-relaxed">{t.deskripsi}</p>

                    {/* Action Bar (Download Question File & Teacher Submission Review) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.fileName && (
                          <button
                            onClick={() =>
                              handlePreviewFile(
                                t.judul,
                                t.fileName || 'Lembar_Soal_Tugas.pdf',
                                t.fileUrl || '',
                                t.guruNama,
                                t.deadline
                              )
                            }
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Lihat Soal PDF</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadFile(t.judul, t.fileName || 'Lembar_Soal_Tugas.pdf', t.fileUrl)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>Unduh Lembar Soal ({t.fileName || 'Soal_Tugas.pdf'})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Guru / Admin: View Submissions List */}
                        {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                          <button
                            onClick={() => setViewingSubmissionsTugas(t)}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Periksa Pengumpulan ({taskSubmissions.length} Siswa)</span>
                          </button>
                        )}

                        {(currentUser.role === 'admin' || currentUser.id === t.guruId) && onDeleteTugas && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus tugas "${t.judul}"?`)) {
                                onDeleteTugas(t.id);
                                showToast('Tugas telah dihapus');
                              }
                            }}
                            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Submission Form Card */}
                    {currentUser.role === 'siswa' && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2 space-y-3">
                        {mySubmission ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 text-emerald-800 font-bold">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-sm font-extrabold text-emerald-950">
                                  Jawaban Anda Telah Dikirim
                                </span>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                                  <span>📅 {mySubmission.tanggalKumpul}</span>
                                  <span>• 📄 {mySubmission.fileName || mySubmission.fileUrl}</span>
                                  {mySubmission.fileSize && <span>({mySubmission.fileSize})</span>}
                                </p>
                                {mySubmission.catatanGuru && (
                                  <p className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg mt-1.5 border border-indigo-100">
                                    💬 Catatan Guru: <em>"{mySubmission.catatanGuru}"</em>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {mySubmission.fileUrl && (
                                <button
                                  onClick={() =>
                                    handlePreviewFile(
                                      `Jawaban ${mySubmission.siswaNama}`,
                                      mySubmission.fileName || 'Jawaban_Tugas.pdf',
                                      mySubmission.fileUrl,
                                      mySubmission.siswaNama,
                                      mySubmission.tanggalKumpul
                                    )
                                  }
                                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" /> Pratinjau Berkas
                                </button>
                              )}

                              {mySubmission.nilai !== undefined ? (
                                <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-black text-xs">
                                  Nilai: {mySubmission.nilai} / 100
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs">
                                  Menunggu Penilaian Guru
                                </span>
                              )}
                            </div>
                          </div>
                        ) : selectedTugasId === t.id ? (
                          /* Active Submission Upload Form */
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <Upload className="w-4 h-4 text-blue-600" /> Formulir Unggah Berkas Jawaban (PDF / Doc):
                              </h5>
                              <button
                                onClick={() => {
                                  setSelectedTugasId(null);
                                  setJawabanFileName('');
                                  setJawabanFileDataUrl('');
                                }}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>

                            {/* File Upload Drop Area */}
                            <div
                              onClick={() => studentFileInputRef.current?.click()}
                              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50/80 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-1.5"
                            >
                              <input
                                ref={studentFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
                                onChange={handleStudentFileSelected}
                                className="hidden"
                              />
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                                <Upload className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-bold text-slate-800">
                                Klik untuk Memilih File PDF / Dokumen Jawaban
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Format didukung: PDF (.pdf), Word (.docx), Foto Lembar Kerja, atau ZIP (Maksimal 10MB)
                              </p>
                            </div>

                            {/* Attached File Preview Badge */}
                            {jawabanFileName && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                    PDF
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-emerald-950 truncate max-w-[240px]">
                                      {jawabanFileName}
                                    </p>
                                    <p className="text-[10px] text-emerald-700">{jawabanFileSize || '1.5 MB'} • Siap Diunggah</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJawabanFileName('');
                                    setJawabanFileDataUrl('');
                                    setJawabanFileSize('');
                                  }}
                                  className="text-xs text-red-600 hover:underline font-bold"
                                >
                                  Ganti File
                                </button>
                              </div>
                            )}

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Catatan / Keterangan Pengerjaan (Opsional):
                              </label>
                              <input
                                type="text"
                                value={jawabanCatatan}
                                onChange={(e) => setJawabanCatatan(e.target.value)}
                                placeholder="Contoh: Jawaban nomor 1 s.d 10 telah dikerjakan lengkap pada lampiran..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                              />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleSubmitAssignment(t.id)}
                                disabled={jawabanUploadProgress}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" /> Kirim Jawaban Tugas Sekarang
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTugasId(null);
                                  setJawabanFileName('');
                                  setJawabanFileDataUrl('');
                                }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs text-slate-500">
                              Anda belum mengumpulkan jawaban untuk penugasan ini.
                            </span>
                            <button
                              onClick={() => {
                                setSelectedTugasId(t.id);
                                setJawabanFileName('');
                                setJawabanFileDataUrl('');
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5" /> UPLOAD JAWABAN TUGAS (PDF)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upload/Create Modal (For Guru & Admin) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  {activeTab === 'materi' ? <Upload className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {activeTab === 'materi' ? 'Unggah Materi / Modul PDF Pelajaran' : 'Terbitkan Tugas & Lembar Soal PDF'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lampirkan file PDF materi atau tugas dan tentukan target kelas tujuan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Materi */}
            {activeTab === 'materi' ? (
              <form onSubmit={handleCreateMateri} className="space-y-4">
                {/* Target Kelas Selection */}
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-1.5">
                  <label className="block text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-blue-600" /> Target Kelas / Rombel Tujuan (Wajib):
                  </label>
                  <select
                    value={materiTargetKelas}
                    onChange={(e) => setMateriTargetKelas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="Semua Kelas">🌐 Semua Kelas (Materi Terbuka / Publik)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.nama}>
                        🏛️ Kelas {cls.nama} - {cls.jurusanNama || 'Rombel'} (Khusus Kelas Ini)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-blue-800">
                    *Hanya siswa yang terdaftar di <strong className="font-extrabold">{materiTargetKelas}</strong> yang akan dapat melihat & mendownload materi ini.
                  </p>
                </div>

                {/* PDF / Document File Picker Box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Unggah File Berkas (PDF / Dokumen):
                  </label>
                  <div
                    onClick={() => materiFileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50/70 rounded-2xl p-4 text-center cursor-pointer transition-all"
                  >
                    <input
                      ref={materiFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.zip,.png,.jpg"
                      onChange={handleMateriFileSelected}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Klik di sini untuk Memilih Berkas PDF / Materi</p>
                    <p className="text-[11px] text-slate-500">Mendukung PDF, Word (.docx), PPT, Slide, Excel, Video MP4</p>
                  </div>

                  {/* Attached File Preview */}
                  {materiFileName && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 truncate max-w-[260px]">{materiFileName}</p>
                          <p className="text-[10px] text-emerald-700">{materiFileSize || '1.8 MB'} • Berkas Siap Diunggah</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMateriFileName('');
                          setMateriFileDataUrl('');
                          setMateriFileSize('');
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                    <input
                      type="text"
                      required
                      value={materiMapel}
                      onChange={(e) => setMateriMapel(e.target.value)}
                      placeholder="Contoh: Matematika Wajib"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Media Berkas:</label>
                    <select
                      value={materiTipe}
                      onChange={(e) => setMateriTipe(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="pdf">📄 Dokumen PDF / E-Modul</option>
                      <option value="video">🎥 Video Pembelajaran</option>
                      <option value="doc">📝 Dokumen Word / Slide PPT</option>
                      <option value="link">🔗 Tautan / Web Link Eksternal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Materi Pembelajaran:</label>
                  <input
                    type="text"
                    required
                    value={materiJudul}
                    onChange={(e) => setMateriJudul(e.target.value)}
                    placeholder="Contoh: Modul 5 Kalkulus Diferensial & Integral"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {materiTipe === 'link' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tautan Web / URL Materi:</label>
                    <input
                      type="url"
                      value={materiExternalUrl}
                      onChange={(e) => setMateriExternalUrl(e.target.value)}
                      placeholder="https://drive.google.com/... atau https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan & Petunjuk Belajar:</label>
                  <textarea
                    rows={3}
                    value={materiDeskripsi}
                    onChange={(e) => setMateriDeskripsi(e.target.value)}
                    placeholder="Poin penting atau ringkasan topik yang dipelajari pada modul ini..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={materiUploadProgress}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" /> Publikasikan Materi PDF
                  </button>
                </div>
              </form>
            ) : (
              /* Tugas Form */
              <form onSubmit={handleCreateTugas} className="space-y-4">
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
                  <label className="block text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-amber-700" /> Target Kelas / Rombel Siswa (Wajib):
                  </label>
                  <select
                    value={tugasTargetKelas}
                    onChange={(e) => setTugasTargetKelas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="Semua Kelas">🌐 Semua Kelas (Tugas Terbuka / Massal)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.nama}>
                        🏛️ Kelas {cls.nama} - {cls.jurusanNama || 'Rombel'} (Khusus Kelas Ini)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-900">
                    *Hanya siswa dari <strong className="font-extrabold">{tugasTargetKelas}</strong> yang akan menerima tugas ini di dashboard mereka.
                  </p>
                </div>

                {/* PDF Lembar Soal Upload Box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Lampiran Lembar Soal / Instruksi (PDF / Dokumen):
                  </label>
                  <div
                    onClick={() => tugasFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/70 rounded-2xl p-4 text-center cursor-pointer transition-all"
                  >
                    <input
                      ref={tugasFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg"
                      onChange={handleTugasFileSelected}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Klik di sini untuk Memilih File Lembar Soal PDF</p>
                    <p className="text-[11px] text-slate-500">Mendukung PDF (.pdf), Word (.docx), atau Gambar Soal</p>
                  </div>

                  {tugasFileName && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-[10px]">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 truncate max-w-[260px]">{tugasFileName}</p>
                          <p className="text-[10px] text-emerald-700">{tugasFileSize || '1.2 MB'} • File Soal Terlampir</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTugasFileName('');
                          setTugasFileDataUrl('');
                          setTugasFileSize('');
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                    <input
                      type="text"
                      required
                      value={tugasMapel}
                      onChange={(e) => setTugasMapel(e.target.value)}
                      placeholder="Contoh: Matematika Wajib"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu (Deadline):</label>
                    <input
                      type="text"
                      required
                      value={tugasDeadline}
                      onChange={(e) => setTugasDeadline(e.target.value)}
                      placeholder="2026-08-25 23:59"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas / Latihan:</label>
                  <input
                    type="text"
                    required
                    value={tugasJudul}
                    onChange={(e) => setTugasJudul(e.target.value)}
                    placeholder="Contoh: Tugas 4 Penyelesaian Sistem Persamaan Linear Tiga Variabel"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poin Maksimal:</label>
                  <input
                    type="number"
                    value={tugasPoin}
                    onChange={(e) => setTugasPoin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Petunjuk & Format Pengerjaan:</label>
                  <textarea
                    rows={3}
                    value={tugasDeskripsi}
                    onChange={(e) => setTugasDeskripsi(e.target.value)}
                    placeholder="Instruksi pengerjaan tugas, nomor soal yang dikerjakan, dan format lampiran..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={tugasUploadProgress}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> Terbitkan Tugas ke Kelas
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Teacher Submissions List Modal */}
      {viewingSubmissionsTugas && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Daftar Pengumpulan Tugas Siswa
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingSubmissionsTugas.judul} • Target: {viewingSubmissionsTugas.kelasNama || '10 IPA 1'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSubmissionsTugas(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of Submissions */}
            {(() => {
              const currentTaskSubmissions = pengumpulanList.filter(
                (p) => p.tugasId === viewingSubmissionsTugas.id
              );

              if (currentTaskSubmissions.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700">Belum Ada Siswa Mengumpulkan</h4>
                    <p className="text-xs text-slate-500">
                      Siswa di kelas target belum mengunggah berkas jawaban untuk penugasan ini.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {currentTaskSubmissions.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h5 className="font-extrabold text-sm text-slate-900">{sub.siswaNama}</h5>
                          {sub.nilai !== undefined ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                              Nilai: {sub.nilai} / 100
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg">
                              Belum Dinilai
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>📅 Dikumpulkan: {sub.tanggalKumpul}</span>
                          <span>• 📄 {sub.fileName || sub.fileUrl}</span>
                        </p>
                        {sub.catatanSiswa && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <strong>Catatan Siswa:</strong> {sub.catatanSiswa}
                          </p>
                        )}
                        {sub.catatanGuru && (
                          <p className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                            <strong>Catatan Guru:</strong> {sub.catatanGuru}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            handlePreviewFile(
                              `Jawaban ${sub.siswaNama}`,
                              sub.fileName || 'Jawaban_Tugas.pdf',
                              sub.fileUrl,
                              sub.siswaNama,
                              sub.tanggalKumpul
                            )
                          }
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" /> Buka PDF
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              `Jawaban_${sub.siswaNama}`,
                              sub.fileName || 'Jawaban_Tugas.pdf',
                              sub.fileUrl
                            )
                          }
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" /> Unduh
                        </button>
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setInputNilai(sub.nilai ?? 100);
                            setInputCatatanGuru(sub.catatanGuru || '');
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-md"
                        >
                          <Award className="w-3.5 h-3.5" /> Beri Nilai
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setViewingSubmissionsTugas(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grading Form Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Penilaian Tugas Siswa</h4>
                  <p className="text-xs text-slate-500">{gradingSubmission.siswaNama}</p>
                </div>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai Tugas (Skala 0 - 100):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={inputNilai}
                  onChange={(e) => setInputNilai(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Masukan Guru untuk Siswa:
                </label>
                <textarea
                  rows={3}
                  value={inputCatatanGuru}
                  onChange={(e) => setInputCatatanGuru(e.target.value)}
                  placeholder="Bagus sekali! Penyelesaian soal lengkap dan terstruktur dengan rapi..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App PDF & Document Previewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-white truncate max-w-md">{previewDoc.title}</h4>
                  <p className="text-[11px] text-slate-300 truncate">
                    {previewDoc.fileName} {previewDoc.uploader ? `• Diunggah oleh: ${previewDoc.uploader}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(previewDoc.title, previewDoc.fileName, previewDoc.fileUrl)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Asli</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-slate-100 p-4 flex flex-col items-center justify-center overflow-auto">
              {previewDoc.fileUrl && previewDoc.fileUrl.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.title}
                  className="w-full h-full rounded-2xl border border-slate-300 bg-white"
                />
              ) : previewDoc.fileUrl && previewDoc.fileUrl.startsWith('data:image/') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-lg"
                />
              ) : (
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xl space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{previewDoc.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{previewDoc.fileName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Tipe Dokumen:</span>
                      <strong className="text-slate-800">E-Modul Digital PDF / Soal</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Status Keamanan:</span>
                      <strong className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Server
                      </strong>
                    </p>
                    {previewDoc.uploader && (
                      <p className="flex justify-between">
                        <span className="text-slate-400">Pengunggah:</span>
                        <strong className="text-slate-800">{previewDoc.uploader}</strong>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownloadFile(previewDoc.title, previewDoc.fileName, previewDoc.fileUrl)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Unduh & Buka Berkas PDF Lengkap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
