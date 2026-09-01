import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  User as UserIcon,
  AlertCircle,
  X,
} from 'lucide-react';

interface PhotoUploadFieldProps {
  currentAvatar: string;
  onAvatarChange: (newAvatar: string) => void;
  label?: string;
  roleHint?: 'guru' | 'staf' | 'siswa' | 'admin' | 'all';
  compact?: boolean;
}

// Curated high quality avatars suitable for Indonesian schools
export const PRESET_AVATARS = {
  guruPria: [
    { label: 'Guru Pria 1 (Formal)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&fit=crop&crop=faces' },
    { label: 'Guru Pria 2 (Kemeja)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&fit=crop&crop=faces' },
    { label: 'Guru Pria 3 (Batik/Jas)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&fit=crop&crop=faces' },
    { label: 'Guru Pria 4 (Kacamata)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&fit=crop&crop=faces' },
  ],
  guruWanita: [
    { label: 'Guru Wanita 1 (Hijab Formal)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&fit=crop&crop=faces' },
    { label: 'Guru Wanita 2 (Blazer)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&fit=crop&crop=faces' },
    { label: 'Guru Wanita 3 (Formal)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&fit=crop&crop=faces' },
    { label: 'Guru Wanita 4 (Elegan)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&fit=crop&crop=faces' },
  ],
  siswaPria: [
    { label: 'Siswa Putra 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&fit=crop&crop=faces' },
    { label: 'Siswa Putra 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&fit=crop&crop=faces' },
    { label: 'Siswa Putra 3', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=250&fit=crop&crop=faces' },
  ],
  siswaWanita: [
    { label: 'Siswi Putri 1 (Hijab)', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=250&fit=crop&crop=faces' },
    { label: 'Siswi Putri 2', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&fit=crop&crop=faces' },
    { label: 'Siswi Putri 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&fit=crop&crop=faces' },
  ],
  ilustrasi: [
    { label: 'Avatar Pria Netral', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=guru1' },
    { label: 'Avatar Wanita Netral', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=guru2' },
    { label: 'Inisial Sekolah', url: 'https://api.dicebear.com/7.x/initials/svg?seed=SMK' },
  ],
};

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  currentAvatar,
  onAvatarChange,
  label = 'Foto Profil / Pas Foto',
  roleHint = 'all',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'preset' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
  }, [activeTab]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh peramban ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.'
      );
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center square
    const startX = ((video.videoWidth || 400) - size) / 2;
    const startY = ((video.videoHeight || 400) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, 320, 320);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onAvatarChange(dataUrl);
    stopCamera();
  };

  const compressAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onAvatarChange(compressedDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndSetImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    onAvatarChange(customUrl.trim());
    setCustomUrl('');
  };

  const handleResetToDefault = () => {
    const defaultAvatar =
      roleHint === 'siswa'
        ? PRESET_AVATARS.siswaPria[0].url
        : roleHint === 'guru'
        ? PRESET_AVATARS.guruPria[0].url
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&fit=crop&crop=faces';
    onAvatarChange(defaultAvatar);
  };

  return (
    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
          <UserIcon className="w-3.5 h-3.5 text-blue-600" />
          {label}
        </label>
        {currentAvatar && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            title="Reset ke Foto Bawaan"
          >
            <RefreshCw className="w-3 h-3" /> Reset Foto
          </button>
        )}
      </div>

      {/* Main Preview & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
        <div className="relative group shrink-0">
          <img
            src={currentAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250'}
            alt="Preview Foto Pengguna"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-sm bg-slate-100"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[9px] shadow-xs flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> Aktif
          </span>
        </div>

        <div className="flex-1 w-full space-y-2">
          {/* Method Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3" /> Unggah File
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeTab === 'camera'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3 h-3" /> Kamera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeTab === 'preset'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Galeri Pilihan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeTab === 'url'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3 h-3" /> URL Link
            </button>
          </div>

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
                <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Klik untuk Telusuri atau Tarik File Foto</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Mendukung format JPG, PNG, WEBP (Otomatis Dioptimasi & Dikompresi)
              </p>
            </div>
          )}

          {/* TAB 2: LIVE CAMERA SNAPSHOT */}
          {activeTab === 'camera' && (
            <div className="space-y-2">
              {cameraError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[11px]">Kamera Tidak Dapat Dibuka</p>
                    <p className="text-[10px] text-red-600 mt-0.5">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 border border-slate-700 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                    <div className="absolute inset-0 border-2 border-white/40 border-dashed rounded-full m-4 pointer-events-none" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> Ambil & Gunakan Foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESET AVATARS */}
          {activeTab === 'preset' && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              <div>
                <p className="font-bold text-slate-600 text-[10px] uppercase mb-1">Guru & Pegawai Pria:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.guruPria.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onAvatarChange(p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        currentAvatar === p.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-400'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-9 h-9 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-600 text-[10px] uppercase mb-1">Guru & Pegawai Wanita:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.guruWanita.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onAvatarChange(p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        currentAvatar === p.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-400'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-9 h-9 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-600 text-[10px] uppercase mb-1">Siswa / Siswi:</p>
                <div className="flex flex-wrap gap-2">
                  {[...PRESET_AVATARS.siswaPria, ...PRESET_AVATARS.siswaWanita].map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onAvatarChange(p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        currentAvatar === p.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-400'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-9 h-9 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT URL */}
          {activeTab === 'url' && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://contoh.com/foto-guru.jpg"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shrink-0"
              >
                Terapkan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
