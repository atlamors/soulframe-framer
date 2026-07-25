import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { strFromU8, unzipSync } from "fflate";

const SOURCE_ID = "1K-COIPAMp6EDDtZKP06L41WKm1BJV_ipCXLVtlrh8bw";
const SOURCE_URL = `https://docs.google.com/spreadsheets/d/${SOURCE_ID}/edit`;
const workbookPath = resolve(process.argv[2] ?? "data/source/soulframe-armor-scaling.xlsx");
const cataloguePath = resolve("src/data/armor-catalogue.generated.json");
const provenancePath = resolve("src/data/catalogue-provenance.json");
const iconDirectory = resolve("public/icons");

const sheetDefinitions = [
  { archivePath: "xl/worksheets/sheet1.xml", sheet: "Helms", slot: "helm" },
  {
    archivePath: "xl/worksheets/sheet2.xml",
    sheet: "Cuirasses",
    slot: "cuirass",
  },
  {
    archivePath: "xl/worksheets/sheet3.xml",
    sheet: "Leggings",
    slot: "leggings",
  },
];

const iconIdsByZeroBasedRow = new Map([
  [1, "physical-defense"],
  [2, "magick-defense"],
  [3, "stability-increase"],
  [5, "courage"],
  [6, "spirit"],
  [7, "grace"],
]);

function decodeXml(value) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function archiveText(archive, path) {
  const value = archive[path];
  if (!value) throw new Error(`Missing required workbook entry: ${path}`);
  return strFromU8(value);
}

function parseSharedStrings(xml) {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => {
    const fragments = [...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)];
    return decodeXml(fragments.map((fragment) => fragment[1]).join(""));
  });
}

function parseRows(xml, sharedStrings) {
  const rows = new Map();
  for (const rowMatch of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowNumber = Number(rowMatch[1]);
    const cells = new Map();
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const reference = attributes.match(/\br="([A-Z]+)\d+"/)?.[1];
      const rawValue = cellMatch[2].match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (!reference || rawValue === undefined) continue;
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      const value = type === "s" ? sharedStrings[Number(rawValue)] : decodeXml(rawValue);
      cells.set(reference, value);
    }
    rows.set(rowNumber, cells);
  }
  return rows;
}

function parseDefenseCell(value, context) {
  if (typeof value !== "string") {
    throw new Error(`${context}: required defense cell is blank`);
  }
  const match = value.match(/^(\d+)\nC(\d+) · S(\d+) · G(\d+)$/);
  if (!match) {
    throw new Error(`${context}: unexpected defense format "${value}"`);
  }
  return {
    base: Number(match[1]),
    pips: {
      courage: Number(match[2]),
      spirit: Number(match[3]),
      grace: Number(match[4]),
    },
  };
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replaceAll(/['’]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function parseCatalogue(archive) {
  const sharedStrings = parseSharedStrings(
    archiveText(archive, "xl/sharedStrings.xml"),
  );
  const items = [];
  const ids = new Set();

  for (const definition of sheetDefinitions) {
    const rows = parseRows(archiveText(archive, definition.archivePath), sharedStrings);
    if (rows.get(5)?.get("A") !== "Armour piece") {
      throw new Error(`${definition.sheet}: expected "Armour piece" in A5`);
    }

    for (let row = 6; row <= 1000; row += 1) {
      const cells = rows.get(row);
      const name = cells?.get("A");
      if (!name) break;
      const id = `${definition.slot}-${slugify(name)}`;
      if (ids.has(id)) throw new Error(`Duplicate generated item id: ${id}`);
      ids.add(id);
      items.push({
        id,
        name,
        slot: definition.slot,
        defenses: {
          physicalDefense: parseDefenseCell(
            cells.get("B"),
            `${definition.sheet}!B${row}`,
          ),
          magickDefense: parseDefenseCell(
            cells.get("C"),
            `${definition.sheet}!C${row}`,
          ),
          stabilityIncrease: parseDefenseCell(
            cells.get("D"),
            `${definition.sheet}!D${row}`,
          ),
        },
        provenance: {
          status: "verified",
          sourceSheet: definition.sheet,
          sourceRow: row,
        },
      });
    }
  }

  return items;
}

function extractIcons(archive) {
  const drawing = archiveText(archive, "xl/drawings/drawing4.xml");
  const relations = archiveText(
    archive,
    "xl/drawings/_rels/drawing4.xml.rels",
  );
  const relationTargets = new Map(
    [...relations.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="\.\.\/media\/([^"]+)"/g)]
      .map((match) => [match[1], match[2]]),
  );
  const extracted = [];

  for (const anchor of drawing.matchAll(/<xdr:oneCellAnchor>([\s\S]*?)<\/xdr:oneCellAnchor>/g)) {
    const row = Number(anchor[1].match(/<xdr:row>(\d+)<\/xdr:row>/)?.[1]);
    const relationId = anchor[1].match(/r:embed="([^"]+)"/)?.[1];
    const iconId = iconIdsByZeroBasedRow.get(row);
    const mediaName = relationTargets.get(relationId);
    if (!iconId || !mediaName) continue;
    const bytes = archive[`xl/media/${mediaName}`];
    if (!bytes) throw new Error(`Missing icon media: ${mediaName}`);
    const output = resolve(iconDirectory, `${iconId}.png`);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, bytes);
    extracted.push(iconId);
  }

  if (extracted.length !== iconIdsByZeroBasedRow.size) {
    throw new Error(`Expected 6 reference icons, extracted ${extracted.length}`);
  }
  return extracted.sort();
}

const workbookBytes = readFileSync(workbookPath);
const archive = unzipSync(workbookBytes);
const items = parseCatalogue(archive);
const icons = extractIcons(archive);
const checksum = createHash("sha256").update(workbookBytes).digest("hex");

mkdirSync(dirname(cataloguePath), { recursive: true });
writeFileSync(cataloguePath, `${JSON.stringify(items, null, 2)}\n`);
writeFileSync(
  provenancePath,
  `${JSON.stringify(
    {
      sourceId: SOURCE_ID,
      sourceUrl: SOURCE_URL,
      sourceTitle: "Soulframe Armor Scaling",
      workbookSha256: checksum,
      itemCount: items.length,
      icons,
      formula:
        "Base + INT(0.12 × (Courage × C-pips + Spirit × S-pips + Grace × G-pips))",
      notes: [
        "Armor requirements are intentionally excluded by the source workbook.",
        "The application does not depend on Google Sheets at runtime.",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`Imported ${items.length} armor items and ${icons.length} icons.`);
