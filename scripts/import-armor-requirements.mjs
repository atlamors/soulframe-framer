import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API_URL = "https://wiki.avakot.org/w/api.php";
const SOURCE_PAGE = "https://wiki.avakot.org/Module:Data/Armour";
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";
const CATALOGUE_PATH = resolve("src/data/armor-catalogue.generated.json");
const OUTPUT_PATH = resolve("src/data/armor-requirements.generated.json");

const virtueByCode = {
  C: "courage",
  S: "spirit",
  G: "grace",
};

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

const getModuleSource = async () => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "parse",
    format: "json",
    formatversion: "2",
    page: "Module:Data/Armour",
    prop: "wikitext",
  });

  const response = await fetchJson(url);
  if (!response.parse?.wikitext) {
    throw new Error("Could not read Avakot's Armour data module.");
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
    titles: "Module:Data/Armour",
  });

  const response = await fetchJson(url);
  const revision = response.query?.pages?.[0]?.revisions?.[0];

  if (!revision) {
    throw new Error("Could not resolve the Avakot Armour module revision.");
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

const parseRequirements = (moduleSource) => {
  const requirements = new Map();
  const entryPattern =
    /^\s*\["([^"]+)"\]\s*=\s*\{([\s\S]*?)(?=^\s*\["|^\})/gm;

  for (const match of moduleSource.matchAll(entryPattern)) {
    const rawRequirement = match[2].match(
      /VirtueReq\s*=\s*(?:"([^"]*)"|nil)/,
    )?.[1];
    const normalized = rawRequirement?.trim();

    if (!normalized) {
      requirements.set(match[1], null);
      continue;
    }

    const requirementMatch = normalized.match(/^(\d+)\s+([CSG])$/);
    if (!requirementMatch) {
      throw new Error(
        `Unsupported requirement "${normalized}" for ${match[1]}.`,
      );
    }

    requirements.set(match[1], {
      virtue: virtueByCode[requirementMatch[2]],
      value: Number(requirementMatch[1]),
    });
  }

  return requirements;
};

const catalogue = JSON.parse(await readFile(CATALOGUE_PATH, "utf8"));
const [moduleSource, sourceRevision] = await Promise.all([
  getModuleSource(),
  getSourceRevision(),
]);
const requirements = parseRequirements(moduleSource);
const missing = catalogue.filter((item) => !requirements.has(item.name));

if (missing.length) {
  throw new Error(
    `Avakot is missing requirements data for: ${missing
      .map((item) => item.name)
      .join(", ")}`,
  );
}

const items = catalogue.map((item) => ({
  itemId: item.id,
  name: item.name,
  slot: item.slot,
  requirement: requirements.get(item.name),
}));
const withRequirement = items.filter((item) => item.requirement !== null).length;

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "The Soulframe Wiki Armour data module",
    publisher: "Avakot",
    pageUrl: SOURCE_PAGE,
    apiUrl: API_URL,
    contentLicense: "CC BY-SA 4.0 unless otherwise noted",
    attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
    ...sourceRevision,
  },
  coverage: {
    catalogueItems: catalogue.length,
    matchedItems: items.length,
    itemsWithRequirement: withRequirement,
    itemsWithoutRequirement: items.length - withRequirement,
    missingItems: [],
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Mapped requirements for ${items.length}/${catalogue.length} armour items from Avakot revision ${sourceRevision.revisionId}.`,
);
