import React, { useState, useMemo, useRef } from 'react';
import {
  Award,
  Plus,
  Save,
  Send,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Printer,
  Users,
  BookOpen,
} from 'lucide-react';
import { NilaiSiswa, User, MataPelajaran, Kelas } from '../../types';
import { exportToCSV, parseCSVText } from '../../utils/csvHelper';

interface InputNilaiProps {
  currentUser: User;
  grades: NilaiSiswa[];
  subjects: MataPelajaran[];
  classes: Kelas[];
  allUsers?: User[];
  onSaveGrade: (grade: NilaiSiswa) => void;
  onSaveBatchGrades?: (grades: NilaiSiswa[]) => void;
  onDeleteGrade?: (gradeId: string) => void;
}

interface ParsedGradeRow {
  siswaId: string;
  nisn: string;
  siswaNama: string;
  nh1: number;
  nh2: number;
  nh3: number;
  uts: number;
  uas: number;
  avgNH: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatanGuru: string;
  status: 'valid' | 'warning' | 'error';
  errorMessage?: string;
}

export const InputNilai: React.FC<InputNilaiProps> = ({
  currentUser,
  grades,
  subjects,
  classes,
  allUsers = [],
  onSaveGrade,
  onSaveBatchGrades,
  onDeleteGrade,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'rekap'>('upload');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || 'kls-10a');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || 'mapel-1');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2025/2026');

  // Search & Filters for Rekap
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Single Manual Input
  const [formSiswaId, setFormSiswaId] = useState('');
  const [siswaNama, setSiswaNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [nh1, setNh1] = useState<number>(85);
  const [nh2, setNh2] = useState<number>(88);
  const [nh3, setNh3] = useState<number>(90);
  const [uts, setUts] = useState<number>(85);
  const [uas, setUas] = useState<number>(90);
  const [catatanGuru, setCatatanGuru] = useState('Perkembangan belajar sangat baik, pertahankan prestasimu!');
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);

  // Upload & CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGradeRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadToast, setUploadToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notifyParentsOnBatch, setNotifyParentsOnBatch] = useState(true);

  // Helper objects
  const currentClassObj = useMemo(() => classes.find((c) => c.id === selectedClass) || classes[0], [classes, selectedClass]);
  const currentSubjectObj = useMemo(() => subjects.find((s) => s.id === selectedSubject) || subjects[0], [subjects, selectedSubject]);

  // Students in selected class
  const classStudents = useMemo(() => {
    const students = allUsers.filter(
      (u) => u.role === 'siswa' && (u.kelasId === selectedClass || (currentClassObj && u.kelasNama === currentClassObj.nama))
    );
    if (students.length > 0) return students;

    // Fallback sample students if none assigned yet
    return [
      { id: 'usr-siswa-1', name: 'Ahmad Fauzi', nisn: '0061234567', email: 'ahmad@siswa.smk.id', role: 'siswa' },
      { id: 'usr-siswa-2', name: 'Siti Aisyah', nisn: '0061234568', email: 'siti@siswa.smk.id', role: 'siswa' },
      { id: 'usr-siswa-3', name: 'Rizky Pratama', nisn: '0061234569', email: 'rizky@siswa.smk.id', role: 'siswa' },
      { id: 'usr-siswa-4', name: 'Dewi Lestari', nisn: '0061234570', email: 'dewi@siswa.smk.id', role: 'siswa' },
      { id: 'usr-siswa-5', name: 'Budi Santoso', nisn: '0061234571', email: 'budi@siswa.smk.id', role: 'siswa' },
    ] as User[];
  }, [allUsers, selectedClass, currentClassObj]);

  // Initialize first student in manual form if empty
  React.useEffect(() => {
    if (classStudents.length > 0 && !formSiswaId) {
      const first = classStudents[0];
      setFormSiswaId(first.id);
      setSiswaNama(first.name);
      setNisn(first.nisn || '');
    }
  }, [classStudents, formSiswaId]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setUploadToast({ message, type });
    setTimeout(() => setUploadToast(null), 4000);
  };

  const getPredikat = (score: number): 'A' | 'B' | 'C' | 'D' => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C';
    return 'D';
  };

  const calculateFinalScore = (n1: number, n2: number, n3: number, ut: number, ua: number) => {
    const avg = Math.round((n1 + n2 + n3) / 3);
    const finalScore = parseFloat((0.3 * avg + 0.35 * ut + 0.35 * ua).toFixed(1));
    return { avg, finalScore, predikat: getPredikat(finalScore) };
  };

  // -------------------------------------------------------------
  // 1. FITUR DOWNLOAD TEMPLATE NILAI BERDASARKAN KELAS & MAPEL
  // -------------------------------------------------------------
  const handleDownloadTemplate = () => {
    if (!currentClassObj || !currentSubjectObj) {
      showToast('Silakan pilih kelas dan mata pelajaran terlebih dahulu', 'error');
      return;
    }

    const headers = [
      'No',
      'NISN',
      'Nama_Siswa',
      'ID_Siswa',
      'Nilai_Harian_1',
      'Nilai_Harian_2',
      'Nilai_Harian_3',
      'Nilai_UTS',
      'Nilai_UAS',
      'Catatan_Guru',
    ];

    const rows = classStudents.map((st, idx) => {
      // Find existing grade if available
      const existing = grades.find(
        (g) =>
          (g.siswaId === st.id || g.nisn === st.nisn || g.siswaNama.toLowerCase() === st.name.toLowerCase()) &&
          g.mataPelajaranId === selectedSubject &&
          g.kelasId === selectedClass
      );

      return [
        idx + 1,
        st.nisn || '',
        st.name,
        st.id,
        existing ? existing.nilaiHarian[0] ?? '' : '',
        existing ? existing.nilaiHarian[1] ?? '' : '',
        existing ? existing.nilaiHarian[2] ?? '' : '',
        existing ? existing.nilaiUTS ?? '' : '',
        existing ? existing.nilaiUAS ?? '' : '',
        existing ? existing.catatanGuru ?? 'Bagus' : '',
      ];
    });

    const cleanClassName = currentClassObj.nama.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanMapelName = currentSubjectObj.nama.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Template_Nilai_${cleanMapelName}_Kelas_${cleanClassName}_${semester}_${tahunAjaran.replace('/', '-')}.csv`;

    exportToCSV(filename, headers, rows);
    showToast(`Template nilai untuk Kelas ${currentClassObj.nama} (${currentSubjectObj.nama}) berhasil diunduh!`, 'success');
  };

  // -------------------------------------------------------------
  // 2. FITUR UPLOAD / PARSING NILAI DARI CSV
  // -------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const { headers, rows } = parseCSVText(text);

        if (rows.length === 0) {
          showToast('File CSV kosong atau tidak memiliki baris data.', 'error');
          setIsProcessingFile(false);
          return;
        }

        // Find header indices (fuzzy match)
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normHeaders = headers.map(normalize);

        const idxNisn = normHeaders.findIndex((h) => h.includes('nisn'));
        const idxNama = normHeaders.findIndex((h) => h.includes('nama') || h.includes('siswa') || h.includes('name'));
        const idxId = normHeaders.findIndex((h) => h.includes('idsiswa') || h.includes('id'));
        const idxNh1 = normHeaders.findIndex((h) => h.includes('harian1') || h.includes('nh1') || h.includes('uh1'));
        const idxNh2 = normHeaders.findIndex((h) => h.includes('harian2') || h.includes('nh2') || h.includes('uh2'));
        const idxNh3 = normHeaders.findIndex((h) => h.includes('harian3') || h.includes('nh3') || h.includes('uh3'));
        const idxUts = normHeaders.findIndex((h) => h.includes('uts') || h.includes('mid') || h.includes('tengah'));
        const idxUas = normHeaders.findIndex((h) => h.includes('uas') || h.includes('pas') || h.includes('akhir'));
        const idxCatatan = normHeaders.findIndex((h) => h.includes('catatan') || h.includes('keterangan') || h.includes('note'));

        const parsed: ParsedGradeRow[] = [];

        rows.forEach((row, i) => {
          if (row.length < 2) return;

          const rowNisn = idxNisn >= 0 ? row[idxNisn]?.trim() : '';
          const rowNama = idxNama >= 0 ? row[idxNama]?.trim() : `Siswa ${i + 1}`;
          let rowSiswaId = idxId >= 0 && row[idxId]?.trim() ? row[idxId].trim() : '';

          // Match student with class student list
          const matchedStudent = classStudents.find(
            (s) => (rowSiswaId && s.id === rowSiswaId) || (rowNisn && s.nisn === rowNisn) || (rowNama && s.name.toLowerCase() === rowNama.toLowerCase())
          );

          if (matchedStudent) {
            rowSiswaId = matchedStudent.id;
          } else if (!rowSiswaId) {
            rowSiswaId = `usr-siswa-${Date.now()}-${i}`;
          }

          const rawNh1 = idxNh1 >= 0 ? parseFloat(row[idxNh1]) || 0 : 80;
          const rawNh2 = idxNh2 >= 0 ? parseFloat(row[idxNh2]) || 0 : 80;
          const rawNh3 = idxNh3 >= 0 ? parseFloat(row[idxNh3]) || 0 : 80;
          const rawUts = idxUts >= 0 ? parseFloat(row[idxUts]) || 0 : 80;
          const rawUas = idxUas >= 0 ? parseFloat(row[idxUASIndex(idxUas, row)] ?? '80') || 0 : 80;
          const rowCatatan = idxCatatan >= 0 && row[idxCatatan] ? row[idxCatatan].trim() : 'Telah mengikuti pembelajaran dengan baik';

          // Clamp scores between 0 and 100
          const n1 = Math.min(100, Math.max(0, rawNh1));
          const n2 = Math.min(100, Math.max(0, rawNh2));
          const n3 = Math.min(100, Math.max(0, rawNh3));
          const ut = Math.min(100, Math.max(0, rawUts));
          const ua = Math.min(100, Math.max(0, rawUas));

          const { avg, finalScore, predikat } = calculateFinalScore(n1, n2, n3, ut, ua);

          let status: 'valid' | 'warning' | 'error' = 'valid';
          let errorMessage: string | undefined;

          if (!rowNama) {
            status = 'error';
            errorMessage = 'Nama siswa kosong';
          } else if (rawNh1 > 100 || rawNh2 > 100 || rawNh3 > 100 || rawUts > 100 || rawUas > 100) {
            status = 'warning';
            errorMessage = 'Ada nilai melebihi batas 100 (otomatis disesuaikan)';
          }

          parsed.push({
            siswaId: rowSiswaId,
            nisn: rowNisn || (matchedStudent?.nisn ?? ''),
            siswaNama: rowNama,
            nh1: n1,
            nh2: n2,
            nh3: n3,
            uts: ut,
            uas: ua,
            avgNH: avg,
            nilaiAkhir: finalScore,
            predikat,
            catatanGuru: rowCatatan,
            status,
            errorMessage,
          });
        });

        function idxUASIndex(uasIdx: number, r: string[]) {
          return uasIdx >= 0 && uasIdx < r.length ? r[uasIdx] : undefined;
        }

        setParsedRows(parsed);
        setIsProcessingFile(false);
        showToast(`Berhasil membaca ${parsed.length} baris nilai dari file ${file.name}. Silakan periksa pratinjau sebelum menyimpan.`, 'info');
      } catch (err: any) {
        setIsProcessingFile(false);
        showToast(`Gagal membaca file CSV: ${err?.message || 'Format tidak valid'}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Edit single cell in parsed rows
  const handleUpdateParsedCell = (index: number, field: keyof ParsedGradeRow, value: any) => {
    const updated = [...parsedRows];
    const row = { ...updated[index], [field]: value };

    // Recalculate score if numerical values changed
    if (['nh1', 'nh2', 'nh3', 'uts', 'uas'].includes(field as string)) {
      const numVal = Math.min(100, Math.max(0, Number(value) || 0));
      row[field as 'nh1' | 'nh2' | 'nh3' | 'uts' | 'uas'] = numVal;
      const { avg, finalScore, predikat } = calculateFinalScore(row.nh1, row.nh2, row.nh3, row.uts, row.uas);
      row.avgNH = avg;
      row.nilaiAkhir = finalScore;
      row.predikat = predikat;
    }

    updated[index] = row;
    setParsedRows(updated);
  };

  // Remove row from parsed table
  const handleRemoveParsedRow = (index: number) => {
    setParsedRows(parsedRows.filter((_, i) => i !== index));
  };

  // Apply & Save Batch Grades
  const handleSaveBatchGrades = () => {
    if (parsedRows.length === 0) {
      showToast('Tidak ada data nilai yang valid untuk disimpan.', 'error');
      return;
    }

    const timestamp = new Date().toLocaleString('id-ID');
    const newGradesList: NilaiSiswa[] = parsedRows.map((row, idx) => ({
      id: `nil-${Date.now()}-${idx}`,
      siswaId: row.siswaId,
      siswaNama: row.siswaNama,
      nisn: row.nisn,
      kelasId: selectedClass,
      mataPelajaranId: selectedSubject,
      mataPelajaranNama: currentSubjectObj.nama,
      semester,
      tahunAjaran,
      nilaiHarian: [row.nh1, row.nh2, row.nh3],
      nilaiUTS: row.uts,
      nilaiUAS: row.uas,
      nilaiAkhir: row.nilaiAkhir,
      predikat: row.predikat,
      catatanGuru: row.catatanGuru,
      updatedAt: timestamp,
    }));

    if (onSaveBatchGrades) {
      onSaveBatchGrades(newGradesList);
    } else {
      newGradesList.forEach((g) => onSaveGrade(g));
    }

    showToast(
      `Berhasil menyimpan ${newGradesList.length} nilai siswa untuk mata pelajaran ${currentSubjectObj.nama} (Kelas ${currentClassObj.nama})!`,
      'success'
    );

    // Reset upload state and switch to rekap
    setParsedRows([]);
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('rekap');
  };

  // -------------------------------------------------------------
  // 3. SINGLE MANUAL SUBMIT
  // -------------------------------------------------------------
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaNama.trim()) {
      showToast('Nama siswa tidak boleh kosong', 'error');
      return;
    }

    const { finalScore, predikat } = calculateFinalScore(nh1, nh2, nh3, uts, uas);

    const gradePayload: NilaiSiswa = {
      id: editingGradeId || `nil-${Date.now()}`,
      siswaId: formSiswaId || `usr-siswa-${Date.now()}`,
      siswaNama,
      nisn,
      kelasId: selectedClass,
      mataPelajaranId: selectedSubject,
      mataPelajaranNama: currentSubjectObj.nama,
      semester,
      tahunAjaran,
      nilaiHarian: [nh1, nh2, nh3],
      nilaiUTS: uts,
      nilaiUAS: uas,
      nilaiAkhir: finalScore,
      predikat,
      catatanGuru,
      updatedAt: new Date().toLocaleString('id-ID'),
    };

    onSaveGrade(gradePayload);
    showToast(`Nilai ${siswaNama} (${currentSubjectObj.nama}) berhasil disimpan!`, 'success');
    setEditingGradeId(null);
    setActiveTab('rekap');
  };

  const handleEditGradeFromRekap = (g: NilaiSiswa) => {
    setEditingGradeId(g.id);
    setSelectedClass(g.kelasId);
    setSelectedSubject(g.mataPelajaranId);
    setFormSiswaId(g.siswaId);
    setSiswaNama(g.siswaNama);
    setNisn(g.nisn);
    setNh1(g.nilaiHarian[0] ?? 80);
    setNh2(g.nilaiHarian[1] ?? 80);
    setNh3(g.nilaiHarian[2] ?? 80);
    setUts(g.nilaiUTS);
    setUas(g.nilaiUAS);
    setCatatanGuru(g.catatanGuru);
    setActiveTab('manual');
  };

  // -------------------------------------------------------------
  // FILTERED GRADES FOR REKAP
  // -------------------------------------------------------------
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchClass = selectedClass === 'all' || g.kelasId === selectedClass;
      const matchSubject = selectedSubject === 'all' || g.mataPelajaranId === selectedSubject;
      const matchSearch =
        searchQuery === '' ||
        g.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.mataPelajaranNama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSubject && matchSearch;
    });
  }, [grades, selectedClass, selectedSubject, searchQuery]);

  // Export Rekap to CSV
  const handleExportRekapCSV = () => {
    const headers = ['No', 'NISN', 'Nama_Siswa', 'Mata_Pelajaran', 'Kelas', 'NH1', 'NH2', 'NH3', 'Rata2_NH', 'UTS', 'UAS', 'Nilai_Akhir', 'Predikat', 'Status', 'Catatan_Guru', 'Terakhir_Update'];
    const rows = filteredGrades.map((g, idx) => {
      const avgH = Math.round(g.nilaiHarian.reduce((a, b) => a + b, 0) / (g.nilaiHarian.length || 1));
      const className = classes.find((c) => c.id === g.kelasId)?.nama || g.kelasId;
      return [
        idx + 1,
        g.nisn,
        g.siswaNama,
        g.mataPelajaranNama,
        className,
        g.nilaiHarian[0] ?? '',
        g.nilaiHarian[1] ?? '',
        g.nilaiHarian[2] ?? '',
        avgH,
        g.nilaiUTS,
        g.nilaiUAS,
        g.nilaiAkhir,
        g.predikat,
        g.nilaiAkhir >= 75 ? 'TUNTAS' : 'REMEDIAL',
        g.catatanGuru,
        g.updatedAt,
      ];
    });
    const filename = `Rekap_Nilai_${currentSubjectObj.nama.replace(/\s+/g, '_')}_Kelas_${currentClassObj.nama.replace(/\s+/g, '_')}.csv`;
    exportToCSV(filename, headers, rows);
    showToast(`Rekap nilai berhasil diekspor ke file ${filename}`, 'success');
  };

  // Batch preview statistics
  const batchStats = useMemo(() => {
    if (parsedRows.length === 0) return null;
    const total = parsedRows.length;
    const totalScore = parsedRows.reduce((acc, r) => acc + r.nilaiAkhir, 0);
    const avg = parseFloat((totalScore / total).toFixed(1));
    const highest = Math.max(...parsedRows.map((r) => r.nilaiAkhir));
    const lowest = Math.min(...parsedRows.map((r) => r.nilaiAkhir));
    const passed = parsedRows.filter((r) => r.nilaiAkhir >= 75).length;
    const remedial = total - passed;
    return { total, avg, highest, lowest, passed, remedial };
  }, [parsedRows]);

  const manualFinal = useMemo(() => calculateFinalScore(nh1, nh2, nh3, uts, uas), [nh1, nh2, nh3, uts, uas]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {uploadToast && (
        <div
          className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
            uploadToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : uploadToast.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {uploadToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {uploadToast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {uploadToast.type === 'info' && <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{uploadToast.message}</span>
          </div>
          <button
            onClick={() => setUploadToast(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              E-PENILAIAN & RAPORT
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Tahun Ajaran {tahunAjaran} ({semester})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            Upload & Pengelolaan Nilai Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Unduh template CSV/Excel berdasarkan kelas dan unggah nilai secara massal per mata pelajaran dengan kalkulasi otomatis (30% NH + 35% UTS + 35% UAS) & notifikasi WhatsApp otomatis.
          </p>
        </div>

        {/* Global Context Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Pilih Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.nama} ({c.tingkat} {c.jurusanKode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Mata Pelajaran:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Nilai Massal & Download Template</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-500/20 text-white">
            Fitur Utama
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('manual');
            setEditingGradeId(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{editingGradeId ? 'Edit Nilai Siswa' : 'Input Manual Per Siswa'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rekapitulasi Nilai Kelas ({filteredGrades.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UPLOAD NILAI MASSAL & DOWNLOAD TEMPLATE BERDASARKAN KELAS & MAPEL */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Step 1 & Step 2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Step 1: Download Template Berdasarkan Kelas */}
            <div className="md:col-span-6 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 p-6 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                    Langkah 1: Download Template
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {classStudents.length} Siswa Terdaftar
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Download Format Template Excel / CSV
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Template ini otomatis memuat daftar seluruh nama siswa & NISN di{' '}
                  <strong className="text-emerald-900 font-bold">Kelas {currentClassObj?.nama}</strong> untuk mata pelajaran{' '}
                  <strong className="text-emerald-900 font-bold">{currentSubjectObj?.nama}</strong>. Guru hanya perlu mengisi angka nilai pada kolom yang tersedia.
                </p>

                {/* Template Content Preview Box */}
                <div className="mt-4 p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold border-b pb-1.5 text-[11px]">
                    <span>Target Kelas:</span>
                    <span className="font-bold text-slate-900">Kelas {currentClassObj?.nama}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 font-semibold border-b pb-1.5 text-[11px]">
                    <span>Target Mata Pelajaran:</span>
                    <span className="font-bold text-slate-900">{currentSubjectObj?.nama}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Kolom Format:</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      NH1, NH2, NH3, UTS, UAS, Catatan
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template Nilai Kelas {currentClassObj?.nama} (.CSV)</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Dapat dibuka dan diedit menggunakan Microsoft Excel, Google Sheets, WPS Office, atau Notepad.
                </p>
              </div>
            </div>

            {/* Step 2: Upload File Nilai */}
            <div className="md:col-span-6 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 p-6 rounded-3xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                    Langkah 2: Upload File Nilai
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {currentSubjectObj?.nama}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  Unggah File Nilai yang Telah Diisi
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Unggah file CSV yang telah diisi nilai harian, UTS, dan UAS. Sistem secara otomatis menghitung Nilai Akhir (30% NH + 35% UTS + 35% UAS) & menentukan predikat kelulusan.
                </p>

                {/* Dropzone / Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 p-5 bg-white border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-blue-50/40 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 group-hover:scale-110 flex items-center justify-center transition-all shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2">
                    {uploadedFileName ? (
                      <span className="text-blue-700 font-black flex items-center gap-1">
                        <FileSpreadsheet className="w-4 h-4" /> {uploadedFileName}
                      </span>
                    ) : (
                      'Klik untuk memilih file CSV / Excel Nilai'
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mendukung format CSV dengan pemisah koma atau titik koma
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-blue-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyParentsOnBatch}
                    onChange={(e) => setNotifyParentsOnBatch(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Kirim Notifikasi WhatsApp Otomatis ke Orang Tua Siswa</span>
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: Pratinjau & Validasi Data Hasil Upload */}
          {parsedRows.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2">
              {/* Preview Header & Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                      Pratinjau & Validasi Data
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Kelas {currentClassObj?.nama} • {currentSubjectObj?.nama}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Daftar Nilai Siap Disimpan ({parsedRows.length} Siswa)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nilai dihitung otomatis menggunakan formula kurikulum resmi. Anda masih dapat mengedit langsung angka nilai di tabel bawah sebelum menekan tombol simpan.
                  </p>
                </div>

                {/* Batch Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([]);
                      setUploadedFileName(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Batal / Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBatchGrades}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Simpan & Terapkan {parsedRows.length} Nilai Siswa
                  </button>
                </div>
              </div>

              {/* Statistics Metric Cards */}
              {batchStats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{batchStats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Rata-Rata Kelas</span>
                    <p className="text-lg font-black text-blue-700 mt-0.5">{batchStats.avg}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Nilai Tertinggi</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{batchStats.highest}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Nilai Terendah</span>
                    <p className="text-lg font-black text-amber-700 mt-0.5">{batchStats.lowest}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Siswa Tuntas (&gt;=75)</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{batchStats.passed}</p>
                  </div>
                  <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200/80">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Remedial (&lt;75)</span>
                    <p className="text-lg font-black text-rose-700 mt-0.5">{batchStats.remedial}</p>
                  </div>
                </div>
              )}

              {/* Editable Preview Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-3">NISN</th>
                      <th className="py-3 px-4 min-w-[160px]">Nama Siswa</th>
                      <th className="py-3 px-2 text-center w-16">NH 1</th>
                      <th className="py-3 px-2 text-center w-16">NH 2</th>
                      <th className="py-3 px-2 text-center w-16">NH 3</th>
                      <th className="py-3 px-2 text-center w-16 bg-slate-100/70">Rata NH</th>
                      <th className="py-3 px-2 text-center w-16">UTS</th>
                      <th className="py-3 px-2 text-center w-16">UAS</th>
                      <th className="py-3 px-3 text-center w-24 bg-blue-50/70 text-blue-900">Nilai Akhir</th>
                      <th className="py-3 px-2 text-center w-16">Predikat</th>
                      <th className="py-3 px-3">Catatan Guru</th>
                      <th className="py-3 px-2 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => {
                      const isRemedial = row.nilaiAkhir < 75;
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            row.status === 'warning' ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                            <input
                              type="text"
                              value={row.nisn}
                              onChange={(e) => handleUpdateParsedCell(idx, 'nisn', e.target.value)}
                              className="w-24 px-1.5 py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-xs font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            <input
                              type="text"
                              value={row.siswaNama}
                              onChange={(e) => handleUpdateParsedCell(idx, 'siswaNama', e.target.value)}
                              className="w-full px-1.5 py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-xs font-bold"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.nh1}
                              onChange={(e) => handleUpdateParsedCell(idx, 'nh1', e.target.value)}
                              className="w-14 text-center px-1 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-xs"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.nh2}
                              onChange={(e) => handleUpdateParsedCell(idx, 'nh2', e.target.value)}
                              className="w-14 text-center px-1 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-xs"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.nh3}
                              onChange={(e) => handleUpdateParsedCell(idx, 'nh3', e.target.value)}
                              className="w-14 text-center px-1 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-600 bg-slate-50/50">
                            {row.avgNH}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.uts}
                              onChange={(e) => handleUpdateParsedCell(idx, 'uts', e.target.value)}
                              className="w-14 text-center px-1 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-xs"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.uas}
                              onChange={(e) => handleUpdateParsedCell(idx, 'uas', e.target.value)}
                              className="w-14 text-center px-1 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center bg-blue-50/60">
                            <span
                              className={`text-sm font-black ${
                                isRemedial ? 'text-rose-600' : 'text-blue-700'
                              }`}
                            >
                              {row.nilaiAkhir}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                row.predikat === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.predikat === 'B'
                                  ? 'bg-blue-100 text-blue-800'
                                  : row.predikat === 'C'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.predikat}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.catatanGuru}
                              onChange={(e) => handleUpdateParsedCell(idx, 'catatanGuru', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-700 text-xs truncate"
                              placeholder="Catatan guru..."
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveParsedRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Sticky Submit Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl">
                <div>
                  <p className="text-xs font-bold">Siap Mengunggah Nilai ke Database</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Data akan otomatis terhubung ke E-Raport PDF dan memicu notifikasi WA orang tua.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveBatchGrades}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> SIMPAN SEMUA NILAI KELAS ({parsedRows.length} SISWA)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORM INPUT MANUAL SINGLE SISWA */}
      {/* ========================================================================= */}
      {activeTab === 'manual' && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              {editingGradeId ? 'Edit Nilai Siswa' : 'Form Input Nilai Manual Satuan'}
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Kelas {currentClassObj?.nama} • {currentSubjectObj?.nama}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Student Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Nama Siswa:</label>
              <select
                value={formSiswaId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setFormSiswaId(sId);
                  const st = classStudents.find((s) => s.id === sId);
                  if (st) {
                    setSiswaNama(st.name);
                    setNisn(st.nisn || '');
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50"
              >
                {classStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.nisn || 'NISN Belum Terisi'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NISN:</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="0061234567"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Harian 1 (NH1):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={nh1}
                onChange={(e) => setNh1(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Harian 2 (NH2):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={nh2}
                onChange={(e) => setNh2(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Harian 3 (NH3):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={nh3}
                onChange={(e) => setNh3(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai UTS (Tengah Semester):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={uts}
                onChange={(e) => setUts(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai UAS (Akhir Semester):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={uas}
                onChange={(e) => setUas(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Capaian Kompetensi Guru:</label>
              <input
                type="text"
                value={catatanGuru}
                onChange={(e) => setCatatanGuru(e.target.value)}
                placeholder="Catatan perkembangan belajar..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Kalkulasi Formula: 30% Rata-Rata NH + 35% UTS + 35% UAS
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl font-black text-blue-700">
                  Nilai Akhir: {manualFinal.finalScore}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-blue-100 text-blue-800">
                  Predikat {manualFinal.predikat}
                </span>
                <span
                  className={`text-xs font-bold ${
                    manualFinal.finalScore >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {manualFinal.finalScore >= 75 ? 'STATUS: TUNTAS (MEMENUHI KKM)' : 'STATUS: PERLU REMEDIAL'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingGradeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingGradeId(null);
                    setActiveTab('rekap');
                  }}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> SIMPAN & SINKRONISASI RAPORT
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REKAPITULASI & LEDGER NILAI KELAS */}
      {/* ========================================================================= */}
      {activeTab === 'rekap' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Rekapitulasi Nilai Terdaftar (Kelas {currentClassObj?.nama})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar nilai mata pelajaran {currentSubjectObj?.nama} yang tersimpan di sistem.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none w-48"
                />
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportRekapCSV}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Ekspor rekapitulasi nilai ke format CSV/Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredGrades.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Belum ada data nilai untuk kelas dan mapel ini</p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan tab <strong>Upload Nilai Massal</strong> atau <strong>Input Manual</strong> untuk mulai memasukkan nilai.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> Upload Nilai Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">NISN</th>
                    <th className="py-3 px-4 min-w-[150px]">Nama Siswa</th>
                    <th className="py-3 px-3">Mata Pelajaran</th>
                    <th className="py-3 px-2 text-center">Rata2 NH</th>
                    <th className="py-3 px-2 text-center">UTS</th>
                    <th className="py-3 px-2 text-center">UAS</th>
                    <th className="py-3 px-3 text-center bg-blue-50/70 text-blue-900">Nilai Akhir</th>
                    <th className="py-3 px-2 text-center">Predikat</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-slate-400">Terakhir Update</th>
                    <th className="py-3 px-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredGrades.map((g, idx) => {
                    const avgNH = Math.round(g.nilaiHarian.reduce((a, b) => a + b, 0) / (g.nilaiHarian.length || 1));
                    const isPassed = g.nilaiAkhir >= 75;
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{g.nisn}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{g.siswaNama}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{g.mataPelajaranNama}</td>
                        <td className="py-3 px-2 text-center text-slate-600 font-bold">{avgNH}</td>
                        <td className="py-3 px-2 text-center text-slate-600 font-bold">{g.nilaiUTS}</td>
                        <td className="py-3 px-2 text-center text-slate-600 font-bold">{g.nilaiUAS}</td>
                        <td className="py-3 px-3 text-center bg-blue-50/60">
                          <span className={`font-black text-sm ${isPassed ? 'text-blue-700' : 'text-rose-600'}`}>
                            {g.nilaiAkhir}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.predikat === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : g.predikat === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : g.predikat === 'C'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {g.predikat}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">{g.updatedAt}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditGradeFromRekap(g)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Nilai"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteGrade && (
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus data nilai ${g.siswaNama} (${g.mataPelajaranNama})?`)) {
                                    onDeleteGrade(g.id);
                                    showToast(`Data nilai ${g.siswaNama} berhasil dihapus`, 'info');
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Nilai"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          )}
        </div>
      )}
    </div>
  );
};
