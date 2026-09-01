import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RotateCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Upload,
  Sparkles,
  RefreshCw,
  ScanLine,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface CameraBarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  autoStart?: boolean;
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  onScanSuccess,
  soundEnabled = true,
  onToggleSound,
  autoStart = true,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  const readerElementId = 'siakad-camera-scanner-view';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingOrStoppingRef = useRef(false);

  // Stable callback ref
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Clean stop scanner instance and clear DOM container
  const stopAndClearScanner = useCallback(async () => {
    if (isStartingOrStoppingRef.current) return;
    isStartingOrStoppingRef.current = true;

    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (err) {
            console.warn('Stop scanner notice:', err);
          }
        }
        try {
          await scannerRef.current.clear();
        } catch (err) {
          console.warn('Clear scanner notice:', err);
        }
        scannerRef.current = null;
      }

      // Ensure DOM element is clean and has no orphaned video or canvas tags
      const container = document.getElementById(readerElementId);
      if (container) {
        container.innerHTML = '';
      }
    } finally {
      setIsScanning(false);
      setIsTorchOn(false);
      isStartingOrStoppingRef.current = false;
    }
  }, [readerElementId]);

  // Start Scanner with multi-tier fallback for laptops, webcams, and mobile phones
  const startScanner = useCallback(
    async (overrideCamId?: string) => {
      if (isStartingOrStoppingRef.current) return;
      isStartingOrStoppingRef.current = true;
      setCameraError(null);

      try {
        // 1. Clean previous instance if any
        if (scannerRef.current) {
          if (scannerRef.current.isScanning) {
            try {
              await scannerRef.current.stop();
            } catch {}
          }
          try {
            await scannerRef.current.clear();
          } catch {}
          scannerRef.current = null;
        }

        const container = document.getElementById(readerElementId);
        if (container) {
          container.innerHTML = '';
        }

        // 2. Pre-enumerate cameras if permission is already available
        let chosenCamId = overrideCamId || selectedCameraId;
        let availableDevices: Array<{ id: string; label: string }> = [];
        try {
          availableDevices = await Html5Qrcode.getCameras();
          if (availableDevices && availableDevices.length > 0) {
            setCameras(availableDevices);
            if (!chosenCamId) {
              const backCam = availableDevices.find(
                (d) =>
                  d.label.toLowerCase().includes('back') ||
                  d.label.toLowerCase().includes('belakang') ||
                  d.label.toLowerCase().includes('environment') ||
                  d.label.toLowerCase().includes('rear') ||
                  d.label.toLowerCase().includes('0, facing back')
              );
              // On phones with multiple cameras, prefer back camera. On laptops/PC (usually 1 camera), choose the first webcam.
              chosenCamId = backCam ? backCam.id : availableDevices[0].id;
              setSelectedCameraId(chosenCamId);
            }
          }
        } catch (camErr) {
          console.log('Pre-camera enumeration notice:', camErr);
        }

        // 3. Supported Barcode Formats (1D & 2D)
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.AZTEC,
        ];

        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport,
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });
        scannerRef.current = html5QrCode;

        // Wide generous bounding box so 1D and 2D barcodes scan anywhere in camera view
        const scanConfig = {
          fps: 25,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const w = Math.floor(Math.min(viewfinderWidth * 0.94, 500));
            const h = Math.floor(Math.min(viewfinderHeight * 0.88, 340));
            return { width: Math.max(w, 240), height: Math.max(h, 160) };
          },
          aspectRatio: 1.333333,
        };

        const handleScanSuccess = (decodedText: string) => {
          if (!decodedText) return;
          const now = Date.now();
          const isSame = decodedText === lastScannedCodeRef.current;
          const timeDiff = now - lastScannedTimeRef.current;

          // Prevent rapid spam of identical code (2.2s cooldown), allow different student barcode quickly (300ms)
          if (isSame && timeDiff < 2200) return;
          if (!isSame && timeDiff < 300) return;

          lastScannedCodeRef.current = decodedText;
          lastScannedTimeRef.current = now;
          setLastScannedText(decodedText);

          // Visual scan flash
          setScanSuccessAnim(true);
          setTimeout(() => setScanSuccessAnim(false), 900);

          // Mobile device haptic feedback
          if (navigator.vibrate) {
            try {
              navigator.vibrate([80, 40, 80]);
            } catch {}
          }

          if (onScanSuccessRef.current) {
            onScanSuccessRef.current(decodedText);
          }
        };

        // 4. Multi-Tier Startup Strategy:
        // Try chosenCamId -> Fallback to facingMode: 'environment' (phone) -> Fallback to facingMode: 'user' (laptop/webcam) -> Fallback to any device
        let started = false;

        // Tier 1: Try specific device ID if available
        if (chosenCamId) {
          try {
            await html5QrCode.start(chosenCamId, scanConfig, handleScanSuccess, () => {});
            started = true;
          } catch (idErr) {
            console.warn('Start with chosenCamId failed, attempting fallback...', idErr);
          }
        }

        // Tier 2: Try back camera (phones)
        if (!started) {
          try {
            await html5QrCode.start({ facingMode: 'environment' }, scanConfig, handleScanSuccess, () => {});
            started = true;
          } catch (envErr) {
            console.warn('Environment camera failed, attempting laptop webcam (user)...', envErr);
          }
        }

        // Tier 3: Try laptop webcam / front camera
        if (!started) {
          try {
            await html5QrCode.start({ facingMode: 'user' }, scanConfig, handleScanSuccess, () => {});
            started = true;
          } catch (userErr) {
            console.warn('User camera facing failed, trying generic device list...', userErr);
          }
        }

        // Tier 4: Query cameras now (post-permission) and pick first device
        if (!started) {
          try {
            const devList = await Html5Qrcode.getCameras();
            if (devList && devList.length > 0) {
              setCameras(devList);
              setSelectedCameraId(devList[0].id);
              await html5QrCode.start(devList[0].id, scanConfig, handleScanSuccess, () => {});
              started = true;
            }
          } catch (listErr) {
            console.warn('Generic camera start failed:', listErr);
          }
        }

        if (!started) {
          throw new Error('Tidak dapat menghubungkan kamera laptop / perangkat Anda. Pastikan izin kamera telah diberikan di browser.');
        }

        setIsScanning(true);

        // Update camera list once active
        try {
          const postDevices = await Html5Qrcode.getCameras();
          if (postDevices && postDevices.length > 0) {
            setCameras(postDevices);
          }
        } catch {}

        // Check flashlight / torch capability
        try {
          // @ts-ignore
          const capabilities = html5QrCode.getRunningTrackCapabilities();
          if (capabilities && 'torch' in capabilities) {
            setHasTorch(true);
          } else {
            setHasTorch(false);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err: any) {
        console.warn('Start camera scanner error:', err);
        setIsScanning(false);
        const errMsg = typeof err === 'string' ? err : err?.message || String(err);
        if (
          errMsg.includes('Permission') ||
          errMsg.includes('NotAllowed') ||
          errMsg.includes('dismissed') ||
          errMsg.includes('denied')
        ) {
          setCameraError(
            'Izin kamera belum aktif. Silakan klik ikon gembok/kamera di bilah URL browser Anda dan pilih "Izinkan" (Allow Camera).'
          );
        } else if (errMsg.includes('NotFound') || errMsg.includes('DevicesNotFoundError')) {
          setCameraError('Kamera / Webcam tidak ditemukan pada laptop atau perangkat ini.');
        } else {
          setCameraError(`Kamera belum aktif: ${errMsg}`);
        }
      } finally {
        isStartingOrStoppingRef.current = false;
      }
    },
    [readerElementId, selectedCameraId]
  );

  // Switch camera cleanly
  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    await stopAndClearScanner();
    setTimeout(() => {
      startScanner(newCamId);
    }, 250);
  };

  // Flip camera between Front and Rear
  const handleFlipCamera = async () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    if (nextCamera) {
      handleCameraChange(nextCamera.id);
    }
  };

  // Toggle Torch / Flashlight
  const handleToggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        const nextState = !isTorchOn;
        // @ts-ignore
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Torch error:', err);
      }
    }
  };

  // Scan from uploaded or captured photo
  const handleScanFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let qrCodeInstance = scannerRef.current;
      if (!qrCodeInstance) {
        qrCodeInstance = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
        scannerRef.current = qrCodeInstance;
      }

      const decodedText = await qrCodeInstance.scanFile(file, true);
      if (decodedText) {
        setLastScannedText(decodedText);
        setScanSuccessAnim(true);
        setTimeout(() => setScanSuccessAnim(false), 900);
        if (onScanSuccessRef.current) {
          onScanSuccessRef.current(decodedText);
        }
      }
    } catch (err: any) {
      console.warn('Scan file error:', err);
      alert('Tidak menemukan Barcode atau QR Code yang jelas pada foto tersebut. Pastikan foto kartu tidak blur.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Single mount effect to auto start
  useEffect(() => {
    let isMounted = true;

    if (autoStart) {
      const timer = setTimeout(() => {
        if (isMounted) {
          startScanner();
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopAndClearScanner();
      };
    }

    return () => {
      isMounted = false;
      stopAndClearScanner();
    };
  }, [autoStart]);

  return (
    <div className="bg-slate-950 rounded-2xl border-2 border-emerald-500/60 overflow-hidden shadow-2xl space-y-3 p-4">
      <style>{`
        #${readerElementId} {
          width: 100% !important;
          max-width: 100% !important;
          border: none !important;
        }
        #${readerElementId} video {
          width: 100% !important;
          height: 100% !important;
          max-height: 380px !important;
          object-fit: cover !important;
          border-radius: 12px !important;
        }
        #${readerElementId}__scan_region {
          min-height: 220px !important;
        }
        #${readerElementId}__dashboard_section {
          display: none !important;
        }
      `}</style>

      {/* Top Scanner Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <div className={`w-3 h-3 rounded-full absolute top-0 left-0 ${isScanning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isScanning ? 'Kamera Pemindai Aktif' : 'Kamera Pemindai Siap'}</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Arahkan kamera ke Barcode 1D / QR Code pada kartu siswa
            </p>
          </div>
        </div>

        {/* Controls: Sound, Torch, Camera Switcher */}
        <div className="flex items-center gap-2">
          {hasTorch && isScanning && (
            <button
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                isTorchOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Lampu Flash / Senter"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}

          {cameras.length > 1 && (
            <button
              onClick={handleFlipCamera}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
              title="Ganti Kamera Belakang / Depan"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Ganti Kamera</span>
            </button>
          )}

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              title="Suara Beep"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {isScanning ? (
            <button
              onClick={stopAndClearScanner}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Matikan</span>
            </button>
          ) : (
            <button
              onClick={() => startScanner()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Buka Kamera</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport Container */}
      <div
        className={`relative rounded-xl overflow-hidden bg-black border min-h-[260px] max-h-[380px] flex items-center justify-center transition-all ${
          scanSuccessAnim ? 'border-emerald-400 ring-4 ring-emerald-400/50' : 'border-slate-800'
        }`}
      >
        {/* The HTML5 QR Code DOM target (single container) */}
        <div id={readerElementId} className="w-full h-full max-w-full overflow-hidden" />

        {/* Laser / Targeting Overlay while Scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            {/* Reticle / Target Box */}
            <div
              className={`w-full max-w-[320px] h-[190px] border-2 rounded-2xl relative transition-all ${
                scanSuccessAnim
                  ? 'border-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.8)] bg-emerald-500/10'
                  : 'border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              }`}
            >
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated Laser Scanning Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,1)] animate-[bounce_2s_infinite] opacity-90" />

              {/* Scan text badge */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 backdrop-blur-xs px-3 py-0.5 rounded-full border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                <ScanLine className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Posisikan Barcode atau QR Code Kartu di Sini</span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Error Message Banner */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <AlertCircle className="w-10 h-10 text-amber-400 animate-pulse" />
            <p className="text-xs text-slate-200 font-semibold max-w-md">{cameraError}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => startScanner()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi Akses Kamera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Buka Kamera Perangkat / Galeri</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File / Native Camera Input for mobile native scanner capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScanFromFile}
        className="hidden"
      />

      {/* Footer Alternative Options */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Otomatis memindai Barcode 1D (NISN) & QR Code Siswa</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
            title="Gunakan aplikasi kamera bawaan HP / Foto Barcode"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Kamera Bawaan HP / Unggah Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

