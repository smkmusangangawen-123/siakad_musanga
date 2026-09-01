import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { BarChart3, TrendingUp, Award, Sparkles, Compass } from 'lucide-react';
import { NilaiSiswa, User } from '../../types';

interface AnalitikNilaiProps {
  currentUser: User;
  grades: NilaiSiswa[];
}

export const AnalitikNilai: React.FC<AnalitikNilaiProps> = ({ currentUser, grades }) => {
  // Chart 1: Subject Performance vs Class Average
  const subjectChartData = grades.map((g) => ({
    mataPelajaran: g.mataPelajaranNama.split(' ')[0],
    NilaiSiswa: g.nilaiAkhir,
    RataRataKelas: 84.5,
    KKM: 75,
  }));

  // Chart 2: Monthly Academic Trend
  const trendData = [
    { bulan: 'Juli', NilaiRataRata: 82.0 },
    { bulan: 'Agustus', NilaiRataRata: 86.5 },
    { bulan: 'September (UTS)', NilaiRataRata: 89.2 },
    { bulan: 'Oktober', NilaiRataRata: 90.1 },
    { bulan: 'November', NilaiRataRata: 91.8 },
    { bulan: 'Desember (UAS)', NilaiRataRata: 92.5 },
  ];

  // Chart 3: Academic Competency Radar
  const radarData = [
    { bidang: 'Matematika', Nilai: 92.5, fullMark: 100 },
    { bidang: 'Fisika & Sains', Nilai: 88.1, fullMark: 100 },
    { bidang: 'Bahasa Indonesia', Nilai: 85.8, fullMark: 100 },
    { bidang: 'Bahasa Inggris', Nilai: 93.3, fullMark: 100 },
    { bidang: 'Kimia & Biologi', Nilai: 89.0, fullMark: 100 },
    { bidang: 'Logika & Komputer', Nilai: 95.0, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
            Real-time Analytics Engine
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" /> Dashboard Analitik Grafik Perkembangan Nilai
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisasi perkembangan akademik real-time, statistik perbandingan mata pelajaran, dan analisis potensi kompetensi.
          </p>
        </div>

        <div className="text-right text-xs bg-purple-50 p-3 rounded-xl border border-purple-200">
          <p className="font-bold text-purple-900">Siswa Dipantau:</p>
          <p className="font-extrabold text-slate-900 text-sm">Ahmad Fauzi (10 IPA 1)</p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Perbandingan Nilai Per Mata Pelajaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Perbandingan Nilai Siswa vs Rata-Rata Kelas
            </h3>
            <span className="text-[11px] font-bold text-slate-500">KKM: 75</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mataPelajaran" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="NilaiSiswa" name="Nilai Ahmad Fauzi" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="RataRataKelas" name="Rata-rata Kelas 10 IPA 1" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Trend Line */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Grafik Tren Perkembangan Nilai
            </h3>
            <span className="text-[11px] font-bold text-emerald-600">+10.5% Tren Positif</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="NilaiRataRata"
                  name="Rata-Rata Nilai"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Competency Radar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" /> Radar Pemetaan Potensi & Bakat Akademik Siswa
            </h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Kekuatan Utama: Logika & Bahasa Inggris
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="bidang" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Kompetensi Siswa" dataKey="Nilai" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
