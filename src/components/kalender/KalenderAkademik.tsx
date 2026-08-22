import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { KalenderEvent, JadwalPelajaran } from '../../types';

interface KalenderAkademikProps {
  events: KalenderEvent[];
  jadwal: JadwalPelajaran[];
}

export const KalenderAkademik: React.FC<KalenderAkademikProps> = ({ events, jadwal }) => {
  const [selectedHari, setSelectedHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin');

  const filteredJadwal = jadwal.filter((j) => j.hari === selectedHari);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
            Jadwal & Kalender Terintegrasi
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Kalender Akademik & Jadwal Pelajaran Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinkronisasi jadwal kelas harian, agenda ujian tengah/akhir semester, serta kegiatan ekstrakurikuler sekolah.
          </p>
        </div>
      </div>

      {/* Grid Layout: Agenda Events & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Calendar Agenda */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" /> Agenda Kalender Akademik 2025/2026
          </h3>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.kategori === 'Ujian'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : evt.kategori === 'Raport'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {evt.kategori}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600">
                    {evt.tanggalMulai} - {evt.tanggalSelesai}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{evt.judul}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Class Timetable */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Jadwal Pelajaran Harian (Kelas 10 IPA 1)
            </h3>
          </div>

          {/* Day Selector Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const).map((hari) => (
              <button
                key={hari}
                onClick={() => setSelectedHari(hari)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedHari === hari
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hari}
              </button>
            ))}
          </div>

          {/* Timetable Cards */}
          <div className="space-y-3">
            {filteredJadwal.length > 0 ? (
              filteredJadwal.map((j) => (
                <div key={j.id} className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">{j.ruang}</span>
                    <h4 className="font-bold text-sm text-slate-900">{j.mataPelajaranNama}</h4>
                    <p className="text-xs text-slate-600">Pengajar: {j.guruNama}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-mono text-xs font-bold">
                      {j.jam}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                Tidak ada jadwal pelajaran di hari {selectedHari}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
