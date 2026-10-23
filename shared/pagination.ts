// Which page numbers a pagination bar shows. Every page when there are few;
// otherwise the first, the last, and the current page with one either side,
// with gaps between. The bar stays the same width whichever page is
// current, so Previous and Next don't jump around under the cursor:
//
//   1 2 3 4 5 … 12      1 … 5 6 7 … 12      1 … 8 9 10 11 12

export type PageItem = number | "gap";

const MAX_ITEMS = 7;

export function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= MAX_ITEMS) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  // Near an end, show five pages in a row there instead of a gap
  if (page <= 4) return [1, 2, 3, 4, 5, "gap", pageCount];
  if (page >= pageCount - 3) {
    return [1, "gap", ...Array.from({ length: 5 }, (_, i) => pageCount - 4 + i)];
  }
  return [1, "gap", page - 1, page, page + 1, "gap", pageCount];
}
