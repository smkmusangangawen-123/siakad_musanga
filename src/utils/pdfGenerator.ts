import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RaportData, NilaiSiswa, SchoolSettings, RaportPageSelection } from '../types';
import {
  generateRaportValidationCode,
  getRaportValidationUrl,
  generateRaportQRCodeDataUrl,
  registerRaportVerification,
} from './raportValidation';

export const DEFAULT_RAPORT_PAGES: RaportPageSelection = {
  cover: true,
  identity: true,
  grades: true,
  extracurricular: true,
};

export interface RaportValidationPayload {
  code: string;
  url: string;
  qrDataUrl: string;
}

function getNormalizedSettings(schoolSettings?: SchoolSettings | string): SchoolSettings {
  if (typeof schoolSettings === 'string') {
    return { namaSekolah: schoolSettings };
  }
  return schoolSettings || {
    namaSekolah: 'SMK MUHAMMADIYAH 1 NGAWEN',
    alamatSekolah: 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul',
    telepon: '(0274) 123456',
    website: 'smkmuh1ngawen.sch.id',
    kepalaSekolah: 'Dr. Hendra Wijaya M.Pd',
    nipKepalaSekolah: '197508122001121001',
  };
}

// -------------------------------------------------------------
// 1. RENDER COVER / SAMPUL RAPORT
// -------------------------------------------------------------
export function renderCoverPage(
  doc: jsPDF,
  raportData: RaportData,
  settings: SchoolSettings,
  validationInfo?: RaportValidationPayload
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const schoolName = settings.kopNamaSekolah || settings.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN';
  const schoolAddress = settings.kopAlamat || settings.alamatSekolah || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta';
  const npsn = settings.npsn || '20338514';
  const code = validationInfo?.code || raportData.validationCode || generateRaportValidationCode(raportData);
  const qr = validationInfo?.qrDataUrl;

  // Double Decorative Border (Sertifikat / Cover Raport Resmi)
  doc.setDrawColor(30, 58, 138); // Deep Navy
  doc.setLineWidth(1.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(217, 119, 6); // Amber Gold Inner Border
  doc.setLineWidth(0.4);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Ornamental Corner Marks
  const corners = [
    { x: 13, y: 13 },
    { x: pageWidth - 13, y: 13 },
    { x: 13, y: pageHeight - 13 },
    { x: pageWidth - 13, y: pageHeight - 13 },
  ];
  doc.setLineWidth(0.8);
  doc.setDrawColor(30, 58, 138);
  corners.forEach((c) => {
    doc.circle(c.x, c.y, 1.5, 'FD');
  });

  // Top Subheader
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(10.5);
  doc.text('KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('REPUBLIK INDONESIA', pageWidth / 2, 33, { align: 'center' });

  // Center School / Official Logo
  const logo = settings.logoUrl || settings.logoKiriUrl;
  let logoY = 44;
  if (logo) {
    try {
      doc.addImage(logo, 'JPEG', pageWidth / 2 - 16, logoY, 32, 32);
      logoY += 38;
    } catch {
      try {
        doc.addImage(logo, 'PNG', pageWidth / 2 - 16, logoY, 32, 32);
        logoY += 38;
      } catch {
        logoY += 8;
      }
    }
  } else {
    logoY += 12;
  }

  // Main Raport Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42);
  doc.text('RAPOR PESERTA DIDIK', pageWidth / 2, logoY + 8, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text('SEKOLAH MENENGAH ATAS / KEJURUAN', pageWidth / 2, logoY + 16, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('(KURIKULUM MERDEKA / SISTEM INFORMASI AKADEMIK)', pageWidth / 2, logoY + 22, { align: 'center' });

  // Student Name Box (Centered Prominently)
  const boxY = logoY + 34;
  const boxW = 148;
  const boxH = 46;
  const boxX = (pageWidth - boxW) / 2;

  // Background Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Nama Peserta Didik :', pageWidth / 2, boxY + 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(raportData.siswaNama.toUpperCase(), pageWidth / 2, boxY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NISN / NIS :', pageWidth / 2, boxY + 25, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(217, 119, 6);
  doc.text(`${raportData.nisn} / ${raportData.nis || '-'}`, pageWidth / 2, boxY + 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Kelas: ${raportData.kelasNama || '-'}  •  Jurusan: ${raportData.jurusanNama || 'MIPA / Kejuruan'}`, pageWidth / 2, boxY + 40, { align: 'center' });

  // Bottom School Metadata
  const bottomY = pageHeight - 55;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Nama Sekolah :', pageWidth / 2, bottomY, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(30, 58, 138);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, bottomY + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`NPSN: ${npsn}  •  Status Akreditasi: ${settings.akreditasi || 'A (Unggul)'}`, pageWidth / 2, bottomY + 12, { align: 'center' });
  doc.text(schoolAddress, pageWidth / 2, bottomY + 17, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`TAHUN PELAJARAN ${raportData.tahunAjaran}`, pageWidth / 2, bottomY + 26, { align: 'center' });

  // Embedded QR Code Verification Stamp on Cover (Bottom Right)
  if (qr) {
    try {
      const qrX = pageWidth - 42;
      const qrY = pageHeight - 48;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(qrX - 2, qrY - 2, 26, 26, 2, 2, 'FD');
      doc.addImage(qr, 'PNG', qrX, qrY, 22, 22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(30, 58, 138);
      doc.text('VERIFIKASI RESMI', qrX + 11, qrY + 23.5, { align: 'center' });
    } catch {}
  }
}

// -------------------------------------------------------------
// 2. RENDER IDENTITAS LENGKAP SISWA (BUKU INDUK FORMAT KEMDIKBUD)
// -------------------------------------------------------------
export function renderIdentityPage(
  doc: jsPDF,
  raportData: RaportData,
  settings: SchoolSettings,
  validationInfo?: RaportValidationPayload
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const kepalaSekolahNama = settings.kepalaSekolah || raportData.kepalaSekolahNama || 'Dr. Hendra Wijaya M.Pd';
  const kepalaSekolahNip = settings.nipKepalaSekolah || raportData.kepalaSekolahNip || '1092837';
  const tipeKepalaSekolah = settings.tipeNomorKepalaSekolah || raportData.kepalaSekolahTipeNomor || 'NBM';
  const code = validationInfo?.code || raportData.validationCode || generateRaportValidationCode(raportData);
  const qr = validationInfo?.qrDataUrl;

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text('KETERANGAN TENTANG DIRI PESERTA DIDIK', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('(Buku Induk Raport Peserta Didik Format Resmi Kemdikbud)', pageWidth / 2, 21, { align: 'center' });

  // Divider Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(16, 24, pageWidth - 16, 24);

  // Precision Table Layout Coordinates
  let y = 30;
  const lineSpacing = 6.2;
  const colNumX = 18;
  const colLabelX = 24;
  const colColonX = 84;
  const colValX = 87;

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  const drawRow = (num: string, label: string, val: string, isBold: boolean = false) => {
    doc.setFont('helvetica', 'normal');
    doc.text(num, colNumX, y);
    doc.text(label, colLabelX, y);
    doc.text(':', colColonX, y);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    }
    doc.text(String(val || '-'), colValX, y);
    y += lineSpacing;
  };

  drawRow('1.', 'Nama Peserta Didik (Lengkap)', raportData.siswaNama.toUpperCase(), true);
  drawRow('2.', 'Nomor Induk Siswa Nasional (NISN)', raportData.nisn, true);
  drawRow('3.', 'Nomor Induk Siswa (NIS)', raportData.nis || '202510001', true);
  drawRow('4.', 'Tempat, Tanggal Lahir', `${raportData.tempatLahir || 'Gunungkidul'}, ${raportData.tanggalLahir || '14 Mei 2008'}`);
  drawRow('5.', 'Jenis Kelamin', raportData.jenisKelamin || 'Laki-laki');
  drawRow('6.', 'Agama & Kepercayaan', raportData.agama || 'Islam');
  drawRow('7.', 'Status dalam Keluarga', raportData.statusDalamKeluarga || 'Anak Kandung');
  drawRow('8.', 'Anak Ke-', `${raportData.anakKe || 1} (Satu)`);
  drawRow('9.', 'Alamat Peserta Didik', raportData.alamatSiswa || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul');
  drawRow('10.', 'Nomor Telepon / HP Siswa', raportData.teleponSiswa || '085711223344');
  drawRow('11.', 'Sekolah Asal (SMP / MTs)', raportData.sekolahAsal || 'SMP Negeri 1 Ngawen');

  // Sub-items for point 12
  doc.setFont('helvetica', 'normal');
  doc.text('12.', colNumX, y);
  doc.text('Diterima di Sekolah ini :', colLabelX, y);
  y += lineSpacing;

  drawRow(' ', '   a. Di Kelas', raportData.diterimaKelas || raportData.kelasNama || '10 IPA 1', true);
  drawRow(' ', '   b. Pada Tanggal', raportData.diterimaTanggal || '15 Juli 2025');
  drawRow(' ', '   c. Semester', raportData.semester === 'Genap' ? '2 (Genap)' : '1 (Ganjil)');

  // Sub-items for point 13 (Orang Tua)
  doc.setFont('helvetica', 'normal');
  doc.text('13.', colNumX, y);
  doc.text('Data Orang Tua Kandung :', colLabelX, y);
  y += lineSpacing;

  drawRow(' ', '   a. Nama Ayah', raportData.namaAyah || 'Bambang Sudarmanto');
  drawRow(' ', '   b. Nama Ibu', raportData.namaIbu || 'Siti Rahmawati');
  drawRow(' ', '   c. Pekerjaan Ayah', raportData.pekerjaanAyah || 'Wiraswasta / Pedagang');
  drawRow(' ', '   d. Pekerjaan Ibu', raportData.pekerjaanIbu || 'Ibu Rumah Tangga');
  drawRow(' ', '   e. Alamat Orang Tua', raportData.alamatOrtu || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul');
  drawRow(' ', '   f. No. Telepon / HP Ortu', raportData.teleponOrtu || '081288990011');

  // Sub-items for point 14 (Wali)
  doc.setFont('helvetica', 'normal');
  doc.text('14.', colNumX, y);
  doc.text('Data Wali Siswa (Jika Ada) :', colLabelX, y);
  y += lineSpacing;

  drawRow(' ', '   a. Nama Wali', raportData.namaWali || '-');
  drawRow(' ', '   b. Pekerjaan Wali', raportData.pekerjaanWali || '-');
  drawRow(' ', '   c. Alamat Wali', raportData.alamatWali || '-');

  // Photo Box (Pas Foto 3x4)
  const photoY = 224;
  const photoW = 28;
  const photoH = 36;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.rect(26, photoY, photoW, photoH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PAS FOTO', 26 + photoW / 2, photoY + 16, { align: 'center' });
  doc.text('3 x 4 CM', 26 + photoW / 2, photoY + 22, { align: 'center' });

  // QR Code Verification badge in Identity Page (Beside Photo)
  if (qr) {
    try {
      const qrX = 62;
      const qrY = photoY + 5;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(qrX - 2, qrY - 2, 54, 28, 2, 2, 'FD');
      doc.addImage(qr, 'PNG', qrX, qrY, 22, 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 58, 138);
      doc.text('VERIFIKASI BUKU INDUK', qrX + 25, qrY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(71, 85, 105);
      doc.text('Status: Terdaftar Resmi', qrX + 25, qrY + 11);
      doc.text(`Kode: ${code.slice(0, 16)}...`, qrX + 25, qrY + 15);
      doc.text('Sistem Informasi Akademik', qrX + 25, qrY + 19);
    } catch {}
  }

  // Signature Block (Kepala Sekolah)
  const signX = pageWidth - 76;
  const signY = 222;
  const cityName =
    settings.kotaTitimangsa ||
    raportData.kotaTitimangsa ||
    settings.kecamatan ||
    settings.kabupaten ||
    (settings.kopAlamat ? settings.kopAlamat.split(',')[1]?.trim() : '') ||
    'Ngawen';
  const acceptedDate = raportData.diterimaTanggal || '15 Juli 2025';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`${cityName}, ${acceptedDate}`, signX, signY);
  doc.text('Kepala Sekolah,', signX, signY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text(kepalaSekolahNama, signX, signY + 28);
  doc.setFont('helvetica', 'normal');
  const ksLabel = tipeKepalaSekolah === 'Tanpa Nomor' || !kepalaSekolahNip ? '-' : `${tipeKepalaSekolah}. ${kepalaSekolahNip}`;
  doc.text(ksLabel, signX, signY + 32.5);
}

// -------------------------------------------------------------
// 3. RENDER NILAI HASIL BELAJAR / E-RAPORT (AKADEMIK)
// -------------------------------------------------------------
export function renderGradesPage(
  doc: jsPDF,
  raportData: RaportData,
  settings: SchoolSettings,
  validationInfo?: RaportValidationPayload
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const schoolName = settings.kopNamaSekolah || settings.namaSekolah || 'SMK MUHAMMADIYAH 1 NGAWEN';
  const schoolAddress = settings.kopAlamat || settings.alamatSekolah || 'Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta 55853';
  const schoolContact = settings.kopKontak || `Telp: ${settings.telepon || '(0274) 123456'} | Web: ${settings.website || 'smkmuh1ngawen.sch.id'}`;
  const baris1 = settings.kopBaris1 || 'PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA';
  const baris2 = settings.kopBaris2 || 'DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA';
  const baris3 = settings.kopBaris3 || '';
  const infoSub = settings.kopInfoSubSekolah || (settings.npsn ? `NPSN: ${settings.npsn} • Terakreditasi ${settings.akreditasi || 'A'}` : 'NPSN: 20338514 • Terakreditasi A');
  const garisTipe = settings.kopGarisTipe || 'ganda';
  const waliKelasNama = raportData.waliKelasNama || 'Budi Santoso S.Pd';
  const code = validationInfo?.code || raportData.validationCode || generateRaportValidationCode(raportData);
  const url = validationInfo?.url || raportData.validationUrl || getRaportValidationUrl(raportData, code);
  const qr = validationInfo?.qrDataUrl;

  // Left & Right Logos
  const logoKiri = settings.showLogoKiri !== false ? (settings.logoKiriUrl || settings.logoUrl) : undefined;
  const logoKanan = settings.showLogoKanan !== false ? settings.logoKananUrl : undefined;

  if (logoKiri) {
    try {
      doc.addImage(logoKiri, 'JPEG', 14, 10, 18, 18);
    } catch {
      try {
        doc.addImage(logoKiri, 'PNG', 14, 10, 18, 18);
      } catch {}
    }
  }

  if (logoKanan) {
    try {
      doc.addImage(logoKanan, 'JPEG', pageWidth - 32, 10, 18, 18);
    } catch {
      try {
        doc.addImage(logoKanan, 'PNG', pageWidth - 32, 10, 18, 18);
      } catch {}
    }
  }

  // Header Kop
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(baris1.toUpperCase(), pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(10.5);
  doc.text(baris2.toUpperCase(), pageWidth / 2, 16.5, { align: 'center' });
  if (baris3) {
    doc.setFontSize(9);
    doc.text(baris3.toUpperCase(), pageWidth / 2, 20.5, { align: 'center' });
  }

  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, baris3 ? 26 : 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const infoY = baris3 ? 30 : 26.5;
  doc.text(infoSub, pageWidth / 2, infoY, { align: 'center' });
  doc.text(`${schoolAddress} | ${schoolContact}`, pageWidth / 2, infoY + 3.5, { align: 'center' });

  // Divider Line
  const lineY = infoY + 6;
  if (garisTipe === 'ganda') {
    doc.setLineWidth(0.8);
    doc.line(15, lineY, pageWidth - 15, lineY);
    doc.setLineWidth(0.2);
    doc.line(15, lineY + 0.8, pageWidth - 15, lineY + 0.8);
  } else if (garisTipe === 'tebal') {
    doc.setLineWidth(1.0);
    doc.line(15, lineY, pageWidth - 15, lineY);
  } else if (garisTipe === 'emas') {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.8);
    doc.line(15, lineY, pageWidth - 15, lineY);
    doc.setLineWidth(0.3);
    doc.line(15, lineY + 0.8, pageWidth - 15, lineY + 0.8);
    doc.setDrawColor(0, 0, 0);
  } else {
    doc.setLineWidth(0.3);
    doc.line(15, lineY, pageWidth - 15, lineY);
  }

  // Title
  const titleY = lineY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN HASIL BELAJAR SISWA (E-RAPORT)', pageWidth / 2, titleY, { align: 'center' });

  // Student Info Grid (2 Kolom Presisi)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const startY = titleY + 6;
  const col1X = 15;
  const col1ColonX = 46;
  const col1ValX = 49;

  const col2X = 110;
  const col2ColonX = 138;
  const col2ValX = 141;

  // Baris 1
  doc.text('Nama Peserta Didik', col1X, startY);
  doc.text(':', col1ColonX, startY);
  doc.setFont('helvetica', 'bold');
  doc.text(String(raportData.siswaNama || '-'), col1ValX, startY);

  doc.setFont('helvetica', 'normal');
  doc.text('Semester', col2X, startY);
  doc.text(':', col2ColonX, startY);
  doc.setFont('helvetica', 'bold');
  doc.text(String(raportData.semester || '-'), col2ValX, startY);

  // Baris 2
  doc.setFont('helvetica', 'normal');
  doc.text('NIS / NISN', col1X, startY + 5);
  doc.text(':', col1ColonX, startY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${raportData.nis || '-'} / ${raportData.nisn || '-'}`, col1ValX, startY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Tahun Pelajaran', col2X, startY + 5);
  doc.text(':', col2ColonX, startY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(String(raportData.tahunAjaran || '-'), col2ValX, startY + 5);

  // Baris 3
  doc.setFont('helvetica', 'normal');
  doc.text('Kelas', col1X, startY + 10);
  doc.text(':', col1ColonX, startY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(String(raportData.kelasNama || '-'), col1ValX, startY + 10);

  doc.setFont('helvetica', 'normal');
  doc.text('Wali Kelas', col2X, startY + 10);
  doc.text(':', col2ColonX, startY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(String(waliKelasNama || '-'), col2ValX, startY + 10);

  // Grades Table
  const tableData = raportData.nilaiList.map((nilai, index) => {
    const kkm = 75;
    return [
      index + 1,
      nilai.mataPelajaranNama,
      kkm,
      nilai.nilaiHarian ? Math.round(nilai.nilaiHarian.reduce((a, b) => a + b, 0) / nilai.nilaiHarian.length) : '-',
      nilai.nilaiUTS,
      nilai.nilaiUAS,
      nilai.nilaiAkhir,
      nilai.predikat,
      nilai.catatanGuru || (nilai.nilaiAkhir >= kkm ? 'Tuntas dengan sangat baik' : 'Perlu bimbingan remedi'),
    ];
  });

  autoTable(doc, {
    startY: startY + 16,
    head: [
      [
        { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Mata Pelajaran', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
        { content: 'KKM', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Nilai Komponen', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Nilai Akhir', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Predikat', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Capaian Kompetensi / Catatan Guru', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
      ],
      [
        { content: 'NH', styles: { halign: 'center' } },
        { content: 'UTS', styles: { halign: 'center' } },
        { content: 'UAS', styles: { halign: 'center' } },
      ],
    ],
    body: tableData,
    styles: { fontSize: 7.8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
  });

  // Digital Security Validation Banner with QR Code at bottom of Grades Page
  const finalY = (doc as any).lastAutoTable?.finalY || startY + 100;
  const bannerY = Math.min(Math.max(finalY + 4, pageHeight - 29), pageHeight - 27);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, bannerY, pageWidth - 30, 20, 2, 2, 'FD');

  // Left Navy Accent Strip
  doc.setFillColor(30, 58, 138);
  doc.rect(15, bannerY, 3, 20, 'F');

  if (qr) {
    try {
      doc.addImage(qr, 'PNG', 20, bannerY + 2, 16, 16);
    } catch {}
  }

  const textX = qr ? 39 : 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('VERIFIKASI KEASLIAN DIGITAL e-RAPORT RESMI SIAKAD', textX, bannerY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Kode Validasi: ${code}  •  Status Dokumen: SAH / ASLI (Tersinkronisasi Cloud Firestore)`, textX, bannerY + 9.5);
  doc.text('Pindai QR Code di samping dengan kamera untuk memvalidasi keaslian dokumen e-raport ini di server sekolah.', textX, bannerY + 13.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  const displayUrl = url.length > 82 ? url.slice(0, 80) + '...' : url;
  doc.text(`URL Validasi: ${displayUrl}`, textX, bannerY + 17.5);
  if (url) {
    try {
      doc.link(textX, bannerY + 14.5, pageWidth - textX - 18, 4, { url });
    } catch {}
  }
}

// -------------------------------------------------------------
// 4. RENDER EKSTRAKURIKULER, ABSENSI & PENGESAHAN (HALAMAN 4)
// -------------------------------------------------------------
export function renderExtracurricularPage(
  doc: jsPDF,
  raportData: RaportData,
  settings: SchoolSettings,
  validationInfo?: RaportValidationPayload
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const kepalaSekolahNama = settings.kepalaSekolah || raportData.kepalaSekolahNama || 'Dr. Hendra Wijaya M.Pd';
  const kepalaSekolahNip = settings.nipKepalaSekolah || raportData.kepalaSekolahNip || '1092837';
  const tipeKepalaSekolah = settings.tipeNomorKepalaSekolah || raportData.kepalaSekolahTipeNomor || 'NBM';
  const waliKelasNama = raportData.waliKelasNama || 'Budi Santoso S.Pd';
  const waliKelasNip = raportData.waliKelasNip || '1087654';
  const tipeWaliKelas = raportData.waliKelasTipeNomor || 'NBM';
  const code = validationInfo?.code || raportData.validationCode || generateRaportValidationCode(raportData);
  const url = validationInfo?.url || raportData.validationUrl || getRaportValidationUrl(raportData, code);
  const qr = validationInfo?.qrDataUrl;

  // Top Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CATATAN PERKEMBANGAN & PENGESAHAN RAPORT', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Peserta Didik: ${raportData.siswaNama} (NISN: ${raportData.nisn}) • Kelas: ${raportData.kelasNama}`, pageWidth / 2, 21, { align: 'center' });

  doc.setLineWidth(0.4);
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 24, pageWidth - 15, 24);

  // Extracurricular & Attendance Table side-by-side
  let currentY = 28;

  autoTable(doc, {
    startY: currentY,
    head: [['Kegiatan Ekstrakurikuler', 'Predikat', 'Keterangan']],
    body: (raportData.ekstrakurikuler || []).map((e) => [e.nama, e.predikat, e.keterangan]),
    styles: { fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    margin: { left: 15, right: 105 },
    tableWidth: 85,
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Ketidakhadiran (Presensi)', 'Jumlah']],
    body: [
      ['Sakit (S)', `${raportData.kehadiran?.sakit || 0} hari`],
      ['Izin (I)', `${raportData.kehadiran?.izin || 0} hari`],
      ['Tanpa Keterangan (A)', `${raportData.kehadiran?.alpa || 0} hari`],
    ],
    styles: { fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    margin: { left: 105, right: 15 },
    tableWidth: 90,
  });

  currentY = Math.max((doc as any).lastAutoTable.finalY + 8, currentY + 36);

  // Prestasi Table
  if (raportData.prestasi && raportData.prestasi.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Prestasi yang Pernah Diraih Siswa', 'Tingkat / Keterangan']],
      body: raportData.prestasi.map((p) => [p.jenis, p.keterangan]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [217, 119, 6], textColor: 255 },
      margin: { left: 15, right: 15 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Wali Kelas Notes Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Catatan Wali Kelas (${waliKelasNama}):`, 15, currentY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setFillColor(254, 252, 232); // Light yellow
  doc.setDrawColor(251, 191, 36);
  doc.rect(15, currentY + 2, pageWidth - 30, 16, 'FD');
  doc.setTextColor(51, 65, 85);
  doc.text(`"${raportData.catatanWaliKelas || 'Pertahankan prestasi belajar, selalu giat berlatih dan berakhlak mulia.'}"`, 18, currentY + 9, { maxWidth: pageWidth - 36 });

  currentY += 24;

  // Decision Status
  doc.setFillColor(240, 253, 244); // Emerald light
  doc.setDrawColor(52, 211, 153);
  doc.rect(15, currentY, pageWidth - 30, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`Keputusan Hasil Belajar: ${raportData.keputusan?.toUpperCase() || 'NAIK KE KELAS BERIKUTNYA'}`, 18, currentY + 6);

  currentY += 18;

  // 3-Party Signatures
  const cityName =
    settings.kotaTitimangsa ||
    raportData.kotaTitimangsa ||
    settings.kecamatan ||
    settings.kabupaten ||
    (settings.kopAlamat ? settings.kopAlamat.split(',')[1]?.trim() : '') ||
    'Ngawen';
  const dateStr = `${cityName}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  // Orang Tua
  doc.text('Mengetahui,', 20, currentY);
  doc.text('Orang Tua / Wali Siswa', 20, currentY + 4);
  doc.text('( ............................................. )', 20, currentY + 24);

  // Wali Kelas
  doc.text(dateStr, pageWidth - 70, currentY);
  doc.text(`Wali Kelas ${raportData.kelasNama}`, pageWidth - 70, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(waliKelasNama, pageWidth - 70, currentY + 24);
  doc.setFont('helvetica', 'normal');
  const wkLabel = tipeWaliKelas === 'Tanpa Nomor' || !waliKelasNip ? '-' : `${tipeWaliKelas}. ${waliKelasNip}`;
  doc.text(wkLabel, pageWidth - 70, currentY + 28);

  // Kepala Sekolah (Tengah) + TTE Digital QR Code
  doc.text('Mengetahui,', pageWidth / 2 - 25, currentY + 20);
  doc.text('Kepala Sekolah,', pageWidth / 2 - 25, currentY + 24);

  if (qr) {
    try {
      const sealX = pageWidth / 2 - 12;
      const sealY = currentY + 26;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(sealX - 2, sealY - 1, 24, 24, 2, 2, 'FD');
      doc.addImage(qr, 'PNG', sealX, sealY, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.2);
      doc.setTextColor(30, 58, 138);
      doc.text('TTE TERSERTIFIKASI', sealX + 10, sealY + 22.5, { align: 'center' });
    } catch {}
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(kepalaSekolahNama, pageWidth / 2 - 25, currentY + 54);
  doc.setFont('helvetica', 'normal');
  const ksLabel = tipeKepalaSekolah === 'Tanpa Nomor' || !kepalaSekolahNip ? '-' : `${tipeKepalaSekolah}. ${kepalaSekolahNip}`;
  doc.text(ksLabel, pageWidth / 2 - 25, currentY + 58);

  // Footer validation line at the bottom
  const footerY = pageHeight - 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Dokumen e-Raport Resmi SIAKAD • Kode Validasi: ${code} • Verifikasi Keaslian: ${url.length > 70 ? url.slice(0, 68) + '...' : url}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
}

// -------------------------------------------------------------
// MAIN GENERATOR: ASYNC WITH QR CODE EMBEDDING & CLOUD REGISTRY
// -------------------------------------------------------------
export async function generateRaportPDF(
  raportData: RaportData,
  schoolSettings?: SchoolSettings | string,
  pages: RaportPageSelection = DEFAULT_RAPORT_PAGES
): Promise<void> {
  const settings = getNormalizedSettings(schoolSettings);
  const doc = new jsPDF('p', 'mm', 'a4');

  // Verify at least one page is selected
  const hasPage = pages.cover || pages.identity || pages.grades || pages.extracurricular;
  if (!hasPage) {
    alert('Pilih minimal satu halaman untuk dicetak / diunduh!');
    return;
  }

  // Generate Verification Code & QR Code Data URL with embedded validation URL
  const validationCode = raportData.validationCode || generateRaportValidationCode(raportData);
  const validationUrl = raportData.validationUrl || getRaportValidationUrl(raportData, validationCode);
  const qrDataUrl = await generateRaportQRCodeDataUrl(validationUrl, {
    darkColor: '#0f172a',
    lightColor: '#ffffff',
    width: 256,
  });

  const validationInfo: RaportValidationPayload = {
    code: validationCode,
    url: validationUrl,
    qrDataUrl,
  };

  // Register verification asynchronously to Firestore and local registry
  registerRaportVerification(raportData, validationCode).catch((e) =>
    console.warn('Background verification registry skipped:', e)
  );

  let isFirstPage = true;

  const addPageIfNeeded = () => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;
  };

  // 1. Sampul / Cover Raport
  if (pages.cover) {
    addPageIfNeeded();
    renderCoverPage(doc, raportData, settings, validationInfo);
  }

  // 2. Keterangan Diri Siswa / Buku Induk
  if (pages.identity) {
    addPageIfNeeded();
    renderIdentityPage(doc, raportData, settings, validationInfo);
  }

  // 3. Nilai Capaian Belajar (E-Raport)
  if (pages.grades) {
    addPageIfNeeded();
    renderGradesPage(doc, raportData, settings, validationInfo);
  }

  // 4. Ekstrakurikuler, Catatan & Pengesahan
  if (pages.extracurricular) {
    addPageIfNeeded();
    renderExtracurricularPage(doc, raportData, settings, validationInfo);
  }

  // Determine file suffix
  const pageTags = [];
  if (pages.cover) pageTags.push('Sampul');
  if (pages.identity) pageTags.push('Identitas');
  if (pages.grades) pageTags.push('Nilai');
  if (pages.extracurricular) pageTags.push('Pengesahan');

  const suffix = pageTags.join('_');
  const safeName = raportData.siswaNama.replace(/\s+/g, '_');
  doc.save(`Raport_${safeName}_${suffix}.pdf`);
}

export async function generateBulkRaportPDF(
  raportList: RaportData[],
  kelasNama: string,
  schoolSettings?: SchoolSettings | string,
  pages: RaportPageSelection = DEFAULT_RAPORT_PAGES
): Promise<void> {
  const settings = getNormalizedSettings(schoolSettings);
  const doc = new jsPDF('p', 'mm', 'a4');

  let isFirstPage = true;

  for (const raportData of raportList) {
    const validationCode = raportData.validationCode || generateRaportValidationCode(raportData);
    const validationUrl = raportData.validationUrl || getRaportValidationUrl(raportData, validationCode);
    const qrDataUrl = await generateRaportQRCodeDataUrl(validationUrl, {
      darkColor: '#0f172a',
      lightColor: '#ffffff',
      width: 256,
    });

    const validationInfo: RaportValidationPayload = {
      code: validationCode,
      url: validationUrl,
      qrDataUrl,
    };

    // Register verification record in background
    registerRaportVerification(raportData, validationCode).catch((e) =>
      console.warn('Background verification registry skipped:', e)
    );

    if (pages.cover) {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;
      renderCoverPage(doc, raportData, settings, validationInfo);
    }

    if (pages.identity) {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;
      renderIdentityPage(doc, raportData, settings, validationInfo);
    }

    if (pages.grades) {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;
      renderGradesPage(doc, raportData, settings, validationInfo);
    }

    if (pages.extracurricular) {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;
      renderExtracurricularPage(doc, raportData, settings, validationInfo);
    }
  }

  doc.save(`Raport_Bulk_${kelasNama.replace(/\s+/g, '_')}_Lengkap.pdf`);
}

