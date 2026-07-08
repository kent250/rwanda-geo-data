# rwanda-locations

Typed, zero-dependency data for Rwanda's administrative hierarchy —
**Province → District → Sector → Cell → Village** — with a fast, indexed
query API.

## Why this structure

The data is stored as five flat, normalized arrays (one per level), each
row carrying an explicit foreign key to its parent (e.g. a `District` has
a `provinceId`). This is deliberately **not** mirrored as nested
folders/files per region — at full depth (5 provinces, 30 districts, 416
sectors, ~2,148 cells, ~14,800+ villages) a one-file-per-region layout
would mean tens of thousands of files, which hurts install size, git
performance, and editor responsiveness for no real benefit, since the
data itself doesn't change per query call.

Lookups are backed by `Map`-based indices built once on first use, so
`getVillages(cellId)` is O(1) + result size, not a full-array `.filter()`
every call.

## Installation

```bash
npm install rwanda-locations
```

## Usage

```ts
import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
  getLocationPath,
  findProvinceByName,
} from "rwanda-locations";

getProvinces();
// [{ id: 5, name: "EAST" }, ...]

getDistricts(5);
// all districts where provinceId === 5

findProvinceByName("east");
// case-insensitive match -> { id: 5, name: "EAST" }

getLocationPath(501010101);
// { village, cell, sector, district, province } - full chain in one call
```

### API

| Function | Description |
|---|---|
| `getProvinces()` | All provinces |
| `getProvinceById(id)` | Single province or `undefined` |
| `findProvinceByName(name)` | Case-insensitive name match |
| `getDistricts(provinceId?)` | All districts, or filtered by province |
| `getDistrictById(id)` | Single district or `undefined` |
| `findDistrictByName(name, provinceId?)` | Case-insensitive, optionally scoped |
| `getSectors(districtId?)` | All sectors, or filtered by district |
| `getSectorById(id)` | Single sector or `undefined` |
| `findSectorByName(name, districtId?)` | Case-insensitive, optionally scoped |
| `getCells(sectorId?)` | All cells, or filtered by sector |
| `getCellById(id)` | Single cell or `undefined` |
| `findCellByName(name, sectorId?)` | Case-insensitive, optionally scoped |
| `getVillages(cellId?)` | All villages, or filtered by cell |
| `getVillageById(id)` | Single village or `undefined` |
| `findVillageByName(name, cellId?)` | Case-insensitive, optionally scoped |
| `getLocationPath(villageId)` | Full resolved chain up to province |


## Scripts

```bash
npm run build         # bundle to dist/ (ESM + CJS + .d.ts) via tsup
npm run test          # run the test suite once
npm run test:watch    # watch mode
npm run lint          # check formatting/lint rules (biome)
npm run lint:fix      # auto-fix
npm run generate:data -- <path>   # regenerate src/data/*.ts from raw JSON
```

## Testing notes

`test/data-integrity.test.ts` validates the **data itself** — uniqueness
of ids per level, and that every child's foreign key resolves to a real
parent. Keep this in CI: it's what catches a bad future data refresh
(duplicate ids, orphaned records) before it ships to consumers.

## License

MIT
