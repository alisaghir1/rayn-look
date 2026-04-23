'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, GripVertical } from 'lucide-react';
import { compressImage } from '@/lib/utils';

interface MultiImageSelectorProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
}

export default function MultiImageSelector({
  value,
  onChange,
  folder = 'products',
  label = 'Product Images',
  max = 10,
}: MultiImageSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    // iPhones can deliver HEIC files; surface a clear message instead of a silent fail.
    const isHeic = /heic|heif/i.test(file.type) || /\.heic$|\.heif$/i.test(file.name);
    if (isHeic) {
      setError('HEIC images aren\u2019t supported. In iPhone Settings \u2192 Camera \u2192 Formats, choose "Most Compatible", or convert to JPG.');
      setUploading(false);
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file. Use JPG, PNG, WebP, or GIF.');
      setUploading(false);
      return;
    }

    // Auto-compress large images instead of rejecting them
    let processedFile = file;
    try {
      processedFile = await compressImage(file, { maxDimension: 2400, quality: 0.82 });
    } catch (err) {
      console.error('Image compression failed:', err);
      // If compression fails, continue with original file
    }

    if (processedFile.size > 5 * 1024 * 1024) {
      setError(`Image is ${(processedFile.size / 1024 / 1024).toFixed(1)}MB after compression (max 5MB). Try a smaller photo.`);
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include', // ensure admin_session cookie is sent on mobile
        body: formData,
      });

      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }

      if (!res.ok) {
        console.error('Upload failed:', res.status, text);
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(data.error || `Upload failed (${res.status})`);
        }
        setUploading(false);
        return;
      }

      if (!data.url) {
        setError('Upload succeeded but no URL returned.');
        setUploading(false);
        return;
      }

      onChange([...value.filter(Boolean), data.url]);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error while uploading. Please try again.');
    }
    setUploading(false);
  }, [folder, onChange, value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Upload files one by one
      Array.from(files).forEach((file) => uploadFile(file));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAdd = value.filter(Boolean).length < max;

  return (
    <div>
      {label && <label className="block text-xs text-gray-400 mb-2">{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.filter(Boolean).map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-admin-bg border border-white/10 group">
            <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            {/* Index badge */}
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-medium">{i + 1}</span>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {/* Drag handle */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white/70" />
            </div>
          </div>
        ))}

        {/* Upload Tile */}
        {canAdd && (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`aspect-square rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
              dragOver
                ? 'border-admin-accent bg-admin-accent/10'
                : 'border-white/15 bg-admin-bg hover:border-white/30 hover:bg-white/5'
            } ${uploading ? 'pointer-events-none' : ''}`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-admin-accent animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-400 text-center px-2">Click or drop</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <p className="text-xs text-gray-600 mt-2">{value.filter(Boolean).length}/{max} images • JPG, PNG, WebP, GIF • Auto-compressed</p>
    </div>
  );
}
