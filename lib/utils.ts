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

  const MAX_BYTES = 5 * 1024 * 1024; // server hard cap

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

      // Iteratively reduce quality until the file is under the server cap.
      // This is important on mobile where camera photos can be 8-15 MB.
      const tryEncode = (type: 'image/webp' | 'image/jpeg', q: number): Promise<Blob | null> =>
        new Promise((res) => canvas.toBlob((b) => res(b), type, q));

      (async () => {
        const ext = (type: string) => (type === 'image/webp' ? 'webp' : 'jpg');

        // Try WebP first, then JPEG, stepping quality down if needed
        for (const type of ['image/webp', 'image/jpeg'] as const) {
          let q = quality;
          for (let i = 0; i < 5; i++) {
            const blob = await tryEncode(type, q);
            if (blob && blob.size <= MAX_BYTES && blob.size < file.size) {
              const name = file.name.replace(/\.[^.]+$/, `.${ext(type)}`);
              resolve(new File([blob], name, { type }));
              return;
            }
            q = Math.max(0.4, q - 0.15);
          }
        }

        // Last resort: return original (upstream will show a size error)
        resolve(file);
      })();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
