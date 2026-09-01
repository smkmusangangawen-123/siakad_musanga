import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  School,
  User,
  Calendar,
  Award,
  Layers,
  FileText,
  X,
  RefreshCw,
} from 'lucide-react';
import { RaportData, SchoolSettings, RaportVerificationRecord } from '../../types';
import {
  generateRaportValidationCode,
  getRaportValidationUrl,
  generateRaportQRCodeDataUrl,
  verifyRaportAuthenticity,
  fetchRaportVerificationRecord,
} from '../../utils/raportValidation';

interface RaportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  raportData?: RaportData;
  schoolSettings?: SchoolSettings;
}

export const RaportValidationModal: React.FC<RaportValidationModalProps> = ({
  isOpen,
  onClose,
  raportData,
  schoolSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'qrcode' | 'lookup'>('qrcode');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [validationCode, setValidationCode] = useState<string>('');
  const [validationUrl, setValidationUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Lookup state
  const [searchCode, setSearchCode] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<RaportVerificationRecord | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupSearched, setLookupSearched] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && raportData) {
      setLoading(true);
      const code = raportData.validationCode || generateRaportValidationCode(raportData);
      const url = raportData.validationUrl || getRaportValidationUrl(raportData, code);
      setValidationCode(code);
      setValidationUrl(url);

      generateRaportQRCodeDataUrl(url, {
        width: 320,
        darkColor: '#0f172a',
        lightColor: '#ffffff',
      })
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate QR code:', err);
          setLoading(false);
        });
    }
  }, [isOpen, raportData]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(validationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(validationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRCode_Raport_${raportData?.siswaNama?.replace(/\s+/g, '_') || 'Validasi'}.png`;
    link.click();
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setLookupLoading(true);
    setLookupSearched(true);
    try {
      const record = await fetchRaportVerificationRecord(searchCode.trim());
      setLookupResult(record);
    } catch (err) {
      console.error('Error looking up raport:', err);
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const schoolName =
    schoolSettings?.kopNamaSekolah ||
    schoolSettings?.namaSekolah ||
    'SMK MUHAMMADIYAH 1 NGAWEN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/40 text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Verifikasi Keaslian Digital e-Raport
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  QR Resmi
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Sistem Validasi & Otentikasi Terintegrasi Cloud SIAKAD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'qrcode'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code Raport Aktif
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'lookup'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Pemeriksaan Kode Validasi
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'qrcode' && raportData && (
            <div className="space-y-6">
              {/* QR Code & Metadata Card */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-slate-50 border border-slate-200">
                {/* QR Code Box */}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 relative group">
                    {loading ? (
                      <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-xs">Membuat QR Code...</span>
                      </div>
                    ) : qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Raport"
                        className="w-44 h-44 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-red-500 text-xs">
                        Gagal memuat QR Code
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    disabled={!qrDataUrl}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline pt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Gambar QR (.png)
                  </button>
                </div>

                {/* Metadata Column */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status: Tersertifikasi Resmi
                    </span>
                    <span className="text-xs text-slate-500">
                      Format ISO / QR Standar
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {raportData.siswaNama}
                    </h3>
                    <p className="text-xs text-slate-600">
                      NISN: <span className="font-semibold text-slate-800">{raportData.nisn}</span> • Kelas: <span className="font-semibold text-slate-800">{raportData.kelasNama}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {schoolName} • TP {raportData.tahunAjaran} ({raportData.semester})
                    </p>
                  </div>

                  {/* Validation Code Display */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Kode Validasi Dokumen (Hash)
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Tersalin' : 'Salin Kode'}
                      </button>
                    </div>
                    <code className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded block truncate select-all">
                      {validationCode}
                    </code>
                  </div>
                </div>
              </div>

              {/* Validation Link Box */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    URL Verifikasi Mandiri (Publik)
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tautan Tersalin' : 'Salin Tautan'}
                  </button>
                </div>
                <p className="text-xs text-blue-800 font-mono break-all select-all bg-white p-2 rounded border border-blue-100">
                  {validationUrl}
                </p>
                <p className="text-[11px] text-blue-700">
                  Pihak sekolah, wali murid, atau instansi lain dapat memindai QR code atau membuka tautan di atas untuk memvalidasi keaslian e-Raport secara real-time.
                </p>
              </div>

              {/* Security Features Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Integritas Data</span>
                  <span className="text-xs font-bold text-slate-800">SHA-256 / Hash 32-bit</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Penyimpanan Cloud</span>
                  <span className="text-xs font-bold text-slate-800">Firestore Cloud Sync</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">TTE Kepala Sekolah</span>
                  <span className="text-xs font-bold text-slate-800">Tersertifikasi Digital</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lookup' && (
            <div className="space-y-5">
              <form onSubmit={handleLookup} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Masukkan Kode Validasi atau Nomor NISN Siswa:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      placeholder="Contoh: VAL-RPT-2024-2025-GENAP-0061234567-..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={lookupLoading || !searchCode.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {lookupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Periksa
                  </button>
                </div>
              </form>

              {/* Lookup Result Display */}
              {lookupSearched && (
                <div>
                  {lookupLoading ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      Memverifikasi catatan pada Cloud Database...
                    </div>
                  ) : lookupResult ? (
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 text-white rounded-full">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">
                            Dokumen Terverifikasi Sah & Asli
                          </h4>
                          <p className="text-xs text-emerald-700">
                            Data e-Raport terdaftar resmi di database SIAKAD sekolah.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-lg border border-emerald-100">
                        <div>
                          <span className="text-slate-500 block">Nama Siswa:</span>
                          <span className="font-bold text-slate-800">{lookupResult.siswaNama}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">NISN / Kelas:</span>
                          <span className="font-bold text-slate-800">{lookupResult.nisn} ({lookupResult.kelasNama})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tahun / Semester:</span>
                          <span className="font-bold text-slate-800">{lookupResult.tahunAjaran} - {lookupResult.semester}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Rata-rata Nilai:</span>
                          <span className="font-bold text-emerald-700">{lookupResult.nilaiRataRata} ({lookupResult.jumlahMapel} Mapel)</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 block">Kepala Sekolah Penandatangan:</span>
                          <span className="font-bold text-slate-800">{lookupResult.kepalaSekolahNama}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                      <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="text-sm font-bold text-amber-900">
                        Dokumen Tidak Ditemukan / Perlu Registrasi
                      </h4>
                      <p className="text-xs text-amber-700 max-w-md mx-auto">
                        Kode validasi <code className="bg-amber-100 px-1 py-0.5 rounded">{searchCode}</code> belum terdaftar atau telah kedaluwarsa. Pastikan kode yang dimasukkan sudah benar.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Sistem Informasi Akademik • Keaslian e-Raport
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
