import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API_URL = "https://wiki.avakot.org/w/api.php";
const SOURCE_PAGE = "https://wiki.avakot.org/Accessories";
const MODULE_PAGE = "Module:Data/Armour";
const CATEGORY = "Category:Talismans";
const OUTPUT_PATH = resolve("src/data/talismans.generated.json");
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";

const statKeys = {
  Courage: ["virtues", "courage"],
  Spirit: ["virtues", "spirit"],
  Grace: ["virtues", "grace"],
  PhysicalDefence: ["defenses", "physicalDefense"],
  MagickDefence: ["defenses", "magickDefense"],
  StabilityIncrease: ["defenses", "stabilityIncrease"],
  Attack: ["attack"],
  Stagger: ["stagger"],
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

const apiUrl = (params) => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  });
  return url;
};

const getCategoryMembers = async () => {
  const response = await fetchJson(
    apiUrl({
      action: "query",
      list: "categorymembers",
      cmtitle: CATEGORY,
      cmlimit: "500",
      cmnamespace: "0",
    }),
  );

  const members = response.query?.categorymembers;
  if (!members?.length) {
    throw new Error("No Talismans were found in Avakot's category index.");
  }

  return members.map((member) => member.title).sort();
};

const getModule = async () => {
  const response = await fetchJson(
    apiUrl({
      action: "parse",
      page: MODULE_PAGE,
      prop: "wikitext",
    }),
  );
  const source = response.parse?.wikitext;

  if (!source) {
    throw new Error("Could not read Avakot's equipment data module.");
  }

  return source;
};

const getSourceRevision = async () => {
  const response = await fetchJson(
    apiUrl({
      action: "query",
      prop: "revisions",
      rvprop: "ids|timestamp",
      titles: MODULE_PAGE,
    }),
  );
  const revision = response.query?.pages?.[0]?.revisions?.[0];

  if (!revision) {
    throw new Error("Could not resolve the Avakot module revision.");
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

const parseStringField = (block, field) =>
  block.match(new RegExp(`${field}\\s*=\\s*"([^"]*)"`))?.[1] ?? "";

const parseStats = (block) => {
  const virtues = { courage: 0, spirit: 0, grace: 0 };
  const defenses = {
    physicalDefense: 0,
    magickDefense: 0,
    stabilityIncrease: 0,
  };
  const result = { virtues, defenses, attack: 0, stagger: 0 };
  const statsBlock = block.match(/Stats\s*=\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";

  for (const [sourceKey, path] of Object.entries(statKeys)) {
    const raw = statsBlock.match(
      new RegExp(`${sourceKey}\\s*=\\s*(\\d+|nil)`),
    )?.[1];
    const value = raw && raw !== "nil" ? Number(raw) : 0;

    if (path.length === 1) {
      result[path[0]] = value;
    } else {
      result[path[0]][path[1]] = value;
    }
  }

  return result;
};

const slugify = (name) =>
  `talisman-${name
    .normalize("NFKD")
    .toLowerCase()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const parseTalismans = (moduleSource, names) => {
  const entries = new Map();
  const entryPattern =
    /^\s*\["([^"]+)"\]\s*=\s*\{([\s\S]*?)(?=^\s*\["|^\})/gm;

  for (const match of moduleSource.matchAll(entryPattern)) {
    if (parseStringField(match[2], "Slot") !== "Talisman") continue;

    const name = match[1];
    entries.set(name, {
      id: slugify(name),
      name,
      description: parseStringField(match[2], "Description"),
      rarity: parseStringField(match[2], "Rarity") || "Unknown",
      accessorySet: parseStringField(match[2], "AccessorySet") || "Unknown",
      armorSet: parseStringField(match[2], "ArmorSet") || "Unknown",
      tags: parseStringField(match[2], "Tags")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageFile: parseStringField(match[2], "ImgPreview"),
      stats: parseStats(match[2]),
      hasUnmodeledConditionalEffect:
        parseStringField(match[2], "Tags") === "Cogah",
    });
  }

  const missing = names.filter((name) => !entries.has(name));
  const unexpected = [...entries.keys()].filter((name) => !names.includes(name));

  if (missing.length || unexpected.length) {
    throw new Error(
      [
        "Avakot Talisman coverage does not match its category index.",
        `Missing: ${missing.join(", ") || "none"}`,
        `Unexpected: ${unexpected.join(", ") || "none"}`,
      ].join("\n"),
    );
  }

  return names.map((name) => entries.get(name));
};

const getImageInfo = async (fileNames) => {
  const result = new Map();

  for (let index = 0; index < fileNames.length; index += 50) {
    const batch = fileNames.slice(index, index + 50);
    const response = await fetchJson(
      apiUrl({
        action: "query",
        prop: "imageinfo",
        iiprop: "url|mime|size|sha1",
        iiurlwidth: "128",
        titles: batch.map((fileName) => `File:${fileName}`).join("|"),
      }),
    );

    for (const page of response.query?.pages ?? []) {
      const fileName = page.title?.replace(/^File:/, "");
      const info = page.imageinfo?.[0];

      if (!fileName || !info) {
        throw new Error(`Missing image metadata for ${page.title}`);
      }

      result.set(fileName, {
        imageUrl: info.url,
        thumbnailUrl: info.thumburl,
        descriptionUrl: info.descriptionurl,
        mimeType: info.mime,
        width: info.width,
        height: info.height,
        thumbnailWidth: info.thumbwidth,
        thumbnailHeight: info.thumbheight,
        bytes: info.size,
        sha1: info.sha1,
      });
    }
  }

  return result;
};

const [names, moduleSource, sourceRevision] = await Promise.all([
  getCategoryMembers(),
  getModule(),
  getSourceRevision(),
]);
const parsedTalismans = parseTalismans(moduleSource, names);
const imageInfo = await getImageInfo([
  ...new Set(parsedTalismans.map((item) => item.imageFile)),
]);
const items = parsedTalismans.map((item) => {
  const image = imageInfo.get(item.imageFile);
  if (!image) throw new Error(`No image metadata was resolved for ${item.name}`);

  return {
    ...item,
    pageUrl: `https://wiki.avakot.org/${encodeURIComponent(
      item.name.replaceAll(" ", "_"),
    )}`,
    ...image,
  };
});

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "The Soulframe Wiki Talisman index and equipment data module",
    publisher: "Avakot",
    pageUrl: SOURCE_PAGE,
    moduleUrl: `https://wiki.avakot.org/${MODULE_PAGE}`,
    categoryUrl: "https://wiki.avakot.org/Category:Talismans",
    apiUrl: API_URL,
    contentLicense: "CC BY-SA 4.0 unless otherwise noted",
    attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
    ...sourceRevision,
  },
  coverage: {
    categoryItems: names.length,
    matchedItems: items.length,
    missingItems: [],
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Imported ${items.length} Talismans from Avakot revision ${sourceRevision.revisionId}.`,
);
