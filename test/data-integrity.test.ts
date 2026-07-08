import { describe, expect, it } from "vitest";
import { cells, districts, provinces, sectors, villages } from "../src/data/index.js";

/**
 * These tests validate the DATA, not just the code. They only pass once
 * you've run `npm run generate:data -- <path>` against a real source file.
 * Keep them in CI so a future data refresh can't silently introduce
 * duplicate ids or orphaned parent references.
 */

function idsOf(items: readonly { id: number }[]): Set<number> {
  return new Set(items.map((i) => i.id));
}

describe("data is populated", () => {
  it("has at least one row at every level", () => {
    expect(provinces.length).toBeGreaterThan(0);
    expect(districts.length).toBeGreaterThan(0);
    expect(sectors.length).toBeGreaterThan(0);
    expect(cells.length).toBeGreaterThan(0);
    expect(villages.length).toBeGreaterThan(0);
  });
});

describe("ids are unique within each level", () => {
  it.each([
    ["provinces", provinces],
    ["districts", districts],
    ["sectors", sectors],
    ["cells", cells],
    ["villages", villages],
  ])("%s has no duplicate ids", (_label, items) => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("referential integrity", () => {
  it("every district references a real province", () => {
    const provinceIds = idsOf(provinces);
    for (const d of districts) {
      expect(provinceIds.has(d.provinceId), `district ${d.id} (${d.name})`).toBe(true);
    }
  });

  it("every sector references a real district", () => {
    const districtIds = idsOf(districts);
    for (const s of sectors) {
      expect(districtIds.has(s.districtId), `sector ${s.id} (${s.name})`).toBe(true);
    }
  });

  it("every cell references a real sector", () => {
    const sectorIds = idsOf(sectors);
    for (const c of cells) {
      expect(sectorIds.has(c.sectorId), `cell ${c.id} (${c.name})`).toBe(true);
    }
  });

  it("every village references a real cell", () => {
    const cellIds = idsOf(cells);
    for (const v of villages) {
      expect(cellIds.has(v.cellId), `village ${v.id} (${v.name})`).toBe(true);
    }
  });
});
