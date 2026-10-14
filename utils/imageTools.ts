// Client-side image handling for the prescription upload: shrink phone photos
// before upload, and the rotate, crop and document filter behind the photo
// editor. Browser only.

/** Longest side of an uploaded image. Plenty for handwriting and small print */
export const OUTPUT_MAX_SIDE = 2560;
/** JPEG quality for uploads: visually lossless for text at this size */
export const OUTPUT_QUALITY = 0.85;
/**
 * Longest side of the copy the editor works on. Large enough that the output
 * keeps its full detail, small enough to stay under iOS Safari's canvas limit
 * (about 16.7 megapixels), which a 48 MP phone photo would otherwise exceed
 */
const WORKING_MAX_SIDE = 4096;

export type Rotation = 0 | 90 | 180 | 270;
export type Filter = "original" | "document";

/** A crop as fractions (0 to 1) of the rotated image */
export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FULL_CROP: Crop = { x: 0, y: 0, width: 1, height: 1 };

/** Whether the browser can open this file as an image */
export function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Decodes an image, honouring the camera's orientation, into a canvas no
 * larger than the working size. Rejects for formats the browser can't read,
 * such as HEIC outside Safari
 */
export async function loadWorkingCopy(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, WORKING_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close();
  }
}

/** The image turned by a quarter turn multiple, optionally scaled down */
export function rotate(
  source: HTMLCanvasElement,
  rotation: Rotation,
  maxSide = Infinity,
): HTMLCanvasElement {
  const sideways = rotation === 90 || rotation === 270;
  const width = sideways ? source.height : source.width;
  const height = sideways ? source.width : source.height;
  const scale = Math.min(1, maxSide / Math.max(width, height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const w = source.width * scale;
  const h = source.height * scale;
  ctx.drawImage(source, -w / 2, -h / 2, w, h);
  return canvas;
}

/**
 * A "scanned document" look: greyscale, with the levels stretched so the
 * paper goes white and the writing goes dark. The points come from the
 * image's own brightness, so it adapts to dim or yellowish photos
 */
export function applyDocumentFilter(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d")!;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  const histogram = new Uint32Array(256);
  const luminance = new Uint8ClampedArray(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const l = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    luminance[p] = l;
    histogram[l]++;
  }

  const percentile = (fraction: number) => {
    const target = luminance.length * fraction;
    let count = 0;
    for (let v = 0; v < 256; v++) {
      count += histogram[v];
      if (count >= target) return v;
    }
    return 255;
  };

  // Paper is most of a document photo, so a fairly high percentile lands on
  // it; everything at least that bright becomes white
  const black = percentile(0.02);
  const white = Math.max(black + 40, percentile(0.6) - 10);
  const range = white - black;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const stretched = Math.min(1, Math.max(0, (luminance[p] - black) / range));
    // A gentle curve keeps faint pen strokes from washing out
    const v = Math.round(Math.pow(stretched, 1.3) * 255);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(image, 0, 0);
}

/**
 * The final upload: rotate, crop and filter the working copy, then scale it to
 * the upload size and encode it as JPEG
 */
export async function renderEdit(
  working: HTMLCanvasElement,
  edit: { rotation: Rotation; crop: Crop; filter: Filter },
): Promise<Blob> {
  const rotated = rotate(working, edit.rotation);
  const sx = Math.round(edit.crop.x * rotated.width);
  const sy = Math.round(edit.crop.y * rotated.height);
  const sw = Math.max(1, Math.round(edit.crop.width * rotated.width));
  const sh = Math.max(1, Math.round(edit.crop.height * rotated.height));
  const scale = Math.min(1, OUTPUT_MAX_SIDE / Math.max(sw, sh));

  const out = document.createElement("canvas");
  out.width = Math.round(sw * scale);
  out.height = Math.round(sh * scale);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(rotated, sx, sy, sw, sh, 0, 0, out.width, out.height);
  if (edit.filter === "document") applyDocumentFilter(out);

  return toJpeg(out);
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      OUTPUT_QUALITY,
    ),
  );
}

/** A Blob as a File named after the original, with a .jpg extension */
export function asJpegFile(blob: Blob, originalName: string): File {
  const base = originalName.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/**
 * Shrinks a phone photo for upload. `optimized` is null when the browser can't
 * read the image or the result wouldn't be smaller, so the caller keeps the
 * original. `editable` says whether the browser could read it at all, which
 * is what the photo editor needs
 */
export async function optimizeForUpload(
  file: File,
): Promise<{ optimized: File | null; editable: boolean }> {
  if (!isImage(file)) return { optimized: null, editable: false };
  try {
    const working = await loadWorkingCopy(file);
    const blob = await renderEdit(working, {
      rotation: 0,
      crop: FULL_CROP,
      filter: "original",
    });
    return {
      optimized: blob.size < file.size ? asJpegFile(blob, file.name) : null,
      editable: true,
    };
  } catch {
    return { optimized: null, editable: false };
  }
}
