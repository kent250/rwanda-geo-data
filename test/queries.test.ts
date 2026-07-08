import { describe, expect, it } from "vitest";
import { districts, provinces, villages } from "../src/data/index.js";
import {
  findProvinceByName,
  getDistricts,
  getLocationPath,
  getProvinceById,
  getProvinces,
  getVillageById,
} from "../src/index.js";

describe("getProvinces", () => {
  it("returns the full province list", () => {
    expect(getProvinces()).toBe(provinces);
  });
});

describe("getProvinceById", () => {
  it("finds an existing province", () => {
    const first = provinces[0];
    if (!first) return; // no data generated yet
    expect(getProvinceById(first.id)).toEqual(first);
  });

  it("returns undefined for an id that doesn't exist", () => {
    expect(getProvinceById(-1)).toBeUndefined();
  });
});

describe("findProvinceByName", () => {
  it("matches case-insensitively and trims whitespace", () => {
    const first = provinces[0];
    if (!first) return;
    expect(findProvinceByName(`  ${first.name.toUpperCase()}  `)).toEqual(first);
  });
});

describe("getDistricts", () => {
  it("filters by provinceId", () => {
    const province = provinces[0];
    if (!province) return;
    const result = getDistricts(province.id);
    expect(result.every((d) => d.provinceId === province.id)).toBe(true);
    expect(result.length).toBe(districts.filter((d) => d.provinceId === province.id).length);
  });

  it("returns an empty array for a province with no districts", () => {
    expect(getDistricts(-1)).toEqual([]);
  });
});

describe("getLocationPath", () => {
  it("resolves a village all the way up to its province", () => {
    const village = villages[0];
    if (!village) return;

    const path = getLocationPath(village.id);
    expect(path).toBeDefined();
    expect(path?.village.id).toBe(village.id);
    expect(path?.cell.id).toBe(village.cellId);
    expect(path?.district.id).toBe(path?.sector.districtId);
    expect(path?.province.id).toBe(path?.district.provinceId);
  });

  it("returns undefined for a village id that doesn't exist", () => {
    expect(getLocationPath(-1)).toBeUndefined();
  });
});

describe("getVillageById", () => {
  it("returns undefined for a bad id", () => {
    expect(getVillageById(-1)).toBeUndefined();
  });
});
