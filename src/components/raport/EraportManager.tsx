import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  Edit,
  Save,
  Users,
  Award,
  Sparkles,
  Building2,
  GraduationCap,
  Layers,
  UserCheck,
  BookOpen,
  CheckSquare,
  Square,
  X,
  Check,
  Eye,
  Sliders,
  Calendar,
  MapPin,
  Phone,
  School,
  UserCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { RaportData, User, NilaiSiswa, SchoolSettings, Kelas, RaportPageSelection } from '../../types';
import { generateRaportPDF, generateBulkRaportPDF, DEFAULT_RAPORT_PAGES } from '../../utils/pdfGenerator';
import { MOCK_RAPORT } from '../../data/initialData';

interface EraportManagerProps {
  currentUser: User;
  grades: NilaiSiswa[];
  schoolSettings?: SchoolSettings;
  classes?: Kelas[];
  allUsers?: User[];
  onUpdateUser?: (updatedUser: User) => void;
  onUpdateSchoolSettings?: (settings: SchoolSettings) => void;
}

export const EraportManager: React.FC<EraportManagerProps> = ({
  currentUser,
  grades,
  schoolSettings,
  classes = [],
  allUsers = [],
  onUpdateUser,
  onUpdateSchoolSettings,
}) => {
  const studentList = allUsers.filter((u) => u.role === 'siswa');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser.role === 'siswa' ? currentUser.id : studentList[0]?.id || 'usr-siswa-1'
  );

  const activeStudent = studentList.find((s) => s.id === selectedStudentId) || studentList[0] || {
    id: 'usr-siswa-1',
    name: 'Ahmad Fauzi',
    nisn: '0061234567',
    kelasNama: '10 IPA 1',
    kelasId: 'kls-10a',
  };

  const studentClass = classes.find(
    (c) => c.id === activeStudent.kelasId || c.nama === activeStudent.kelasNama
  ) || classes[0];

  const matchedWaliTeacher = allUsers.find(
    (u) => u.id === studentClass?.waliKelasId || u.name === studentClass?.waliKelasNama
  );

  const dynamicWaliKelasNama = studentClass?.waliKelasNama || matchedWaliTeacher?.name || 'Budi Santoso S.Pd';
  const dynamicWaliKelasNip = matchedWaliTeacher?.nip || '1087654';
  const dynamicWaliKelasTipe = matchedWaliTeacher?.tipeIdentitasPegawai || 'NBM';
  const dynamicKepalaSekolahNama = schoolSettings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd';
  const dynamicKepalaSekolahNip = schoolSettings?.nipKepalaSekolah || '1092837';
  const dynamicKepalaSekolahTipe = schoolSettings?.tipeNomorKepalaSekolah || 'NBM';

  // Helper to extract city/district name cleanly from address strings
  const extractCityFromAddress = (addr?: string) => {
    if (!addr) return '';
    const parts = addr.split(',').map((s) => s.trim());
    if (parts.length >= 3) {
      return parts[parts.length - 2].replace(/^(Kec\.|Kecamatan|Kab\.|Kabupaten|Kota)\s+/i, '').trim();
    }
    if (parts.length >= 2) {
      return parts[1].replace(/^(Kec\.|Kecamatan|Kab\.|Kabupaten|Kota)\s+/i, '').trim();
    }
    return parts[0];
  };

  const fallbackCity =
    schoolSettings?.kotaTitimangsa ||
    schoolSettings?.kecamatan ||
    schoolSettings?.kabupaten ||
    extractCityFromAddress(schoolSettings?.kopAlamat) ||
    extractCityFromAddress(schoolSettings?.alamatSekolah) ||
    'Ngawen';

  // Filter actual grades for selected student
  const studentGrades = grades.filter(
    (g) => g.siswaId === activeStudent.id || g.siswaNama === activeStudent.name
  );

  const [raportState, setRaportState] = useState<RaportData>(() => ({
    ...MOCK_RAPORT,
    siswaId: activeStudent.id,
    siswaNama: activeStudent.name,
    nisn: activeStudent.nisn || '0061234567',
    nis: activeStudent.nis || '202510001',
    kelasNama: studentClass?.nama || activeStudent.kelasNama || '10 IPA 1',
    jurusanNama: activeStudent.jurusanNama || 'MIPA',
    waliKelasNama: dynamicWaliKelasNama,
    waliKelasNip: dynamicWaliKelasNip,
    waliKelasTipeNomor: dynamicWaliKelasTipe,
    kepalaSekolahNama: dynamicKepalaSekolahNama,
    kepalaSekolahNip: dynamicKepalaSekolahNip,
    kepalaSekolahTipeNomor: dynamicKepalaSekolahTipe,
    kotaTitimangsa: schoolSettings?.kotaTitimangsa || fallbackCity,
    nilaiList: studentGrades.length > 0 ? studentGrades : MOCK_RAPORT.nilaiList,
    tempatLahir: activeStudent.tempatLahir || 'Gunungkidul',
    tanggalLahir: activeStudent.tanggalLahir || '14 Mei 2008',
    jenisKelamin: activeStudent.jenisKelamin || 'Laki-laki',
    agama: activeStudent.agama || 'Islam',
    statusDalamKeluarga: activeStudent.statusDalamKeluarga || 'Anak Kandung',
    anakKe: activeStudent.anakKe || 1,
    alamatSiswa: activeStudent.alamatSiswa || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul',
    teleponSiswa: activeStudent.teleponSiswa || activeStudent.phone || '085711223344',
    sekolahAsal: activeStudent.sekolahAsal || 'SMP Negeri 1 Ngawen',
    diterimaKelas: activeStudent.diterimaKelas || studentClass?.nama || '10 IPA 1',
    diterimaTanggal: activeStudent.diterimaTanggal || '15 Juli 2025',
    namaAyah: activeStudent.namaAyah || 'Bambang Sudarmanto',
    namaIbu: activeStudent.namaIbu || 'Siti Rahmawati',
    pekerjaanAyah: activeStudent.pekerjaanAyah || 'Wiraswasta / Pedagang',
    pekerjaanIbu: activeStudent.pekerjaanIbu || 'Ibu Rumah Tangga',
    alamatOrtu: activeStudent.alamatOrtu || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul',
    teleponOrtu: activeStudent.teleponOrtu || '081288990011',
    namaWali: activeStudent.namaWali || '-',
    pekerjaanWali: activeStudent.pekerjaanWali || '-',
    alamatWali: activeStudent.alamatWali || '-',
  }));

  const dynamicKotaTitimangsa =
    raportState.kotaTitimangsa ||
    schoolSettings?.kotaTitimangsa ||
    fallbackCity;

  const [catatan, setCatatan] = useState(raportState.catatanWaliKelas);
  const [keputusan, setKeputusan] = useState(raportState.keputusan);

  // Active Live Preview Page Tab
  const [previewTab, setPreviewTab] = useState<'cover' | 'identity' | 'grades' | 'extracurricular'>('grades');

  // Print / Download Page Selection Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditBiodataOpen, setIsEditBiodataOpen] = useState(false);
  const [isEditKotaModalOpen, setIsEditKotaModalOpen] = useState(false);
  const [tempKotaInput, setTempKotaInput] = useState(dynamicKotaTitimangsa);
  const [isSaveKotaAsGlobal, setIsSaveKotaAsGlobal] = useState(true);
  const [pageSelection, setPageSelection] = useState<RaportPageSelection>({
    cover: true,
    identity: true,
    grades: true,
    extracurricular: true,
  });

  // Sync state if student changes
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const targetStudent = studentList.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const targetClass = classes.find(
      (c) => c.id === targetStudent.kelasId || c.nama === targetStudent.kelasNama
    ) || classes[0];

    const targetWali = allUsers.find(
      (u) => u.id === targetClass?.waliKelasId || u.name === targetClass?.waliKelasNama
    );

    const targetGrades = grades.filter(
      (g) => g.siswaId === targetStudent.id || g.siswaNama === targetStudent.name
    );

    const newRaport: RaportData = {
      ...MOCK_RAPORT,
      siswaId: targetStudent.id,
      siswaNama: targetStudent.name,
      nisn: targetStudent.nisn || '0061234567',
      nis: targetStudent.nis || '202510001',
      kelasNama: targetClass?.nama || targetStudent.kelasNama || '10 IPA 1',
      jurusanNama: targetStudent.jurusanNama || 'MIPA',
      waliKelasNama: targetClass?.waliKelasNama || targetWali?.name || 'Budi Santoso S.Pd',
      waliKelasNip: targetWali?.nip || '1087654',
      waliKelasTipeNomor: targetWali?.tipeIdentitasPegawai || 'NBM',
      kepalaSekolahNama: dynamicKepalaSekolahNama,
      kepalaSekolahNip: dynamicKepalaSekolahNip,
      kepalaSekolahTipeNomor: dynamicKepalaSekolahTipe,
      nilaiList: targetGrades.length > 0 ? targetGrades : MOCK_RAPORT.nilaiList,
      tempatLahir: targetStudent.tempatLahir || 'Gunungkidul',
      tanggalLahir: targetStudent.tanggalLahir || '14 Mei 2008',
      jenisKelamin: targetStudent.jenisKelamin || 'Laki-laki',
      agama: targetStudent.agama || 'Islam',
      statusDalamKeluarga: targetStudent.statusDalamKeluarga || 'Anak Kandung',
      anakKe: targetStudent.anakKe || 1,
      alamatSiswa: targetStudent.alamatSiswa || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul',
      teleponSiswa: targetStudent.teleponSiswa || targetStudent.phone || '085711223344',
      sekolahAsal: targetStudent.sekolahAsal || 'SMP Negeri 1 Ngawen',
      diterimaKelas: targetStudent.diterimaKelas || targetClass?.nama || '10 IPA 1',
      diterimaTanggal: targetStudent.diterimaTanggal || '15 Juli 2025',
      namaAyah: targetStudent.namaAyah || 'Bambang Sudarmanto',
      namaIbu: targetStudent.namaIbu || 'Siti Rahmawati',
      pekerjaanAyah: targetStudent.pekerjaanAyah || 'Wiraswasta / Pedagang',
      pekerjaanIbu: targetStudent.pekerjaanIbu || 'Ibu Rumah Tangga',
      alamatOrtu: targetStudent.alamatOrtu || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul',
      teleponOrtu: targetStudent.teleponOrtu || '081288990011',
      namaWali: targetStudent.namaWali || '-',
      pekerjaanWali: targetStudent.pekerjaanWali || '-',
      alamatWali: targetStudent.alamatWali || '-',
    };

    setRaportState(newRaport);
    setCatatan(newRaport.catatanWaliKelas);
    setKeputusan(newRaport.keputusan);
  };

  const handleSaveRaport = () => {
    setRaportState({
      ...raportState,
      catatanWaliKelas: catatan,
      keputusan,
    });
    alert('Catatan Wali Kelas & Keputusan Hasil Belajar Berhasil Diperbarui!');
  };

  const handleSaveKotaTitimangsa = (newKota: string, saveGlobal: boolean) => {
    const trimmed = newKota.trim() || 'Ngawen';
    setRaportState((prev) => ({
      ...prev,
      kotaTitimangsa: trimmed,
    }));

    if (saveGlobal && onUpdateSchoolSettings && schoolSettings) {
      onUpdateSchoolSettings({
        ...schoolSettings,
        kotaTitimangsa: trimmed,
      });
    }

    setIsEditKotaModalOpen(false);
  };

  const handleSaveBiodata = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedKota = (formData.get('kotaTitimangsa') as string)?.trim() || dynamicKotaTitimangsa;
    const updatedBio = {
      tempatLahir: formData.get('tempatLahir') as string,
      tanggalLahir: formData.get('tanggalLahir') as string,
      jenisKelamin: formData.get('jenisKelamin') as any,
      agama: formData.get('agama') as string,
      statusDalamKeluarga: formData.get('statusDalamKeluarga') as string,
      anakKe: Number(formData.get('anakKe')) || 1,
      alamatSiswa: formData.get('alamatSiswa') as string,
      teleponSiswa: formData.get('teleponSiswa') as string,
      sekolahAsal: formData.get('sekolahAsal') as string,
      diterimaKelas: formData.get('diterimaKelas') as string,
      diterimaTanggal: formData.get('diterimaTanggal') as string,
      kotaTitimangsa: updatedKota,
      namaAyah: formData.get('namaAyah') as string,
      namaIbu: formData.get('namaIbu') as string,
      pekerjaanAyah: formData.get('pekerjaanAyah') as string,
      pekerjaanIbu: formData.get('pekerjaanIbu') as string,
      alamatOrtu: formData.get('alamatOrtu') as string,
      teleponOrtu: formData.get('teleponOrtu') as string,
      namaWali: formData.get('namaWali') as string,
      pekerjaanWali: formData.get('pekerjaanWali') as string,
      alamatWali: formData.get('alamatWali') as string,
    };

    const newRaport = {
      ...raportState,
      ...updatedBio,
    };
    setRaportState(newRaport);

    if (onUpdateSchoolSettings && schoolSettings && updatedKota !== schoolSettings.kotaTitimangsa) {
      onUpdateSchoolSettings({
        ...schoolSettings,
        kotaTitimangsa: updatedKota,
      });
    }

    if (onUpdateUser && activeStudent) {
      onUpdateUser({
        ...activeStudent,
        ...updatedBio,
      });
    }

    setIsEditBiodataOpen(false);
    alert('Identitas Lengkap Peserta Didik Berhasil Disimpan!');
  };

  // Direct Execution of PDF Download with Selected Pages
  const handleExecuteDownloadPDF = (customPages?: RaportPageSelection) => {
    const pagesToPrint = customPages || pageSelection;
    const count = Object.values(pagesToPrint).filter(Boolean).length;
    if (count === 0) {
      alert('Silakan pilih minimal satu halaman untuk diunduh / dicetak.');
      return;
    }

    generateRaportPDF(
      {
        ...raportState,
        kotaTitimangsa: dynamicKotaTitimangsa,
        waliKelasNama: dynamicWaliKelasNama,
        waliKelasNip: dynamicWaliKelasNip,
        waliKelasTipeNomor: dynamicWaliKelasTipe,
        kepalaSekolahNama: dynamicKepalaSekolahNama,
        kepalaSekolahNip: dynamicKepalaSekolahNip,
        kepalaSekolahTipeNomor: dynamicKepalaSekolahTipe,
      },
      schoolSettings,
      pagesToPrint
    );

    setIsPrintModalOpen(false);
  };

  const handleDownloadBulkPDF = () => {
    const className = studentClass?.nama || '10 IPA 1';
    generateBulkRaportPDF(
      [
        {
          ...raportState,
          kotaTitimangsa: dynamicKotaTitimangsa,
          waliKelasNama: dynamicWaliKelasNama,
          waliKelasNip: dynamicWaliKelasNip,
          waliKelasTipeNomor: dynamicWaliKelasTipe,
          kepalaSekolahNama: dynamicKepalaSekolahNama,
          kepalaSekolahNip: dynamicKepalaSekolahNip,
          kepalaSekolahTipeNomor: dynamicKepalaSekolahTipe,
        },
      ],
      className,
      schoolSettings,
      pageSelection
    );
  };

  const handleTogglePage = (key: keyof RaportPageSelection) => {
    setPageSelection((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllPages = () => {
    setPageSelection({
      cover: true,
      identity: true,
      grades: true,
      extracurricular: true,
    });
  };

  const handleSelectCoverAndIdentityOnly = () => {
    setPageSelection({
      cover: true,
      identity: true,
      grades: false,
      extracurricular: false,
    });
  };

  const handleSelectGradesOnly = () => {
    setPageSelection({
      cover: false,
      identity: false,
      grades: true,
      extracurricular: true,
    });
  };

  const schoolName = schoolSettings?.kopNamaSekolah || schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN';
  const schoolAddress = schoolSettings?.kopAlamat || schoolSettings?.alamatSekolah || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul';
  const schoolPhone = schoolSettings?.telepon || '(0274) 123456';
  const schoolEmail = schoolSettings?.emailSekolah || 'smkmusangangawen@gmail.com';

  const selectedPagesCount = Object.values(pageSelection).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              E-Raport Digital & Buku Induk Raport
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Multi-Halaman & Pilihan Unduh
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" /> Sistem Kelola Raport Hasil Belajar Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak atau unduh per halaman: <b>Sampul Raport</b>, <b>Identitas Lengkap Siswa</b>, <b>Nilai Akademik</b>, dan <b>Catatan Pengesahan</b>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Titimangsa Kota / Kecamatan Quick Customizer */}
          {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
            <button
              onClick={() => {
                setTempKotaInput(dynamicKotaTitimangsa);
                setIsEditKotaModalOpen(true);
              }}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Kustomisasi Kota/Kecamatan Titimangsa Tanda Tangan"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Kota Raport: <b className="text-blue-950 underline">{dynamicKotaTitimangsa}</b></span>
            </button>
          )}

          {/* Edit Biodata Button */}
          {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsEditBiodataOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-amber-700" /> Edit Identitas Buku Induk
            </button>
          )}

          {/* Modal Trigger for Customized Page Download */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-300" /> Pilih Halaman & Cetak PDF
          </button>

          {/* Quick 1-Click All-Pages Download */}
          <button
            onClick={() => handleExecuteDownloadPDF({ cover: true, identity: true, grades: true, extracurricular: true })}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Unduh Lengkap (.pdf)
          </button>
        </div>
      </div>

      {/* Student Selector for Teachers & Admin */}
      {(currentUser.role === 'guru' || currentUser.role === 'admin') && studentList.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <label className="text-xs font-extrabold text-slate-800">
              Pilih Siswa untuk Ditampilkan / Dicetak Raportnya:
            </label>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => handleSelectStudent(e.target.value)}
            className="px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
          >
            {studentList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.kelasNama || '10 IPA 1'}) - NISN: {s.nisn || '0061234567'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Live Preview Page Navigation Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> Pratinjau Layar:
          </span>

          <button
            onClick={() => setPreviewTab('cover')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'cover'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" /> 1. Sampul Raport (Cover)
          </button>

          <button
            onClick={() => setPreviewTab('identity')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'identity'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCircle2 className="w-3.5 h-3.5 text-cyan-300" /> 2. Identitas Lengkap Siswa
          </button>

          <button
            onClick={() => setPreviewTab('grades')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'grades'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" /> 3. Nilai Capaian Belajar
          </button>

          <button
            onClick={() => setPreviewTab('extracurricular')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'extracurricular'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" /> 4. Ekstrakurikuler & Pengesahan
          </button>
        </div>

        {/* Download Button for Active Page Only */}
        <button
          onClick={() => {
            const singlePageMap: RaportPageSelection = {
              cover: previewTab === 'cover',
              identity: previewTab === 'identity',
              grades: previewTab === 'grades',
              extracurricular: previewTab === 'extracurricular',
            };
            handleExecuteDownloadPDF(singlePageMap);
          }}
          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Unduh Halaman Ini Saja
        </button>
      </div>

      {/* Wali Kelas Notes & Promotion Controls (Guru/Admin only) */}
      {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
            <Edit className="w-4 h-4 text-blue-600" /> Panel Pengisian Wali Kelas ({currentUser.name})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Wali Kelas untuk Raport {raportState.siswaNama}:
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keputusan Akhir Semester:</label>
              <select
                value={keputusan}
                onChange={(e) => setKeputusan(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              >
                <option value="Naik ke kelas XI">Naik ke kelas XI</option>
                <option value="Tinggal di kelas X">Tinggal di kelas X</option>
                <option value="Lulus">Lulus</option>
                <option value="Dalam Proses">Dalam Proses</option>
              </select>

              <button
                onClick={handleSaveRaport}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" /> SIMPAN PERUBAHAN RAPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SCREEN DOCUMENT PREVIEWS                                           */}
      {/* ================================================================= */}

      {/* 1. COVER / SAMPUL PREVIEW */}
      {previewTab === 'cover' && (
        <div className="bg-white p-10 sm:p-14 rounded-2xl border-4 border-blue-900 shadow-xl max-w-3xl mx-auto text-center space-y-8 relative overflow-hidden">
          {/* Inner Decorative Border */}
          <div className="absolute inset-3 border-2 border-amber-600/60 rounded pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <p className="text-xs font-extrabold text-blue-900 tracking-wider uppercase">
              KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
            </p>
            <p className="text-[11px] font-bold text-slate-600 uppercase">REPUBLIK INDONESIA</p>
          </div>

          {/* Center Logo */}
          <div className="flex justify-center relative z-10 py-2">
            {schoolSettings?.logoUrl || schoolSettings?.logoKiriUrl ? (
              <img
                src={schoolSettings.logoUrl || schoolSettings.logoKiriUrl}
                alt="Logo Sekolah"
                className="w-24 h-24 object-contain drop-shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-900 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                SMK
              </div>
            )}
          </div>

          {/* Main Title */}
          <div className="space-y-1 relative z-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">RAPOR PESERTA DIDIK</h1>
            <h2 className="text-base font-extrabold text-blue-900 tracking-wide uppercase">
              SEKOLAH MENENGAH ATAS / KEJURUAN
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              (KURIKULUM MERDEKA / SISTEM INFORMASI AKADEMIK)
            </p>
          </div>

          {/* Student Box */}
          <div className="max-w-md mx-auto p-6 bg-slate-50 border-2 border-slate-300 rounded-2xl shadow-inner space-y-2 relative z-10">
            <p className="text-xs text-slate-500 font-medium">Nama Peserta Didik :</p>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {raportState.siswaNama}
            </h3>
            <p className="text-xs text-slate-500 font-medium pt-1">NISN / NIS :</p>
            <p className="text-base font-black font-mono text-amber-600">
              {raportState.nisn} / {raportState.nis || '202510001'}
            </p>
            <div className="pt-2 text-xs font-bold text-slate-700">
              Kelas: <span className="text-blue-900">{raportState.kelasNama}</span> • Jurusan:{' '}
              <span className="text-blue-900">{raportState.jurusanNama || 'MIPA / TKJ'}</span>
            </div>
          </div>

          {/* School Bottom Metadata */}
          <div className="space-y-1.5 pt-6 relative z-10">
            <p className="text-xs text-slate-500 font-medium">Nama Sekolah :</p>
            <h3 className="text-lg font-black text-blue-900 uppercase">{schoolName}</h3>
            <p className="text-xs text-slate-600 font-medium">
              NPSN: {schoolSettings?.npsn || '20338514'} • Terakreditasi {schoolSettings?.akreditasi || 'A'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{schoolAddress}</p>
            <p className="text-sm font-black text-slate-900 pt-3">
              TAHUN PELAJARAN {raportState.tahunAjaran}
            </p>
          </div>
        </div>
      )}

      {/* 2. IDENTITAS LENGKAP SISWA PREVIEW (BUKU INDUK) */}
      {previewTab === 'identity' && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-3 border-b-2 border-slate-900">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
              KETERANGAN TENTANG DIRI PESERTA DIDIK
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              (Buku Induk Raport Peserta Didik Format Resmi Kemdikbud)
            </p>
          </div>

          {/* 14 Official Points Table */}
          <div className="text-xs text-slate-800 leading-relaxed font-medium">
            <table className="w-full border-collapse">
              <tbody className="space-y-1">
                <tr className="hover:bg-slate-50">
                  <td className="w-8 py-1.5 font-bold">1.</td>
                  <td className="w-64 py-1.5 font-semibold text-slate-700">Nama Peserta Didik (Lengkap)</td>
                  <td className="w-4 py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-black uppercase text-slate-900 text-[13px]">{raportState.siswaNama}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">2.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Nomor Induk Siswa Nasional (NISN)</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-mono font-bold text-blue-900">{raportState.nisn}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">3.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Nomor Induk Siswa (NIS)</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-mono font-bold text-slate-800">{raportState.nis || '202510001'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">4.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Tempat, Tanggal Lahir</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">
                    {raportState.tempatLahir || 'Gunungkidul'}, {raportState.tanggalLahir || '14 Mei 2008'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">5.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Jenis Kelamin</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.jenisKelamin || 'Laki-laki'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">6.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Agama & Kepercayaan</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.agama || 'Islam'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">7.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Status dalam Keluarga</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.statusDalamKeluarga || 'Anak Kandung'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">8.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Anak Ke-</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.anakKe || 1} (Satu)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">9.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Alamat Peserta Didik</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.alamatSiswa || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">10.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Nomor Telepon / HP Siswa</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.teleponSiswa || '085711223344'}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 font-bold">11.</td>
                  <td className="py-1.5 font-semibold text-slate-700">Sekolah Asal (SMP / MTs)</td>
                  <td className="py-1.5 font-bold text-center">:</td>
                  <td className="py-1.5 font-semibold text-slate-900">{raportState.sekolahAsal || 'SMP Negeri 1 Ngawen'}</td>
                </tr>

                {/* Point 12 */}
                <tr>
                  <td className="py-1.5 font-bold align-top">12.</td>
                  <td className="py-1.5 font-semibold text-slate-700 align-top">Diterima di Sekolah ini :</td>
                  <td className="py-1.5 font-bold text-center align-top">:</td>
                  <td className="py-1.5">
                    <div className="space-y-1">
                      <div>a. Di Kelas: <span className="font-bold text-slate-900">{raportState.diterimaKelas || raportState.kelasNama}</span></div>
                      <div>b. Pada Tanggal: <span className="font-bold text-slate-900">{raportState.diterimaTanggal || '15 Juli 2025'}</span></div>
                      <div>c. Semester: <span className="font-bold text-slate-900">{raportState.semester === 'Genap' ? '2 (Genap)' : '1 (Ganjil)'}</span></div>
                    </div>
                  </td>
                </tr>

                {/* Point 13 */}
                <tr>
                  <td className="py-1.5 font-bold align-top">13.</td>
                  <td className="py-1.5 font-semibold text-slate-700 align-top">Data Orang Tua Kandung :</td>
                  <td className="py-1.5 font-bold text-center align-top">:</td>
                  <td className="py-1.5">
                    <div className="space-y-1">
                      <div>a. Nama Ayah: <span className="font-bold text-slate-900">{raportState.namaAyah || 'Bambang Sudarmanto'}</span></div>
                      <div>b. Nama Ibu: <span className="font-bold text-slate-900">{raportState.namaIbu || 'Siti Rahmawati'}</span></div>
                      <div>c. Pekerjaan Ayah: <span className="font-semibold text-slate-800">{raportState.pekerjaanAyah || 'Wiraswasta / Pedagang'}</span></div>
                      <div>d. Pekerjaan Ibu: <span className="font-semibold text-slate-800">{raportState.pekerjaanIbu || 'Ibu Rumah Tangga'}</span></div>
                      <div>e. Alamat Orang Tua: <span className="font-semibold text-slate-800">{raportState.alamatOrtu || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul'}</span></div>
                      <div>f. No. Telepon / HP Ortu: <span className="font-semibold text-slate-800">{raportState.teleponOrtu || '081288990011'}</span></div>
                    </div>
                  </td>
                </tr>

                {/* Point 14 */}
                <tr>
                  <td className="py-1.5 font-bold align-top">14.</td>
                  <td className="py-1.5 font-semibold text-slate-700 align-top">Data Wali Siswa (Jika Ada) :</td>
                  <td className="py-1.5 font-bold text-center align-top">:</td>
                  <td className="py-1.5">
                    <div className="space-y-1">
                      <div>a. Nama Wali: <span className="font-semibold text-slate-800">{raportState.namaWali || '-'}</span></div>
                      <div>b. Pekerjaan Wali: <span className="font-semibold text-slate-800">{raportState.pekerjaanWali || '-'}</span></div>
                      <div>c. Alamat Wali: <span className="font-semibold text-slate-800">{raportState.alamatWali || '-'}</span></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Section: Pas Foto & Signature */}
          <div className="pt-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 border-t border-slate-200">
            {/* Pas Foto 3x4 */}
            <div className="w-28 h-36 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-center p-2 bg-slate-50 shrink-0">
              {activeStudent.avatar ? (
                <img
                  src={activeStudent.avatar}
                  alt={raportState.siswaNama}
                  className="w-full h-full object-cover rounded-lg shadow-xs"
                />
              ) : (
                <>
                  <p className="text-[11px] font-bold text-slate-600">PAS FOTO</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">3 x 4 CM</p>
                </>
              )}
            </div>

            {/* Signature Block */}
            <div className="text-right sm:text-left text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 justify-end sm:justify-start group">
                <p className="font-medium text-slate-800">
                  {dynamicKotaTitimangsa}, {raportState.diterimaTanggal || '15 Juli 2025'}
                </p>
                {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempKotaInput(dynamicKotaTitimangsa);
                      setIsEditKotaModalOpen(true);
                    }}
                    className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer border border-blue-200"
                    title="Ubah Kota/Kecamatan Titimangsa"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="font-bold text-slate-900">Kepala Sekolah,</p>
              <div className="h-16" />
              <p className="font-extrabold text-slate-900 underline">{dynamicKepalaSekolahNama}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                {dynamicKepalaSekolahTipe === 'Tanpa Nomor' || !dynamicKepalaSekolahNip
                  ? '-'
                  : `${dynamicKepalaSekolahTipe}. ${dynamicKepalaSekolahNip}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. NILAI CAPAIAN BELAJAR (E-RAPORT) PREVIEW */}
      {previewTab === 'grades' && (
        <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-lg space-y-6 max-w-4xl mx-auto">
          {/* Kop Surat Header Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              {/* Logo Kiri */}
              {schoolSettings?.showLogoKiri !== false && (schoolSettings?.logoKiriUrl || schoolSettings?.logoUrl) ? (
                <div
                  className="shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${schoolSettings?.logoKiriSize || 64}px`,
                    height: `${schoolSettings?.logoKiriSize || 64}px`,
                  }}
                >
                  <img
                    src={schoolSettings.logoKiriUrl || schoolSettings.logoUrl}
                    alt="Logo Kiri"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div style={{ width: `${schoolSettings?.logoKiriSize || 64}px` }} className="shrink-0" />
              )}

              {/* Kop Center Text */}
              <div className="flex-1 text-center space-y-0.5 px-2">
                <h3 className="font-extrabold text-xs tracking-wide uppercase text-slate-800">
                  {schoolSettings?.kopBaris1 || 'PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA'}
                </h3>
                <h3 className="font-extrabold text-xs tracking-wide uppercase text-slate-800">
                  {schoolSettings?.kopBaris2 || 'DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA'}
                </h3>
                {schoolSettings?.kopBaris3 && (
                  <h4 className="font-bold text-[11px] tracking-wide uppercase text-slate-700">
                    {schoolSettings.kopBaris3}
                  </h4>
                )}
                <h2
                  className="font-black text-lg uppercase tracking-tight py-0.5"
                  style={{ color: schoolSettings?.kopWarnaTeksSekolah || '#1e3a8a' }}
                >
                  {schoolSettings?.kopNamaSekolah || schoolName}
                </h2>
                <p className="text-[11px] text-slate-700 font-bold">
                  {schoolSettings?.kopInfoSubSekolah ||
                    (schoolSettings?.npsn
                      ? `NPSN: ${schoolSettings.npsn} • Terakreditasi ${schoolSettings.akreditasi || 'A'}`
                      : 'NPSN: 20338514 • Terakreditasi A')}
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  {schoolSettings?.kopAlamat || `${schoolAddress} | Telp: ${schoolPhone} | Email: ${schoolEmail}`}
                </p>
              </div>

              {/* Logo Kanan */}
              {schoolSettings?.showLogoKanan !== false && schoolSettings?.logoKananUrl ? (
                <div
                  className="shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${schoolSettings?.logoKananSize || 64}px`,
                    height: `${schoolSettings?.logoKananSize || 64}px`,
                  }}
                >
                  <img
                    src={schoolSettings.logoKananUrl}
                    alt="Logo Kanan"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div style={{ width: `${schoolSettings?.logoKananSize || 64}px` }} className="shrink-0" />
              )}
            </div>

            {/* Divider Line */}
            <div className="space-y-0.5 pt-1">
              <div className="h-[2px] bg-slate-900 w-full" />
              <div className="h-[0.75px] bg-slate-900 w-full" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h4 className="font-extrabold text-base text-slate-900 uppercase tracking-wider underline">
              LAPORAN HASIL BELAJAR SISWA (E-RAPORT)
            </h4>
          </div>

          {/* Student Information Grid - Presisi 2 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <table className="w-full border-collapse">
              <tbody className="space-y-1">
                <tr>
                  <td className="w-36 text-slate-600 font-medium py-1 whitespace-nowrap">Nama Peserta Didik</td>
                  <td className="w-4 text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-bold text-slate-900 py-1">{raportState.siswaNama}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium py-1 whitespace-nowrap">NIS / NISN</td>
                  <td className="text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-mono font-bold text-slate-900 py-1">
                    {raportState.nis || '202510001'} / {raportState.nisn}
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium py-1 whitespace-nowrap">Kelas</td>
                  <td className="text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-bold text-slate-900 py-1">{raportState.kelasNama}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse">
              <tbody className="space-y-1">
                <tr>
                  <td className="w-32 text-slate-600 font-medium py-1 whitespace-nowrap">Semester</td>
                  <td className="w-4 text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-bold text-slate-900 py-1">{raportState.semester}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium py-1 whitespace-nowrap">Tahun Pelajaran</td>
                  <td className="text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-bold text-slate-900 py-1">{raportState.tahunAjaran}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium py-1 whitespace-nowrap">Wali Kelas</td>
                  <td className="text-slate-500 font-bold text-center py-1">:</td>
                  <td className="font-bold text-slate-900 py-1">{dynamicWaliKelasNama}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-blue-900 text-white font-bold">
                <tr>
                  <th className="p-2 border border-slate-300 text-center">No</th>
                  <th className="p-2 border border-slate-300">Mata Pelajaran</th>
                  <th className="p-2 border border-slate-300 text-center">KKM</th>
                  <th className="p-2 border border-slate-300 text-center">NH</th>
                  <th className="p-2 border border-slate-300 text-center">UTS</th>
                  <th className="p-2 border border-slate-300 text-center">UAS</th>
                  <th className="p-2 border border-slate-300 text-center">Nilai Akhir</th>
                  <th className="p-2 border border-slate-300 text-center">Predikat</th>
                  <th className="p-2 border border-slate-300">Catatan Capaian Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {raportState.nilaiList.map((n, idx) => (
                  <tr key={n.id || idx} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-bold">{n.mataPelajaranNama}</td>
                    <td className="p-2 border border-slate-300 text-center">75</td>
                    <td className="p-2 border border-slate-300 text-center">
                      {n.nilaiHarian
                        ? Math.round(n.nilaiHarian.reduce((a, b) => a + b, 0) / n.nilaiHarian.length)
                        : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">{n.nilaiUTS}</td>
                    <td className="p-2 border border-slate-300 text-center">{n.nilaiUAS}</td>
                    <td className="p-2 border border-slate-300 text-center font-black text-blue-800">
                      {n.nilaiAkhir}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{n.predikat}</td>
                    <td className="p-2 border border-slate-300 text-[11px] italic">
                      {n.catatanGuru || (n.nilaiAkhir >= 75 ? 'Tuntas dengan sangat baik' : 'Perlu bimbingan remedi')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EKSTRAKURIKULER & PENGESAHAN PREVIEW */}
      {previewTab === 'extracurricular' && (
        <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-lg space-y-6 max-w-4xl mx-auto">
          <div className="text-center pb-2 border-b border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              CATATAN PERKEMBANGAN & PENGESAHAN RAPORT
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Peserta Didik: {raportState.siswaNama} (NISN: {raportState.nisn}) • Kelas: {raportState.kelasNama}
            </p>
          </div>

          {/* Extracurricular & Attendance Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 mb-1">Kegiatan Ekstrakurikuler:</h5>
              <table className="w-full border border-slate-300">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-1.5 border border-slate-300">Kegiatan</th>
                    <th className="p-1.5 border border-slate-300 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {raportState.ekstrakurikuler.map((e, i) => (
                    <tr key={i}>
                      <td className="p-1.5 border border-slate-300 font-semibold">{e.nama}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold">{e.predikat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">Kehadiran (Presensi):</h5>
              <table className="w-full border border-slate-300">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-1.5 border border-slate-300">Alasan</th>
                    <th className="p-1.5 border border-slate-300 text-center">Jumlah Hari</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1.5 border border-slate-300">Sakit</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {raportState.kehadiran?.sakit || 0} hari
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-300">Izin</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {raportState.kehadiran?.izin || 0} hari
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-300">Tanpa Keterangan (Alpa)</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {raportState.kehadiran?.alpa || 0} hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Homeroom Notes Box */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl text-xs">
            <p className="font-bold text-amber-900">Catatan Wali Kelas ({dynamicWaliKelasNama}):</p>
            <p className="text-slate-800 italic mt-1 font-medium leading-relaxed">
              "{raportState.catatanWaliKelas}"
            </p>
          </div>

          {/* Promotion Decision */}
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
            <span>Keputusan Hasil Belajar:</span>
            <span className="text-sm uppercase tracking-wide">{raportState.keputusan}</span>
          </div>

          {/* Official 3-Party Signatures Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-center pt-6 font-medium border-t border-slate-200">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold text-slate-700">Orang Tua / Wali Siswa</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">( ............................................. )</p>
            </div>

            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold text-slate-700">Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">{dynamicKepalaSekolahNama}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {dynamicKepalaSekolahTipe === 'Tanpa Nomor' || !dynamicKepalaSekolahNip
                  ? '-'
                  : `${dynamicKepalaSekolahTipe}. ${dynamicKepalaSekolahNip}`}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 group">
                <p>
                  {dynamicKotaTitimangsa}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempKotaInput(dynamicKotaTitimangsa);
                      setIsEditKotaModalOpen(true);
                    }}
                    className="p-0.5 rounded-md hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    title="Ubah Kota/Kecamatan Titimangsa"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <p className="font-semibold text-slate-700">Wali Kelas {raportState.kelasNama}</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">{dynamicWaliKelasNama}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {dynamicWaliKelasTipe === 'Tanpa Nomor' || !dynamicWaliKelasNip
                  ? '-'
                  : `${dynamicWaliKelasTipe}. ${dynamicWaliKelasNip}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PILIH HALAMAN UNTUK MENCETAK / MENDOWNLOAD RAPORT           */}
      {/* ================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  Opsi Cetak & Unduh Raport
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
                  <Sliders className="w-5 h-5 text-blue-600" /> Pilih Halaman yang Ingin Dicetak / Diunduh
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilihan Cepat Halaman:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPages}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedPagesCount === 4
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua Halaman (Lengkap)
                </button>
                <button
                  type="button"
                  onClick={handleSelectCoverAndIdentityOnly}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    pageSelection.cover && pageSelection.identity && !pageSelection.grades && !pageSelection.extracurricular
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Sampul + Identitas
                </button>
                <button
                  type="button"
                  onClick={handleSelectGradesOnly}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !pageSelection.cover && !pageSelection.identity && pageSelection.grades && pageSelection.extracurricular
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nilai + Catatan
                </button>
              </div>
            </div>

            {/* Interactive Page Checklist */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-slate-700">Checklist Halaman Dokumen PDF:</label>

              {/* 1. Cover */}
              <div
                onClick={() => handleTogglePage('cover')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  pageSelection.cover ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {pageSelection.cover ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Halaman 1: Sampul / Cover Raport</h4>
                    <p className="text-[11px] text-slate-500">
                      Cover resmi berkurikulum merdeka, logo sekolah, identitas nama siswa besar, NISN, dan TA.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                  Cover
                </span>
              </div>

              {/* 2. Identity */}
              <div
                onClick={() => handleTogglePage('identity')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  pageSelection.identity ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {pageSelection.identity ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Halaman 2: Lembar Identitas Lengkap Peserta Didik</h4>
                    <p className="text-[11px] text-slate-500">
                      Format Buku Induk Kemdikbud (14 butir lengkap, data ortu/wali, kotak pas foto 3x4 & TTD Kepsek).
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                  Buku Induk
                </span>
              </div>

              {/* 3. Grades */}
              <div
                onClick={() => handleTogglePage('grades')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  pageSelection.grades ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {pageSelection.grades ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Halaman 3: Halaman Capaian Nilai Hasil Belajar</h4>
                    <p className="text-[11px] text-slate-500">
                      Kop surat resmi sekolah, tabel KKM, NH, UTS, UAS, Nilai Akhir, Predikat, dan Catatan Guru.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  E-Raport
                </span>
              </div>

              {/* 4. Extracurricular & Signatures */}
              <div
                onClick={() => handleTogglePage('extracurricular')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  pageSelection.extracurricular ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {pageSelection.extracurricular ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Halaman 4: Ekstrakurikuler, Catatan & Pengesahan</h4>
                    <p className="text-[11px] text-slate-500">
                      Tabel ekskul, presensi kehadiran, catatan wali kelas, kenaikan kelas, dan TTD 3 Pihak resmi.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Pengesahan
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-semibold">
                Terpilih: <span className="font-black text-blue-700">{selectedPagesCount} dari 4 Halaman</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex-1 sm:flex-none cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteDownloadPDF()}
                  disabled={selectedPagesCount === 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF ({selectedPagesCount} Halaman)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EDIT IDENTITAS LENGKAP BUKU INDUK SISWA                    */}
      {/* ================================================================= */}
      {isEditBiodataOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                  Buku Induk Raport Peserta Didik
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
                  <UserCheck className="w-5 h-5 text-amber-600" /> Edit Identitas Lengkap ({raportState.siswaNama})
                </h3>
              </div>
              <button
                onClick={() => setIsEditBiodataOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBiodata} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempatLahir"
                    defaultValue={raportState.tempatLahir || 'Gunungkidul'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    name="tanggalLahir"
                    defaultValue={raportState.tanggalLahir || '14 Mei 2008'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    name="jenisKelamin"
                    defaultValue={raportState.jenisKelamin || 'Laki-laki'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agama & Kepercayaan</label>
                  <input
                    type="text"
                    name="agama"
                    defaultValue={raportState.agama || 'Islam'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status dalam Keluarga</label>
                  <input
                    type="text"
                    name="statusDalamKeluarga"
                    defaultValue={raportState.statusDalamKeluarga || 'Anak Kandung'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anak Ke-</label>
                  <input
                    type="number"
                    name="anakKe"
                    defaultValue={raportState.anakKe || 1}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tempat Tinggal Siswa</label>
                  <input
                    type="text"
                    name="alamatSiswa"
                    defaultValue={raportState.alamatSiswa || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / HP Siswa</label>
                  <input
                    type="text"
                    name="teleponSiswa"
                    defaultValue={raportState.teleponSiswa || '085711223344'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sekolah Asal (SMP / MTs)</label>
                  <input
                    type="text"
                    name="sekolahAsal"
                    defaultValue={raportState.sekolahAsal || 'SMP Negeri 1 Ngawen'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diterima di Kelas</label>
                  <input
                    type="text"
                    name="diterimaKelas"
                    defaultValue={raportState.diterimaKelas || raportState.kelasNama}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diterima pada Tanggal</label>
                  <input
                    type="text"
                    name="diterimaTanggal"
                    defaultValue={raportState.diterimaTanggal || '15 Juli 2025'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Kota / Kecamatan Titimangsa Raport (Tempat Tanda Tangan)
                    </span>
                    <span className="text-[10px] text-blue-600 font-normal">Contoh: Ngawen, Gunungkidul, Sleman, Yogyakarta</span>
                  </label>
                  <input
                    type="text"
                    name="kotaTitimangsa"
                    defaultValue={raportState.kotaTitimangsa || dynamicKotaTitimangsa}
                    placeholder="Contoh: Ngawen / Gunungkidul / Kota Sekolah"
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-semibold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t font-bold text-xs text-blue-900">
                  Data Orang Tua & Wali Siswa:
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah Kandung</label>
                  <input
                    type="text"
                    name="namaAyah"
                    defaultValue={raportState.namaAyah || 'Bambang Sudarmanto'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    name="pekerjaanAyah"
                    defaultValue={raportState.pekerjaanAyah || 'Wiraswasta / Pedagang'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    name="namaIbu"
                    defaultValue={raportState.namaIbu || 'Siti Rahmawati'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    name="pekerjaanIbu"
                    defaultValue={raportState.pekerjaanIbu || 'Ibu Rumah Tangga'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Orang Tua</label>
                  <input
                    type="text"
                    name="alamatOrtu"
                    defaultValue={raportState.alamatOrtu || 'Jl. Raya Ngawen KM. 1, RT 02/RW 04, Ngawen, Gunungkidul'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon / HP Orang Tua</label>
                  <input
                    type="text"
                    name="teleponOrtu"
                    defaultValue={raportState.teleponOrtu || '081288990011'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Wali (Jika Ada)</label>
                  <input
                    type="text"
                    name="namaWali"
                    defaultValue={raportState.namaWali || '-'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBiodataOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Identitas Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================================================================= */}
      {/* MODAL: EDIT KOTA / KECAMATAN TITIMANGSA TANDA TANGAN               */}
      {/* ================================================================= */}
      {isEditKotaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Ubah Kota / Kecamatan Titimangsa</h3>
              </div>
              <button
                onClick={() => setIsEditKotaModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Tentukan nama kota / kecamatan yang tercantum di bagian tempat & tanggal tanda tangan raport (misal: <b>Ngawen</b>, <b>Gunungkidul</b>, atau <b>Yogyakarta</b>).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Kota / Kecamatan Titimangsa
                </label>
                <input
                  type="text"
                  value={tempKotaInput}
                  onChange={(e) => setTempKotaInput(e.target.value)}
                  placeholder="Contoh: Ngawen / Gunungkidul"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Quick suggestion chips */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1.5">Pilihan Cepat / Rekomendasi:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Ngawen', 'Gunungkidul', 'Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Wonosari'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setTempKotaInput(city)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer ${
                        tempKotaInput.toLowerCase() === city.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                  {schoolSettings?.kopAlamat && (
                    <button
                      type="button"
                      onClick={() => setTempKotaInput(extractCityFromAddress(schoolSettings.kopAlamat))}
                      className="px-2.5 py-1 text-xs rounded-lg font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                    >
                      Ambil dari Alamat Kop
                    </button>
                  )}
                </div>
              </div>

              {/* Global Save Checkbox */}
              {schoolSettings && onUpdateSchoolSettings && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSaveKotaAsGlobal}
                      onChange={(e) => setIsSaveKotaAsGlobal(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-blue-950">Terapkan sebagai Standar Sekolah</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Kota ini otomatis digunakan untuk semua raport siswa dan pengaturan data sekolah.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditKotaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveKotaTitimangsa(tempKotaInput, isSaveKotaAsGlobal)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Terapkan Kota Titimangsa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
