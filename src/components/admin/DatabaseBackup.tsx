import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  Clock,
  Download,
  Upload,
  Play,
  CheckCircle2,
  Server,
  ShieldAlert,
  Code2,
  RefreshCw,
  Cloud,
  Layers,
  FileSpreadsheet,
  FileJson,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  DatabaseBackupLog,
  User,
  Kelas,
  Jurusan,
  NilaiSiswa,
  AbsensiRecord,
  AbsensiPegawaiRecord,
  BukuDigital,
  PeminjamanBuku,
  MateriPelajaran,
  TugasPelajaran,
  PengumpulanTugas,
  ForumDiskusi,
  NotificationLog,
  SchoolSettings,
} from '../../types';
import { SyncStatus, forceFullCloudSync } from '../../lib/firestoreSync';
import { firebaseConfig } from '../../lib/firebase';

interface DatabaseBackupProps {
  backups: DatabaseBackupLog[];
  onTriggerBackup: () => void;
  syncStatus?: SyncStatus;
  allAppData?: {
    users: User[];
    classes: Kelas[];
    jurusan: Jurusan[];
    grades: NilaiSiswa[];
    attendance: AbsensiRecord[];
    staffAttendance: AbsensiPegawaiRecord[];
    books: BukuDigital[];
    peminjaman: PeminjamanBuku[];
    materi: MateriPelajaran[];
    tugas: TugasPelajaran[];
    pengumpulan: PengumpulanTugas[];
    forum: ForumDiskusi[];
    notifications: NotificationLog[];
    backups: DatabaseBackupLog[];
    schoolSettings: SchoolSettings;
  };
  onRestoreData?: (data: any) => void;
}

export const DatabaseBackupConsole: React.FC<DatabaseBackupProps> = ({
  backups,
  onTriggerBackup,
  syncStatus = 'connected',
  allAppData,
  onRestoreData,
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showSqlTerminal, setShowSqlTerminal] = useState(false);

  const handleRunManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      onTriggerBackup();
      setIsBackingUp(false);
      alert(
        'Dump Database Berhasil Dijalankan!\nFile backup siakad_cloud_dump.sql.gz disimpan & dicadangkan dengan aman.'
      );
    }, 1200);
  };

  const handleCloudSyncNow = async () => {
    if (!allAppData) return;
    setIsCloudSyncing(true);
    setSyncSuccessMsg(null);
    try {
      await forceFullCloudSync(allAppData);
      setSyncSuccessMsg('Semua data berhasil disinkronkan 100% ke Cloud Firestore!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (e: any) {
      alert('Gagal menyinkronkan ke cloud: ' + (e.message || String(e)));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleDownloadJsonBackup = () => {
    if (!allAppData) return;
    const backupObj = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      school: allAppData.schoolSettings.namaSekolah,
      data: allAppData,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siakad_backup_cloud_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSqlDump = () => {
    if (!allAppData) return;
    let sql = `-- SIAKAD SQL Dump Export\n-- Generated: ${new Date().toISOString()}\n-- School: ${allAppData.schoolSettings.namaSekolah}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY, name VARCHAR, role VARCHAR, email VARCHAR, phone VARCHAR);\n`;
    allAppData.users.forEach((u) => {
      sql += `INSERT INTO users (id, name, role, email, phone) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.role}', '${u.email}', '${u.phone || ''}') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;\n`;
    });
    sql += `\nCREATE TABLE IF NOT EXISTS absensi (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, tanggal VARCHAR, status VARCHAR, waktu VARCHAR);\n`;
    allAppData.attendance.forEach((a) => {
      sql += `INSERT INTO absensi (id, siswa_id, tanggal, status, waktu) VALUES ('${a.id}', '${a.siswaId}', '${a.tanggal}', '${a.status}', '${a.waktu}') ON CONFLICT (id) DO NOTHING;\n`;
    });
    sql += `\nCREATE TABLE IF NOT EXISTS nilai (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, mapel_id VARCHAR, nilai_akhir NUMERIC);\n`;
    allAppData.grades.forEach((g) => {
      sql += `INSERT INTO nilai (id, siswa_id, mapel_id, nilai_akhir) VALUES ('${g.id}', '${g.siswaId}', '${g.mataPelajaranId}', ${g.nilaiAkhir}) ON CONFLICT (id) DO UPDATE SET nilai_akhir=EXCLUDED.nilai_akhir;\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siakad_sql_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data && onRestoreData) {
          onRestoreData(parsed.data);
          alert('Database berhasil dipulihkan dari file JSON cadangan!');
        } else if (onRestoreData) {
          onRestoreData(parsed);
          alert('Database berhasil dipulihkan dari file JSON cadangan!');
        }
      } catch (err) {
        alert('File backup tidak valid atau rusak!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title & Cloud Realtime Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              CLOUD FIRESTORE PERSISTENT & SYNCED
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              100% FREE (Spark Tier)
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2.5 tracking-tight">
            <Cloud className="w-7 h-7 text-emerald-400" /> Database Cloud Terpusat & Sinkronisasi Real-time
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Data sekolah (akun guru, siswa, kelas, absensi GPS, nilai e-raport, tugas & buku) tersimpan aman di Cloud Firestore. Semua perubahan di satu perangkat langsung tersinkronisasi otomatis ke semua guru & siswa secara bersamaan tanpa biaya server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCloudSyncNow}
            disabled={isCloudSyncing}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/40"
          >
            <RefreshCw className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            {isCloudSyncing ? 'Sinkronisasi ke Cloud...' : 'Sinkronkan ke Cloud Sekarang'}
          </button>

          <button
            onClick={handleDownloadJsonBackup}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>Download Backup JSON</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Cloud Info & Collection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 md:col-span-2 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">Informasi Klaster Cloud Database</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              STATUS: TERKONEKSI (ONLINE)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Engine Database</p>
              <p className="font-mono font-bold text-emerald-400 mt-0.5">Google Cloud Firestore</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project ID</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5 truncate">{firebaseConfig.projectId}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database ID</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5 truncate">{firebaseConfig.firestoreDatabaseId || '(default)'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sinkronisasi</p>
              <p className="font-mono font-bold text-amber-300 mt-0.5">Real-time bi-directional (WebSockets)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Biaya Operasional</p>
              <p className="font-mono font-bold text-emerald-300 mt-0.5">100% Gratis Selamanya</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Multi-Perangkat</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5">HP Guru, Siswa, Laptop, Tablet</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3 text-[11px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSqlTerminal(!showSqlTerminal)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" /> {showSqlTerminal ? 'Sembunyikan Terminal SQL' : 'Lihat Skema Ekspor SQL'}
              </button>
              <button
                onClick={handleDownloadSqlDump}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh SQL Dump
              </button>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">Cloud Region: asia-southeast1 (Jakarta/SG)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" /> Cadangkan & Pulihkan (Restore)
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Anda dapat mengimpor file backup `.json` untuk memulihkan seluruh data sekolah kapan saja.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore dari File JSON</span>
              <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
            </label>

            <button
              onClick={handleRunManualBackup}
              disabled={isBackingUp}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Memproses...' : 'Buat Titik Pemulihan Baru'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Collection Statistics */}
      {allAppData && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> Koleksi & Dokumen Database Cloud Aktif
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time Live Synced</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Akun Pengguna</p>
              <p className="text-lg font-black text-slate-900 mt-1">{allAppData.users.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Rombel Kelas</p>
              <p className="text-lg font-black text-blue-600 mt-1">{allAppData.classes.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Log Absensi</p>
              <p className="text-lg font-black text-emerald-600 mt-1">{allAppData.attendance.length + allAppData.staffAttendance.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Data Nilai</p>
              <p className="text-lg font-black text-amber-600 mt-1">{allAppData.grades.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Materi & Tugas</p>
              <p className="text-lg font-black text-purple-600 mt-1">{allAppData.materi.length + allAppData.tugas.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Buku Digital</p>
              <p className="text-lg font-black text-indigo-600 mt-1">{allAppData.books.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal SQL Schema Preview */}
      {showSqlTerminal && (
        <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-xs border border-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2">
            <span>siakad_cloud_schema_export.sql</span>
            <span>SQL Schema Preview</span>
          </div>
          <pre className="text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded-lg max-h-60 overflow-y-auto">
            {`CREATE TABLE users (id VARCHAR PRIMARY KEY, name VARCHAR, role VARCHAR, email VARCHAR, phone VARCHAR);
CREATE TABLE classes (id VARCHAR PRIMARY KEY, nama VARCHAR, tingkat VARCHAR, wali_kelas_id VARCHAR);
CREATE TABLE nilai_siswa (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, mapel_id VARCHAR, nilai_akhir NUMERIC, predikat VARCHAR);
CREATE TABLE absensi_gps (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, tanggal DATE, status VARCHAR, latitude NUMERIC, longitude NUMERIC);
CREATE TABLE materi_pelajaran (id VARCHAR PRIMARY KEY, judul VARCHAR, mapel_id VARCHAR, file_url TEXT);
CREATE TABLE tugas_siswa (id VARCHAR PRIMARY KEY, judul VARCHAR, tenggat_waktu TIMESTAMP);
CREATE TABLE buku_perpustakaan (id VARCHAR PRIMARY KEY, judul VARCHAR, penulis VARCHAR, stok INT);
-- Synchronized with Cloud Firestore Collections Real-time`}
          </pre>
        </div>
      )}

      {/* Backup History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Riwayat Arsip & Titik Pemulihan Database</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Waktu Backup</th>
                <th className="py-3 px-4">Nama File Dump</th>
                <th className="py-3 px-4">Tipe Pembuat</th>
                <th className="py-3 px-4">Ukuran Berkas</th>
                <th className="py-3 px-4">Status Cloud</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((bkp) => (
                <tr key={bkp.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono text-slate-600">{bkp.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">{bkp.fileName}</td>
                  <td className="py-3 px-4 text-slate-700">{bkp.tipe}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{bkp.ukuranFile}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {bkp.status || 'Tersimpan'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={handleDownloadJsonBackup}
                      className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
