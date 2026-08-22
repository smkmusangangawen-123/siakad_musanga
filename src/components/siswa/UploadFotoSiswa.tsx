import React, { useState, useMemo, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  Trash2,
  Users,
  Printer,
  Sparkles,
  UserCheck,
  UserX,
  FileImage,
  ArrowRight,
  Check,
  X,
  SlidersHorizontal,
  GraduationCap,
  FolderUp,
  Download,
  Info,
  Maximize2,
  Video,
} from 'lucide-react';
import { User, Kelas, Jurusan, SchoolSettings } from '../../types';
import { PhotoUploadField } from '../common/PhotoUploadField';
import { QuickPhotoModal } from '../common/QuickPhotoModal';

interface UploadFotoSiswaProps {
  currentUser: User;
  users: User[];
  classes: Kelas[];
  jurusanList: Jurusan[];
  onUpdateUser: (user: User) => void;
  onBatchUpdateUsers?: (users: User[]) => void;
  schoolSettings?: SchoolSettings;
}

interface BatchMatchedFile {
  file: File;
  previewUrl: string;
  matchedStudent: User | null;
  matchType: 'nisn' | 'nis' | 'name' | 'manual' | 'none';
}

export const UploadFotoSiswa: React.FC<UploadFotoSiswaProps> = ({
  currentUser,
  users,
  classes,
  jurusanList,
  onUpdateUser,
  onBatchUpdateUsers,
  schoolSettings,
}) => {
  // Determine if user is Wali Kelas
  const isWaliKelas =
    currentUser.role === 'guru' &&
    (currentUser.isWaliKelas ||
      classes.some(
        (c) =>
          c.waliKelasId === currentUser.id ||
          c.waliKelasNama === currentUser.name ||
          (currentUser.name && c.waliKelasNama && currentUser.name.toLowerCase().includes(c.waliKelasNama.toLowerCase()))
      ));

  // Find wali kelas assigned class
  const waliKelasObj = isWaliKelas
    ? classes.find(
        (c) =>
          c.waliKelasId === currentUser.id ||
          c.waliKelasNama === currentUser.name ||
          (currentUser.name && c.waliKelasNama && currentUser.name.toLowerCase().includes(c.waliKelasNama.toLowerCase()))
      )
    : null;

  // Filter and view states
  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentUser.role === 'admin' ? 'ALL' : (waliKelasObj?.id || currentUser.kelasId || 'ALL')
  );
  const [selectedJurusanId, setSelectedJurusanId] = useState<string>('ALL');
  const [filterPhotoStatus, setFilterPhotoStatus] = useState<'ALL' | 'HAS_PHOTO' | 'NO_PHOTO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'batch' | 'booth' | 'album'>('gallery');

  // Selected student for quick photo modal
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<User | null>(null);

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<BatchMatchedFile[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Photo Booth State
  const [selectedBoothStudentId, setSelectedBoothStudentId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // All student users
  const studentUsers = useMemo(() => {
    return users.filter((u) => u.role === 'siswa');
  }, [users]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return studentUsers.filter((s) => {
      // Role-based filter constraint for wali kelas (if applicable)
      if (currentUser.role === 'guru' && isWaliKelas && selectedClassId === 'ALL' && waliKelasObj) {
        if (s.kelasId !== waliKelasObj.id && s.kelasNama !== waliKelasObj.nama) {
          return false;
        }
      }

      // Class filter
      if (selectedClassId !== 'ALL' && s.kelasId !== selectedClassId) {
        // Also fallback to match by class name
        const targetClass = classes.find((c) => c.id === selectedClassId);
        if (!targetClass || s.kelasNama !== targetClass.nama) {
          return false;
        }
      }

      // Jurusan filter
      if (selectedJurusanId !== 'ALL' && s.jurusanId !== selectedJurusanId) {
        return false;
      }

      // Photo status filter
      const hasRealPhoto = Boolean(
        s.avatar &&
          !s.avatar.includes('dicebear.com') &&
          !s.avatar.includes('placeholder') &&
          s.avatar.trim() !== ''
      );

      if (filterPhotoStatus === 'HAS_PHOTO' && !hasRealPhoto) return false;
      if (filterPhotoStatus === 'NO_PHOTO' && hasRealPhoto) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNisn = s.nisn?.toLowerCase().includes(q);
        const matchNis = s.nis?.toLowerCase().includes(q);
        const matchKelas = s.kelasNama?.toLowerCase().includes(q);
        if (!matchName && !matchNisn && !matchNis && !matchKelas) {
          return false;
        }
      }

      return true;
    });
  }, [studentUsers, selectedClassId, selectedJurusanId, filterPhotoStatus, searchQuery, currentUser, isWaliKelas, waliKelasObj, classes]);

  // Statistics
  const stats = useMemo(() => {
    const total = studentUsers.length;
    const withPhoto = studentUsers.filter(
      (s) => s.avatar && !s.avatar.includes('dicebear.com') && s.avatar.trim() !== ''
    ).length;
    const withoutPhoto = total - withPhoto;
    const percentage = total > 0 ? Math.round((withPhoto / total) * 100) : 0;

    // Filtered set stats
    const filteredTotal = filteredStudents.length;
    const filteredWithPhoto = filteredStudents.filter(
      (s) => s.avatar && !s.avatar.includes('dicebear.com') && s.avatar.trim() !== ''
    ).length;
    const filteredWithoutPhoto = filteredTotal - filteredWithPhoto;

    return {
      total,
      withPhoto,
      withoutPhoto,
      percentage,
      filteredTotal,
      filteredWithPhoto,
      filteredWithoutPhoto,
    };
  }, [studentUsers, filteredStudents]);

  // Handle single photo change
  const handleSaveStudentPhoto = (student: User, newAvatarUrl: string) => {
    const updated = {
      ...student,
      avatar: newAvatarUrl,
    };
    onUpdateUser(updated);
  };

  // Handle reset photo to default DiceBear avatar
  const handleResetPhoto = (student: User) => {
    if (window.confirm(`Reset pas foto untuk ${student.name} ke avatar standar?`)) {
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.nisn || student.name)}`;
      handleSaveStudentPhoto(student, defaultAvatar);
    }
  };

  // Batch file processing & smart matching
  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFileList(Array.from(files));
    e.target.value = '';
  };

  const processFileList = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Mohon pilih berkas gambar (JPG, PNG, WebP).');
      return;
    }

    const matchedList: BatchMatchedFile[] = imageFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      // Strip extension
      const baseName = file.name.replace(/\.[^/.]+$/, '').trim();
      const cleanName = baseName.replace(/[_\-+.]/g, ' ').toLowerCase();

      // Matching Strategy:
      // 1. Exact or partial NISN match
      let match = studentUsers.find((s) => s.nisn && baseName.includes(s.nisn));
      let matchType: 'nisn' | 'nis' | 'name' | 'manual' | 'none' = 'nisn';

      // 2. NIS match
      if (!match) {
        match = studentUsers.find((s) => s.nis && baseName.includes(s.nis));
        if (match) matchType = 'nis';
      }

      // 3. Name match
      if (!match) {
        match = studentUsers.find((s) => {
          const sName = s.name.toLowerCase();
          return cleanName.includes(sName) || sName.includes(cleanName);
        });
        if (match) matchType = 'name';
      }

      if (!match) {
        matchType = 'none';
      }

      return {
        file,
        previewUrl,
        matchedStudent: match || null,
        matchType,
      };
    });

    setBatchFiles((prev) => [...prev, ...matchedList]);
    setBatchSuccessMessage(null);
  };

  // Convert File to Base64 with compression
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Apply all matched batch photos
  const handleApplyBatchPhotos = async () => {
    const validMatches = batchFiles.filter((b) => b.matchedStudent !== null);
    if (validMatches.length === 0) {
      alert('Tidak ada foto yang memiliki pasangan siswa yang cocok.');
      return;
    }

    setIsProcessingBatch(true);
    try {
      const updatedStudentsList: User[] = [];

      for (const item of validMatches) {
        if (!item.matchedStudent) continue;
        const base64Url = await fileToBase64(item.file);
        const updated = {
          ...item.matchedStudent,
          avatar: base64Url,
        };
        updatedStudentsList.push(updated);
        onUpdateUser(updated);
      }

      setBatchSuccessMessage(`Berhasil memperbarui ${updatedStudentsList.length} pas foto siswa secara massal!`);
      setBatchFiles([]);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses foto massal.');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Live Camera Photo Booth Functions
  const startBoothCamera = async () => {
    setCameraError(null);
    setCapturedPhotoUrl(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada peramban ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 960 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Gagal mengakses kamera. Mohon izinkan akses peramban.');
      setIsCameraActive(false);
    }
  };

  const stopBoothCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureBoothPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 600;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhotoUrl(dataUrl);
      stopBoothCamera();
    }
  };

  const saveBoothPhotoToSelectedStudent = () => {
    if (!capturedPhotoUrl || !selectedBoothStudentId) return;
    const targetStudent = studentUsers.find((s) => s.id === selectedBoothStudentId);
    if (!targetStudent) return;

    handleSaveStudentPhoto(targetStudent, capturedPhotoUrl);
    setCapturedPhotoUrl(null);

    // Auto-advance to next student without photo
    const nextStudent = filteredStudents.find(
      (s) => s.id !== selectedBoothStudentId && (!s.avatar || s.avatar.includes('dicebear.com'))
    );
    if (nextStudent) {
      setSelectedBoothStudentId(nextStudent.id);
      startBoothCamera();
    } else {
      setSelectedBoothStudentId('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl flex items-center justify-center shadow-inner">
                <Camera className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.role === 'admin' ? 'Eksklusif Administrator' : 'Eksklusif Wali Kelas'}
              </span>
              {isWaliKelas && waliKelasObj && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Wali Kelas: {waliKelasObj.nama}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Upload & Manajemen Pas Foto Siswa
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pusat pengelolaan pas foto resmi siswa untuk sinkronisasi otomatis ke Kartu Pelajar Digital,
              Absensi Scanner Barcode/QR, E-Raport Kurikulum Merdeka, dan Biodata Induk.
            </p>
          </div>

          {/* Progress & Stat Widget */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg shrink-0 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Kelengkapan Foto Siswa</span>
              <span className="text-indigo-400 font-extrabold text-sm">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {stats.withPhoto} Lengkap
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {stats.withoutPhoto} Belum
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'gallery'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" /> Galeri Pas Foto Siswa
          </button>

          <button
            onClick={() => setActiveSubTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderUp className="w-4 h-4" /> Unggah Massal (Auto Match NISN)
          </button>

          <button
            onClick={() => {
              setActiveSubTab('booth');
              startBoothCamera();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'booth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Studio Pemotretan Live
          </button>

          <button
            onClick={() => setActiveSubTab('album')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'album'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" /> Cetak Lembar Album Foto
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GALERI PAS FOTO SISWA */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Kelas */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Kelas:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({studentUsers.length} Siswa)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.nama} {cls.waliKelasNama ? `(Walas: ${cls.waliKelasNama})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status Foto */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFilterPhotoStatus('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPhotoStatus === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({stats.filteredTotal})
                </button>
                <button
                  onClick={() => setFilterPhotoStatus('HAS_PHOTO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterPhotoStatus === 'HAS_PHOTO'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Sudah Berfoto ({stats.filteredWithPhoto})
                </button>
                <button
                  onClick={() => setFilterPhotoStatus('NO_PHOTO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterPhotoStatus === 'NO_PHOTO'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" /> Belum Ada ({stats.filteredWithoutPhoto})
                </button>
              </div>
            </div>

            {/* Search & View Switcher */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, NISN, NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Student Grid / List Rendering */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Tidak ada siswa yang sesuai kriteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Coba sesuaikan pilihan filter kelas, status foto, atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => {
                  setSelectedClassId('ALL');
                  setFilterPhotoStatus('ALL');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredStudents.map((student) => {
                const hasPhoto = Boolean(
                  student.avatar &&
                    !student.avatar.includes('dicebear.com') &&
                    student.avatar.trim() !== ''
                );

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                      hasPhoto ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                    }`}
                  >
                    {/* Top Status Bar */}
                    <div className="p-3.5 pb-2 flex items-center justify-between border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">
                        {student.kelasNama || 'Kelas ?'}
                      </span>
                      {hasPhoto ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Foto Ada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Belum Foto
                        </span>
                      )}
                    </div>

                    {/* Photo Area with Pas Foto Frame (3:4 ratio) */}
                    <div className="p-4 flex flex-col items-center text-center">
                      <div
                        onClick={() => setSelectedStudentForModal(student)}
                        className="relative group/avatar cursor-pointer w-28 h-36 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-xs flex items-center justify-center transition-transform group-hover/avatar:scale-105"
                      >
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2 text-center">
                          <Camera className="w-6 h-6 text-indigo-300" />
                          <span className="text-[10px] font-extrabold">Ubah Pas Foto</span>
                        </div>
                      </div>

                      {/* Name and Info */}
                      <h4 className="font-extrabold text-sm text-slate-900 mt-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        NISN: <span className="font-mono font-bold text-slate-700">{student.nisn || '-'}</span>
                      </p>
                      {student.nis && (
                        <p className="text-[11px] text-slate-400 font-mono">NIS: {student.nis}</p>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedStudentForModal(student)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Unggah Foto
                      </button>

                      {hasPhoto && (
                        <button
                          onClick={() => handleResetPhoto(student)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                          title="Reset ke avatar standar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Pas Foto</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">NISN / NIS</th>
                      <th className="py-3 px-4">Kelas & Jurusan</th>
                      <th className="py-3 px-4">Status Pas Foto</th>
                      <th className="py-3 px-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const hasPhoto = Boolean(
                        student.avatar &&
                          !student.avatar.includes('dicebear.com') &&
                          student.avatar.trim() !== ''
                      );

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4">
                            <div
                              onClick={() => setSelectedStudentForModal(student)}
                              className="w-10 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-xs relative group cursor-pointer"
                            >
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera className="w-4 h-4" />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900">
                            {student.name}
                            <div className="text-[11px] text-slate-400 font-normal">
                              {student.jenisKelamin || 'Siswa'}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                            <div>{student.nisn || '-'}</div>
                            {student.nis && <div className="text-[10px] text-slate-400 font-mono">NIS: {student.nis}</div>}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-slate-800">{student.kelasNama || '-'}</span>
                            <div className="text-[11px] text-slate-400">{student.jurusanNama || '-'}</div>
                          </td>
                          <td className="py-2.5 px-4">
                            {hasPhoto ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Foto Resmi Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5" /> Belum Ada Pas Foto
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedStudentForModal(student)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Upload className="w-3.5 h-3.5" /> Ganti Foto
                              </button>
                              {hasPhoto && (
                                <button
                                  onClick={() => handleResetPhoto(student)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                  title="Reset foto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
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
        </div>
      )}

      {/* SUB-TAB 2: BATCH / MASS UPLOAD WITH SMART NISN MATCHER */}
      {activeSubTab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderUp className="w-5 h-5 text-indigo-600" /> Unggah Massal Pas Foto Siswa (Smart Matcher)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Pilih puluhan atau ratusan berkas foto sekaligus dari komputer Anda. Sistem akan otomatis
                  mencocokkan nama berkas foto dengan <strong>NISN</strong>, <strong>NIS</strong>, atau{' '}
                  <strong>Nama Siswa</strong> di database.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-2 rounded-2xl border border-indigo-100 text-xs font-bold">
                <Info className="w-4 h-4" /> Format Nama File: <span className="font-mono">NISN.jpg</span> atau <span className="font-mono">Nama_Siswa.png</span>
              </div>
            </div>

            {/* Drag and drop / file selector box */}
            <div
              onClick={() => batchFileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all rounded-3xl p-8 sm:p-12 text-center cursor-pointer group"
            >
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleBatchFileSelect}
                className="hidden"
              />
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FolderUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Klik atau Tarik & Letakkan Kumpulan Berkas Foto di Sini
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung banyak file sekaligus (JPG, PNG, WebP). Kompresi otomatis dilakukan secara aman.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-sm">
                <Upload className="w-4 h-4" /> Pilih Berkas Foto dari Komputer
              </div>
            </div>

            {/* Success notification */}
            {batchSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{batchSuccessMessage}</span>
              </div>
            )}

            {/* Matched Preview List */}
            {batchFiles.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Hasil Deteksi & Pencocokan Foto ({batchFiles.length} Berkas)
                    </h4>
                    <p className="text-xs text-slate-500">
                      {batchFiles.filter((b) => b.matchedStudent !== null).length} Cocok,{' '}
                      {batchFiles.filter((b) => b.matchedStudent === null).length} Belum Cocok
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBatchFiles([])}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      Bersihkan Daftar
                    </button>
                    <button
                      disabled={isProcessingBatch || batchFiles.filter((b) => b.matchedStudent !== null).length === 0}
                      onClick={handleApplyBatchPhotos}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isProcessingBatch ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan Foto...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Terapkan & Simpan Semua Foto Cocok
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-1">
                  {batchFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                        item.matchedStudent ? 'bg-white border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-14 h-18 object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[11px] font-bold text-slate-800 truncate" title={item.file.name}>
                            {item.file.name}
                          </p>

                          {item.matchedStudent ? (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                <Check className="w-3 h-3" /> Cocok via {item.matchType.toUpperCase()}
                              </span>
                              <p className="font-extrabold text-slate-900 text-xs mt-1 truncate">
                                {item.matchedStudent.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                NISN: {item.matchedStudent.nisn || '-'} • {item.matchedStudent.kelasNama}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                                <AlertCircle className="w-3 h-3" /> Tidak Ditemukan
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Pilih siswa manual:
                              </p>
                              <select
                                onChange={(e) => {
                                  const target = studentUsers.find((s) => s.id === e.target.value);
                                  const updated = [...batchFiles];
                                  updated[idx] = {
                                    ...updated[idx],
                                    matchedStudent: target || null,
                                    matchType: 'manual',
                                  };
                                  setBatchFiles(updated);
                                }}
                                className="mt-1 w-full bg-white border border-slate-200 rounded-lg p-1 text-[11px] font-medium"
                              >
                                <option value="">-- Pilih Siswa --</option>
                                {studentUsers.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.kelasNama} - {s.nisn})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => {
                            setBatchFiles(batchFiles.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STUDIO PEMOTRETAN LIVE (PHOTO BOOTH) */}
      {activeSubTab === 'booth' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" /> Studio Pemotretan Live Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ambil foto siswa secara langsung menggunakan kamera laptop/webcam. Pas foto akan langsung
              tersimpan ke profil siswa terpilih.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Camera & Live View */}
            <div className="lg:col-span-2 bg-slate-950 rounded-3xl overflow-hidden p-4 flex flex-col items-center justify-center relative min-h-[420px] text-white">
              {isCameraActive && (
                <div className="relative w-full max-w-md aspect-3/4 bg-black rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Face Framing Overlay Guide */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-white/60 shadow-inner flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                        Posisikan Wajah di Sini
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {capturedPhotoUrl && (
                <div className="relative w-full max-w-md aspect-3/4 bg-black rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl flex items-center justify-center">
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" /> Foto Terambil
                  </div>
                </div>
              )}

              {!isCameraActive && !capturedPhotoUrl && (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base">Kamera Sedang Tidak Aktif</h4>
                  {cameraError && (
                    <p className="text-xs text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-900">
                      {cameraError}
                    </p>
                  )}
                  <button
                    onClick={startBoothCamera}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Buka Kamera Live
                  </button>
                </div>
              )}

              {/* Camera Action Buttons */}
              <div className="mt-4 flex items-center gap-3">
                {isCameraActive && (
                  <>
                    <button
                      onClick={captureBoothPhoto}
                      disabled={!selectedBoothStudentId}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Camera className="w-5 h-5" /> Ambil Foto Sekarang (Jepret)
                    </button>
                    <button
                      onClick={stopBoothCamera}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl cursor-pointer"
                    >
                      Tutup Kamera
                    </button>
                  </>
                )}

                {capturedPhotoUrl && (
                  <>
                    <button
                      onClick={saveBoothPhotoToSelectedStudent}
                      disabled={!selectedBoothStudentId}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Simpan ke Profil Siswa
                    </button>
                    <button
                      onClick={() => {
                        setCapturedPhotoUrl(null);
                        startBoothCamera();
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Ambil Ulang
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right: Target Student Selection & Queue */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">1. Pilih Siswa yang Akan Difoto</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Target Siswa:
                  </label>
                  <select
                    value={selectedBoothStudentId}
                    onChange={(e) => setSelectedBoothStudentId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Siswa dari Daftar --</option>
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.kelasNama} - {s.nisn || 'No NISN'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Student Details Card */}
                {selectedBoothStudentId && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    {(() => {
                      const student = studentUsers.find((s) => s.id === selectedBoothStudentId);
                      if (!student) return null;
                      return (
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-12 h-16 object-cover rounded-xl border border-slate-200"
                          />
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm leading-tight">
                              {student.name}
                            </h5>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              NISN: {student.nisn || '-'}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              {student.kelasNama}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Quick List of students needing photo */}
                <div>
                  <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Antrean Belum Ada Foto</span>
                    <span className="text-amber-600 font-bold">{stats.filteredWithoutPhoto} Siswa</span>
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredStudents
                      .filter((s) => !s.avatar || s.avatar.includes('dicebear.com'))
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedBoothStudentId(s.id);
                            if (!isCameraActive && !capturedPhotoUrl) {
                              startBoothCamera();
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            selectedBoothStudentId === s.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span className="truncate">{s.name}</span>
                          <span className="text-[10px] opacity-75 font-mono">{s.kelasNama}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-medium">
                💡 <strong>Tips:</strong> Pastikan pencahayaan cukup dan siswa menghadap lurus ke arah kamera.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CETAK ALBUM LEMBAR PAS FOTO KELAS */}
      {activeSubTab === 'album' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" /> Cetak Lembar Album Pas Foto Siswa
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Format cetak album pas foto kelas standar untuk arsip wali kelas, buku induk, dan tata usaha.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak / Unduh PDF Lembar Foto
              </button>
            </div>

            {/* Printable Album Sheet */}
            <div className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-white print:border-none print:p-0">
              {/* Header Album */}
              <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1 mb-6">
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                  ALBUM PAS FOTO RESMI SISWA
                </h2>
                <h3 className="text-sm font-extrabold text-slate-800">
                  {schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN'}
                </h3>
                <p className="text-xs text-slate-600">
                  Kelas: <span className="font-bold text-slate-900">{selectedClassId === 'ALL' ? 'Semua Kelas' : classes.find((c) => c.id === selectedClassId)?.nama}</span> • Tahun Ajaran: 2024/2025
                </p>
              </div>

              {/* Grid 4x6 for printing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
                {filteredStudents.map((s, idx) => (
                  <div
                    key={s.id}
                    className="border border-slate-200 rounded-xl p-2.5 text-center flex flex-col items-center justify-between bg-slate-50/50"
                  >
                    <div className="w-20 h-26 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-2xs mb-2">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-full">
                      <p className="font-extrabold text-[11px] text-slate-900 truncate leading-tight">
                        {idx + 1}. {s.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        NISN: {s.nisn || '-'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {s.kelasNama}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Titimangsa & Tanda Tangan */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-800">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{schoolSettings?.kepalaSekolah || 'Kepala Sekolah'}</p>
                  <p className="text-[11px] text-slate-500">NIP. {schoolSettings?.nipKepalaSekolah || '-'}</p>
                </div>

                <div className="text-right">
                  <p>{schoolSettings?.kotaTitimangsa || 'Gunungkidul'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">Wali Kelas</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {classes.find((c) => c.id === selectedClassId)?.waliKelasNama || currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500">NIP/NBM. {currentUser.nip || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Photo Upload Modal */}
      {selectedStudentForModal && (
        <QuickPhotoModal
          user={selectedStudentForModal}
          isOpen={Boolean(selectedStudentForModal)}
          onClose={() => setSelectedStudentForModal(null)}
          onSavePhoto={(updated) => {
            onUpdateUser(updated);
            setSelectedStudentForModal(null);
          }}
        />
      )}
    </div>
  );
};
