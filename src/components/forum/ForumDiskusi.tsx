import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Send,
  Plus,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ForumDiskusi, KomentarForum, User } from '../../types';

interface ForumDiskusiProps {
  currentUser: User;
  forumList: ForumDiskusi[];
  onAddForum: (forum: ForumDiskusi) => void;
  onAddComment: (forumId: string, komentar: KomentarForum) => void;
}

export const ForumDiskusiView: React.FC<ForumDiskusiProps> = ({
  currentUser,
  forumList,
  onAddForum,
  onAddComment,
}) => {
  const [judulThread, setJudulThread] = useState('');
  const [deskripsiThread, setDeskripsiThread] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Matematika Wajib');

  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulThread) return;

    const newForum: ForumDiskusi = {
      id: `frm-${Date.now()}`,
      judul: judulThread,
      deskripsi: deskripsiThread,
      mataPelajaranNama: selectedSubject,
      guruNama: 'Budi Santoso S.Pd',
      penulisNama: currentUser.name,
      penulisRole: currentUser.role,
      penulisAvatar: currentUser.avatar,
      tanggal: new Date().toLocaleString('id-ID'),
      sukaCount: 0,
      komentarList: [],
    };

    onAddForum(newForum);
    setJudulThread('');
    setDeskripsiThread('');
    alert('Topik Diskusi Baru Berhasil Diterbitkan!');
  };

  const handleSendComment = (forumId: string) => {
    const text = commentInputMap[forumId];
    if (!text) return;

    const newKomentar: KomentarForum = {
      id: `km-${Date.now()}`,
      penulisNama: currentUser.name,
      penulisRole: currentUser.role,
      penulisAvatar: currentUser.avatar,
      isiText: text,
      tanggal: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddComment(forumId, newKomentar);
    setCommentInputMap({ ...commentInputMap, [forumId]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
            Ruang Diskusi Interaktif
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" /> Forum Diskusi Pengajar & Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Wadah tanya jawab materi pelajaran, pembahasan latihan soal, dan konsultasi akademik.
          </p>
        </div>
      </div>

      {/* New Thread Form */}
      <form onSubmit={handleCreateThread} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
          <Plus className="w-4 h-4 text-purple-600" /> Buat Topik Pertanyaan / Diskusi Baru
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran Terkait:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Matematika Wajib">Matematika Wajib</option>
              <option value="Fisika Dasar">Fisika Dasar</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Bahasa Inggris">Bahasa Inggris</option>
              <option value="Kimia">Kimia</option>
              <option value="Biologi">Biologi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Topik Pertanyaan:</label>
            <input
              type="text"
              required
              value={judulThread}
              onChange={(e) => setJudulThread(e.target.value)}
              placeholder="Contoh: Cara menentukan determinan matriks 3x3..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pertanyaan / Penjelasan Detail:</label>
          <textarea
            rows={2}
            value={deskripsiThread}
            onChange={(e) => setDeskripsiThread(e.target.value)}
            placeholder="Tuliskan soal atau bagian rumus yang belum dipahami..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> TERBITKAN DISKUSI
        </button>
      </form>

      {/* Forum List */}
      <div className="space-y-4">
        {forumList.map((frm) => (
          <div key={frm.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-3">
                <img src={frm.penulisAvatar} alt={frm.penulisNama} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{frm.penulisNama}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold capitalize ${
                        frm.penulisRole === 'guru'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {frm.penulisRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{frm.tanggal} • Subject: {frm.mataPelajaranNama}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {frm.komentarList.length} Tanggapan
              </span>
            </div>

            {/* Content */}
            <div>
              <h3 className="font-extrabold text-base text-slate-900">{frm.judul}</h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{frm.deskripsi}</p>
            </div>

            {/* Comments Thread */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Tanggapan Diskusi:</h5>

              <div className="space-y-2.5">
                {frm.komentarList.map((km) => (
                  <div
                    key={km.id}
                    className={`p-3 rounded-xl border text-xs ${
                      km.penulisRole === 'guru'
                        ? 'bg-blue-50/80 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{km.penulisNama}</span>
                        {km.penulisRole === 'guru' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> GURU VERIFIED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{km.tanggal}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{km.isiText}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={commentInputMap[frm.id] || ''}
                  onChange={(e) => setCommentInputMap({ ...commentInputMap, [frm.id]: e.target.value })}
                  placeholder="Tulis balasan atau jawaban..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                />
                <button
                  onClick={() => handleSendComment(frm.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Balas
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
