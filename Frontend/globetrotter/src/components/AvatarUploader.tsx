import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Sparkles, Check, Plus } from 'lucide-react';

interface AvatarUploaderProps {
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
}

const PRESET_AVATARS = [
  {
    id: 'hiker',
    name: 'Mountain Explorer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'photographer',
    name: 'Travel Photographer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'wanderer',
    name: 'Solo Nomad',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'backpacker',
    name: 'Globe Adventurer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  },
];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  onAvatarChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onAvatarChange(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div id="avatar-uploader-container" className="flex flex-col items-center gap-2 my-2">
      <div className="relative group">
        <div
          id="avatar-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 flex items-center justify-center ${
            isDragging
              ? 'border-[#5d6d5a] bg-[#e9e9e0] scale-105 shadow-md'
              : avatarUrl
              ? 'border-[#d4a373] bg-[#f5f5f0] shadow-sm hover:border-[#5d6d5a]'
              : 'border-[#d4a373] bg-[#f5f5f0] hover:bg-[#e9e9e0]'
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Plus className="w-8 h-8 text-[#d4a373] stroke-[1.5] group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#2d3436]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-[#fdfcf8] text-xs font-medium backdrop-blur-xs">
            <Upload className="w-4 h-4 mr-1 text-[#fdfcf8]" />
            <span>{avatarUrl ? 'Change' : 'Upload'}</span>
          </div>
        </div>

        {/* Action badge on corner */}
        {avatarUrl ? (
          <button
            id="btn-remove-avatar"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAvatarChange(null);
            }}
            className="absolute -bottom-1 right-1 bg-white text-rose-600 border border-[#e0e0d5] rounded-full p-2 shadow-md hover:bg-rose-50 hover:border-rose-300 transition-colors"
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute -bottom-1 right-1 bg-[#d4a373] p-2 rounded-full text-white shadow-lg pointer-events-none">
            <Camera className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <span className="text-[10px] uppercase tracking-widest text-[#d4a373] mt-2 font-semibold">
        Upload Traveler Photo
      </span>

      <input
        ref={fileInputRef}
        id="avatar-file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div className="flex items-center gap-3 mt-1">
        <button
          id="btn-browse-photo"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-[#5d6d5a] hover:text-[#4a5748] font-medium inline-flex items-center gap-1 hover:underline"
        >
          <Upload className="w-3 h-3" />
          Browse file
        </button>
        <span className="text-[#e0e0d5] text-xs">•</span>
        <button
          id="btn-toggle-presets"
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-[#7f8c8d] hover:text-[#2d3436] font-medium inline-flex items-center gap-1 hover:underline"
        >
          <Sparkles className="w-3 h-3 text-[#d4a373]" />
          Choose avatar
        </button>
      </div>

      {showPresets && (
        <div
          id="preset-avatars-panel"
          className="w-full bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-3 mt-1 shadow-sm animate-in fade-in duration-150"
        >
          <p className="text-[10px] uppercase tracking-widest text-[#7f8c8d] font-bold mb-2 text-center">
            Pick a traveler icon
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = avatarUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  id={`preset-avatar-${preset.id}`}
                  type="button"
                  onClick={() => {
                    onAvatarChange(preset.url);
                    setShowPresets(false);
                  }}
                  className={`relative rounded-full aspect-square overflow-hidden border-2 transition-transform hover:scale-105 ${
                    isSelected ? 'border-[#5d6d5a] ring-2 ring-[#5d6d5a]/20' : 'border-[#e0e0d5]'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#5d6d5a]/50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
