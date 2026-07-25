# Data migration note

## Source inspected

- Spreadsheet: `Soulframe Armor Scaling`
- Spreadsheet ID: `1K-COIPAMp6EDDtZKP06L41WKm1BJV_ipCXLVtlrh8bw`
- Tabs: `Helms`, `Cuirasses`, `Leggings`, and `Refs`
- Imported rows begin at row 6 on each armor tab.

The normalized catalogue contains 28 helms, 22 cuirasses, and 22 leggings.

## Field mapping

| Sheet field | Normalized field |
| --- | --- |
| Column A | Armor display name and generated stable ID |
| Column B | Physical Defense base value and C/S/G pips |
| Column C | Magick Defense base value and C/S/G pips |
| Column D | Stability Increase base value and C/S/G pips |
| Tab name | Armor slot |
| Sheet row | Provenance row |

Packed values such as `4\nC3 · S0 · G0` are parsed into a numeric base value
and three independent pip counts. Blank required cells are errors and are not
coerced to zero.

## Formula verified

The `Refs` tab defines the scaling coefficient as `0.12` and documents:

```text
Final Defence =
  Base Defence
  + INT(ArmorScale × (
      Courage × C-pips
      + Spirit × S-pips
      + Grace × G-pips
    ))
```

`INT` is applied to each defense increase before Physical, Magick, and Stability
are totaled. Existing workbook scenario columns were used as fixtures.

## Icon recovery

The six images are floating/anchored workbook drawings rather than cell values.
The importer resolves their drawing relationships and anchor rows:

| Refs anchor | Semantic ID |
| --- | --- |
| B2 | `physical-defense` |
| B3 | `magick-defense` |
| B4 | `stability-increase` |
| B6 | `courage` |
| B7 | `spirit` |
| B8 | `grace` |

They are written as ordinary PNG assets under `public/icons/`.

## Remaining source ambiguities

- The workbook calls the C/S/G values attached to each defense “Attunement
  pips,” but it does not define selectable attunement configurations.
- Courage, Spirit, and Grace are treated as character inputs. The workbook does
  not establish armor virtue contributions.
- Armor requirements are explicitly excluded from the source calculations.
- No item artwork, temper data, joinery data, acquisition data, or non-armor
  gear catalogue is present.

No behavior has been inferred for these systems.
