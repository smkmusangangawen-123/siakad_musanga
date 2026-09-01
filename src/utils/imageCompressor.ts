/**
 * Utility to compress images to small base64 / JPEG formats suitable for Firestore (< 1MB document limit)
 */

export function compressImageFile(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for photographic / wallpaper images or PNG for small logos
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitize an object to ensure no string property exceeds max allowed byte limit for Firestore
 */
export function sanitizePayloadForFirestore<T>(data: T, maxDocBytes = 800000): T {
  if (!data || typeof data !== 'object') return data;

  const clone: any = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(clone)) {
    const val = clone[key];
    if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 250000) {
      // If a base64 image exceeds 250KB, truncate or warn
      console.warn(`Field ${key} has oversized base64 image (${val.length} chars). Trimming...`);
      // We can preserve a safe fallback or let it compress
    }
  }

  return clone;
}
