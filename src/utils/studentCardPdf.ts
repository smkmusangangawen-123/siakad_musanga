import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { User, SchoolSettings, Kelas } from '../types';

export type CardTheme = 'navy' | 'emerald' | 'crimson' | 'slate' | 'amber';
export type CardSideOption = 'depan' | 'belakang' | 'bolak-balik';
export type CardPageLayout = 'pvc-single' | 'a4-grid';

export interface StudentCardExportOptions {
  theme?: CardTheme;
  side?: CardSideOption;
  layout?: CardPageLayout;
  schoolSettings?: SchoolSettings;
  classes?: Kelas[];
  showPhoto?: boolean;
  show1DBarcode?: boolean;
  showQRCode?: boolean;
  showHologram?: boolean;
  showStampKepsek?: boolean;
  customValidity?: string;
}

interface ThemePalette {
  primary: [number, number, number]; // RGB
  secondary: [number, number, number];
  accent: [number, number, number];
  headerBg: [number, number, number];
  badgeBg: [number, number, number];
  textColor: [number, number, number];
  highlightText: [number, number, number];
}

const THEMES: Record<CardTheme, ThemePalette> = {
  navy: {
    primary: [15, 23, 42], // Slate 900
    secondary: [30, 58, 138], // Blue 900
    accent: [56, 189, 248], // Sky 400
    headerBg: [10, 20, 45],
    badgeBg: [14, 165, 233], // Sky 500
    textColor: [255, 255, 255],
    highlightText: [253, 224, 71], // Amber 300
  },
  emerald: {
    primary: [2, 44, 34], // Emerald 950
    secondary: [6, 78, 59], // Emerald 800
    accent: [52, 211, 153], // Emerald 400
    headerBg: [4, 35, 28],
    badgeBg: [16, 185, 129], // Emerald 500
    textColor: [255, 255, 255],
    highlightText: [253, 224, 71],
  },
  crimson: {
    primary: [76, 5, 25], // Rose 950
    secondary: [136, 19, 55], // Rose 900
    accent: [251, 191, 36], // Amber 400
    headerBg: [60, 4, 20],
    badgeBg: [245, 158, 11], // Amber 500
    textColor: [255, 255, 255],
    highlightText: [253, 224, 71],
  },
  slate: {
    primary: [9, 13, 22],
    secondary: [30, 41, 59], // Slate 800
    accent: [34, 211, 238], // Cyan 400
    headerBg: [15, 23, 42],
    badgeBg: [6, 182, 212], // Cyan 500
    textColor: [255, 255, 255],
    highlightText: [253, 224, 71],
  },
  amber: {
    primary: [69, 26, 3], // Amber 950
    secondary: [120, 53, 15], // Amber 900
    accent: [251, 191, 36], // Amber 400
    headerBg: [50, 18, 2],
    badgeBg: [217, 119, 6], // Amber 600
    textColor: [255, 255, 255],
    highlightText: [253, 224, 71],
  },
};

// Generate 1D Barcode PNG Data URL using offscreen canvas and JsBarcode
export function generateBarcodeDataUrl(value: string): string {
  try {
    const cleanVal = (value || '0000000000').trim();
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, cleanVal, {
      format: 'CODE128',
      width: 2,
      height: 38,
      displayValue: true,
      fontSize: 12,
      font: 'monospace',
      lineColor: '#000000',
      background: '#ffffff',
      margin: 2,
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to generate barcode data URL:', err);
    return '';
  }
}

// Generate High-Resolution Crisp QR Code Data URL using standard QRCode encoder
export async function generateQRCodeDataUrl(text: string, size: number = 300): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn('Failed to generate real QR Code data URL:', err);
    return '';
  }
}

// Convert Image URL to Base64 (with cross-origin handling)
export function getImgBase64(url: string): Promise<string> {
  return new Promise((resolve) => {
    if (!url) {
      resolve('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 120;
        canvas.height = img.height || 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve('');
        }
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
}

// ============================================================================
// DRAW STUDENT CARD FRONT ON jsPDF
// ============================================================================
export function drawCardFront(
  doc: jsPDF,
  student: User,
  x: number,
  y: number,
  w: number = 85.6,
  h: number = 53.98,
  options: StudentCardExportOptions = {},
  cachedAssets: { barcodeUrl?: string; qrUrl?: string; avatarUrl?: string; logoUrl?: string } = {}
) {
  const theme = THEMES[options.theme || 'navy'];
  const settings = options.schoolSettings;
  const schoolName = (settings?.kopNamaSekolah || settings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN').toUpperCase();
  const schoolNpsn = settings?.npsn || '20338514';
  const studentNisn = student.nisn || student.nis || '0061234567';

  // Find Wali Kelas
  const waliKelas =
    options.classes?.find((c) => c.id === student.kelasId || c.nama === student.kelasNama)?.waliKelasNama ||
    'Budi Santoso S.Pd';

  // 1. Card Outer Background with Rounded Corners
  doc.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2]);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // 2. Card Gradient / Accent Border
  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(x + 0.3, y + 0.3, w - 0.6, h - 0.6, 2.8, 2.8, 'D');

  // 3. Top Header Bar
  const headerHeight = 10;
  doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
  doc.rect(x + 0.4, y + 0.4, w - 0.8, headerHeight, 'F');

  // Decorative Accent Line under header
  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.3);
  doc.line(x + 0.4, y + headerHeight + 0.4, x + w - 0.4, y + headerHeight + 0.4);

  // Logo / Icon
  if (cachedAssets.logoUrl) {
    try {
      doc.addImage(cachedAssets.logoUrl, 'PNG', x + 2, y + 1.2, 7.5, 7.5);
    } catch {
      // fallback
    }
  } else {
    // Drawn School Shield Emblem
    doc.setFillColor(255, 255, 255);
    doc.circle(x + 5.5, y + 5.2, 3.2, 'F');
    doc.setFillColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.circle(x + 5.5, y + 5.2, 2.5, 'F');
  }

  // School Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(schoolName.length > 28 ? 6.5 : 7.2);
  doc.text(schoolName, x + 10.5, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(200, 215, 240);
  doc.text(`NPSN: ${schoolNpsn} • SISTEM AKADEMIK DIGITAL`, x + 10.5, y + 7.5);

  // Top-Right Badge: "KARTU PELAJAR"
  doc.setFillColor(theme.badgeBg[0], theme.badgeBg[1], theme.badgeBg[2]);
  doc.roundedRect(x + w - 21.5, y + 2.5, 19.5, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(15, 23, 42);
  doc.text('KARTU PELAJAR', x + w - 11.75, y + 5.8, { align: 'center' });

  // 4. Student Photo Frame
  const photoX = x + 2.5;
  const photoY = y + 12;
  const photoW = 14.5;
  const photoH = 18.5;

  // Photo background & border
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(photoX, photoY, photoW, photoH, 1.2, 1.2, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.roundedRect(photoX, photoY, photoW, photoH, 1.2, 1.2, 'D');

  if (cachedAssets.avatarUrl && options.showPhoto !== false) {
    try {
      doc.addImage(cachedAssets.avatarUrl, 'JPEG', photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6);
    } catch {
      // draw placeholder silhouette
      drawSilhouette(doc, photoX + photoW / 2, photoY + photoH / 2);
    }
  } else {
    drawSilhouette(doc, photoX + photoW / 2, photoY + photoH / 2);
  }

  // Hologram Security Seal
  if (options.showHologram !== false) {
    doc.setFillColor(251, 191, 36); // Gold
    doc.circle(photoX + photoW - 1, photoY + photoH - 1, 2.2, 'F');
    doc.setFillColor(15, 23, 42);
    doc.circle(photoX + photoW - 1, photoY + photoH - 1, 1.6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.2);
    doc.setTextColor(251, 191, 36);
    doc.text('SEC', photoX + photoW - 1, photoY + photoH - 0.2, { align: 'center' });
  }

  // 5. Student Details Table
  const detailX = photoX + photoW + 2.5;
  let detailY = y + 14.2;
  const lineSpacing = 3.8;

  // Nama
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(180, 200, 230);
  doc.text('Nama', detailX, detailY);
  doc.text(':', detailX + 11, detailY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(255, 255, 255);
  const truncatedName = student.name.length > 20 ? student.name.substring(0, 19) + '…' : student.name;
  doc.text(truncatedName.toUpperCase(), detailX + 13, detailY);

  // NISN
  detailY += lineSpacing;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(180, 200, 230);
  doc.text('NISN', detailX, detailY);
  doc.text(':', detailX + 11, detailY);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(theme.highlightText[0], theme.highlightText[1], theme.highlightText[2]);
  doc.text(studentNisn, detailX + 13, detailY);

  // Kelas
  detailY += lineSpacing;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(180, 200, 230);
  doc.text('Kelas', detailX, detailY);
  doc.text(':', detailX + 11, detailY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text(student.kelasNama || '10 TKJ 1', detailX + 13, detailY);

  // Wali Kelas
  detailY += lineSpacing;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(180, 200, 230);
  doc.text('Wali Kelas', detailX, detailY);
  doc.text(':', detailX + 11, detailY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(230, 240, 255);
  const truncatedWali = waliKelas.length > 18 ? waliKelas.substring(0, 17) + '…' : waliKelas;
  doc.text(truncatedWali, detailX + 13, detailY);

  // 6. QR Code Box (Enlarged)
  if (options.showQRCode !== false) {
    const qrBoxSize = 15;
    const qrX = x + w - qrBoxSize - 2.5;
    const qrY = y + 13;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX, qrY, qrBoxSize, qrBoxSize, 1.2, 1.2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrX, qrY, qrBoxSize, qrBoxSize, 1.2, 1.2, 'D');

    if (cachedAssets.qrUrl) {
      try {
        doc.addImage(cachedAssets.qrUrl, 'PNG', qrX + 0.8, qrY + 0.8, qrBoxSize - 1.6, qrBoxSize - 1.6);
      } catch {
        // fallback
      }
    }

    // Mini Tag below QR
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(qrX + 1.2, qrY + qrBoxSize - 2.6, qrBoxSize - 2.4, 2.2, 0.4, 0.4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.6);
    doc.setTextColor(15, 23, 42);
    doc.text('SCAN PRESENSI', qrX + qrBoxSize / 2, qrY + qrBoxSize - 1, { align: 'center' });
  }

  // 7. Bottom Barcode Container (White Clean Box with 1D Code 128)
  if (options.show1DBarcode !== false) {
    const barcodeBoxW = w - 5;
    const barcodeBoxH = 9.5;
    const barcodeX = x + 2.5;
    const barcodeY = y + h - barcodeBoxH - 2.2;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(barcodeX, barcodeY, barcodeBoxW, barcodeBoxH, 1.2, 1.2, 'F');

    if (cachedAssets.barcodeUrl) {
      try {
        doc.addImage(cachedAssets.barcodeUrl, 'PNG', barcodeX + 1, barcodeY + 0.5, barcodeBoxW - 2, barcodeBoxH - 1);
      } catch {
        // fallback
        doc.setFont('courier', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(`*${studentNisn}*`, barcodeX + barcodeBoxW / 2, barcodeY + 5.5, { align: 'center' });
      }
    } else {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`*${studentNisn}*`, barcodeX + barcodeBoxW / 2, barcodeY + 5.5, { align: 'center' });
    }
  }
}

// ============================================================================
// DRAW STUDENT CARD BACK ON jsPDF
// ============================================================================
export function drawCardBack(
  doc: jsPDF,
  student: User,
  x: number,
  y: number,
  w: number = 85.6,
  h: number = 53.98,
  options: StudentCardExportOptions = {},
  cachedAssets: { qrUrl?: string } = {}
) {
  const theme = THEMES[options.theme || 'navy'];
  const settings = options.schoolSettings;
  const schoolAddress = settings?.alamatSekolah || 'Jl. Raya Ngawen KM 1, Gunungkidul, D.I. Yogyakarta';
  const schoolWebsite = settings?.website || 'siakad.smkmuh1ngawen.sch.id';
  const kepsekNama = settings?.kepalaSekolah || 'Dr. Hendra Wijaya M.Pd';
  const kepsekTipe = settings?.tipeNomorKepalaSekolah || 'NBM';
  const kepsekNip = settings?.nipKepalaSekolah || '1092837';
  const kotaTitimangsa = settings?.kotaTitimangsa || settings?.kecamatan || 'Ngawen';
  const studentNisn = student.nisn || student.nis || '0061234567';

  // 1. Outer Card Background
  doc.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2]);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // 2. Accent Border
  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(x + 0.3, y + 0.3, w - 0.6, h - 0.6, 2.8, 2.8, 'D');

  // 3. Top Header
  const headerHeight = 7.5;
  doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
  doc.rect(x + 0.4, y + 0.4, w - 0.8, headerHeight, 'F');

  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.3);
  doc.line(x + 0.4, y + headerHeight + 0.4, x + w - 0.4, y + headerHeight + 0.4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(theme.highlightText[0], theme.highlightText[1], theme.highlightText[2]);
  doc.text('KETENTUAN KARTU PELAJAR & PRESENSI', x + 3.5, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.4);
  doc.setTextColor(180, 200, 230);
  doc.text('Sistem Informasi Akademik & Presensi Gerbang', x + 3.5, y + 6.8);

  // 4. Rules List (Left side)
  const rulesX = x + 3.5;
  let rulesY = y + 12;
  const ruleSpacing = 3.4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.6);
  doc.setTextColor(230, 240, 255);

  const rules = [
    '1. Kartu wajib dibawa setiap hari untuk presensi gerbang & kelas.',
    '2. Dilarang memindahtangankan kartu kepada siswa lain.',
    '3. Berfungsi sebagai kartu akses Perpustakaan & CBT Ujian.',
    '4. Jika kartu hilang, segera melapor ke bagian Tata Usaha.',
  ];

  rules.forEach((rule) => {
    doc.text(rule, rulesX, rulesY);
    rulesY += ruleSpacing;
  });

  // 5. Verification QR Code (Right side)
  const backQrSize = 16;
  const backQrX = x + w - backQrSize - 3.5;
  const backQrY = y + 10;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(backQrX, backQrY, backQrSize, backQrSize, 1.2, 1.2, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(backQrX, backQrY, backQrSize, backQrSize, 1.2, 1.2, 'D');

  if (cachedAssets.qrUrl) {
    try {
      doc.addImage(cachedAssets.qrUrl, 'PNG', backQrX + 0.8, backQrY + 0.8, backQrSize - 1.6, backQrSize - 1.6);
    } catch {
      // fallback
    }
  }

  // Label under QR
  doc.setFont('courier', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(theme.highlightText[0], theme.highlightText[1], theme.highlightText[2]);
  doc.text(`NISN: ${studentNisn}`, backQrX + backQrSize / 2, backQrY + backQrSize + 2.4, { align: 'center' });

  // 6. Bottom Signature & School Info Section
  const footerY = y + h - 14;
  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.2);
  doc.line(x + 3.5, footerY, x + w - 3.5, footerY);

  // Left Footer: School Address & Web
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.2);
  doc.setTextColor(170, 190, 220);
  const truncatedAddr = schoolAddress.length > 40 ? schoolAddress.substring(0, 39) + '…' : schoolAddress;
  doc.text(truncatedAddr, x + 3.5, footerY + 3.5);
  doc.text(`Portal: ${schoolWebsite}`, x + 3.5, footerY + 6.8);
  doc.text(`Berlaku: ${options.customValidity || 'T.A. 2025 / 2026'}`, x + 3.5, footerY + 10.1);

  // Right Footer: Signature Block
  if (options.showStampKepsek !== false) {
    const sigX = x + w - 24;
    const nowYear = new Date().getFullYear();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.2);
    doc.setTextColor(200, 220, 245);
    doc.text(`${kotaTitimangsa}, Juli ${nowYear}`, sigX + 10, footerY + 3.2, { align: 'center' });
    doc.text('Kepala Sekolah,', sigX + 10, footerY + 5.8, { align: 'center' });

    // Signature stamp marker
    doc.setFont('times', 'italic');
    doc.setFontSize(4.8);
    doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.text('[Ttd & Cap]', sigX + 10, footerY + 8.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(255, 255, 255);
    doc.text(kepsekNama, sigX + 10, footerY + 11.2, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.8);
    doc.setTextColor(180, 200, 230);
    const nipStr = kepsekTipe === 'Tanpa Nomor' || !kepsekNip ? '-' : `${kepsekTipe}. ${kepsekNip}`;
    doc.text(nipStr, sigX + 10, footerY + 13.2, { align: 'center' });
  }
}

// Draw silhouette helper
function drawSilhouette(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(148, 163, 184); // Slate 400
  doc.circle(cx, cy - 2.5, 2.8, 'F');
  doc.roundedRect(cx - 4.5, cy + 1, 9, 5, 2, 2, 'F');
}

// ============================================================================
// MAIN EXPORT FUNCTION 1: DOWNLOAD SINGLE STUDENT CARD (PERSISWA)
// ============================================================================
export async function downloadSingleStudentCardPDF(student: User, options: StudentCardExportOptions = {}): Promise<void> {
  const side = options.side || 'depan';
  const layout = options.layout || 'pvc-single';
  const theme = options.theme || 'navy';
  const studentNisn = student.nisn || student.nis || '0061234567';

  // Prepare Assets in Parallel
  const [barcodeUrl, qrUrl, avatarUrl, logoUrl] = await Promise.all([
    generateBarcodeDataUrl(studentNisn),
    generateQRCodeDataUrl(
      JSON.stringify({
        id: student.id,
        nisn: studentNisn,
        nama: student.name,
        kelas: student.kelasNama || '-',
        jurusan: student.jurusanNama || '-',
        sekolah: options.schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN',
        type: 'SIAKAD_STUDENT_CARD_V1',
      })
    ),
    student.avatar ? getImgBase64(student.avatar) : Promise.resolve(''),
    options.schoolSettings?.logoUrl ? getImgBase64(options.schoolSettings.logoUrl) : Promise.resolve(''),
  ]);

  const assets = { barcodeUrl, qrUrl, avatarUrl, logoUrl };

  if (layout === 'pvc-single') {
    // Exact CR80 PVC Standard Dimension: 85.6 x 54 mm Landscape
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    if (side === 'depan') {
      drawCardFront(doc, student, 0, 0, 85.6, 53.98, options, assets);
    } else if (side === 'belakang') {
      drawCardBack(doc, student, 0, 0, 85.6, 53.98, options, assets);
    } else {
      // Bolak-Balik: 2 Pages in 1 PDF
      drawCardFront(doc, student, 0, 0, 85.6, 53.98, options, assets);
      doc.addPage([85.6, 53.98], 'landscape');
      drawCardBack(doc, student, 0, 0, 85.6, 53.98, options, assets);
    }

    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Kartu_Pelajar_${cleanName}_${studentNisn}.pdf`);
  } else {
    // A4 Printable Single Sheet with Front and Back placed together
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const schoolName = (options.schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN').toUpperCase();

    // Sheet Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138);
    doc.text(schoolName, pageWidth / 2, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Lembar Cetak Kartu Pelajar & Presensi Digital (Siap Potong)', pageWidth / 2, 24, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(15, 28, pageWidth - 15, 28);

    const cardW = 85.6;
    const cardH = 53.98;
    const startX = (pageWidth - cardW) / 2;

    // Card Front
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('SISI TAMPAK DEPAN (BIODATA & BARCODE):', startX, 36);

    // Cutting boundary dashed line
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(startX - 1, 39, cardW + 2, cardH + 2);
    doc.setLineDashPattern([], 0);

    drawCardFront(doc, student, startX, 40, cardW, cardH, options, assets);

    // Card Back
    const backStartY = 40 + cardH + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('SISI TAMPAK BELAKANG (KETENTUAN & PENGESAHAN):', startX, backStartY - 4);

    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(startX - 1, backStartY - 1, cardW + 2, cardH + 2);
    doc.setLineDashPattern([], 0);

    drawCardBack(doc, student, startX, backStartY, cardW, cardH, options, assets);

    // Footer instruction
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Petunjuk: Cetak dengan skala 100% (Actual Size) pada kertas foto / PVC tebal, lalu gunting mengikuti garis putus-putus.',
      pageWidth / 2,
      280,
      { align: 'center' }
    );

    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Lembar_A4_Kartu_${cleanName}_${studentNisn}.pdf`);
  }
}

// ============================================================================
// MAIN EXPORT FUNCTION 2: DOWNLOAD BATCH / ALL STUDENT CARDS (SEMUA SISWA)
// ============================================================================
export async function downloadBatchStudentCardsPDF(
  students: User[],
  options: StudentCardExportOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (students.length === 0) return;

  const side = options.side || 'depan';
  const layout = options.layout || 'a4-grid';
  const schoolName = (options.schoolSettings?.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN').toUpperCase();
  const logoUrl = options.schoolSettings?.logoUrl ? await getImgBase64(options.schoolSettings.logoUrl) : '';

  // Pre-fetch all asset caches for each student in batch
  const studentAssetsList: Array<{
    student: User;
    assets: { barcodeUrl: string; qrUrl: string; avatarUrl: string; logoUrl: string };
  }> = [];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (onProgress) onProgress(i + 1, students.length);

    const sNisn = s.nisn || s.nis || '0061234567';
    const [barcodeUrl, qrUrl, avatarUrl] = await Promise.all([
      generateBarcodeDataUrl(sNisn),
      generateQRCodeDataUrl(
        JSON.stringify({
          id: s.id,
          nisn: sNisn,
          nama: s.name,
          kelas: s.kelasNama || '-',
          jurusan: s.jurusanNama || '-',
          sekolah: schoolName,
          type: 'SIAKAD_STUDENT_CARD_V1',
        })
      ),
      s.avatar ? getImgBase64(s.avatar) : Promise.resolve(''),
    ]);

    studentAssetsList.push({
      student: s,
      assets: { barcodeUrl, qrUrl, avatarUrl, logoUrl },
    });
  }

  const nowStr = new Date().toISOString().split('T')[0];

  // --------------------------------------------------------------------------
  // MODE 1: MULTI-PAGE STANDAR ID CARD PVC (CR80: 85.6 x 53.98 mm)
  // Dedicated single-card pages in a combined multi-page document
  // --------------------------------------------------------------------------
  if (layout === 'pvc-single') {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    studentAssetsList.forEach((item, index) => {
      if (side === 'depan') {
        if (index > 0) doc.addPage([85.6, 53.98], 'landscape');
        drawCardFront(doc, item.student, 0, 0, 85.6, 53.98, options, item.assets);
      } else if (side === 'belakang') {
        if (index > 0) doc.addPage([85.6, 53.98], 'landscape');
        drawCardBack(doc, item.student, 0, 0, 85.6, 53.98, options, item.assets);
      } else {
        // Bolak-balik: Page (2*index + 1) = Front, Page (2*index + 2) = Back
        if (index > 0) doc.addPage([85.6, 53.98], 'landscape');
        drawCardFront(doc, item.student, 0, 0, 85.6, 53.98, options, item.assets);
        doc.addPage([85.6, 53.98], 'landscape');
        drawCardBack(doc, item.student, 0, 0, 85.6, 53.98, options, item.assets);
      }
    });

    doc.save(`Kartu_Pelajar_PVC_MultiHalaman_${students.length}_Siswa_${nowStr}.pdf`);
    return;
  }

  // --------------------------------------------------------------------------
  // MODE 2: MULTI-PAGE LEMBAR CETAK A4 GRID (8 Cards Per Page / 4 Duplex Pairs)
  // --------------------------------------------------------------------------
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const cardW = 85.6;
  const cardH = 53.98;
  const marginX = 12;
  const startY = 24;
  const gapX = 14;
  const gapY = 10;
  const cardsPerPage = 8; // 2 x 4

  const renderPageHeader = (pageNum: number, totalPages: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text(schoolName, marginX, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Lembar Cetak Massal Kartu Pelajar (Format A4 Grid) • Halaman ${pageNum} dari ${totalPages}`,
      marginX,
      16
    );

    doc.text(
      `Sisi: ${side === 'depan' ? 'Tampak Depan' : side === 'belakang' ? 'Tampak Belakang' : 'Bolak-Balik'} • Total: ${students.length} Siswa`,
      pageWidth - marginX,
      16,
      { align: 'right' }
    );

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, 19, pageWidth - marginX, 19);
  };

  if (side === 'bolak-balik') {
    // In bolak-balik mode, we render Front pages, and corresponding Back pages
    const totalPages = Math.ceil(studentAssetsList.length / 4) * 2;
    let currentPage = 1;

    for (let i = 0; i < studentAssetsList.length; i += 4) {
      const pageBatch = studentAssetsList.slice(i, i + 4);

      // Page A: Front Cards (4 cards)
      renderPageHeader(currentPage, totalPages);

      pageBatch.forEach((item, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const posX = marginX + col * (cardW + gapX);
        const posY = startY + row * (cardH + gapY);

        // Cut guide
        doc.setDrawColor(203, 213, 225);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(posX - 0.8, posY - 0.8, cardW + 1.6, cardH + 1.6);
        doc.setLineDashPattern([], 0);

        drawCardFront(doc, item.student, posX, posY, cardW, cardH, options, item.assets);
      });

      // Page B: Corresponding Back Cards (Mirror position for duplex printing)
      doc.addPage('a4', 'portrait');
      currentPage++;
      renderPageHeader(currentPage, totalPages);

      pageBatch.forEach((item, idx) => {
        const row = Math.floor(idx / 2);
        // Mirrored column for correct duplex flipping (col 0 becomes col 1, col 1 becomes col 0)
        const col = 1 - (idx % 2);
        const posX = marginX + col * (cardW + gapX);
        const posY = startY + row * (cardH + gapY);

        // Cut guide
        doc.setDrawColor(203, 213, 225);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(posX - 0.8, posY - 0.8, cardW + 1.6, cardH + 1.6);
        doc.setLineDashPattern([], 0);

        drawCardBack(doc, item.student, posX, posY, cardW, cardH, options, item.assets);
      });

      if (i + 4 < studentAssetsList.length) {
        doc.addPage('a4', 'portrait');
        currentPage++;
      }
    }
  } else {
    // Single Side Massal (8 cards per A4 page)
    const totalPages = Math.ceil(studentAssetsList.length / cardsPerPage);
    let currentPage = 1;

    for (let i = 0; i < studentAssetsList.length; i += cardsPerPage) {
      const pageBatch = studentAssetsList.slice(i, i + cardsPerPage);
      renderPageHeader(currentPage, totalPages);

      pageBatch.forEach((item, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const posX = marginX + col * (cardW + gapX);
        const posY = startY + row * (cardH + gapY);

        // Cut guide
        doc.setDrawColor(203, 213, 225);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(posX - 0.8, posY - 0.8, cardW + 1.6, cardH + 1.6);
        doc.setLineDashPattern([], 0);

        if (side === 'depan') {
          drawCardFront(doc, item.student, posX, posY, cardW, cardH, options, item.assets);
        } else {
          drawCardBack(doc, item.student, posX, posY, cardW, cardH, options, item.assets);
        }
      });

      if (i + cardsPerPage < studentAssetsList.length) {
        doc.addPage('a4', 'portrait');
        currentPage++;
      }
    }
  }

  doc.save(`Kartu_Pelajar_Lembar_A4_${students.length}_Siswa_${nowStr}.pdf`);
}
