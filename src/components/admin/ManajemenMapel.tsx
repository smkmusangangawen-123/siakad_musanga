import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
  Award,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { MataPelajaran, User, Kelas, Jurusan } from '../../types';
import { exportToCSV } from '../../utils/csvHelper';

interface ManajemenMapelProps {
  subjects: MataPelajaran[];
  teachers: User[];
  classes?: Kelas[];
  jurusanList?: Jurusan[];
  onAddSubject: (subject: MataPelajaran) => void;
  onUpdateSubject: (subject: MataPelajaran) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const ManajemenMapel: React.FC<ManajemenMapelProps> = ({
  subjects,
  teachers,
  classes = [],
  jurusanList = [],
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelompok, setFilterKelompok] = useState<string>('all');
  const [filterGuru, setFilterGuru] = useState<string>('all');
  const [filterTingkat, setFilterTingkat] = useState<string>('all');

  // Modal State
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; kode: string } | null>(null);

  // Form Fields
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKKM, setFormKKM] = useState<number>(75);
  const [formGuruId, setFormGuruId] = useState('');
  const [formKelompok, setFormKelompok] = useState<string>('Kelompok A (Umum)');
  const [formTingkat, setFormTingkat] = useState<string>('Semua');
  const [formJurusanNama, setFormJurusanNama] = useState<string>('Semua Jurusan');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const teacherUsers = teachers.filter(
    (u) => u.role === 'guru' && (!u.kategoriPegawai || u.kategoriPegawai === 'Guru')
  );

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.guruNama && s.guruNama.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesKelompok =
      filterKelompok === 'all' || s.kelompok === filterKelompok;
    const matchesGuru = filterGuru === 'all' || s.guruId === filterGuru;
    const matchesTingkat =
      filterTingkat === 'all' ||
      String(s.tingkat) === filterTingkat ||
      s.tingkat === 'Semua' ||
      !s.tingkat;

    return matchesSearch && matchesKelompok && matchesGuru && matchesTingkat;
  });

  const handleOpenAdd = () => {
    setEditingId('');
    setFormKode(`MP-${subjects.length + 1 < 10 ? '0' : ''}${subjects.length + 1}`);
    setFormNama('');
    setFormKKM(75);
    setFormGuruId(teacherUsers[0]?.id || '');
    setFormKelompok('Kelompok A (Umum)');
    setFormTingkat('Semua');
    setFormJurusanNama('Semua Jurusan');
    setFormDeskripsi('');
    setModalType('add');
  };

  const handleOpenEdit = (sub: MataPelajaran) => {
    setEditingId(sub.id);
    setFormKode(sub.kode);
    setFormNama(sub.nama);
    setFormKKM(sub.kKM || 75);
    setFormGuruId(sub.guruId || teacherUsers[0]?.id || '');
    setFormKelompok(sub.kelompok || 'Kelompok A (Umum)');
    setFormTingkat(sub.tingkat ? String(sub.tingkat) : 'Semua');
    setFormJurusanNama(sub.jurusanNama || 'Semua Jurusan');
    setFormDeskripsi(sub.deskripsi || '');
    setModalType('edit');
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKode.trim()) return;

    const selectedTeacher = teacherUsers.find((t) => t.id === formGuruId);

    if (modalType === 'add') {
      const newSubject: MataPelajaran = {
        id: `mapel-${Date.now()}`,
        kode: formKode.trim().toUpperCase(),
        nama: formNama.trim(),
        kKM: Number(formKKM) || 75,
        guruId: formGuruId,
        guruNama: selectedTeacher ? selectedTeacher.name : 'Guru Pengampu Belum Ditentukan',
        kelompok: formKelompok,
        tingkat: formTingkat === 'Semua' ? 'Semua' : Number(formTingkat),
        jurusanNama: formJurusanNama,
        deskripsi: formDeskripsi.trim(),
      };
      onAddSubject(newSubject);
    } else if (modalType === 'edit') {
      const existing = subjects.find((s) => s.id === editingId);
      if (existing) {
        onUpdateSubject({
          ...existing,
          kode: formKode.trim().toUpperCase(),
          nama: formNama.trim(),
          kKM: Number(formKKM) || 75,
          guruId: formGuruId,
          guruNama: selectedTeacher ? selectedTeacher.name : existing.guruNama,
          kelompok: formKelompok,
          tingkat: formTingkat === 'Semua' ? 'Semua' : Number(formTingkat),
          jurusanNama: formJurusanNama,
          deskripsi: formDeskripsi.trim(),
        });
      }
    }
    setModalType(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    onDeleteSubject(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Kode Mapel', 'Nama Mata Pelajaran', 'Kelompok', 'KKM', 'Guru Pengampu', 'Tingkat Kelas', 'Jurusan'];
    const rows = filteredSubjects.map((s, idx) => [
      idx + 1,
      s.kode,
      s.nama,
      s.kelompok || 'Kelompok A',
      s.kKM || 75,
      s.guruNama || '-',
      s.tingkat || 'Semua',
      s.jurusanNama || 'Semua',
    ]);
    exportToCSV('Data_Mata_Pelajaran.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900">Manajemen Mata Pelajaran (Mapel)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola kurikulum, daftar mata pelajaran, KKM standar ketuntasan, dan penugasan guru pengampu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" /> Ekspor .CSV
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500">Total Mata Pelajaran</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{subjects.length}</p>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <p className="text-[11px] font-bold text-blue-600">Rata-rata KKM</p>
            <p className="text-xl font-black text-blue-900 mt-0.5">
              {subjects.length > 0
                ? Math.round(subjects.reduce((acc, s) => acc + (s.kKM || 75), 0) / subjects.length)
                : 75}
            </p>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <p className="text-[11px] font-bold text-purple-600">Guru Terdaftar</p>
            <p className="text-xl font-black text-purple-900 mt-0.5">{teacherUsers.length} Guru</p>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-600">Jurusan Terkait</p>
            <p className="text-xl font-black text-emerald-900 mt-0.5">{jurusanList.length} Jurusan</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode mapel, nama mata pelajaran, atau guru pengampu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Filter Kelompok */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Kelompok:</span>
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kelompok</option>
              <option value="Kelompok A (Umum)">Kelompok A (Umum)</option>
              <option value="Kelompok B (Umum)">Kelompok B (Umum)</option>
              <option value="Kelompok C (Kejuruan/Peminatan)">Kelompok C (Kejuruan/Peminatan)</option>
              <option value="Muatan Lokal">Muatan Lokal</option>
            </select>
          </div>

          {/* Filter Guru */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Guru:</span>
            <select
              value={filterGuru}
              onChange={(e) => setFilterGuru(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px] truncate"
            >
              <option value="all">Semua Guru Pengampu</option>
              {teacherUsers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Mata Pelajaran</th>
                <th className="py-3.5 px-4">Kelompok / Kategori</th>
                <th className="py-3.5 px-4 text-center">KKM</th>
                <th className="py-3.5 px-4">Guru Pengampu</th>
                <th className="py-3.5 px-4">Sasaran Kelas & Jurusan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada data mata pelajaran yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        {sub.kode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-slate-900 text-sm">{sub.nama}</p>
                      {sub.deskripsi && (
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">{sub.deskripsi}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        sub.kelompok?.includes('Kelompok A')
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : sub.kelompok?.includes('Kelompok B')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : sub.kelompok?.includes('Kelompok C')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {sub.kelompok || 'Kelompok A (Umum)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md font-black text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.kKM || 75}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {sub.guruNama ? sub.guruNama.charAt(0) : 'G'}
                        </div>
                        <span className="font-bold text-slate-800">{sub.guruNama || 'Belum Ditentukan'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-medium">
                        {sub.tingkat && sub.tingkat !== 'Semua' ? `Kelas ${sub.tingkat}` : 'Semua Tingkat'}
                        {sub.jurusanNama && sub.jurusanNama !== 'Semua Jurusan' ? ` (${sub.jurusanNama})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Mata Pelajaran"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              id: sub.id,
                              name: sub.nama,
                              kode: sub.kode,
                            })
                          }
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Mata Pelajaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Subject */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {modalType === 'add' ? 'Tambah Mata Pelajaran Baru' : 'Edit Mata Pelajaran'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    placeholder="MAT-10"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika Wajib"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelompok / Kategori</label>
                  <select
                    value={formKelompok}
                    onChange={(e) => setFormKelompok(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="Kelompok A (Umum)">Kelompok A (Umum)</option>
                    <option value="Kelompok B (Umum)">Kelompok B (Umum)</option>
                    <option value="Kelompok C (Kejuruan/Peminatan)">Kelompok C (Kejuruan/Peminatan)</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Standar KKM *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={formKKM}
                    onChange={(e) => setFormKKM(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Guru Pengampu Utama</label>
                <select
                  value={formGuruId}
                  onChange={(e) => setFormGuruId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                >
                  <option value="">-- Pilih Guru Pengampu --</option>
                  {teacherUsers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.nip ? `(${t.nip})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat Kelas</label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="Semua">Semua Tingkat (10, 11, 12)</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khusus Jurusan</label>
                  <select
                    value={formJurusanNama}
                    onChange={(e) => setFormJurusanNama(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="Semua Jurusan">Semua Jurusan</option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.kode}>
                        {j.kode} - {j.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Ringkas / Silabus</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan materi dasar atau deskripsi mata pelajaran..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-sm"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Konfirmasi Hapus Mata Pelajaran</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus data mapel dari database.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Apakah Anda yakin ingin menghapus mata pelajaran <strong className="text-slate-900 font-bold">[{deleteConfirm.kode}] {deleteConfirm.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-sm text-xs"
              >
                Ya, Hapus Mapel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
