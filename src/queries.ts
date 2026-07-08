import { cells, districts, provinces, sectors, villages } from "./data/index.js";
import type { Cell, District, LocationPath, Province, Sector, Village } from "./types.js";

/**
 * Indices are built once, lazily, on first use (not at import time) so that
 * importing this module has no upfront cost if the consumer only touches a
 * subset of the API. Villages alone number in the tens of thousands, so
 * every lookup here is backed by a Map rather than a linear .filter() scan.
 */

function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

function indexBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of items) {
    map.set(keyOf(item), item);
  }
  return map;
}

let provincesById: Map<number, Province> | undefined;
let districtsById: Map<number, District> | undefined;
let districtsByProvinceId: Map<number, District[]> | undefined;
let sectorsById: Map<number, Sector> | undefined;
let sectorsByDistrictId: Map<number, Sector[]> | undefined;
let cellsById: Map<number, Cell> | undefined;
let cellsBySectorId: Map<number, Cell[]> | undefined;
let villagesById: Map<number, Village> | undefined;
let villagesByCellId: Map<number, Village[]> | undefined;

function getProvincesById(): Map<number, Province> {
  if (!provincesById) provincesById = indexBy(provinces, (p) => p.id);
  return provincesById;
}
function getDistrictsById(): Map<number, District> {
  if (!districtsById) districtsById = indexBy(districts, (d) => d.id);
  return districtsById;
}
function getDistrictsByProvinceId(): Map<number, District[]> {
  if (!districtsByProvinceId) districtsByProvinceId = groupBy(districts, (d) => d.provinceId);
  return districtsByProvinceId;
}
function getSectorsById(): Map<number, Sector> {
  if (!sectorsById) sectorsById = indexBy(sectors, (s) => s.id);
  return sectorsById;
}
function getSectorsByDistrictId(): Map<number, Sector[]> {
  if (!sectorsByDistrictId) sectorsByDistrictId = groupBy(sectors, (s) => s.districtId);
  return sectorsByDistrictId;
}
function getCellsById(): Map<number, Cell> {
  if (!cellsById) cellsById = indexBy(cells, (c) => c.id);
  return cellsById;
}
function getCellsBySectorId(): Map<number, Cell[]> {
  if (!cellsBySectorId) cellsBySectorId = groupBy(cells, (c) => c.sectorId);
  return cellsBySectorId;
}
function getVillagesById(): Map<number, Village> {
  if (!villagesById) villagesById = indexBy(villages, (v) => v.id);
  return villagesById;
}
function getVillagesByCellId(): Map<number, Village[]> {
  if (!villagesByCellId) villagesByCellId = groupBy(villages, (v) => v.cellId);
  return villagesByCellId;
}

const EMPTY: readonly never[] = Object.freeze([]);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Provinces
// ---------------------------------------------------------------------------

export function getProvinces(): readonly Province[] {
  return provinces;
}

export function getProvinceById(id: number): Province | undefined {
  return getProvincesById().get(id);
}

export function findProvinceByName(name: string): Province | undefined {
  const target = normalize(name);
  return provinces.find((p) => normalize(p.name) === target);
}

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------

export function getDistricts(provinceId?: number): readonly District[] {
  if (provinceId === undefined) return districts;
  return getDistrictsByProvinceId().get(provinceId) ?? EMPTY;
}

export function getDistrictById(id: number): District | undefined {
  return getDistrictsById().get(id);
}

export function findDistrictByName(name: string, provinceId?: number): District | undefined {
  const target = normalize(name);
  const pool = provinceId === undefined ? districts : getDistricts(provinceId);
  return pool.find((d) => normalize(d.name) === target);
}

// ---------------------------------------------------------------------------
// Sectors
// ---------------------------------------------------------------------------

export function getSectors(districtId?: number): readonly Sector[] {
  if (districtId === undefined) return sectors;
  return getSectorsByDistrictId().get(districtId) ?? EMPTY;
}

export function getSectorById(id: number): Sector | undefined {
  return getSectorsById().get(id);
}

export function findSectorByName(name: string, districtId?: number): Sector | undefined {
  const target = normalize(name);
  const pool = districtId === undefined ? sectors : getSectors(districtId);
  return pool.find((s) => normalize(s.name) === target);
}

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

export function getCells(sectorId?: number): readonly Cell[] {
  if (sectorId === undefined) return cells;
  return getCellsBySectorId().get(sectorId) ?? EMPTY;
}

export function getCellById(id: number): Cell | undefined {
  return getCellsById().get(id);
}

export function findCellByName(name: string, sectorId?: number): Cell | undefined {
  const target = normalize(name);
  const pool = sectorId === undefined ? cells : getCells(sectorId);
  return pool.find((c) => normalize(c.name) === target);
}

// ---------------------------------------------------------------------------
// Villages
// ---------------------------------------------------------------------------

export function getVillages(cellId?: number): readonly Village[] {
  if (cellId === undefined) return villages;
  return getVillagesByCellId().get(cellId) ?? EMPTY;
}

export function getVillageById(id: number): Village | undefined {
  return getVillagesById().get(id);
}

export function findVillageByName(name: string, cellId?: number): Village | undefined {
  const target = normalize(name);
  const pool = cellId === undefined ? villages : getVillages(cellId);
  return pool.find((v) => normalize(v.name) === target);
}

// ---------------------------------------------------------------------------
// Cross-level resolution
// ---------------------------------------------------------------------------

/** Resolve a village all the way up to its province in one call. */
export function getLocationPath(villageId: number): LocationPath | undefined {
  const village = getVillageById(villageId);
  if (!village) return undefined;

  const cell = getCellById(village.cellId);
  if (!cell) return undefined;

  const sector = getSectorById(cell.sectorId);
  if (!sector) return undefined;

  const district = getDistrictById(sector.districtId);
  if (!district) return undefined;

  const province = getProvinceById(district.provinceId);
  if (!province) return undefined;

  return { village, cell, sector, district, province };
}
