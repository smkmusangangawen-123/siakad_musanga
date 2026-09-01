export type UserRole = 'admin' | 'guru' | 'siswa' | 'orangtua';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  username?: string;
  statusAkun?: 'Aktif' | 'Nonaktif';
  role: UserRole;
  avatar: string;
  nip?: string; // For teachers and staff
  nisn?: string; // For students
  phone?: string;
  kelasId?: string; // For students or wali kelas
  kelasNama?: string;
  jurusanId?: string;
  jurusanNama?: string;
  childStudentId?: string; // For parents
  childName?: string; // For parents display
  subject?: string; // For subject teachers
  isWaliKelas?: boolean;
  jabatan?: string; // For teachers & staff/karyawan (e.g. Guru Matematika, Staf TU, Kepala Lab)
  kategoriPegawai?: 'Guru' | 'Staf TU' | 'Pustakawan' | 'Laboran' | 'Keamanan' | 'Kebersihan' | 'Lainnya';
  tipeIdentitasPegawai?: 'NIP' | 'NBM' | 'NUPTK' | 'NIY' | 'NIGB' | 'NRG' | 'Tanpa Nomor' | string;
  nis?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  agama?: string;
  statusDalamKeluarga?: string;
  anakKe?: number;
  alamatSiswa?: string;
  teleponSiswa?: string;
  sekolahAsal?: string;
  diterimaKelas?: string;
  diterimaTanggal?: string;
  namaAyah?: string;
  namaIbu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  alamatOrtu?: string;
  teleponOrtu?: string;
  namaWali?: string;
  pekerjaanWali?: string;
  alamatWali?: string;
}

export interface Jurusan {
  id: string;
  kode: string; // e.g. "TKJ", "RPL", "AKL", "IPA", "IPS"
  nama: string; // e.g. "Teknik Komputer dan Jaringan"
  kepalaJurusan?: string;
  deskripsi?: string;
  kuotaSiswa?: number;
}

export interface Kelas {
  id: string;
  nama: string; // e.g. "10 IPA 1", "10 TKJ 1"
  tingkat: number; // 10, 11, 12
  jurusanId?: string;
  jurusanNama?: string;
  waliKelasId: string;
  waliKelasNama: string;
  jumlahSiswa: number;
  tahunAjaran: string;
  ruangan?: string;
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kKM: number; // Kriteria Ketuntasan Minimal (e.g. 75)
  guruId?: string;
  guruNama?: string;
  kelompok?: 'Kelompok A (Umum)' | 'Kelompok B (Umum)' | 'Kelompok C (Kejuruan/Peminatan)' | 'Muatan Lokal' | string;
  tingkat?: number | string; // 10, 11, 12 atau 'Semua'
  jurusanNama?: string;
  deskripsi?: string;
}

export interface NilaiSiswa {
  id: string;
  siswaId: string;
  siswaNama: string;
  nisn: string;
  kelasId: string;
  mataPelajaranId: string;
  mataPelajaranNama: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  nilaiHarian: number[]; // e.g. [85, 90, 88]
  nilaiUTS: number;
  nilaiUAS: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatanGuru?: string;
  updatedAt: string;
}

export interface AbsensiRecord {
  id: string;
  siswaId: string;
  siswaNama: string;
  nisn: string;
  kelasId: string;
  kelasNama?: string;
  jurusanNama?: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm:ss
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  tipeAbsensi?: 'Harian' | 'Mapel';
  mataPelajaranId?: string;
  mataPelajaranNama?: string;
  guruId?: string;
  guruNama?: string;
  pertemuanKe?: number;
  materiMapel?: string;
  latitude?: number;
  longitude?: number;
  jarakKeSekolahMeter?: number;
  lokasiNama?: string;
  metodePresensi?: string;
  catatan?: string;
  fotoUrl?: string;
}

export interface AbsensiPegawaiRecord {
  id: string;
  pegawaiId: string;
  pegawaiNama: string;
  nipOrNik: string;
  jabatan: string; // e.g. "Guru Matematika / Wali Kelas 10-A", "Staf Tata Usaha", "Kepala Perpustakaan", "Laboran Komputer"
  kategori: 'Guru' | 'Staf TU' | 'Pustakawan' | 'Laboran' | 'Keamanan' | 'Kebersihan' | 'Lainnya';
  tanggal: string; // YYYY-MM-DD
  waktuMasuk: string; // HH:mm:ss
  waktuPulang?: string; // HH:mm:ss
  status: 'Hadir' | 'Dinas Luar' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpa';
  latitude?: number;
  longitude?: number;
  jarakMeter?: number;
  catatan?: string;
  fotoMasukUrl?: string;
  fotoPulangUrl?: string;
  statusVerifikasi: 'Terverifikasi (GPS Valid)' | 'Menunggu Persetujuan' | 'Ditolak';
}

export interface BukuDigital {
  id: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahun: number;
  kategori: string;
  isbn: string;
  deskripsi: string;
  coverUrl: string;
  pdfUrl: string;
  stokTotal: number;
  stokTersedia: number;
  dipinjamOleh?: string[]; // student ids
}

export interface PeminjamanBuku {
  id: string;
  bukuId: string;
  bukuJudul: string;
  siswaId: string;
  siswaNama: string;
  tanggalPinjam: string;
  tanggalJatuhTempo: string;
  tanggalKembali?: string;
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
}

export interface MateriPelajaran {
  id: string;
  judul: string;
  deskripsi: string;
  mataPelajaranId: string;
  mataPelajaranNama: string;
  guruId: string;
  guruNama: string;
  kelasId: string;
  kelasNama?: string;
  tipeFile: 'pdf' | 'video' | 'doc' | 'link';
  fileUrl: string;
  tanggalUpload: string;
  fileName?: string;
  fileSize?: string;
}

export interface TugasPelajaran {
  id: string;
  judul: string;
  deskripsi: string;
  mataPelajaranId: string;
  mataPelajaranNama: string;
  guruId: string;
  guruNama: string;
  kelasId: string;
  kelasNama?: string;
  deadline: string;
  poinMaksimal: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  pengumpulanCount: number;
}

export interface PengumpulanTugas {
  id: string;
  tugasId: string;
  siswaId: string;
  siswaNama: string;
  tanggalKumpul: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  catatanSiswa?: string;
  nilai?: number;
  catatanGuru?: string;
  status: 'Belum Dinilai' | 'Sudah Dinilai' | 'Terlambat';
}

export interface ForumDiskusi {
  id: string;
  judul: string;
  deskripsi: string;
  mataPelajaranNama: string;
  guruNama: string;
  penulisNama: string;
  penulisRole: UserRole;
  penulisAvatar: string;
  tanggal: string;
  sukaCount: number;
  komentarList: KomentarForum[];
}

export interface KomentarForum {
  id: string;
  penulisNama: string;
  penulisRole: UserRole;
  penulisAvatar: string;
  isiText: string;
  tanggal: string;
}

export interface KalenderEvent {
  id: string;
  judul: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kategori: 'Ujian' | 'Libur' | 'Kegiatan' | 'Raport';
  deskripsi: string;
  kelasTarget?: string;
}

export interface JadwalPelajaran {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  jam: string; // e.g., "07:30 - 09:00"
  mataPelajaranNama: string;
  guruNama: string;
  ruang: string;
  kelasId: string;
}

export interface NotificationLog {
  id: string;
  channel: 'WhatsApp' | 'Email';
  penerimaNama: string;
  penerimaKontak: string; // Phone or Email
  siswaNama: string;
  pesan: string;
  waktu: string;
  status: 'Terkirim' | 'Gagal';
  tipe: 'Nilai' | 'Absensi' | 'Pengumuman' | 'Tugas';
}

export interface RaportPageSelection {
  cover: boolean; // Halaman 1: Sampul / Cover Raport
  identity: boolean; // Halaman 2: Keterangan Tentang Diri Peserta Didik (Identitas Lengkap Siswa / Buku Induk)
  grades: boolean; // Halaman 3: Laporan Hasil Capaian Belajar / Nilai Akademik
  extracurricular: boolean; // Halaman 4: Ekstrakurikuler, Absensi, Catatan Karakter & Pengesahan
}

export interface RaportData {
  siswaId: string;
  siswaNama: string;
  nisn: string;
  nis: string;
  kelasNama: string;
  jurusanNama?: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  waliKelasNama: string;
  waliKelasNip?: string;
  waliKelasTipeNomor?: 'NIP' | 'NBM' | 'NUPTK' | 'NIY' | 'NIGB' | 'NRG' | 'Tanpa Nomor' | string;
  kepalaSekolahNama: string;
  kepalaSekolahNip?: string;
  kepalaSekolahTipeNomor?: 'NIP' | 'NBM' | 'NUPTK' | 'NIY' | 'NIGB' | 'NRG' | 'Tanpa Nomor' | string;
  kotaTitimangsa?: string;
  nilaiList: NilaiSiswa[];
  ekstrakurikuler: { nama: string; predikat: string; keterangan: string }[];
  prestasi: { jenis: string; keterangan: string }[];
  kehadiran: { sakit: number; izin: number; alpa: number };
  catatanWaliKelas: string;
  keputusan: 'Naik ke kelas XI' | 'Tinggal di kelas X' | 'Lulus' | 'Dalam Proses';
  
  // Biodata Lengkap Siswa untuk Buku Induk / Halaman Identitas
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  agama?: string;
  statusDalamKeluarga?: string;
  anakKe?: number;
  alamatSiswa?: string;
  teleponSiswa?: string;
  sekolahAsal?: string;
  diterimaKelas?: string;
  diterimaTanggal?: string;
  namaAyah?: string;
  namaIbu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  alamatOrtu?: string;
  teleponOrtu?: string;
  namaWali?: string;
  pekerjaanWali?: string;
  alamatWali?: string;
  // Validation and Authenticity Metadata
  validationCode?: string;
  validationUrl?: string;
  generatedAt?: string;
}

export interface RaportVerificationRecord {
  validationCode: string;
  siswaId: string;
  siswaNama: string;
  nisn: string;
  nis: string;
  kelasNama: string;
  semester: string;
  tahunAjaran: string;
  nilaiRataRata: number;
  jumlahMapel: number;
  keputusan: string;
  kepalaSekolahNama: string;
  waliKelasNama: string;
  kotaTitimangsa: string;
  statusKeaslian: 'VALID_AUTHENTIC' | 'DATA_MISMATCH' | 'NOT_FOUND';
  generatedAt: string;
  hashSignature: string;
}

export interface RolePermissionSetting {
  id: string;
  featureName: string;
  category: string;
  description: string;
  admin: boolean;
  guru: boolean;
  siswa: boolean;
  orangtua: boolean;
}

export interface DatabaseBackupLog {
  id: string;
  timestamp: string;
  ukuranFile: string;
  tipe: 'Otomatis (Cron Nightly)' | 'Manual Admin';
  status: 'Berhasil' | 'Gagal';
  databaseName: string;
  fileName: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  logoUrl?: string; // Base64 data URL or external URL
  titleLogoUrl?: string; // Specific logo for website title/header if separated
  websiteTitle?: string; // Website page title (e.g. SIAKAD SMA Negeri 1)
  websiteSubtitle?: string; // Website slogan / subtitle
  alamatSekolah?: string;
  telepon?: string;
  emailSekolah?: string;
  akreditasi?: string;
  npsn?: string;
  website?: string;
  kepalaSekolah?: string;
  nipKepalaSekolah?: string;
  tipeNomorKepalaSekolah?: 'NIP' | 'NBM' | 'NUPTK' | 'NIY' | 'NIGB' | 'NRG' | 'Tanpa Nomor' | string;
  kotaTitimangsa?: string; // Titimangsa kota/kecamatan pada raport & surat (e.g. "Ngawen", "Gunungkidul", "Yogyakarta")
  kecamatan?: string;
  kabupaten?: string;

  // Background Customization (Color / Image with Transparency)
  bgType?: 'solid' | 'gradient' | 'image';
  bgColor?: string; // Hex color (e.g., #f8fafc)
  bgGradient?: string; // CSS linear gradient
  bgImageUrl?: string; // Custom wallpaper/photo URL or Base64
  bgImageOpacity?: number; // 0 to 100%
  bgImageBlur?: number; // 0 to 20px
  bgOverlayColor?: string; // Hex overlay color (e.g. #ffffff or #0f172a)
  bgOverlayOpacity?: number; // 0 to 100%
  bgAttachment?: 'fixed' | 'scroll';
  bgSize?: 'cover' | 'contain' | 'auto';

  // Kop Raport & Multi-Logo Settings (Khusus Admin)
  logoKiriUrl?: string; // Left Logo (e.g., Logo Pemda / Kemdikbud / Yayasan)
  logoKananUrl?: string; // Right Logo (e.g., Logo Sekolah / SMK / Madrasah)
  showLogoKiri?: boolean;
  showLogoKanan?: boolean;
  logoKiriSize?: number; // In px (e.g. 50 to 90)
  logoKananSize?: number; // In px (e.g. 50 to 90)
  kopBaris1?: string; // e.g. "PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA"
  kopBaris2?: string; // e.g. "DINAS PENDIDIKAN, PEMUDA DAN OLAHRAGA"
  kopBaris3?: string; // e.g. "BALAI PENDIDIKAN MENENGAH KABUPATEN GUNUNGKIDUL"
  kopNamaSekolah?: string; // e.g. "SMK MUHAMMADIYAH 1 NGAWEN"
  kopInfoSubSekolah?: string; // e.g. "NPSN: 20338514 • NSS: 402040301001 • Terakreditasi A"
  kopAlamat?: string; // e.g. "Jl. Raya Ngawen KM. 1, Ngawen, Gunungkidul, D.I. Yogyakarta 55853"
  kopKontak?: string; // e.g. "Telp: (0274) 123456 | Email: smkmusangangawen@gmail.com | Web: smkmuh1ngawen.sch.id"
  kopGarisTipe?: 'ganda' | 'tebal' | 'tipis' | 'emas' | 'none';
  kopWarnaTeksSekolah?: string; // e.g. '#1e3a8a', '#0f172a', '#065f46'
  kopLayout?: 'simetris' | 'logo-kiri-saja' | 'logo-kanan-saja' | 'tanpa-logo';
  kopFontFamily?: 'helvetica' | 'times' | 'arial';
}
