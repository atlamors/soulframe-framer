const API_URL = "https://wiki.avakot.org/w/api.php";
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";

export class LuaTableParser {
  constructor(source, { rejectDuplicateKeys = false } = {}) {
    this.source = source;
    this.index = 0;
    this.rejectDuplicateKeys = rejectDuplicateKeys;
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
      } else if (this.source.startsWith("--[[", this.index)) {
        const end = this.source.indexOf("]]", this.index + 4);
        this.index = end === -1 ? this.source.length : end + 2;
      } else if (this.source.startsWith("--", this.index)) {
        const end = this.source.indexOf("\n", this.index + 2);
        this.index = end === -1 ? this.source.length : end + 1;
      } else {
        break;
      }
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
      const escapes = {
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
      value += escapes[escaped] ?? escaped;
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
    // Some Avakot data modules use JSON-style `null` for absent metadata.
    // Preserve that source distinction as JavaScript null rather than failing
    // the entire import.
    if (identifier === "null") return null;
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
        const startsWithIdentifier = /[A-Za-z_]/.test(
          this.source[this.index] ?? "",
        );
        if (startsWithIdentifier) {
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
        } else {
          this.index = checkpoint;
          key = arrayIndex++;
          value = this.parseValue();
        }
      }
      if (
        this.rejectDuplicateKeys &&
        Object.prototype.hasOwnProperty.call(result, key)
      ) {
        this.error(`Duplicate Lua table key "${key}"`);
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

export const apiUrl = (params) => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  });
  return url;
};

export const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Avakot API returned ${response.status} for ${url}`);
  }
  return response.json();
};

export const getModuleSource = async (page) => {
  const response = await fetchJson(
    apiUrl({ action: "parse", page, prop: "wikitext" }),
  );
  if (!response.parse?.wikitext) {
    throw new Error(`Could not read Avakot module ${page}.`);
  }
  return response.parse.wikitext;
};

export const getModule = async (page) =>
  new LuaTableParser(await getModuleSource(page)).parse();

export const moduleRevisionFromResponse = (response, page) => {
  const sourcePage = response.query?.pages?.[0];
  const revision = sourcePage?.revisions?.[0];
  const source = revision?.slots?.main?.content ?? revision?.["*"];
  if (!revision || typeof source !== "string") {
    throw new Error(`Could not read Avakot module revision for ${page}.`);
  }
  return {
    source,
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

export const getModuleRevision = async (page) =>
  moduleRevisionFromResponse(
    await fetchJson(
      apiUrl({
        action: "query",
        prop: "revisions",
        rvprop: "ids|timestamp|content",
        rvslots: "main",
        titles: page,
      }),
    ),
    page,
  );

export const getRevision = async (page) => {
  const response = await fetchJson(
    apiUrl({
      action: "query",
      prop: "revisions",
      rvprop: "ids|timestamp",
      titles: page,
    }),
  );
  const revision = response.query?.pages?.[0]?.revisions?.[0];
  if (!revision) throw new Error(`Could not resolve revision for ${page}.`);
  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

export const getImageInfo = async (fileNames, thumbnailWidth = 192) => {
  const result = new Map();
  const uniqueFiles = [...new Set(fileNames.filter(Boolean))];
  for (let index = 0; index < uniqueFiles.length; index += 50) {
    const batch = uniqueFiles.slice(index, index + 50);
    const response = await fetchJson(
      apiUrl({
        action: "query",
        prop: "imageinfo",
        iiprop: "url|mime|size|sha1",
        iiurlwidth: String(thumbnailWidth),
        titles: batch.map((fileName) => `File:${fileName}`).join("|"),
      }),
    );
    for (const page of response.query?.pages ?? []) {
      const fileName = page.title?.replace(/^File:/, "");
      const info = page.imageinfo?.[0];
      if (!fileName || !info) continue;
      result.set(fileName, {
        imageUrl: info.url,
        thumbnailUrl: info.thumburl ?? info.url,
        descriptionUrl: info.descriptionurl,
        mimeType: info.mime,
        width: info.width,
        height: info.height,
        thumbnailWidth: info.thumbwidth ?? info.width,
        thumbnailHeight: info.thumbheight ?? info.height,
        bytes: info.size,
        sha1: info.sha1,
      });
    }
  }
  return result;
};

export const slugify = (prefix, name) =>
  `${prefix}-${name
    .normalize("NFKD")
    .toLowerCase()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

export const stripWikiMarkup = (value = "") =>
  String(value ?? "")
    .replace(/'''?/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim();

export const arrayValues = (value) =>
  value && typeof value === "object"
    ? Object.entries(value)
        .filter(([key]) => /^\d+$/.test(key))
        .sort(([left], [right]) => Number(left) - Number(right))
        .map(([, item]) => item)
    : [];

export const pageUrl = (name) =>
  `https://wiki.avakot.org/${encodeURIComponent(name.replaceAll(" ", "_"))}`;

export const sourceMetadata = (modulePage, revision) => ({
  publisher: "Avakot",
  moduleUrl: `https://wiki.avakot.org/${modulePage}`,
  apiUrl: API_URL,
  contentLicense: "CC BY-SA 4.0 unless otherwise noted",
  attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
  ...revision,
});
