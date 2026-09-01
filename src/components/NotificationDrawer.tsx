import React from 'react';
import { X, Bell, MessageSquare, Mail, CheckCircle2, Send, PhoneCall } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  onSendTestNotification?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSendTestNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Notifikasi WhatsApp & Email</h3>
              <p className="text-[11px] text-slate-300">Log Pengiriman Otomatis ke Orang Tua</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Sistem Notifikasi Real-time Aktif</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Setiap kali guru memasukkan nilai baru atau siswa melakukan absensi GPS, notifikasi terkirim otomatis ke WhatsApp & Email orang tua.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Pesan Terkirim ({notifications.length})
            </h4>
            {onSendTestNotification && (
              <button
                onClick={onSendTestNotification}
                className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-bold"
              >
                <Send className="w-3 h-3" /> Test Kirim WA
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.map((ntf) => (
              <div
                key={ntf.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      ntf.channel === 'WhatsApp'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {ntf.channel === 'WhatsApp' ? <MessageSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                    {ntf.channel}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{ntf.waktu}</span>
                </div>

                <p className="font-bold text-slate-900">
                  Kepada: {ntf.penerimaNama} ({ntf.penerimaKontak})
                </p>
                <p className="text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 italic font-mono text-[11px]">
                  "{ntf.pesan}"
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Siswa: {ntf.siswaNama}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Status: {ntf.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-100 border-t text-center text-xs text-slate-500">
          Integrated Gateway API • SMS / WA / Email SMTP
        </div>
      </div>
    </div>
  );
};
