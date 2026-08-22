import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  Clock,
  Download,
  Play,
  CheckCircle2,
  Server,
  ShieldAlert,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { DatabaseBackupLog } from '../../types';

interface DatabaseBackupProps {
  backups: DatabaseBackupLog[];
  onTriggerBackup: () => void;
}

export const DatabaseBackupConsole: React.FC<DatabaseBackupProps> = ({ backups, onTriggerBackup }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSqlTerminal, setShowSqlTerminal] = useState(false);

  const handleRunManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      onTriggerBackup();
      setIsBackingUp(false);
      alert('Dump Database PostgreSQL Berhasil Dijalankan!\nFile backup siakad_pg_dump.sql.gz disimpan & diarsipkan dengan aman.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
            PostgreSQL Security & Backup Engine
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" /> Sistem Backup Database PostgreSQL Otomatis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal backup otomatis setiap malam pkl 00:00 WIB untuk menjamin keamanan & integritas data nilai & absensi.
          </p>
        </div>

        <button
          onClick={handleRunManualBackup}
          disabled={isBackingUp}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Play className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
          {isBackingUp ? 'Proses Dump pg_dump...' : 'Trigger Dump PostgreSQL Sekarang'}
        </button>
      </div>

      {/* Database Connection & Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-3 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">PostgreSQL Production Cluster Info</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              STATUS: CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Database Name</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5">postgresql_siakad_prod</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Host Server</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5">db.siakad.internal:5432</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Ukuran DB Saat Ini</p>
              <p className="font-mono font-bold text-emerald-400 mt-0.5">14.8 MB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Jadwal Backup Cron</p>
              <p className="font-mono font-bold text-amber-300 mt-0.5">Setiap Malam (00:00 WIB)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Retensi File</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5">30 Hari Arsip Encrypted</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Metode Dump</p>
              <p className="font-mono font-bold text-slate-200 mt-0.5">pg_dump .sql.gz</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <button
              onClick={() => setShowSqlTerminal(!showSqlTerminal)}
              className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
            >
              <Code2 className="w-3.5 h-3.5" /> {showSqlTerminal ? 'Sembunyikan Terminal SQL' : 'Lihat Skema Query SQL'}
            </button>
            <span className="text-slate-400">PostgreSQL 16.2 on x86_64-pc-linux-gnu</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Otomatisasi Cron Job
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Setiap pukul 00:00 WIB, script daemon menjalankan perintah dump PostgreSQL secara terisolasi tanpa mengganggu lalu lintas pengguna aktif.
            </p>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Sistem Backup Otomatis Berjalan Normal.</span>
          </div>
        </div>
      </div>

      {/* Terminal SQL Schema Preview */}
      {showSqlTerminal && (
        <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-xs border border-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2">
            <span>pg_dump --dbname=postgresql_siakad_production --schema-only</span>
            <span>PostgreSQL Terminal Console</span>
          </div>
          <pre className="text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded-lg">
            {`CREATE TABLE users (id VARCHAR PRIMARY KEY, name VARCHAR, role VARCHAR, email VARCHAR, phone VARCHAR);
CREATE TABLE nilai_siswa (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, mata_pelajaran VARCHAR, nh FLOAT, uts FLOAT, uas FLOAT, final_score FLOAT);
CREATE TABLE absensi_gps (id VARCHAR PRIMARY KEY, siswa_id VARCHAR, latitude NUMERIC, longitude NUMERIC, status VARCHAR, timestamp TIMESTAMP);
-- Indexing for maximum performance
CREATE INDEX idx_siswa_nilai ON nilai_siswa (siswa_id, mata_pelajaran);
CREATE INDEX idx_absensi_gps ON absensi_gps (siswa_id, timestamp);`}
          </pre>
        </div>
      )}

      {/* Backup History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Riwayat Arsip Backup Database PostgreSQL</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Waktu Backup</th>
                <th className="py-3 px-4">Nama File Dump</th>
                <th className="py-3 px-4">Tipe Pembuat</th>
                <th className="py-3 px-4">Ukuran Berkas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Unduh Dump</th>
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {bkp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        alert(`Munduh file backup PostgreSQL: '${bkp.fileName}' (${bkp.ukuranFile})`)
                      }
                      className="text-amber-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh .sql.gz
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
