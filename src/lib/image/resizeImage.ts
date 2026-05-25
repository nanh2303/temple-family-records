/**
 * src/lib/image/resizeImage.ts
 *
 * Client-side image resize utility using the Canvas API.
 * Runs entirely in the browser — no server dependencies required.
 *
 * Resize strategy:
 *  - Maintains original aspect ratio (no distortion).
 *  - Downscales only: if the original is already smaller than maxWidth x maxHeight
 *    the original dimensions are kept.
 *  - Outputs as JPEG to maximise compression.  WebP source images are converted
 *    to JPEG so that the server-side MIME detection in the upload route still works.
 */

export const AVATAR_MAX_WIDTH = 800;
export const AVATAR_MAX_HEIGHT = 800;
export const AVATAR_JPEG_QUALITY = 0.85; // 0–1

/**
 * Resize `file` to fit within `maxWidth` × `maxHeight` while preserving
 * aspect ratio, then re-encode as JPEG at `quality`.
 *
 * Returns a new `File` whose name always ends in `.jpg`.
 */
export async function resizeImageFile(
  file: File,
  maxWidth = AVATAR_MAX_WIDTH,
  maxHeight = AVATAR_MAX_HEIGHT,
  quality = AVATAR_JPEG_QUALITY,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = bitmap;

  // Compute target size — downscale only.
  const scale = Math.min(1, maxWidth / origW, maxHeight / origH);
  const targetW = Math.round(origW * scale);
  const targetH = Math.round(origH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D context not available.");
  }

  // Use high-quality interpolation where supported.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas toBlob returned null."));
      },
      "image/jpeg",
      quality,
    );
  });

  // Rename to .jpg regardless of original extension.
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

/**
 * Create a temporary object-URL for local preview.
 * Call `URL.revokeObjectURL(url)` when the preview is no longer needed.
 */
export function createLocalPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
