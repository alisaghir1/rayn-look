import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RL-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Compress an image file client-side using Canvas API.
 * Resizes to maxDimension and converts to WebP/JPEG at the given quality.
 * Skips SVG and GIF files (returns them as-is).
 */
export async function compressImage(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
    maxSizeMB?: number;
  } = {}
): Promise<File> {
  const { maxDimension = 2400, quality = 0.82, maxSizeMB = 4.5 } = options;

  // Skip non-compressible formats
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // Skip if already small enough
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      const outputType = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compression didn't help, try JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob || jpegBlob.size >= file.size) {
                  resolve(file); // original is already smaller
                  return;
                }
                const ext = 'jpg';
                const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
                resolve(new File([jpegBlob], name, { type: 'image/jpeg' }));
              },
              'image/jpeg',
              quality
            );
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, '.webp');
          resolve(new File([blob], name, { type: outputType }));
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
