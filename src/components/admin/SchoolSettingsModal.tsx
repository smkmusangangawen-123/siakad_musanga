import React, { useState, useRef } from 'react';
import {
  Building2,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  Save,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Award,
  Globe,
  User,
  Check,
  Palette,
  Sliders,
  Eye,
  Type,
  Layout,
  Layers,
} from 'lucide-react';
import { SchoolSettings, UserRole } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  schoolSettings: SchoolSettings;
  onSaveSchoolSettings: (newSettings: SchoolSettings) => void;
}

// Preset logos if user wants to pick a quick default template logo
const LOGO_PRESETS = [
  {
    name: 'Standard Academic Shield',
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern University Emblem',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classic Eagle Seal',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Green Leaf Bio & Tech',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
  },
];

// Preset Background Colors
const COLOR_PRESETS = [
  { name: 'Clean Slate Light', value: '#f8fafc', textColor: 'text-slate-800' },
  { name: 'Soft Cool Blue', value: '#f0f4f8', textColor: 'text-slate-800' },
  { name: 'Pure Minimalist', value: '#ffffff', textColor: 'text-slate-800' },
  { name: 'Warm Cream Sand', value: '#faf8f5', textColor: 'text-slate-800' },
  { name: 'Soft Emerald Mint', value: '#f0fdf4', textColor: 'text-slate-800' },
  { name: 'Soft Lavender', value: '#faf5ff', textColor: 'text-slate-800' },
  { name: 'Cyber Dark Navy', value: '#0f172a', textColor: 'text-white' },
  { name: 'Deep Indigo Dark', value: '#1e1b4b', textColor: 'text-white' },
  { name: 'Emerald Forest Dark', value: '#064e3b', textColor: 'text-white' },
  { name: 'Midnight Charcoal', value: '#18181b', textColor: 'text-white' },
];

// Preset Background Gradients
const GRADIENT_PRESETS = [
  { name: 'Soft Slate Subtle', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
  { name: 'Cool Sky Blue', value: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
  { name: 'Modern Indigo Blue', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' },
  { name: 'Dark Cyber Slate', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { name: 'Emerald Mint Forest', value: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' },
  { name: 'Sunset Twilight', value: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #1e1b4b 100%)' },
  { name: 'Royal Velvet Purple', value: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)' },
];

// Preset High-Resolution Background Wallpapers
const WALLPAPER_PRESETS = [
  {
    name: 'Modern University Campus',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Academic Grand Library',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Futuristic Tech & IT Lab',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classroom & Study Hall',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Abstract Wave Gradient',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimalist Architecture',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&auto=format&fit=crop&q=80',
  },
];

type SettingsTab = 'background' | 'title_logo' | 'school_profile';

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  userRole,
  schoolSettings,
  onSaveSchoolSettings,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('background');
  const [formData, setFormData] = useState<SchoolSettings>({
    bgType: 'solid',
    bgColor: '#f8fafc',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    bgImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&auto=format&fit=crop&q=80',
    bgImageOpacity: 35,
    bgImageBlur: 0,
    bgOverlayColor: '#ffffff',
    bgOverlayOpacity: 60,
    bgAttachment: 'fixed',
    bgSize: 'cover',
    websiteTitle: 'SIAKAD SMA Negeri 1 Smart School',
    websiteSubtitle: 'Sistem Informasi Akademik & Portal Pembelajaran Digital',
    ...schoolSettings,
  });

  const [logoPreview, setLogoPreview] = useState<string>(schoolSettings.logoUrl || schoolSettings.titleLogoUrl || '');
  const [bgImagePreview, setBgImagePreview] = useState<string>(formData.bgImageUrl || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isAdmin = userRole === 'admin';

  // Logo File Upload (Compressed Base64)
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Format file tidak didukung. Silakan pilih gambar (PNG, JPG, WEBP, atau SVG).');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 240, 240, 0.85);
      setLogoPreview(compressed);
      setFormData((prev) => ({ ...prev, logoUrl: compressed, titleLogoUrl: compressed }));
    } catch (err) {
      console.error('Error compressing logo:', err);
      setUploadError('Gagal memproses file gambar.');
    }
  };

  // Background Wallpaper File Upload (Compressed Base64)
  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setBgUploadError(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBgUploadError('Format file wallpaper tidak didukung. Silakan pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    try {
      // Compress wallpaper to max 1280px at 0.75 quality (< 150KB)
      const compressed = await compressImageFile(file, 1280, 720, 0.75);
      setBgImagePreview(compressed);
      setFormData((prev) => ({
        ...prev,
        bgType: 'image',
        bgImageUrl: compressed,
      }));
    } catch (err) {
      console.error('Error compressing wallpaper:', err);
      setBgUploadError('Gagal memproses file wallpaper.');
    }
  };

  const handleClearLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logoUrl: '', titleLogoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPresetLogo = (url: string) => {
    setLogoPreview(url);
    setFormData((prev) => ({ ...prev, logoUrl: url, titleLogoUrl: url }));
  };

  const handleSelectWallpaperPreset = (url: string) => {
    setBgImagePreview(url);
    setFormData((prev) => ({
      ...prev,
      bgType: 'image',
      bgImageUrl: url,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Akses Dibatasi: Pengaturan ini hanya dapat disimpan oleh Administrator System.');
      return;
    }

    onSaveSchoolSettings(formData);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  Khusus Role Admin
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> System Access
                </span>
              </div>
              <h3 className="text-lg font-black mt-1">Kustomisasi Background, Title & Identitas Website</h3>
              <p className="text-xs text-blue-200">
                Atur warna / wallpaper latar belakang website dengan transparansi, ganti title website, dan logo sekolah.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'background'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-600" /> Background & Wallpaper Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('title_logo')}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'title_logo'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4 text-blue-600" /> Title Website & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('school_profile')}
            className={`pb-3 px-3.5 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'school_profile'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" /> Profil Resmi Sekolah
          </button>
        </div>

        {/* Success Alert Toast */}
        {showSuccessToast && (
          <div className="bg-emerald-600 text-white px-6 py-3 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Pengaturan website dan background berhasil disimpan dan diterapkan seketika!</span>
          </div>
        )}

        {/* Non-Admin Access Warning Banner */}
        {!isAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-amber-900 text-xs flex items-start gap-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Akses Mode Lihat (Read-Only)</p>
              <p className="mt-0.5">
                Anda login sebagai <span className="font-bold uppercase">{userRole}</span>. Hanya akun berkategori{' '}
                <span className="font-bold uppercase text-red-600">Admin</span> yang dapat mengubah dan menyimpan kustomisasi website.
              </p>
            </div>
          </div>
        )}

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ===================== LIVE PREVIEW BANNER ===================== */}
          <div className="p-4 rounded-2xl border border-slate-200 relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Live Simulation Preview (Header & Background Website)
            </div>

            {/* Container Preview with custom background applied */}
            <div
              className="rounded-xl overflow-hidden border border-slate-300 p-4 relative min-h-[130px] flex flex-col justify-between"
              style={{
                backgroundColor: formData.bgType === 'solid' ? (formData.bgColor || '#f8fafc') : undefined,
                backgroundImage:
                  formData.bgType === 'gradient'
                    ? formData.bgGradient
                    : formData.bgType === 'image' && bgImagePreview
                    ? `url(${bgImagePreview})`
                    : undefined,
                backgroundSize: formData.bgSize || 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Optional Wallpaper Overlay & Opacity Layer */}
              {formData.bgType === 'image' && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all"
                  style={{
                    backgroundColor: formData.bgOverlayColor || '#ffffff',
                    opacity: (formData.bgOverlayOpacity ?? 60) / 100,
                    backdropFilter: formData.bgImageBlur ? `blur(${formData.bgImageBlur}px)` : undefined,
                  }}
                />
              )}

              {/* Sample Mini Header Bar */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden border border-blue-500 shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover p-0.5" />
                    ) : (
                      <GraduationCap className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {formData.websiteTitle || formData.namaSekolah || 'SIAKAD SMA Negeri 1'}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                      {formData.websiteSubtitle || 'Sistem Informasi Akademik Terpadu'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  Pratinjau Live
                </span>
              </div>

              {/* Sample Mini Card Content */}
              <div className="relative z-10 grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-500">Status Database</span>
                  <p className="text-[11px] font-black text-emerald-700">PostgreSQL Terhubung</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-500">Tipe Latar Belakang</span>
                  <p className="text-[11px] font-black text-blue-700 uppercase">{formData.bgType || 'Solid'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== TAB 1: BACKGROUND & WALLPAPER ===================== */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Pilih Mode Latar Belakang Website:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setFormData({ ...formData, bgType: 'solid' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.bgType === 'solid'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-blue-600" />
                    <span>Warna Solid</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setFormData({ ...formData, bgType: 'gradient' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.bgType === 'gradient'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders className="w-5 h-5 text-purple-600" />
                    <span>Gradien Warna</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setFormData({ ...formData, bgType: 'image' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.bgType === 'image'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    <span>Foto / Wallpaper</span>
                  </button>
                </div>
              </div>

              {/* Sub-Section A: SOLID COLOR */}
              {formData.bgType === 'solid' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Pilihan Warna Solid Populer:</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Custom Color:</span>
                      <input
                        type="color"
                        disabled={!isAdmin}
                        value={formData.bgColor || '#f8fafc'}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.bgColor || '#f8fafc'}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {COLOR_PRESETS.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => setFormData({ ...formData, bgColor: c.value })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-2xs ${
                          formData.bgColor === c.value
                            ? 'border-blue-600 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border border-black/20 shrink-0 ${
                            formData.bgColor === c.value ? 'bg-blue-600 text-white flex items-center justify-center' : ''
                          }`}
                        >
                          {formData.bgColor === c.value && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className={`truncate ${c.textColor}`}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Section B: GRADIENT */}
              {formData.bgType === 'gradient' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 block">Pilihan Gradien Warna Elegan:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GRADIENT_PRESETS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => setFormData({ ...formData, bgGradient: g.value })}
                        className={`p-4 rounded-xl border text-left text-xs font-extrabold transition-all relative overflow-hidden shadow-xs flex items-center justify-between ${
                          formData.bgGradient === g.value
                            ? 'border-blue-600 ring-2 ring-blue-500/40 text-white'
                            : 'border-slate-200 text-white hover:scale-[1.01]'
                        }`}
                        style={{ background: g.value }}
                      >
                        <span className="drop-shadow-md text-xs">{g.name}</span>
                        {formData.bgGradient === g.value && (
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom CSS Gradient:</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.bgGradient || ''}
                      onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
                      placeholder="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Sub-Section C: PHOTO / IMAGE WALLPAPER WITH TRANSPARENCY SLIDERS */}
              {formData.bgType === 'image' && (
                <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" /> Foto Wallpaper & Pengaturan Transparansi
                    </label>
                  </div>

                  {bgUploadError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{bgUploadError}</span>
                    </div>
                  )}

                  {/* Upload Foto Wallpaper Custom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => isAdmin && bgFileInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                        isAdmin
                          ? 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50'
                          : 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <input
                        ref={bgFileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleBgFileChange}
                        disabled={!isAdmin}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Unggah Foto Wallpaper dari Perangkat</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Format JPG, PNG, WEBP (Maksimal 4MB)</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Atau Masukkan URL Gambar Wallpaper:</label>
                      <input
                        type="url"
                        disabled={!isAdmin}
                        value={formData.bgImageUrl || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, bgImageUrl: e.target.value });
                          setBgImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Gunakan tautan gambar beresolusi tinggi untuk hasil visual yang jernih.
                      </p>
                    </div>
                  </div>

                  {/* Preset Wallpapers */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Pilihan Wallpaper Sekolah & Kampus Bawaan:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {WALLPAPER_PRESETS.map((wp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isAdmin}
                          onClick={() => handleSelectWallpaperPreset(wp.url)}
                          className={`group relative h-16 rounded-xl border-2 overflow-hidden transition-all shadow-2xs ${
                            bgImagePreview === wp.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200'
                          }`}
                        >
                          <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[9px] text-white font-bold truncate">{wp.name}</span>
                          </div>
                          {bgImagePreview === wp.url && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SLIDERS: TRANSPARENCY, OVERLAY, BLUR */}
                  <div className="pt-3 border-t border-slate-200 space-y-4">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-600" /> Pengaturan Transparansi, Overlay & Efek
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Overlay Opacity Slider */}
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Transparansi Lapisan (Overlay):</span>
                          <span className="font-extrabold text-emerald-600 font-mono">
                            {formData.bgOverlayOpacity ?? 60}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="95"
                          step="5"
                          disabled={!isAdmin}
                          value={formData.bgOverlayOpacity ?? 60}
                          onChange={(e) => setFormData({ ...formData, bgOverlayOpacity: Number(e.target.value) })}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">
                          Semakin tinggi nilai transparansi overlay, teks dan konten dashboard akan semakin jelas terbaca.
                        </p>
                      </div>

                      {/* Overlay Color Picker */}
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Warna Lapisan Pelindung (Overlay):</span>
                          <span className="font-mono text-xs font-bold text-slate-600">
                            {formData.bgOverlayColor || '#ffffff'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setFormData({ ...formData, bgOverlayColor: '#ffffff' })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                              formData.bgOverlayColor === '#ffffff'
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full bg-white border border-slate-300" /> Putih (Terang)
                          </button>
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setFormData({ ...formData, bgOverlayColor: '#0f172a' })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                              formData.bgOverlayColor === '#0f172a'
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600" /> Hitam / Gelap
                          </button>
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setFormData({ ...formData, bgOverlayColor: '#1e1b4b' })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                              formData.bgOverlayColor === '#1e1b4b'
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full bg-indigo-950 border border-indigo-700" /> Navy
                          </button>
                        </div>
                      </div>

                      {/* Blur Effect Slider */}
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Efek Blur / Kabur Gambar:</span>
                          <span className="font-extrabold text-emerald-600 font-mono">
                            {formData.bgImageBlur ?? 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          disabled={!isAdmin}
                          value={formData.bgImageBlur ?? 0}
                          onChange={(e) => setFormData({ ...formData, bgImageBlur: Number(e.target.value) })}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">
                          Memberikan efek latar belakang halus (frosted glass) yang estetik dan nyaman di mata.
                        </p>
                      </div>

                      {/* Background Attachment / Position */}
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Posisi Gambar Wallpaper:</span>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setFormData({ ...formData, bgAttachment: 'fixed', bgSize: 'cover' })}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-bold text-center ${
                              formData.bgAttachment === 'fixed'
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            Layar Penuh Tetap (Parallax)
                          </button>
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setFormData({ ...formData, bgAttachment: 'scroll', bgSize: 'cover' })}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-bold text-center ${
                              formData.bgAttachment === 'scroll'
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            Ikut Bergulir (Scroll)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: TITLE & LOGO WEBSITE ===================== */}
          {activeTab === 'title_logo' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-blue-600" /> Edit Title & Subtitle Website (Khusus Admin)
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Utama Website / Title Header <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={formData.websiteTitle || ''}
                    onChange={(e) => setFormData({ ...formData, websiteTitle: e.target.value })}
                    placeholder="e.g. SIAKAD SMA Negeri 1 Smart School"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Judul ini tampil pada tab browser, bilah navigasi atas, dan halaman utama sistem.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slogan / Subtitle Website:
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.websiteSubtitle || ''}
                    onChange={(e) => setFormData({ ...formData, websiteSubtitle: e.target.value })}
                    placeholder="e.g. Sistem Informasi Akademik & Portal Pembelajaran Digital"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Upload Logo Title */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Tambah / Ganti Logo di Title & Header (Role Admin)
                </label>

                {uploadError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Box */}
                  <div
                    onClick={() => isAdmin && fileInputRef.current?.click()}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isAdmin
                        ? 'border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50'
                        : 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoFileChange}
                      disabled={!isAdmin}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Klik untuk Unggah Gambar Logo</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Format PNG, JPG, SVG (Maks. 2MB)</p>
                  </div>

                  {/* Preset Logos */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">Atau Pilih Logo Preset Cepat:</p>
                      <div className="flex items-center gap-2">
                        {LOGO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => handleSelectPresetLogo(p.url)}
                            className={`w-12 h-12 rounded-xl border-2 p-1 bg-white hover:scale-105 transition-transform overflow-hidden relative ${
                              logoPreview === p.url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                            }`}
                            title={p.name}
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                            {logoPreview === p.url && (
                              <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 font-bold" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {logoPreview && (
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={handleClearLogo}
                        className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Hapus Logo & Pakai Icon Bawaan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: PROFIL RESMI SEKOLAH ===================== */}
          {activeTab === 'school_profile' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Data Profil & Kop Dokumen Sekolah
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Resmi Sekolah / Lembaga <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={formData.namaSekolah}
                    onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                    placeholder="e.g. SMA Negeri 1 Smart School"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Alamat Lengkap Sekolah:
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.alamatSekolah || ''}
                    onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                    placeholder="e.g. Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta 55853"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Kota / Kecamatan Titimangsa:
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.kotaTitimangsa || ''}
                      onChange={(e) => setFormData({ ...formData, kotaTitimangsa: e.target.value })}
                      placeholder="e.g. Ngawen / Gunungkidul"
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Kota/Kecamatan di ttd E-Raport & Surat</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> Nomor Telepon Kantor / WA:
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.telepon || ''}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      placeholder="(0274) 123456"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Resmi Sekolah:
                  </label>
                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={formData.emailSekolah || ''}
                    onChange={(e) => setFormData({ ...formData, emailSekolah: e.target.value })}
                    placeholder="info@sekolah.sch.id"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-500" /> Peringkat Akreditasi:
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={formData.akreditasi || 'A (Unggul)'}
                    onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="A (Unggul)">A (Unggul)</option>
                    <option value="B (Baik)">B (Baik)</option>
                    <option value="C (Cukup)">C (Cukup)</option>
                    <option value="Terakreditasi Internasional">Terakreditasi Internasional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NPSN:</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.npsn || ''}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    placeholder="20101234"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Nama Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.kepalaSekolah || ''}
                    onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                    placeholder="Dr. Hendra Wijaya M.Pd"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Nomor Identitas:
                    </label>
                    <select
                      disabled={!isAdmin}
                      value={formData.tipeNomorKepalaSekolah || 'NBM'}
                      onChange={(e) => setFormData({ ...formData, tipeNomorKepalaSekolah: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="NBM">NBM (Nomor Baku Muhammadiyah)</option>
                      <option value="NIP">NIP (Nomor Induk Pegawai - Negeri/PNS)</option>
                      <option value="NUPTK">NUPTK (Nomor Unik Pendidik)</option>
                      <option value="NIY">NIY (Nomor Induk Yayasan)</option>
                      <option value="NIGB">NIGB (Nomor Induk Guru Bantu)</option>
                      <option value="NRG">NRG (Nomor Registrasi Guru)</option>
                      <option value="Tanpa Nomor">Tanpa Nomor (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formData.tipeNomorKepalaSekolah === 'Tanpa Nomor' ? 'Keterangan' : `Nomor ${formData.tipeNomorKepalaSekolah || 'NBM'}:`}
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin || formData.tipeNomorKepalaSekolah === 'Tanpa Nomor'}
                      value={formData.nipKepalaSekolah || ''}
                      onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                      placeholder={
                        formData.tipeNomorKepalaSekolah === 'NBM'
                          ? 'e.g. 1092837'
                          : formData.tipeNomorKepalaSekolah === 'NIP'
                          ? '197508122001121001'
                          : 'Nomor Identitas'
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none font-mono disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setFormData({ ...schoolSettings })}
              disabled={!isAdmin}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Batal & Reset Form
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>

              {isAdmin && (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Website
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
