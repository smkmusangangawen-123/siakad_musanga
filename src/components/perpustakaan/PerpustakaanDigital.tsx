import React, { useState, useMemo } from 'react';
import {
  Library,
  BookOpen,
  Search,
  Download,
  BookMarked,
  CheckCircle2,
  X,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Layers,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { BukuDigital, PeminjamanBuku, User } from '../../types';

interface PerpustakaanDigitalProps {
  currentUser: User;
  books: BukuDigital[];
  peminjamanList: PeminjamanBuku[];
  onBorrowBook: (bukuId: string) => void;
  onAddBook?: (newBook: BukuDigital) => void;
  onUpdateBook?: (updatedBook: BukuDigital) => void;
  onDeleteBook?: (bookId: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Buku Teks Utama',
  'Sains & Teknologi',
  'Sejarah & Budaya',
  'Bahasa & Sastra',
  'Komputer & TI',
  'Pengembangan Diri',
  'Kamus & Referensi',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e37271?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
];

export const PerpustakaanDigital: React.FC<PerpustakaanDigitalProps> = ({
  currentUser,
  books,
  peminjamanList,
  onBorrowBook,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [readingBook, setReadingBook] = useState<BukuDigital | null>(null);

  // Admin CRUD Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<BukuDigital | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial Form State
  const initialFormState = {
    judul: '',
    pengarang: '',
    penerbit: 'Pusat Perbukuan Kemdikbud RI',
    tahun: new Date().getFullYear(),
    kategori: 'Buku Teks Utama',
    isbn: '',
    deskripsi: '',
    coverUrl: PRESET_COVERS[0],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    stokTotal: 30,
    stokTersedia: 30,
  };

  const [bookForm, setBookForm] = useState(initialFormState);

  // Dynamic Category List
  const categories = useMemo(() => {
    const fromBooks = books.map((b) => b.kategori).filter(Boolean);
    const combined = Array.from(new Set(['Semua', ...DEFAULT_CATEGORIES, ...fromBooks]));
    return combined;
  }, [books]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.judul.toLowerCase().includes(q) ||
        b.pengarang.toLowerCase().includes(q) ||
        (b.penerbit && b.penerbit.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.kategori && b.kategori.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'Semua' || b.kategori === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [books, searchTerm, selectedCategory]);

  // Statistics
  const totalJudul = books.length;
  const totalEksemplar = books.reduce((acc, curr) => acc + (curr.stokTotal || 0), 0);
  const totalTersedia = books.reduce((acc, curr) => acc + (curr.stokTersedia || 0), 0);
  const totalDipinjam = Math.max(0, totalEksemplar - totalTersedia);

  // Handlers
  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setBookForm({
      ...initialFormState,
      isbn: `978-602-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1 + Math.random() * 9)}`,
      coverUrl: PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: BukuDigital) => {
    if (!isAdmin) return;
    setSelectedBookForAction(book);
    setBookForm({
      judul: book.judul,
      pengarang: book.pengarang,
      penerbit: book.penerbit || 'Erlangga',
      tahun: book.tahun || new Date().getFullYear(),
      kategori: book.kategori || 'Buku Teks Utama',
      isbn: book.isbn || '',
      deskripsi: book.deskripsi || '',
      coverUrl: book.coverUrl || PRESET_COVERS[0],
      pdfUrl: book.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      stokTotal: book.stokTotal || 20,
      stokTersedia: book.stokTersedia !== undefined ? book.stokTersedia : 20,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (book: BukuDigital) => {
    if (!isAdmin) return;
    setSelectedBookForAction(book);
    setIsDeleteModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!bookForm.judul.trim() || !bookForm.pengarang.trim()) {
      alert('Judul buku dan nama pengarang wajib diisi.');
      return;
    }

    if (isEditModalOpen && selectedBookForAction) {
      const updated: BukuDigital = {
        ...selectedBookForAction,
        judul: bookForm.judul.trim(),
        pengarang: bookForm.pengarang.trim(),
        penerbit: bookForm.penerbit.trim(),
        tahun: Number(bookForm.tahun),
        kategori: bookForm.kategori,
        isbn: bookForm.isbn.trim(),
        deskripsi: bookForm.deskripsi.trim(),
        coverUrl: bookForm.coverUrl.trim() || PRESET_COVERS[0],
        pdfUrl: bookForm.pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        stokTotal: Number(bookForm.stokTotal),
        stokTersedia: Math.min(Number(bookForm.stokTersedia), Number(bookForm.stokTotal)),
      };

      if (onUpdateBook) {
        onUpdateBook(updated);
      }
      showToast(`✅ Berhasil memperbarui data buku "${updated.judul}"!`);
      setIsEditModalOpen(false);
      setSelectedBookForAction(null);
    } else {
      const newBook: BukuDigital = {
        id: `bk-${Date.now()}`,
        judul: bookForm.judul.trim(),
        pengarang: bookForm.pengarang.trim(),
        penerbit: bookForm.penerbit.trim(),
        tahun: Number(bookForm.tahun),
        kategori: bookForm.kategori,
        isbn: bookForm.isbn.trim() || `978-602-999-001-1`,
        deskripsi: bookForm.deskripsi.trim() || 'Buku referensi digital resmi sekolah.',
        coverUrl: bookForm.coverUrl.trim() || PRESET_COVERS[0],
        pdfUrl: bookForm.pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        stokTotal: Number(bookForm.stokTotal),
        stokTersedia: Number(bookForm.stokTotal),
      };

      if (onAddBook) {
        onAddBook(newBook);
      }
      showToast(`🎉 Berhasil menambahkan buku baru "${newBook.judul}" ke katalog!`);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!isAdmin || !selectedBookForAction) return;

    if (onDeleteBook) {
      onDeleteBook(selectedBookForAction.id);
    }
    showToast(`🗑️ Buku "${selectedBookForAction.judul}" berhasil dihapus.`);
    setIsDeleteModalOpen(false);
    setSelectedBookForAction(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <Library className="w-4 h-4 text-amber-300" />
              <span>PERPUSTAKAAN DIGITAL & E-BOOK PORTAL</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Katalog Buku Digital & Peminjaman Online
            </h1>
            <p className="text-amber-100 text-sm max-w-2xl leading-relaxed">
              Akses materi pelajaran kurikulum nasional, modul praktikum kejuruan, ensiklopedia ilmiah, serta baca berkas PDF secara instan di portal SIAKAD.
            </p>
          </div>

          {/* Admin Add Button */}
          {isAdmin && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-amber-950 hover:bg-amber-50 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-700" />
                <span>Tambah Buku Digital</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Banner inside header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/15 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <span className="text-white/70 block text-[11px] font-medium">Total Koleksi Judul</span>
            <span className="text-lg font-bold text-white block mt-0.5">{totalJudul} Buku</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <span className="text-white/70 block text-[11px] font-medium">Total Eksemplar</span>
            <span className="text-lg font-bold text-amber-200 block mt-0.5">{totalEksemplar} Eks</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <span className="text-white/70 block text-[11px] font-medium">Stok Tersedia</span>
            <span className="text-lg font-bold text-emerald-300 block mt-0.5">{totalTersedia} Eks</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <span className="text-white/70 block text-[11px] font-medium">Buku Sedang Dipinjam</span>
            <span className="text-lg font-bold text-sky-200 block mt-0.5">{totalDipinjam} Eks</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul buku, nama pengarang, penerbit, ISBN..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'Semua'
                ? books.length
                : books.filter((b) => b.kategori === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada buku yang ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ditemukan judul atau kategori buku yang sesuai dengan pencarian &quot;{searchTerm}&quot;.
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua');
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((bk) => {
            const isAvailable = (bk.stokTersedia || 0) > 0;

            return (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-200 transition-all group"
              >
                <div>
                  {/* Card Top / Header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={bk.coverUrl || PRESET_COVERS[0]}
                        alt={bk.judul}
                        referrerPolicy="no-referrer"
                        className="w-20 h-28 object-cover rounded-xl shadow border border-slate-200 group-hover:scale-[1.02] transition-transform duration-200"
                      />
                      <span
                        className={`absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight shadow-sm ${
                          isAvailable ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-100 text-amber-900 truncate">
                          {bk.kategori || 'Buku Teks'}
                        </span>

                        {/* Admin Direct Action Buttons on Card */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(bk)}
                              title="Edit Data Buku"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(bk)}
                              title="Hapus Buku"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4
                        className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-amber-900 transition-colors"
                        title={bk.judul}
                      >
                        {bk.judul}
                      </h4>
                      <p className="text-[11px] text-slate-600 truncate font-medium">
                        Oleh: {bk.pengarang}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{bk.tahun || 2024}</span>
                        <span>•</span>
                        <span className="truncate">{bk.penerbit || 'Kemdikbud'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                        {bk.deskripsi || 'Buku materi digital terpadu SMK Muhammadiyah 1 Ngawen.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <div className="text-slate-500 font-medium text-[11px]">
                    Stok:{' '}
                    <span className="font-bold text-slate-900">
                      {bk.stokTersedia || 0}
                    </span>
                    /{bk.stokTotal || 0} Eks
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReadingBook(bk)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Baca E-Book</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        onBorrowBook(bk.id);
                        showToast(`📖 Berhasil meminjam "${bk.judul}"! Batas waktu 14 hari.`);
                      }}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>Pinjam</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: Tambah / Edit Buku Digital (Admin Only)       */}
      {/* ==================================================== */}
      {(isAddModalOpen || isEditModalOpen) && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  {isEditModalOpen ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isEditModalOpen ? 'Edit Data Buku Digital' : 'Tambah Koleksi Buku Digital'}
                  </h3>
                  <p className="text-xs text-slate-500">Lengkapi metadata dan link file E-Book PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Judul Buku *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman Web & Perangkat Bergerak SMK"
                    value={bookForm.judul}
                    onChange={(e) => setBookForm({ ...bookForm, judul: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengarang / Penulis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dr. Suparman M.Kom"
                    value={bookForm.pengarang}
                    onChange={(e) => setBookForm({ ...bookForm, pengarang: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    placeholder="Contoh: Erlangga / Kemdikbud"
                    value={bookForm.penerbit}
                    onChange={(e) => setBookForm({ ...bookForm, penerbit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Buku</label>
                  <select
                    value={bookForm.kategori}
                    onChange={(e) => setBookForm({ ...bookForm, kategori: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={bookForm.tahun}
                    onChange={(e) => setBookForm({ ...bookForm, tahun: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISBN / Barcode</label>
                  <input
                    type="text"
                    placeholder="978-602-xxx-xxx-x"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Stok Total</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={bookForm.stokTotal}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        stokTotal: Number(e.target.value),
                        stokTersedia: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">URL Dokumen E-Book (PDF)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={bookForm.pdfUrl}
                    onChange={(e) => setBookForm({ ...bookForm, pdfUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-bold text-slate-700">Gambar Cover Buku</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={bookForm.coverUrl || PRESET_COVERS[0]}
                      alt="Preview"
                      className="w-14 h-20 rounded-lg object-cover border border-slate-300 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="url"
                        placeholder="URL Cover Gambar..."
                        value={bookForm.coverUrl}
                        onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Pilihan Cepat:</span>
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBookForm({ ...bookForm, coverUrl: preset })}
                            className={`w-6 h-6 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                              bookForm.coverUrl === preset ? 'border-amber-600 scale-110' : 'border-transparent'
                            }`}
                          >
                            <img src={preset} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Sinopsis / Ringkasan Buku</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan deskripsi ringkas isi buku..."
                    value={bookForm.deskripsi}
                    onChange={(e) => setBookForm({ ...bookForm, deskripsi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditModalOpen ? 'Simpan Perubahan Buku' : 'Tambahkan ke Katalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: Delete Book Confirmation (Admin Only)         */}
      {/* ==================================================== */}
      {isDeleteModalOpen && selectedBookForAction && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Buku dari Perpustakaan?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus buku{' '}
                <strong className="text-slate-800 font-bold">&quot;{selectedBookForAction.judul}&quot;</strong> karya{' '}
                {selectedBookForAction.pengarang}? Tindakan ini akan menghapus buku dari katalog digital.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Ya, Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: Online Book Reader / E-Book Preview Modal     */}
      {/* ==================================================== */}
      {readingBook && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate max-w-md">{readingBook.judul}</h3>
                  <p className="text-[11px] text-slate-300">
                    Penulis: {readingBook.pengarang} • {readingBook.penerbit || 'Kemdikbud'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReadingBook(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Dokumen Digital E-Book PDF Resmi Perpustakaan Sekolah. Tersedia fitur baca online dan unduh berkas.
                </span>
              </div>

              <div className="w-full h-80 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 space-y-3 p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{readingBook.judul}</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Dokumen e-book telah siap dibuka. Klik tombol di bawah untuk membaca di tab baru atau mengunduh file PDF secara langsung.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <a
                    href={readingBook.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> Buka Pembaca PDF Layar Penuh
                  </a>
                  <a
                    href={readingBook.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300" /> Unduh Dokumen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
