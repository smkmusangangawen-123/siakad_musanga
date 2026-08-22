import React, { useState } from 'react';
import { X, Camera, Check, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { PhotoUploadField } from './PhotoUploadField';

interface QuickPhotoModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (updatedUser: User) => void;
}

export const QuickPhotoModal: React.FC<QuickPhotoModalProps> = ({
  user,
  isOpen,
  onClose,
  onSavePhoto,
}) => {
  const [avatar, setAvatar] = useState(user.avatar || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePhoto({
      ...user,
      avatar: avatar.trim() || user.avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Unggah & Ubah Foto Profil</h3>
              <p className="text-xs text-slate-300">
                {user.name} • <span className="capitalize">{user.role}</span> {user.nip ? `(${user.nip})` : user.nisn ? `(${user.nisn})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <PhotoUploadField
            currentAvatar={avatar}
            onAvatarChange={setAvatar}
            label={`Foto Profil untuk ${user.name}`}
            roleHint={user.role as any}
          />
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Simpan Foto Baru
          </button>
        </div>
      </div>
    </div>
  );
};
