import React, { useState, useRef } from 'react';
import {
  Building2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Printer,
  Sliders,
  Eye,
  Type,
  Layout,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  Layers,
  FileCheck,
  GraduationCap,
  Maximize2,
} from 'lucide-react';
import { SchoolSettings, UserRole, User } from '../../types';
import { generateRaportPDF } from '../../utils/pdfGenerator';
import { MOCK_RAPORT } from '../../data/initialData';

interface KopRaportSettingsProps {
  currentUser: User;
  schoolSettings: SchoolSettings;
  onSaveSchoolSettings: (newSettings: SchoolSettings) => void;
}

// Preset Logo Kiri (Instansi/Pemda/Yayasan)
const PRESET_LOGOS_KIRI = [
  {
    name: 'Kemdikbud / Tut Wuri Handayani',
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    description: 'Logo Tut Wuri Handayani standar sekolah nasional',
  },
  {
    name: 'Logo Pemda DIY / Lambang Daerah',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    description: 'Logo Pemerintah Provinsi / Daerah',
  },
  {
    name: 'Logo Majelis Dikdasmen / Yayasan',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    description: 'Logo Yayasan Pendidikan / Majelis',
  },
  {
    name: 'Garuda Pancasila Emas',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80',
    description: 'Simbol Lambang Negara Resmi',
  },
];

// Preset Logo Kanan (Sekolah/SMK/Madrasah)
const PRESET_LOGOS_KANAN = [
  {
    name: 'Logo SMK Muhammadiyah 1',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    description: 'Logo resmi SMK / SMA vokasi',
  },
  {
    name: 'Emblem Perisai Akademik Emas',
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    description: 'Perisai mutu dan integritas akademik',
  },
  {
    name: 'Tech & Vokasi Engineering',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    description: 'Logo modern jurusan keahlian IT & Mesin',
  },
  {
    name: 'Islamic Green Star & Book',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    description: 'Logo bernuansa islami dan Al-Quran',
  },
];

// Template Presets Kop Surat Raport
const KOP_TEMPLATES = [
  {
    id: 'smk-muhammadiyah',
    title: 'SMK Muhammadiyah 1 Ngawen',
    badge: 'Template Aktif',
    baris1: 'MAJELIS PENDIDIKAN DASAR DAN MENENGAH DAN PENDIDIKAN NONFORMAL',
    baris2: 'PIMPINAN DAERAH MUHAMMADIYAH KABUPATEN GUNUNGKIDUL',
    baris3: 'SMK MUHAMMADIYAH 1 NGAWEN',
    namaSekolah: 'SMK MUHAMMADIYAH 1 NGAWEN',
    infoSub: 'TERAKREDITASI A • NPSN: 20338514 • NSS: 402040301001',
    alamat: 'Jl. Raya Ngawen KM. 1, Kaliwaru, Kampung, Ngawen, Gunungkidul, D.I. Yogyakarta 55853',
    kontak: 'Telp: (0274) 123456 | Email: smkmusangangawen@gmail.com | Web: smkmuh1ngawen.sch.id',
    garis: 'ganda' as const,
    warnaSekolah: '#1e3a8a',
  },
  {
    id: 'smk-dinas-provinsi',
    title: 'SMK / SMA Negeri (Dinas Pendidikan DIY)',
    badge: 'Negeri / Pemda',
    baris1: 'PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA',
    baris2: 'DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA',
    baris3: 'BALAI PENDIDIKAN MENENGAH KABUPATEN GUNUNGKIDUL',
    namaSekolah: 'SMK NEGERI 1 NGAWEN',
    infoSub: 'NPSN: 20338514 • NSS: 402040301001 • Terakreditasi A',
    alamat: 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta 55853',
    kontak: 'Telp: (0274) 123456 | Email: info@smkn1ngawen.sch.id | Website: www.smkn1ngawen.sch.id',
    garis: 'ganda' as const,
    warnaSekolah: '#0f172a',
  },
  {
    id: 'kemenag-ma',
    title: 'Madrasah Aliyah / MTs (Kemenag)',
    badge: 'Kementerian Agama',
    baris1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
    baris2: 'KANTOR KEMENTERIAN AGAMA KABUPATEN GUNUNGKIDUL',
    baris3: 'MADRASAH ALIYAH AL-HIKMAH',
    namaSekolah: 'MADRASAH ALIYAH AL-HIKMAH',
    infoSub: 'NSM: 131134030001 • NPSN: 20363201 • Terakreditasi A (Unggul)',
    alamat: 'Jl. Wonosari - Semin KM. 5, Gunungkidul, D.I. Yogyakarta 55851',
    kontak: 'Telp: (0274) 391234 | Email: ma.alhikmah@kemenag.go.id | Web: ma-alhikmah.sch.id',
    garis: 'ganda' as const,
    warnaSekolah: '#065f46',
  },
  {
    id: 'swasta-modern',
    title: 'Sekolah Nasional Plus / Cyber Academy',
    badge: 'Modern Clean',
    baris1: 'YAYASAN PENDIDIKAN NUSANTARA UTAMA DIGITAL',
    baris2: 'SMK TEKNOLOGI INFORMATIKA INDONESIA',
    baris3: '',
    namaSekolah: 'SMK TEKNOLOGI INFORMATIKA NUSANTARA',
    infoSub: 'SK Pendirian No: 421.3/890/2018 • Terakreditasi Unggul',
    alamat: 'Kawasan Edukasi Terpadu, Blok B No. 12-14, D.I. Yogyakarta 55281',
    kontak: 'Hunting: (0274) 889900 | WhatsApp: 0812-3456-7890 | Web: smktik.sch.id',
    garis: 'tebal' as const,
    warnaSekolah: '#1e1b4b',
  },
];

export const KopRaportSettings: React.FC<KopRaportSettingsProps> = ({
  currentUser,
  schoolSettings,
  onSaveSchoolSettings,
}) => {
  // Form States
  const [formData, setFormData] = useState<{
    logoKiriUrl: string;
    logoKananUrl: string;
    showLogoKiri: boolean;
    showLogoKanan: boolean;
    logoKiriSize: number;
    logoKananSize: number;
    kopBaris1: string;
    kopBaris2: string;
    kopBaris3: string;
    kopNamaSekolah: string;
    kopInfoSubSekolah: string;
    kopAlamat: string;
    kopKontak: string;
    kopGarisTipe: 'ganda' | 'tebal' | 'tipis' | 'emas' | 'none';
    kopWarnaTeksSekolah: string;
    kopLayout: 'simetris' | 'logo-kiri-saja' | 'logo-kanan-saja' | 'tanpa-logo';
    kopFontFamily: 'helvetica' | 'times' | 'arial';
  }>({
    logoKiriUrl: schoolSettings.logoKiriUrl || schoolSettings.logoUrl || PRESET_LOGOS_KIRI[0].url,
    logoKananUrl: schoolSettings.logoKananUrl || '',
    showLogoKiri: schoolSettings.showLogoKiri !== undefined ? schoolSettings.showLogoKiri : true,
    showLogoKanan: schoolSettings.showLogoKanan !== undefined ? schoolSettings.showLogoKanan : true,
    logoKiriSize: schoolSettings.logoKiriSize || 64,
    logoKananSize: schoolSettings.logoKananSize || 64,
    kopBaris1: schoolSettings.kopBaris1 || 'PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA',
    kopBaris2: schoolSettings.kopBaris2 || 'DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA',
    kopBaris3: schoolSettings.kopBaris3 || 'BALAI PENDIDIKAN MENENGAH WILAYAH GUNUNGKIDUL',
    kopNamaSekolah: schoolSettings.kopNamaSekolah || schoolSettings.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN',
    kopInfoSubSekolah: schoolSettings.kopInfoSubSekolah || (schoolSettings.npsn ? `NPSN: ${schoolSettings.npsn} • Terakreditasi ${schoolSettings.akreditasi || 'A'}` : 'NPSN: 20338514 • Terakreditasi A'),
    kopAlamat: schoolSettings.kopAlamat || schoolSettings.alamatSekolah || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta 55853',
    kopKontak: schoolSettings.kopKontak || (schoolSettings.telepon ? `Telp: ${schoolSettings.telepon} | Email: ${schoolSettings.emailSekolah || 'smkmusangangawen@gmail.com'} | Web: ${schoolSettings.website || 'smkmuh1ngawen.sch.id'}` : 'Telp: (0274) 123456 | Email: smkmusangangawen@gmail.com | Web: smkmuh1ngawen.sch.id'),
    kopGarisTipe: schoolSettings.kopGarisTipe || 'ganda',
    kopWarnaTeksSekolah: schoolSettings.kopWarnaTeksSekolah || '#1e3a8a',
    kopLayout: schoolSettings.kopLayout || 'simetris',
    kopFontFamily: schoolSettings.kopFontFamily || 'helvetica',
  });

  const [activeTabSub, setActiveTabSub] = useState<'teks' | 'logo' | 'garis'>('logo');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewScale, setPreviewScale] = useState<'compact' | 'real' | 'expanded'>('real');
  const [previewDocType, setPreviewDocType] = useState<'raport' | 'surat'>('raport');

  const fileInputKiriRef = useRef<HTMLInputElement>(null);
  const fileInputKananRef = useRef<HTMLInputElement>(null);

  // Security Role Check
  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Akses Dibatasi - Khusus Administrator</h3>
        <p className="text-xs text-slate-600">
          Menu konfigurasi Kop Raport dan Logo Kanan/Kiri hanya dapat diakses dan diubah oleh akun dengan hak akses Administrator Sistem.
        </p>
      </div>
    );
  }

  // Handle Left Logo Upload
  const handleUploadLogoKiri = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          logoKiriUrl: event.target?.result as string,
          showLogoKiri: true,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Right Logo Upload
  const handleUploadLogoKanan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          logoKananUrl: event.target?.result as string,
          showLogoKanan: true,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply Quick Template
  const handleApplyTemplate = (tpl: typeof KOP_TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      kopBaris1: tpl.baris1,
      kopBaris2: tpl.baris2,
      kopBaris3: tpl.baris3,
      kopNamaSekolah: tpl.namaSekolah,
      kopInfoSubSekolah: tpl.infoSub,
      kopAlamat: tpl.alamat,
      kopKontak: tpl.kontak,
      kopGarisTipe: tpl.garis,
      kopWarnaTeksSekolah: tpl.warnaSekolah,
    }));
  };

  // Save Settings
  const handleSave = () => {
    const updatedSettings: SchoolSettings = {
      ...schoolSettings,
      namaSekolah: formData.kopNamaSekolah || schoolSettings.namaSekolah,
      logoKiriUrl: formData.logoKiriUrl,
      logoKananUrl: formData.logoKananUrl,
      showLogoKiri: formData.showLogoKiri,
      showLogoKanan: formData.showLogoKanan,
      logoKiriSize: formData.logoKiriSize,
      logoKananSize: formData.logoKananSize,
      kopBaris1: formData.kopBaris1,
      kopBaris2: formData.kopBaris2,
      kopBaris3: formData.kopBaris3,
      kopNamaSekolah: formData.kopNamaSekolah,
      kopInfoSubSekolah: formData.kopInfoSubSekolah,
      kopAlamat: formData.kopAlamat,
      kopKontak: formData.kopKontak,
      kopGarisTipe: formData.kopGarisTipe,
      kopWarnaTeksSekolah: formData.kopWarnaTeksSekolah,
      kopLayout: formData.kopLayout,
      kopFontFamily: formData.kopFontFamily,
    };

    onSaveSchoolSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Test Print / Generate PDF Sample
  const handleTestPrintPDF = () => {
    const mockData = {
      ...MOCK_RAPORT,
      siswaNama: 'Ahmad Fauzi (Sample)',
      nisn: '0061234567',
      kelasNama: '10 IPA 1',
    };
    generateRaportPDF(mockData, {
      ...schoolSettings,
      ...formData,
      namaSekolah: formData.kopNamaSekolah,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Khusus Role Administrator
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold">
                SIAKAD v3.8 Multi-Logo Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-sky-400 shrink-0" />
              Pengaturan Kop Raport & Upload Logo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Atur format kepala surat (Kop) resmi E-Raport digital sekolah. Unggah <strong>Logo Kiri (Instansi/Pemda/Yayasan)</strong> dan <strong>Logo Kanan (Sekolah/SMK)</strong>, serta sesuaikan teks dan garis pembatas secara interaktif.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={handleTestPrintPDF}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/20 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-300" />
              <span>Cetak Contoh PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SIMPAN PERUBAHAN</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl flex items-center gap-2 text-emerald-200 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pengaturan Kop Raport dan Logo berhasil disimpan! Seluruh halaman E-Raport dan hasil cetak PDF otomatis tersinkronisasi.</span>
          </div>
        )}
      </div>

      {/* Quick Template Presets Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Pilih Template Kop Cepat (1-Klik Terapkan):
          </span>
          <span className="text-[11px] text-slate-500">Otomatis mengisi baris teks & gaya garis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {KOP_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className="p-3.5 rounded-xl border text-left transition-all hover:border-blue-500 hover:shadow-md bg-slate-50/70 hover:bg-blue-50/40 group relative flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {tpl.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-bold">Terapkan →</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{tpl.alamat}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Editor & WYSIWYG Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Settings & Upload Form (5 cols on xl) */}
        <div className="xl:col-span-6 space-y-5">
          {/* Sub Navigation Tabs */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1">
            <button
              onClick={() => setActiveTabSub('logo')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTabSub === 'logo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>1. Upload Logo Kiri & Kanan</span>
            </button>

            <button
              onClick={() => setActiveTabSub('teks')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTabSub === 'teks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>2. Baris Teks Kop</span>
            </button>

            <button
              onClick={() => setActiveTabSub('garis')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTabSub === 'garis'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>3. Gaya Garis & Warna</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD LOGO KIRI & KANAN */}
          {activeTabSub === 'logo' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Logo Kiri (Instansi / Pemda / Yayasan) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      L
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Logo Kiri (Instansi / Pemda / Yayasan)</h3>
                      <p className="text-[11px] text-slate-500">Logo di sudut kiri atas kepala surat</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showLogoKiri}
                      onChange={(e) => setFormData({ ...formData, showLogoKiri: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Tampilkan</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div
                      className="rounded-lg bg-white shadow-xs border flex items-center justify-center overflow-hidden"
                      style={{ width: `${formData.logoKiriSize}px`, height: `${formData.logoKiriSize}px` }}
                    >
                      {formData.logoKiriUrl ? (
                        <img
                          src={formData.logoKiriUrl}
                          alt="Logo Kiri"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <GraduationCap className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono">
                      {formData.logoKiriSize} × {formData.logoKiriSize} px
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputKiriRef}
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        className="hidden"
                        onChange={handleUploadLogoKiri}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputKiriRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Logo Kiri</span>
                      </button>
                      {formData.logoKiriUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logoKiriUrl: '' })}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                          title="Hapus Logo Kiri"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Logo Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Ukuran Logo Kiri</span>
                        <span>{formData.logoKiriSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="90"
                        step="2"
                        value={formData.logoKiriSize}
                        onChange={(e) => setFormData({ ...formData, logoKiriSize: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Picker */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600">Pilih Preset Logo Kiri:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_LOGOS_KIRI.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoKiriUrl: p.url, showLogoKiri: true })}
                        className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center gap-2 text-left transition-all"
                      >
                        <img src={p.url} alt={p.name} className="w-6 h-6 object-cover rounded shrink-0" />
                        <span className="text-[11px] font-medium text-slate-700 line-clamp-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Kanan (Sekolah / SMK / Lembaga) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Logo Kanan (Logo Sekolah / SMK)</h3>
                      <p className="text-[11px] text-slate-500">Logo di sudut kanan atas kepala surat</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showLogoKanan}
                      onChange={(e) => setFormData({ ...formData, showLogoKanan: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Tampilkan</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div
                      className="rounded-lg bg-white shadow-xs border flex items-center justify-center overflow-hidden"
                      style={{ width: `${formData.logoKananSize}px`, height: `${formData.logoKananSize}px` }}
                    >
                      {formData.logoKananUrl ? (
                        <img
                          src={formData.logoKananUrl}
                          alt="Logo Kanan"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono">
                      {formData.logoKananSize} × {formData.logoKananSize} px
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputKananRef}
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        className="hidden"
                        onChange={handleUploadLogoKanan}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputKananRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Logo Kanan</span>
                      </button>
                      {formData.logoKananUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logoKananUrl: '' })}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                          title="Hapus Logo Kanan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Logo Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Ukuran Logo Kanan</span>
                        <span>{formData.logoKananSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="90"
                        step="2"
                        value={formData.logoKananSize}
                        onChange={(e) => setFormData({ ...formData, logoKananSize: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Picker */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600">Pilih Preset Logo Kanan:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_LOGOS_KANAN.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoKananUrl: p.url, showLogoKanan: true })}
                        className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex items-center gap-2 text-left transition-all"
                      >
                        <img src={p.url} alt={p.name} className="w-6 h-6 object-cover rounded shrink-0" />
                        <span className="text-[11px] font-medium text-slate-700 line-clamp-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BARIS TEKS KOP */}
          {activeTabSub === 'teks' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600" />
                Edit Teks Setiap Baris Kepala Surat (Kop)
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 1: Instansi Tertinggi / Pemerintah Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.kopBaris1}
                    onChange={(e) => setFormData({ ...formData, kopBaris1: e.target.value })}
                    placeholder="Contoh: PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold uppercase tracking-wide focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 2: Dinas Pendidikan / Yayasan / Majelis
                  </label>
                  <input
                    type="text"
                    value={formData.kopBaris2}
                    onChange={(e) => setFormData({ ...formData, kopBaris2: e.target.value })}
                    placeholder="Contoh: DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold uppercase tracking-wide focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 3: Balai Dikmen / Cabang Dinas (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.kopBaris3}
                    onChange={(e) => setFormData({ ...formData, kopBaris3: e.target.value })}
                    placeholder="Contoh: BALAI PENDIDIKAN MENENGAH WILAYAH GUNUNGKIDUL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold uppercase tracking-wide focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-900 mb-1 flex items-center justify-between">
                    <span>Baris 4: Nama Resmi Satuan Pendidikan / Sekolah (Utama)</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase">Judul Utama</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kopNamaSekolah}
                    onChange={(e) => setFormData({ ...formData, kopNamaSekolah: e.target.value })}
                    placeholder="Contoh: SMK MUHAMMADIYAH 1 NGAWEN"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-blue-400 bg-blue-50/20 text-xs font-black uppercase tracking-wide text-blue-950 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 5: NPSN, NSS, Status Akreditasi & Identitas
                  </label>
                  <input
                    type="text"
                    value={formData.kopInfoSubSekolah}
                    onChange={(e) => setFormData({ ...formData, kopInfoSubSekolah: e.target.value })}
                    placeholder="Contoh: TERAKREDITASI A • NPSN: 20338514 • NSS: 402040301001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 6: Alamat Lengkap Kampus / Sekolah & Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.kopAlamat}
                    onChange={(e) => setFormData({ ...formData, kopAlamat: e.target.value })}
                    placeholder="Contoh: Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul 55853"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 7: Kontak, Telepon, Email & Website Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.kopKontak}
                    onChange={(e) => setFormData({ ...formData, kopKontak: e.target.value })}
                    placeholder="Contoh: Telp: (0274) 123456 | Email: smkmusangangawen@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GAYA GARIS & WARNA */}
          {activeTabSub === 'garis' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Kustomisasi Model Garis Pembatas & Tipografi
              </h3>

              {/* Model Garis Pembatas */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Pilih Model Garis Pembatas (Divider Line):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ganda', name: 'Garis Ganda Resmi (2px + 1px)' },
                    { id: 'tebal', name: 'Garis Tunggal Tebal (3px)' },
                    { id: 'emas', name: 'Garis Aksen Emas Ganda' },
                    { id: 'tipis', name: 'Garis Tipis Minimalis (1px)' },
                    { id: 'none', name: 'Tanpa Garis Pembatas' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, kopGarisTipe: g.id as any })}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        formData.kopGarisTipe === g.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>{g.name}</span>
                        {formData.kopGarisTipe === g.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Nama Sekolah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Warna Teks Nama Sekolah:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Royal Navy', color: '#1e3a8a' },
                    { name: 'Midnight Slate', color: '#0f172a' },
                    { name: 'Emerald Academic', color: '#065f46' },
                    { name: 'Crimson Maroon', color: '#881337' },
                    { name: 'Deep Indigo', color: '#312e81' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, kopWarnaTeksSekolah: c.color })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.kopWarnaTeksSekolah === c.color
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border shadow-inner" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Bottom Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block">Siap Diterapkan ke Sistem</span>
              Perubahan langsung aktif di E-Raport & Cetak PDF
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SIMPAN PENGATURAN KOP</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Live Document Preview (7 cols on xl) */}
        <div className="xl:col-span-6 space-y-4">
          <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl border border-slate-700 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Pratinjau Langsung Dokumen (Live Canvas WYSIWYG)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewDocType(previewDocType === 'raport' ? 'surat' : 'raport')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[11px] font-bold"
              >
                {previewDocType === 'raport' ? 'Tampilan Raport' : 'Tampilan Surat Resmi'}
              </button>
              <button
                type="button"
                onClick={handleTestPrintPDF}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                title="Cetak Dokumen"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Sheet Simulation */}
          <div className="bg-slate-200 p-4 sm:p-6 rounded-2xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto">
            <div
              className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-5 text-slate-900 border border-slate-300 transition-all select-none"
              style={{
                width: '100%',
                maxWidth: '680px',
                minHeight: '750px',
                fontFamily: 'serif',
              }}
            >
              {/* Kop Header Render */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  {/* Logo Kiri */}
                  {formData.showLogoKiri && formData.logoKiriUrl ? (
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{ width: `${formData.logoKiriSize}px`, height: `${formData.logoKiriSize}px` }}
                    >
                      <img
                        src={formData.logoKiriUrl}
                        alt="Logo Kiri"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div style={{ width: `${formData.logoKiriSize}px` }} className="shrink-0" />
                  )}

                  {/* Multi-line Header Center */}
                  <div className="flex-1 text-center space-y-0.5 px-2">
                    {formData.kopBaris1 && (
                      <h4 className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-slate-800">
                        {formData.kopBaris1}
                      </h4>
                    )}
                    {formData.kopBaris2 && (
                      <h4 className="text-[10px] sm:text-[11.5px] font-bold tracking-wide uppercase text-slate-800">
                        {formData.kopBaris2}
                      </h4>
                    )}
                    {formData.kopBaris3 && (
                      <h5 className="text-[9.5px] sm:text-[10.5px] font-semibold tracking-wide uppercase text-slate-700">
                        {formData.kopBaris3}
                      </h5>
                    )}
                    {formData.kopNamaSekolah && (
                      <h2
                        className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight py-0.5"
                        style={{ color: formData.kopWarnaTeksSekolah }}
                      >
                        {formData.kopNamaSekolah}
                      </h2>
                    )}
                    {formData.kopInfoSubSekolah && (
                      <p className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-700">
                        {formData.kopInfoSubSekolah}
                      </p>
                    )}
                    {formData.kopAlamat && (
                      <p className="text-[8px] sm:text-[9px] text-slate-600 font-sans">
                        {formData.kopAlamat}
                      </p>
                    )}
                    {formData.kopKontak && (
                      <p className="text-[7.5px] sm:text-[8.5px] text-slate-500 font-sans font-medium">
                        {formData.kopKontak}
                      </p>
                    )}
                  </div>

                  {/* Logo Kanan */}
                  {formData.showLogoKanan && formData.logoKananUrl ? (
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{ width: `${formData.logoKananSize}px`, height: `${formData.logoKananSize}px` }}
                    >
                      <img
                        src={formData.logoKananUrl}
                        alt="Logo Kanan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div style={{ width: `${formData.logoKananSize}px` }} className="shrink-0" />
                  )}
                </div>

                {/* Divider Line Render */}
                {formData.kopGarisTipe === 'ganda' && (
                  <div className="space-y-0.5 pt-1">
                    <div className="h-[2px] bg-slate-900 w-full" />
                    <div className="h-[0.75px] bg-slate-900 w-full" />
                  </div>
                )}
                {formData.kopGarisTipe === 'tebal' && (
                  <div className="pt-1">
                    <div className="h-[3px] bg-slate-900 w-full" />
                  </div>
                )}
                {formData.kopGarisTipe === 'emas' && (
                  <div className="space-y-0.5 pt-1">
                    <div className="h-[2px] bg-amber-600 w-full" />
                    <div className="h-[1px] bg-amber-400 w-full" />
                  </div>
                )}
                {formData.kopGarisTipe === 'tipis' && (
                  <div className="pt-1">
                    <div className="h-[1px] bg-slate-700 w-full" />
                  </div>
                )}
              </div>

              {/* Document Body Sample */}
              {previewDocType === 'raport' ? (
                <div className="space-y-4 pt-2 font-sans">
                  <div className="text-center space-y-0.5">
                    <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 underline">
                      LAPORAN HASIL CAPAIAN KOMPETENSI PESERTA DIDIK
                    </h3>
                    <p className="text-[10px] text-slate-600 font-medium">Tahun Ajaran 2026/2027 - Semester Ganjil</p>
                  </div>

                  {/* Biodata Mini - Presisi & Rapi Terstruktur */}
                  <div className="grid grid-cols-2 text-[9.5px] sm:text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-200 gap-x-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-20 text-slate-600 font-medium py-0.5 whitespace-nowrap">Nama Siswa</td>
                          <td className="w-3 text-slate-500 font-bold text-center py-0.5">:</td>
                          <td className="font-bold text-slate-900 py-0.5">Ahmad Fauzi</td>
                        </tr>
                        <tr>
                          <td className="text-slate-600 font-medium py-0.5 whitespace-nowrap">NISN</td>
                          <td className="text-slate-500 font-bold text-center py-0.5">:</td>
                          <td className="font-mono font-bold text-slate-900 py-0.5">0061234567</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-20 text-slate-600 font-medium py-0.5 whitespace-nowrap">Kelas</td>
                          <td className="w-3 text-slate-500 font-bold text-center py-0.5">:</td>
                          <td className="font-bold text-slate-900 py-0.5">10 IPA 1</td>
                        </tr>
                        <tr>
                          <td className="text-slate-600 font-medium py-0.5 whitespace-nowrap">Wali Kelas</td>
                          <td className="text-slate-500 font-bold text-center py-0.5">:</td>
                          <td className="font-bold text-slate-900 py-0.5">Budi Santoso S.Pd</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table Sample */}
                  <table className="w-full text-[9.5px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                        <th className="border border-slate-300 p-1.5 text-left">Mata Pelajaran</th>
                        <th className="border border-slate-300 p-1.5 text-center w-12">KKM</th>
                        <th className="border border-slate-300 p-1.5 text-center w-14">Nilai Akhir</th>
                        <th className="border border-slate-300 p-1.5 text-center w-12">Predikat</th>
                        <th className="border border-slate-300 p-1.5 text-left">Capaian Kompetensi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-1 text-center font-mono">1</td>
                        <td className="border border-slate-300 p-1 font-semibold">Pendidikan Agama & Budi Pekerti</td>
                        <td className="border border-slate-300 p-1 text-center font-mono">75</td>
                        <td className="border border-slate-300 p-1 text-center font-mono font-bold text-blue-900">92</td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-emerald-600">A</td>
                        <td className="border border-slate-300 p-1 text-[8.5px] text-slate-600">Sangat baik dalam memahami materi dan akhlak terpuji</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border border-slate-300 p-1 text-center font-mono">2</td>
                        <td className="border border-slate-300 p-1 font-semibold">Matematika Tingkat Lanjut</td>
                        <td className="border border-slate-300 p-1 text-center font-mono">75</td>
                        <td className="border border-slate-300 p-1 text-center font-mono font-bold text-blue-900">88</td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-blue-600">B+</td>
                        <td className="border border-slate-300 p-1 text-[8.5px] text-slate-600">Mampu menyelesaikan soal kalkulus dan logika dengan baik</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1 text-center font-mono">3</td>
                        <td className="border border-slate-300 p-1 font-semibold">Teknologi Jaringan & Pemrograman</td>
                        <td className="border border-slate-300 p-1 text-center font-mono">75</td>
                        <td className="border border-slate-300 p-1 text-center font-mono font-bold text-blue-900">95</td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-emerald-600">A</td>
                        <td className="border border-slate-300 p-1 text-[8.5px] text-slate-600">Sangat mahir konfigurasi routing dan frontend web</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-2 text-[9.5px] pt-8 gap-4 text-center">
                    <div className="space-y-12">
                      <p>Mengetahui,<br />Orang Tua / Wali Siswa</p>
                      <p className="font-bold underline text-slate-800">( ........................................... )</p>
                    </div>
                    <div className="space-y-12">
                      <p>Gunungkidul, 19 Agustus 2026<br />Wali Kelas</p>
                      <div>
                        <p className="font-bold underline text-slate-900">Budi Santoso S.Pd</p>
                        <p className="text-[8.5px] text-slate-500 font-mono">NIP: 198203152008011003</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 font-serif text-[11px] leading-relaxed text-slate-800">
                  <div className="flex justify-between text-[10px]">
                    <div>Nomor: 421.3 / 108 / SMK-M1 / VIII / 2026<br />Lampiran: -<br />Hal: Pemberitahuan Kegiatan Akademik</div>
                    <div className="text-right">Gunungkidul, 19 Agustus 2026<br />Kepada Yth.<br />Bapak/Ibu Orang Tua Siswa</div>
                  </div>
                  <p className="pt-2">
                    Dengan hormat,<br />
                    Bersama ini kami sampaikan agenda pelaksanaan Asesmen Sumatif Semester dan Rapat Pleno Kelulusan yang akan diselenggarakan secara digital melalui sistem SIAKAD resmi.
                  </p>
                  <p>
                    Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan kerjasama Bapak/Ibu, kami ucapkan terima kasih.
                  </p>
                  <div className="pt-6 flex justify-end">
                    <div className="text-center space-y-12 w-48">
                      <p>Kepala Sekolah,</p>
                      <div>
                        <p className="font-bold underline text-slate-900">{schoolSettings.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd'}</p>
                        <p className="text-[9px] text-slate-500 font-mono">NIP. {schoolSettings.nipKepalaSekolah || '197508122001121001'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
