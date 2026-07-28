# Weapon catalogue

The weapon catalogue is generated from The Soulframe Wiki's MediaWiki API.
Run:

```sh
npm run import:weapons
```

The importer reads:

- `Category:Weapons` for the canonical page index.
- `Module:Data/Weapons` for normalized weapon metadata and statistics.
- MediaWiki `imageinfo` for original and 192px image URLs and provenance.

The generated file is `src/data/weapons.generated.json`. The application does
not call Avakot at runtime.

## Coverage

The current import contains all 59 indexed entries:

- 47 main-hand weapons (`Slot = Weapon`)
- 12 off-hand weapons (`Slot = Sidearm`)
- 3 entries marked as upcoming

`Coiled Dawn` is indexed on the wiki but does not yet have a
`Module:Data/Weapons` record. The importer retains its public page metadata as
a `partial` upcoming entry. When Avakot adds the module record, that canonical
record automatically replaces the supplemental one.

## Attribution

The generated JSON records the exact module revision and links back to Avakot.
Wiki content is CC BY-SA 4.0 unless otherwise noted; image-specific licensing
may vary on each file-description page.
