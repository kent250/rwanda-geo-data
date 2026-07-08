/**
 * Rwanda's administrative hierarchy, top to bottom:
 * Province -> District -> Sector -> Cell -> Village
 *
 * Every level below Province carries an explicit foreign key to its
 * direct parent (e.g. a District carries `provinceId`). Lookups are
 * built off these FKs rather than by parsing structure out of the
 * numeric IDs, so the API stays correct even if the ID scheme changes.
 */

export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export interface Sector {
  id: number;
  name: string;
  districtId: number;
}

export interface Cell {
  id: number;
  name: string;
  sectorId: number;
}

export interface Village {
  id: number;
  name: string;
  cellId: number;
}

/** Full resolved chain from a village up to its province. */
export interface LocationPath {
  village: Village;
  cell: Cell;
  sector: Sector;
  district: District;
  province: Province;
}
