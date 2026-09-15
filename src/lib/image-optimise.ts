/**
 * The single place where the Deerva image rule lives: resize, WebP, strip
 * metadata. Every upload in admin goes through this — see
 * docs/standards/07-tech-baseline.md.
 *
 * Runs in the browser on purpose: the server is an edge worker where native
 * image libraries (sharp and friends) are not available.
 */

export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_QUALITY = 0.82;
export const IMAGE_MAX_INPUT_BYTES = 25 * 1024 * 1024;

export type OptimisedImage = {
  blob: Blob;
  width: number;
  height: number;
};

export type OptimiseOptions = {
  /** Longest side of the output, in pixels. */
  maxEdge?: number;
  quality?: number;
};

/** Human readable size, used in the admin UI. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Re-draws the source through a canvas, which drops EXIF and every other
 * embedded metadata block, then encodes WebP.
 */
export async function optimiseImage(
  source: Blob,
  options: OptimiseOptions = {},
): Promise<OptimisedImage> {
  const maxEdge = options.maxEdge ?? IMAGE_MAX_EDGE;
  const quality = options.quality ?? IMAGE_QUALITY;

  if (source.size > IMAGE_MAX_INPUT_BYTES) {
    throw new Error(
      `That file is ${formatBytes(source.size)}. Please pick an image under ${formatBytes(IMAGE_MAX_INPUT_BYTES)}.`,
    );
  }
  if (source.type && !source.type.startsWith("image/")) {
    throw new Error("That file is not an image.");
  }
  if (source.type === "image/svg+xml") {
    throw new Error("Vector files are not supported here. Please upload a photo or a PNG.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    throw new Error("That image could not be read. Try a JPEG, PNG or WebP file.");
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process the image.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("Could not process the image.");

  return { blob, width, height };
}
