'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

export default function ImageSelector({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  className = '',
  aspectRatio = 'auto',
}: ImageSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    auto: 'min-h-[140px]',
  };

  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file. Use JPG, PNG, WebP, or GIF.');
      setUploading(false);
      return;
    }

    // Auto-compress large images instead of rejecting them
    let processedFile = file;
    try {
      processedFile = await compressImage(file, { maxDimension: 2400, quality: 0.82 });
    } catch {
      // If compression fails, continue with original file
    }

    if (processedFile.size > 5 * 1024 * 1024) {
      setError('File still too large after compression. Try a smaller image.');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      onChange(data.url);
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  }, [folder, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-400 mb-1.5">{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        /* Image Preview */
        <div className={`relative rounded-lg overflow-hidden bg-admin-bg border border-white/10 group ${aspectClasses[aspectRatio]}`}>
          <img
            src={value}
            alt="Selected"
            className="w-full h-full object-cover"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-2 bg-red-500/30 hover:bg-red-500/50 text-white text-xs rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-lg border-2 border-dashed transition-all cursor-pointer ${aspectClasses[aspectRatio]} flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? 'border-admin-accent bg-admin-accent/10'
              : 'border-white/15 bg-admin-bg hover:border-white/30 hover:bg-white/5'
          } ${uploading ? 'pointer-events-none' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
              <span className="text-xs text-gray-400">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  <span className="text-admin-accent font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF, SVG • Auto-compressed</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
