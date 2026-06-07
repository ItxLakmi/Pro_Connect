/**
 * Compresses an image File using an off-screen <canvas> and returns a
 * base64 data-URL suitable for storing in the database.
 *
 * @param file        - The original File from an <input type="file">
 * @param maxWidth    - Maximum output width in pixels
 * @param maxHeight   - Maximum output height in pixels
 * @param quality     - JPEG quality 0–1  (default 0.82)
 * @returns           - Compressed base64 data-URL string
 */
export function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        // Compute scaled dimensions while preserving aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));

        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG for photos — much smaller than PNG
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
