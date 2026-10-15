import { describe, expect, it } from "vitest";
import {
  fullQuad,
  isUprightRectangle,
  isUsableQuad,
  pageAspect,
  squareToQuad,
  straightenedSize,
  type Quad,
} from "~/utils/imageTools";

// A page photographed at an angle: the far (top) edge looks shorter
const skewed: Quad = [
  { x: 0.2, y: 0.1 },
  { x: 0.8, y: 0.15 },
  { x: 0.95, y: 0.9 },
  { x: 0.05, y: 0.85 },
];

describe("squareToQuad", () => {
  it("maps each corner of the square onto the matching corner", () => {
    const map = squareToQuad(skewed);
    const corners = [map(0, 0), map(1, 0), map(1, 1), map(0, 1)];
    corners.forEach((point, i) => {
      expect(point.x).toBeCloseTo(skewed[i].x, 10);
      expect(point.y).toBeCloseTo(skewed[i].y, 10);
    });
  });

  it("is a plain stretch for an upright rectangle", () => {
    const rect: Quad = [
      { x: 0.1, y: 0.2 },
      { x: 0.5, y: 0.2 },
      { x: 0.5, y: 0.6 },
      { x: 0.1, y: 0.6 },
    ];
    const centre = squareToQuad(rect)(0.5, 0.5);
    expect(centre.x).toBeCloseTo(0.3, 10);
    expect(centre.y).toBeCloseTo(0.4, 10);
  });

  it("keeps straight lines straight, as a camera does", () => {
    // The square's middle row must land on the line between the mapped ends
    const map = squareToQuad(skewed);
    const a = map(0, 0.5);
    const b = map(1, 0.5);
    const mid = map(0.5, 0.5);
    const cross = (b.x - a.x) * (mid.y - a.y) - (b.y - a.y) * (mid.x - a.x);
    expect(cross).toBeCloseTo(0, 10);
  });
});

describe("quad checks", () => {
  it("treats the starting outline as a plain crop", () => {
    expect(isUprightRectangle(fullQuad())).toBe(true);
    expect(isUprightRectangle(skewed)).toBe(false);
  });

  it("accepts a convex outline and refuses one turned inside out", () => {
    expect(isUsableQuad(skewed)).toBe(true);
    const crossed: Quad = [skewed[0], skewed[2], skewed[1], skewed[3]];
    expect(isUsableQuad(crossed)).toBe(false);
  });

  it("refuses an outline collapsed to a sliver", () => {
    const sliver: Quad = [
      { x: 0.1, y: 0.5 },
      { x: 0.9, y: 0.5 },
      { x: 0.9, y: 0.505 },
      { x: 0.1, y: 0.505 },
    ];
    expect(isUsableQuad(sliver)).toBe(false);
  });

  it("sizes the straightened page from its longer edges", () => {
    const size = straightenedSize([
      { x: 10, y: 0 },
      { x: 90, y: 0 },
      { x: 100, y: 120 },
      { x: 0, y: 120 },
    ]);
    expect(size.width).toBe(100);
    expect(size.height).toBeCloseTo(Math.hypot(10, 120), 10);
  });
});

describe("pageAspect", () => {
  // Photographs a flat page through a pinhole camera, as a phone does: the
  // page is tilted back and turned, then projected onto a 4000 x 3000 photo
  function photograph(pageWidth: number, pageHeight: number): Quad {
    const tilt = (35 * Math.PI) / 180;
    const turn = (20 * Math.PI) / 180;
    const focal = 3000;
    const corners = [
      [-pageWidth / 2, -pageHeight / 2],
      [pageWidth / 2, -pageHeight / 2],
      [pageWidth / 2, pageHeight / 2],
      [-pageWidth / 2, pageHeight / 2],
    ];
    return corners.map(([x0, y0]) => {
      // Tilt about the horizontal axis, then turn about the vertical one
      const y1 = y0 * Math.cos(tilt);
      const z1 = y0 * Math.sin(tilt);
      const x2 = x0 * Math.cos(turn) + z1 * Math.sin(turn);
      const z2 = -x0 * Math.sin(turn) + z1 * Math.cos(turn) + 3;
      return { x: 2000 + (focal * x2) / z2, y: 1500 + (focal * y1) / z2 };
    }) as Quad;
  }

  it("recovers the page's real shape from an angled photo", () => {
    expect(pageAspect(photograph(0.8, 1), 4000, 3000)).toBeCloseTo(0.8, 3);
    expect(pageAspect(photograph(1.586, 1), 4000, 3000)).toBeCloseTo(1.586, 3);
  });

  it("can't tell, and says so, when the page faces the camera squarely", () => {
    const flat: Quad = [
      { x: 1000, y: 500 },
      { x: 3000, y: 500 },
      { x: 3000, y: 2500 },
      { x: 1000, y: 2500 },
    ];
    expect(pageAspect(flat, 4000, 3000)).toBeNull();
  });
});
