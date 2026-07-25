import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_PAGE = "https://wiki.avakot.org/Armour";
const API_URL = "https://wiki.avakot.org/w/api.php";
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";
const CATALOGUE_PATH = resolve("src/data/armor-catalogue.generated.json");
const OUTPUT_PATH = resolve("src/data/armor-images.generated.json");

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

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

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: "text/html",
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Avakot returned ${response.status} for ${url}`);
  }

  return response.text();
};

const extractFileName = (thumbnailUrl) => {
  const path = new URL(thumbnailUrl, SOURCE_PAGE).pathname;
  const match = path.match(/\/thumb\/[^/]+\/[^/]+\/([^/]+)\/\d+px-/);

  if (!match) {
    throw new Error(`Could not identify source file from ${thumbnailUrl}`);
  }

  return decodeURIComponent(match[1]);
};

const scrapeIndex = async () => {
  const html = await fetchText(SOURCE_PAGE);
  const entries = new Map();
  const entryPattern =
    /<span class="tooltipv2" data-tooltip-source="Armour" data-tooltip-name="([^"]+)"[^>]*>[\s\S]*?<a href="([^"]+)" title="title=[^"]*"><img[^>]+src="([^"]+)"/g;

  for (const match of html.matchAll(entryPattern)) {
    const name = decodeHtml(match[1]);
    if (entries.has(name)) {
      continue;
    }

    entries.set(name, {
      name,
      pageUrl: new URL(decodeHtml(match[2]), SOURCE_PAGE).href,
      fileName: extractFileName(decodeHtml(match[3])),
    });
  }

  if (entries.size === 0) {
    throw new Error("No armour entries were found on the Avakot index.");
  }

  return entries;
};

const getSourceRevision = async () => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "revisions",
    rvprop: "ids|timestamp",
    titles: "Armour",
  });

  const response = await fetchJson(url);
  const page = response.query?.pages?.[0];
  const revision = page?.revisions?.[0];

  if (!revision) {
    throw new Error("Could not resolve the Avakot Armour page revision.");
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

const getImageInfo = async (fileNames) => {
  const result = new Map();

  for (let index = 0; index < fileNames.length; index += 50) {
    const batch = fileNames.slice(index, index + 50);
    const url = new URL(API_URL);
    url.search = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "imageinfo",
      iiprop: "url|mime|size|sha1",
      iiurlwidth: "128",
      titles: batch.map((fileName) => `File:${fileName}`).join("|"),
    });

    const response = await fetchJson(url);

    for (const page of response.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      const fileName = page.title?.replace(/^File:/, "");

      if (!fileName || !info) {
        throw new Error(`Missing image metadata for ${page.title ?? "unknown file"}`);
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

const catalogue = JSON.parse(await readFile(CATALOGUE_PATH, "utf8"));
const scrapedEntries = await scrapeIndex();

const missing = catalogue.filter((item) => !scrapedEntries.has(item.name));
const unexpected = [...scrapedEntries.keys()].filter(
  (name) => !catalogue.some((item) => item.name === name),
);

if (missing.length || unexpected.length) {
  throw new Error(
    [
      `Avakot coverage does not match the local catalogue.`,
      `Missing: ${missing.map((item) => item.name).join(", ") || "none"}`,
      `Unexpected: ${unexpected.join(", ") || "none"}`,
    ].join("\n"),
  );
}

const fileNames = [...new Set([...scrapedEntries.values()].map((entry) => entry.fileName))];
const [sourceRevision, imageInfo] = await Promise.all([
  getSourceRevision(),
  getImageInfo(fileNames),
]);

const items = catalogue.map((item) => {
  const scraped = scrapedEntries.get(item.name);
  const image = imageInfo.get(scraped.fileName);

  if (!image) {
    throw new Error(`No original image was resolved for ${item.name}`);
  }

  return {
    itemId: item.id,
    name: item.name,
    slot: item.slot,
    pageUrl: scraped.pageUrl,
    fileName: scraped.fileName,
    ...image,
  };
});

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "The Soulframe Wiki",
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
    missingItems: [],
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Mapped ${items.length}/${catalogue.length} armour images from Avakot revision ${sourceRevision.revisionId}.`,
);
