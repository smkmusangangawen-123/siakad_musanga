import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  Search,
  Download,
  BookMarked,
  CheckCircle2,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { BukuDigital, PeminjamanBuku, User } from '../../types';

interface PerpustakaanDigitalProps {
  currentUser: User;
  books: BukuDigital[];
  peminjamanList: PeminjamanBuku[];
  onBorrowBook: (bukuId: string) => void;
}

export const PerpustakaanDigital: React.FC<PerpustakaanDigitalProps> = ({
  currentUser,
  books,
  peminjamanList,
  onBorrowBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [readingBook, setReadingBook] = useState<BukuDigital | null>(null);

  const categories = ['Semua', 'Buku Teks Utama', 'Sains & Teknologi', 'Sejarah & Budaya'];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pengarang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || b.kategori === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
            Perpustakaan Digital Terintegrasi
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Library className="w-5 h-5 text-amber-600" /> Katalog E-Book & Sistem Peminjaman Digital
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akses e-book pelajaran, jurnal ilmiah, dan ensiklopedia digital secara online atau unduh format PDF.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul buku, pengarang..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((bk) => (
          <div
            key={bk.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="p-5 flex items-start gap-4">
              <img
                src={bk.coverUrl}
                alt={bk.judul}
                className="w-20 h-28 object-cover rounded-lg shadow border shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                  {bk.kategori}
                </span>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mt-1">{bk.judul}</h4>
                <p className="text-[11px] text-slate-500">Penulis: {bk.pengarang}</p>
                <p className="text-[10px] text-slate-400 font-mono">ISBN: {bk.isbn}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{bk.deskripsi}</p>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Stok: <span className="font-bold text-slate-900">{bk.stokTersedia}/{bk.stokTotal}</span>
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setReadingBook(bk)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Baca PDF
                </button>
                <button
                  onClick={() => {
                    onBorrowBook(bk.id);
                    alert(`Buku '${bk.judul}' Berhasil Dipinjam Online!\nBatas Pengembalian: 14 Hari.`);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <BookMarked className="w-3.5 h-3.5" /> Pinjam Buku
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Online Book Reader Modal */}
      {readingBook && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm truncate max-w-md">{readingBook.judul}</h3>
                  <p className="text-[11px] text-slate-300">Pembaca E-Book Digital SIAKAD</p>
                </div>
              </div>
              <button
                onClick={() => setReadingBook(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Format Dokumen: E-Book PDF Resmi Kementerian Pendidikan & Kebudayaan RI.</span>
              </div>

              <div className="w-full h-96 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
                <BookOpen className="w-12 h-12 text-amber-600" />
                <h4 className="font-bold text-slate-800 text-sm">{readingBook.judul}</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Dokumen PDF telah dimuat sepenuhnya di memori reader portal SIAKAD Smart School.
                </p>
                <a
                  href={readingBook.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 mt-2"
                >
                  <Download className="w-4 h-4" /> Buka PDF Tampilan Penuh / Unduh File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
