import { describe, expect, it } from "vitest";
import { pageItems } from "~~/shared/pagination";

describe("pageItems", () => {
  it("shows every page when there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("puts gaps around the current page in a long list", () => {
    expect(pageItems(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
  });

  it("runs pages together near either end", () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
    expect(pageItems(9, 12)).toEqual([1, "gap", 8, 9, 10, 11, 12]);
    expect(pageItems(12, 12)).toEqual([1, "gap", 8, 9, 10, 11, 12]);
  });

  it("always has the same number of items once there are gaps", () => {
    for (let page = 1; page <= 20; page++) {
      expect(pageItems(page, 20)).toHaveLength(7);
    }
  });

  it("always includes the current page", () => {
    for (let page = 1; page <= 20; page++) {
      expect(pageItems(page, 20)).toContain(page);
    }
  });
});
