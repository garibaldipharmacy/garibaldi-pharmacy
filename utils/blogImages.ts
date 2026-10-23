// Pictures for blog posts, shrunk in the browser before upload. A phone
// photo is often 4000px and several MB; a post column never shows one wider
// than about 1500 device pixels, so 2000px is plenty and uploads are quick.
// Doing it here means the server needs no image library.

export const BLOG_IMAGE_MAX_SIDE = 2000;
const JPEG_QUALITY = 0.85;
// The server's limit. A huge PNG falls back to JPEG to fit under it
const MAX_BYTES = 10 * 1024 * 1024;

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      type,
      JPEG_QUALITY,
    ),
  );
}

/**
 * The picture scaled to fit 2000px, upright. PNGs stay PNG so screenshots
 * and graphics keep their sharp edges and transparency; everything else
 * becomes JPEG. Rejects when the browser can't read the format, such as
 * HEIC outside Safari
 */
export async function prepareBlogImage(original: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(original);
  } catch {
    throw new Error("This browser can't open that picture. Try a JPEG or PNG.");
  }

  try {
    const scale = Math.min(
      1,
      BLOG_IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let type = original.type === "image/png" ? "image/png" : "image/jpeg";
    let blob = await encode(canvas, type);
    if (blob.size > MAX_BYTES && type === "image/png") {
      type = "image/jpeg";
      blob = await encode(canvas, type);
    }

    const base = original.name.replace(/\.[^.]+$/, "") || "picture";
    const extension = type === "image/png" ? "png" : "jpg";
    return {
      file: new File([blob], `${base}.${extension}`, { type }),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}

/** Shrinks and uploads a picture, returning where it now lives */
export async function uploadBlogImage(
  original: File,
): Promise<{ url: string; width: number; height: number }> {
  const { file, width, height } = await prepareBlogImage(original);
  const body = new FormData();
  body.append("file", file);
  try {
    const { url } = await $fetch<{ url: string }>("/api/admin/media", {
      method: "POST",
      body,
    });
    return { url, width, height };
  } catch (err) {
    throw new Error(
      (err as { statusMessage?: string })?.statusMessage ??
        "The picture didn't upload. Try again.",
    );
  }
}
