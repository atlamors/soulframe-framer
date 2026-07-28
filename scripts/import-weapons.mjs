import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API_URL = "https://wiki.avakot.org/w/api.php";
const SOURCE_PAGE = "https://wiki.avakot.org/Weapons";
const MODULE_PAGE = "Module:Data/Weapons";
const CATEGORY = "Category:Weapons";
const OUTPUT_PATH = resolve("src/data/weapons.generated.json");
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";

// Coiled Dawn is indexed as an upcoming weapon but does not yet have a record
// in Module:Data/Weapons. Preserve it in the full catalogue with the public
// facts available on its page; the module record will take precedence once
// Avakot publishes one.
const supplementalWeapons = {
  "Coiled Dawn": {
    Description:
      "An upcoming Mendicant greatsword: the Ichor-corrupted sword of the Envoy's mother.",
    Slot: "Weapon",
    Rarity: "Unknown",
    Art: "Long Blade",
    DamageType: "Sharp",
    Origin: "Mendicant",
    ReqVirtue: "",
    Attunement: "",
    ImgIcon: "GripTypeLongbladeNoBacker.png",
    Tags: "Upcoming",
    Introduced: "Preludes 16",
    Stats: {},
    dataStatus: "partial",
  },
};

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
    throw new Error("No weapons were found in Avakot's category index.");
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
    throw new Error("Could not read Avakot's weapon data module.");
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
    throw new Error("Could not resolve the Avakot weapon module revision.");
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

class LuaTableParser {
  constructor(source) {
    this.source = source;
    this.index = 0;
  }

  error(message) {
    const context = this.source.slice(
      Math.max(0, this.index - 40),
      this.index + 80,
    );
    throw new Error(`${message} at ${this.index}: ${context}`);
  }

  skipSpace() {
    while (this.index < this.source.length) {
      if (/\s/.test(this.source[this.index])) {
        this.index += 1;
        continue;
      }
      if (this.source.startsWith("--[[", this.index)) {
        const end = this.source.indexOf("]]", this.index + 4);
        this.index = end === -1 ? this.source.length : end + 2;
        continue;
      }
      if (this.source.startsWith("--", this.index)) {
        const end = this.source.indexOf("\n", this.index + 2);
        this.index = end === -1 ? this.source.length : end + 1;
        continue;
      }
      break;
    }
  }

  consume(expected) {
    this.skipSpace();
    if (!this.source.startsWith(expected, this.index)) {
      this.error(`Expected "${expected}"`);
    }
    this.index += expected.length;
  }

  parseString() {
    this.skipSpace();
    const quote = this.source[this.index];
    if (quote !== '"' && quote !== "'") this.error("Expected a string");
    this.index += 1;
    let value = "";

    while (this.index < this.source.length) {
      const character = this.source[this.index++];
      if (character === quote) return value;
      if (character !== "\\") {
        value += character;
        continue;
      }

      const escaped = this.source[this.index++];
      const escapeValues = {
        a: "\x07",
        b: "\b",
        f: "\f",
        n: "\n",
        r: "\r",
        t: "\t",
        v: "\v",
        "\\": "\\",
        '"': '"',
        "'": "'",
      };
      value += escapeValues[escaped] ?? escaped;
    }

    this.error("Unterminated string");
  }

  parseIdentifier() {
    this.skipSpace();
    const match = this.source.slice(this.index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (!match) this.error("Expected an identifier");
    this.index += match[0].length;
    return match[0];
  }

  parseNumber() {
    this.skipSpace();
    const match = this.source
      .slice(this.index)
      .match(/^-?(?:\d+(?:\.\d*)?|\.\d+)/);
    if (!match) this.error("Expected a number");
    this.index += match[0].length;
    return Number(match[0]);
  }

  parseValue() {
    this.skipSpace();
    const character = this.source[this.index];
    if (character === "{") return this.parseTable();
    if (character === '"' || character === "'") return this.parseString();
    if (character === "-" || /\d/.test(character)) return this.parseNumber();

    const identifier = this.parseIdentifier();
    if (identifier === "nil") return null;
    if (identifier === "true") return true;
    if (identifier === "false") return false;
    this.error(`Unsupported Lua value "${identifier}"`);
  }

  parseTable() {
    this.consume("{");
    const result = {};
    let arrayIndex = 1;

    while (true) {
      this.skipSpace();
      if (this.source[this.index] === "}") {
        this.index += 1;
        return result;
      }

      let key;
      let value;
      if (this.source[this.index] === "[") {
        this.index += 1;
        key = this.parseValue();
        this.consume("]");
        this.consume("=");
        value = this.parseValue();
      } else {
        const checkpoint = this.index;
        const identifier = this.parseIdentifier();
        this.skipSpace();
        if (this.source[this.index] === "=") {
          this.index += 1;
          key = identifier;
          value = this.parseValue();
        } else {
          this.index = checkpoint;
          key = arrayIndex++;
          value = this.parseValue();
        }
      }

      result[key] = value;
      this.skipSpace();
      if (this.source[this.index] === "," || this.source[this.index] === ";") {
        this.index += 1;
      }
    }
  }

  parse() {
    this.skipSpace();
    if (this.source.startsWith("return", this.index)) {
      this.index += "return".length;
    }
    const result = this.parseValue();
    this.skipSpace();
    if (this.index !== this.source.length) {
      this.error("Unexpected source after the root table");
    }
    return result;
  }
}

const slugify = (name) =>
  `weapon-${name
    .normalize("NFKD")
    .toLowerCase()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const stripWikiMarkup = (value = "") =>
  value
    .replace(/'''?/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();

const parseVirtues = (value = "") => {
  const virtues = { courage: 0, spirit: 0, grace: 0 };
  for (const match of String(value ?? "").matchAll(/(\d+)\s*([CSG])/g)) {
    virtues[virtueByCode[match[2]]] = Number(match[1]);
  }
  return virtues;
};

const normalizeLevelStats = (stats = {}) =>
  Object.fromEntries(
    Object.entries(stats)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => [
        key.charAt(0).toLowerCase() + key.slice(1),
        value,
      ]),
  );

const normalizeDamageCaps = (caps = {}) =>
  Object.fromEntries(
    Object.entries(caps)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => [
        key.charAt(0).toLowerCase() + key.slice(1),
        value,
      ]),
  );

const parseSmite = (value, percentValue) => {
  const match = value?.match(/^(\d+)\s+in\s+(\d+)$/);
  const percent = Number.parseFloat(percentValue);
  return {
    display: value || "",
    numerator: match ? Number(match[1]) : null,
    denominator: match ? Number(match[2]) : null,
    percent: Number.isFinite(percent) ? percent : null,
  };
};

const normalizeWeapon = (name, source) => {
  const stats = source.Stats ?? {};
  const tags = String(source.Tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: slugify(name),
    name,
    dataStatus: source.dataStatus === "partial" ? "partial" : "verified",
    description: stripWikiMarkup(source.Description),
    slot: source.Slot === "Sidearm" ? "offHand" : "mainHand",
    sourceSlot: source.Slot || "Weapon",
    rarity: source.Rarity || "Unknown",
    combatArt: source.Art || "Unknown",
    damageType: source.DamageType || "Unknown",
    origin: source.Origin || "Unknown",
    requirements: parseVirtues(source.ReqVirtue),
    attunement: parseVirtues(source.Attunement),
    imageFile: source.ImgIcon || "",
    tags,
    isUpcoming: tags.includes("Upcoming"),
    introduced: source.Introduced || "",
    lastUpdated: source.lastUpdated || "",
    sellable: source.Sellable || "",
    stats: {
      smite: parseSmite(stats.Smite, stats.SmitePercent),
      arrowHail:
        typeof stats.ArrowHail === "number" ? stats.ArrowHail : null,
      virtueAttuneCap:
        typeof stats.VirtueAttuneCap === "number"
          ? stats.VirtueAttuneCap
          : null,
      level0: normalizeLevelStats(stats.Lvl0),
      level30: normalizeLevelStats(stats.Lvl30),
      damageCaps: normalizeDamageCaps(stats.DamageCaps),
    },
  };
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
        iiurlwidth: "192",
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
const moduleData = new LuaTableParser(moduleSource).parse();
const parsedItems = Object.entries(moduleData)
  .filter(([, item]) => item.Slot === "Weapon" || item.Slot === "Sidearm")
  .map(([name, item]) => normalizeWeapon(name, item));
for (const [name, item] of Object.entries(supplementalWeapons)) {
  if (!parsedItems.some((weapon) => weapon.name === name)) {
    parsedItems.push(normalizeWeapon(name, item));
  }
}
const itemByName = new Map(parsedItems.map((item) => [item.name, item]));
const missing = names.filter((name) => !itemByName.has(name));
const unexpected = parsedItems
  .map((item) => item.name)
  .filter((name) => !names.includes(name));

if (missing.length || unexpected.length) {
  throw new Error(
    [
      "Avakot weapon coverage does not match its category index.",
      `Missing: ${missing.join(", ") || "none"}`,
      `Unexpected: ${unexpected.join(", ") || "none"}`,
    ].join("\n"),
  );
}

const orderedItems = names.map((name) => itemByName.get(name));
const imageInfo = await getImageInfo([
  ...new Set(orderedItems.map((item) => item.imageFile)),
]);
const items = orderedItems.map((item) => {
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
    name: "The Soulframe Wiki weapon index and data module",
    publisher: "Avakot",
    pageUrl: SOURCE_PAGE,
    moduleUrl: `https://wiki.avakot.org/${MODULE_PAGE}`,
    categoryUrl: "https://wiki.avakot.org/Category:Weapons",
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
  `Imported ${items.length} weapons from Avakot revision ${sourceRevision.revisionId}.`,
);
