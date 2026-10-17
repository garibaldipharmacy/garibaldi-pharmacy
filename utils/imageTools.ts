// Client-side image handling for the prescription upload: shrink phone photos
// before upload, and the rotate, crop, perspective correction and document
// filter behind the photo editor. Browser only, apart from the geometry.

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

/** A point as fractions (0 to 1) of the rotated image's width and height */
export interface Point {
  x: number;
  y: number;
}

/**
 * The page's four corners, in order: top left, top right, bottom right,
 * bottom left. Each moves freely, so a page photographed at an angle can be
 * outlined as it appears and straightened into a rectangle
 */
export type Quad = [Point, Point, Point, Point];

export const fullQuad = (): Quad => [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

/** Whether the corners still form an upright rectangle, i.e. a plain crop */
export function isUprightRectangle([tl, tr, br, bl]: Quad): boolean {
  const close = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  return close(tl.y, tr.y) && close(bl.y, br.y) && close(tl.x, bl.x) && close(tr.x, br.x);
}

/**
 * Whether four corners make a usable outline: convex, wound the same way as
 * the image (clockwise on screen), and not collapsed to a sliver. A corner
 * dragged past its neighbours would otherwise turn the page inside out
 */
export function isUsableQuad(quad: Quad, minArea = 0.01): boolean {
  let area = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const c = quad[(i + 2) % 4];
    const turn = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (turn <= 0) return false;
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2 >= minArea;
}

/**
 * The projective transform taking the unit square onto a quad: (0,0) to the
 * first corner, (1,0) to the second, (1,1) to the third, (0,1) to the
 * fourth (Heckbert's square-to-quad). Returns a function mapping a point in
 * the square to the matching point in the quad
 */
export function squareToQuad(
  [p0, p1, p2, p3]: Quad,
): (u: number, v: number) => Point {
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;

  let g = 0;
  let h = 0;
  if (dx3 !== 0 || dy3 !== 0) {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det;
    h = (dx1 * dy3 - dx3 * dy1) / det;
  }
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;

  return (u, v) => {
    const w = g * u + h * v + 1;
    return { x: (a * u + b * v + p0.x) / w, y: (d * u + e * v + p0.y) / w };
  };
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

type Vec3 = [number, number, number];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The true width-to-height ratio of a rectangular page photographed at an
 * angle, from its corners in pixels and the photo's size. The far edge of a
 * tilted page looks shorter than it is, so its edges alone give the wrong
 * shape; this recovers the camera's focal length from the perspective and
 * undoes it (Zhang & He, "Whiteboard scanning and image enhancement", 2007).
 * Assumes the lens centre is the photo's centre, as it is for phone cameras.
 * Null when the outline has too little perspective to tell, or doesn't fit a
 * real camera
 */
export function pageAspect(
  [tl, tr, br, bl]: Quad,
  imageWidth: number,
  imageHeight: number,
): number | null {
  const cx = imageWidth / 2;
  const cy = imageHeight / 2;
  const h = (p: Point): Vec3 => [p.x - cx, p.y - cy, 1];
  const m1 = h(tl);
  const m2 = h(tr);
  const m3 = h(bl);
  const m4 = h(br);

  const k2 = dot3(cross3(m1, m4), m3) / dot3(cross3(m2, m4), m3);
  const k3 = dot3(cross3(m1, m4), m2) / dot3(cross3(m3, m4), m2);
  const n2: Vec3 = [k2 * m2[0] - m1[0], k2 * m2[1] - m1[1], k2 * m2[2] - m1[2]];
  const n3: Vec3 = [k3 * m3[0] - m1[0], k3 * m3[1] - m1[1], k3 * m3[2] - m1[2]];
  if (![k2, k3, ...n2, ...n3].every(Number.isFinite)) return null;

  // Opposite edges (nearly) parallel: no perspective to correct
  const scale = Math.max(imageWidth, imageHeight);
  if (Math.abs(n2[2] * n3[2]) * scale * scale < 1e-6 * Math.abs(dot3(n2, n3) || 1)) {
    return null;
  }

  const f2 = -(n2[0] * n3[0] + n2[1] * n3[1]) / (n2[2] * n3[2]);
  if (!(f2 > 0)) return null;
  const ratio = Math.sqrt(
    (n2[0] ** 2 + n2[1] ** 2 + f2 * n2[2] ** 2) /
      (n3[0] ** 2 + n3[1] ** 2 + f2 * n3[2] ** 2),
  );
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}

/**
 * The size of the straightened page in pixels: each side as long as the
 * longer of the two matching edges, so no detail is squeezed
 */
export function straightenedSize([tl, tr, br, bl]: Quad): {
  width: number;
  height: number;
} {
  return {
    width: Math.max(distance(tl, tr), distance(bl, br)),
    height: Math.max(distance(tl, bl), distance(tr, br)),
  };
}

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
 * The page as it will be uploaded, before any filter: the working copy
 * rotated, the outlined page cut out (straightened if its corners are
 * skewed) and scaled to the upload size
 */
export function renderPage(
  working: HTMLCanvasElement,
  edit: { rotation: Rotation; quad: Quad },
): HTMLCanvasElement {
  return isUprightRectangle(edit.quad)
    ? cropUpright(rotate(working, edit.rotation), edit.quad)
    : straighten(working, edit.rotation, edit.quad);
}

/** A copy of the page with the filter applied, leaving the page untouched */
export function filtered(page: HTMLCanvasElement, filter: Filter): HTMLCanvasElement {
  if (filter === "original") return page;
  const copy = document.createElement("canvas");
  copy.width = page.width;
  copy.height = page.height;
  copy.getContext("2d")!.drawImage(page, 0, 0);
  applyDocumentFilter(copy);
  return copy;
}

/** The final upload: the page, filtered and encoded as JPEG */
export function encodePage(page: HTMLCanvasElement, filter: Filter): Promise<Blob> {
  return toJpeg(filtered(page, filter));
}

/** A plain crop, scaled to the upload size */
function cropUpright(rotated: HTMLCanvasElement, [tl, , br]: Quad): HTMLCanvasElement {
  const sx = Math.round(tl.x * rotated.width);
  const sy = Math.round(tl.y * rotated.height);
  const sw = Math.max(1, Math.round((br.x - tl.x) * rotated.width));
  const sh = Math.max(1, Math.round((br.y - tl.y) * rotated.height));
  const scale = Math.min(1, OUTPUT_MAX_SIDE / Math.max(sw, sh));

  const out = document.createElement("canvas");
  out.width = Math.round(sw * scale);
  out.height = Math.round(sh * scale);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(rotated, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out;
}

/**
 * Maps the outlined page onto a flat rectangle, pixel by pixel. The source is
 * first scaled to about the output's detail, so a 48 MP photo isn't read in
 * full to make a 2560 px page
 */
function straighten(
  working: HTMLCanvasElement,
  rotation: Rotation,
  quad: Quad,
): HTMLCanvasElement {
  const sideways = rotation === 90 || rotation === 270;
  const fullWidth = sideways ? working.height : working.width;
  const fullHeight = sideways ? working.width : working.height;
  const inPixels = (w: number, h: number) =>
    quad.map((p) => ({ x: p.x * w, y: p.y * h })) as Quad;

  const page = straightenedSize(inPixels(fullWidth, fullHeight));
  const sourceScale = Math.min(1, OUTPUT_MAX_SIDE / Math.max(page.width, page.height));
  const source = rotate(
    working,
    rotation,
    Math.max(fullWidth, fullHeight) * sourceScale,
  );
  const corners = inPixels(source.width, source.height);
  const size = straightenedSize(corners);
  // The page's real shape where the perspective allows working it out,
  // keeping the longer measured side's detail
  const aspect = pageAspect(corners, source.width, source.height);
  if (aspect) {
    const longest = Math.max(size.width, size.height);
    size.width = aspect >= 1 ? longest : longest * aspect;
    size.height = aspect >= 1 ? longest / aspect : longest;
  }
  const scale = Math.min(1, OUTPUT_MAX_SIDE / Math.max(size.width, size.height));
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));

  const from = source
    .getContext("2d")!
    .getImageData(0, 0, source.width, source.height);
  const src = from.data;
  const sw = source.width;
  const sh = source.height;

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  const to = ctx.createImageData(width, height);
  const dst = to.data;
  const map = squareToQuad(corners);

  // Bilinear sampling, at pixel centres
  for (let y = 0; y < height; y++) {
    const v = (y + 0.5) / height;
    for (let x = 0; x < width; x++) {
      const p = map((x + 0.5) / width, v);
      const fx = Math.min(sw - 1, Math.max(0, p.x - 0.5));
      const fy = Math.min(sh - 1, Math.max(0, p.y - 0.5));
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const x1 = Math.min(sw - 1, x0 + 1);
      const y1 = Math.min(sh - 1, y0 + 1);
      const ax = fx - x0;
      const ay = fy - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const o = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] + (src[i10 + c] - src[i00 + c]) * ax;
        const bottom = src[i01 + c] + (src[i11 + c] - src[i01 + c]) * ax;
        dst[o + c] = top + (bottom - top) * ay;
      }
      dst[o + 3] = 255;
    }
  }
  ctx.putImageData(to, 0, 0);
  return out;
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
    const blob = await encodePage(
      renderPage(working, { rotation: 0, quad: fullQuad() }),
      "original",
    );
    return {
      optimized: blob.size < file.size ? asJpegFile(blob, file.name) : null,
      editable: true,
    };
  } catch {
    return { optimized: null, editable: false };
  }
}
