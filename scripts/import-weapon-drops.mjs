import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API_URL = "https://wiki.avakot.org/w/api.php";
const SOURCE_TITLE = "Module:Data/DropTables";
const SOURCE_PAGE = "https://wiki.avakot.org/Module:Data/DropTables";
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";
const CATALOGUE_PATH = resolve("src/data/weapons.generated.json");
const OUTPUT_PATH = resolve("src/data/weapon-drops.generated.json");

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Avakot API returned ${response.status} for ${url}`);
  }

  return response.json();
};

const getPageSource = async (title) => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "parse",
    format: "json",
    formatversion: "2",
    page: title,
    prop: "wikitext",
  });
  const response = await fetchJson(url);

  if (!response.parse?.wikitext) {
    throw new Error(`Could not read Avakot page ${title}.`);
  }

  return response.parse.wikitext;
};

const getSourceRevision = async () => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "revisions",
    rvprop: "ids|timestamp",
    titles: SOURCE_TITLE,
  });
  const response = await fetchJson(url);
  const revision = response.query?.pages?.[0]?.revisions?.[0];

  if (!revision) {
    throw new Error(`Could not resolve the Avakot revision for ${SOURCE_TITLE}.`);
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

const findMatchingBrace = (source, openingIndex) => {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let inComment = false;

  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (inComment) {
      if (character === "\n") inComment = false;
      continue;
    }
    if (!inString && character === "-" && next === "-") {
      inComment = true;
      index += 1;
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error(`Unmatched brace at offset ${openingIndex}.`);
};

const extractAssignments = (source) => {
  const assignments = [];
  const entryPattern = /^\s*\["([^"]+)"\]\s*=\s*\{/gm;

  for (const match of source.matchAll(entryPattern)) {
    const openingIndex = match.index + match[0].lastIndexOf("{");
    const closingIndex = findMatchingBrace(source, openingIndex);
    assignments.push({
      id: match[1],
      body: source.slice(openingIndex + 1, closingIndex),
    });
  }

  return assignments;
};

const extractNamedTable = (body, field) => {
  const match = new RegExp(`\\b${field}\\s*=\\s*\\{`).exec(body);
  if (!match) return "";
  const openingIndex = match.index + match[0].lastIndexOf("{");
  const closingIndex = findMatchingBrace(body, openingIndex);
  return body.slice(openingIndex + 1, closingIndex);
};

const extractDirectObjects = (tableBody) => {
  const objects = [];

  for (let index = 0; index < tableBody.length; index += 1) {
    if (tableBody[index] !== "{") continue;
    const closingIndex = findMatchingBrace(tableBody, index);
    objects.push(tableBody.slice(index + 1, closingIndex));
    index = closingIndex;
  }

  return objects;
};

const readString = (body, field) => {
  const value = body.match(
    new RegExp(`\\b${field}\\s*=\\s*"((?:\\\\.|[^"])*)"`),
  )?.[1];
  return value?.replaceAll('\\"', '"').replaceAll("\\\\", "\\").trim() || "";
};

const readQuantity = (body) => {
  const raw = body.match(/\bQuantity\s*=\s*(?:"([^"]*)"|([\d.]+))/);
  return raw?.[1]?.trim() || raw?.[2] || "1";
};

const wikiPageUrl = (page) =>
  page.startsWith("http://") || page.startsWith("https://")
    ? page
    : `https://wiki.avakot.org/${encodeURIComponent(
        page.replaceAll(" ", "_"),
      ).replaceAll("%2F", "/")}`;

const catalogue = JSON.parse(await readFile(CATALOGUE_PATH, "utf8"));
const [moduleSource, sourceRevision] = await Promise.all([
  getPageSource(SOURCE_TITLE),
  getSourceRevision(),
]);
const weaponByName = new Map(
  catalogue.items.map((item) => [item.name, item]),
);
const sourcesByItemId = new Map(
  catalogue.items.map((item) => [item.id, []]),
);

for (const table of extractAssignments(moduleSource)) {
  const sourceRows = extractDirectObjects(
    extractNamedTable(table.body, "Sources"),
  )
    .map((body) => ({
      name: readString(body, "Name"),
      link: readString(body, "Link"),
    }))
    .filter((source) => source.name);
  const tags = readString(table.body, "Tags");

  for (const dropBody of extractDirectObjects(
    extractNamedTable(table.body, "Drops"),
  )) {
    const itemName = readString(dropBody, "Name");
    const weapon = weaponByName.get(itemName);
    if (!weapon) continue;

    for (const source of sourceRows) {
      sourcesByItemId.get(weapon.id).push({
        tableId: table.id,
        category: tags,
        sourceName: source.name,
        sourceUrl: wikiPageUrl(source.link || source.name),
        quantity: readQuantity(dropBody),
        fragment: /\bFragment\s*=\s*true\b/.test(dropBody),
        level: readString(dropBody, "Level"),
        note: readString(dropBody, "Note"),
      });
    }
  }
}

const items = catalogue.items.map((item) => ({
  itemId: item.id,
  name: item.name,
  sources: sourcesByItemId.get(item.id),
}));
const sourcedItems = items.filter((item) => item.sources.length > 0);

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "The Soulframe Wiki drop-table data module",
    publisher: "Avakot",
    pageUrl: SOURCE_PAGE,
    apiUrl: API_URL,
    contentLicense: "CC BY-SA 4.0 unless otherwise noted",
    attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
    ...sourceRevision,
  },
  coverage: {
    catalogueItems: catalogue.items.length,
    itemsWithDropSources: sourcedItems.length,
    itemsWithoutDropSources: items.length - sourcedItems.length,
    totalSourceRows: items.reduce(
      (total, item) => total + item.sources.length,
      0,
    ),
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Imported ${output.coverage.totalSourceRows} source rows for ` +
    `${output.coverage.itemsWithDropSources}/${output.coverage.catalogueItems} weapons ` +
    `from Avakot revision ${sourceRevision.revisionId}.`,
);
