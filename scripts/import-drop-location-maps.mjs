import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import sharp from "sharp";

const API_URL = "https://wiki.avakot.org/w/api.php";
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";
const DROP_DATA_PATHS = [
  resolve("src/data/armor-drops.generated.json"),
  resolve("src/data/weapon-drops.generated.json"),
];
const OUTPUT_PATH = resolve("src/data/drop-location-maps.generated.json");
const SOULMAP_VERSION = "P15";
const SOULMAP_DATA_URL = `https://soulmap.avakot.org/${SOULMAP_VERSION}/__data.json`;
const SOULMAP_BUNDLE_URL = `https://soulmap.avakot.org/api/bundle/${SOULMAP_VERSION}`;
const MAP_ASSET_PATH = resolve(
  `public/maps/soulmap-${SOULMAP_VERSION.toLowerCase()}.webp`,
);
const MAP_ASSET_URL = `/maps/soulmap-${SOULMAP_VERSION.toLowerCase()}.webp`;
const MAP_ASSET_SIZE = 2048;
const MARKER_ASSET_DIR = resolve("public/maps/markers");
const CURATED_MARKER_SOURCES = {
  agari:
    "https://static.wikitide.net/soulframewiki/6/64/AgariHealthIcon.png",
  dungeon:
    "https://static.wikitide.net/soulframewiki/7/7b/EntranceMarker.png",
  cogah: "https://static.wikitide.net/soulframewiki/0/0a/Cogah.png",
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

const fetchBytes = async (url) => {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Soulmap returned ${response.status} for ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const titleFromPageUrl = (pageUrl) => {
  const url = new URL(pageUrl);
  return decodeURIComponent(url.pathname.slice(1))
    .replaceAll("_", " ")
    .split("#")[0]
    .trim();
};

const normalizeMapUrl = (mapUrl) => {
  const url = new URL(mapUrl.replaceAll("&amp;", "&"));
  url.pathname = "/";
  return url.toString();
};

const unflatten = (values) => {
  const hydrated = new Map();

  const hydrate = (index) => {
    if (index === -1 || index === -2) return undefined;
    if (index === -3) return Number.NaN;
    if (index === -4) return Number.POSITIVE_INFINITY;
    if (index === -5) return Number.NEGATIVE_INFINITY;
    if (index === -6) return -0;
    if (hydrated.has(index)) return hydrated.get(index);

    const value = values[index];
    if (value === null || typeof value !== "object") return value;
    const result = Array.isArray(value) ? [] : {};
    hydrated.set(index, result);

    if (Array.isArray(value)) {
      for (const item of value) {
        result.push(typeof item === "number" ? hydrate(item) : item);
      }
    } else {
      for (const [key, item] of Object.entries(value)) {
        result[key] = typeof item === "number" ? hydrate(item) : item;
      }
    }

    return result;
  };

  return hydrate(0);
};

const getSoulmapData = async () => {
  const response = await fetchJson(SOULMAP_DATA_URL);
  const pageNode = response.nodes?.find(
    (node) =>
      node.type === "data" &&
      Array.isArray(node.data) &&
      node.data.some(
        (value) =>
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          "locations" in value,
      ),
  );
  if (!pageNode) {
    throw new Error("Could not read Soulmap's public map data.");
  }
  return unflatten(pageNode.data);
};

const normalizedName = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/[-\s]+/g, " ").trim()
    : "";

const sortLocations = (locations) =>
  [...locations].sort((left, right) => {
    const order =
      (left.orderIndex ?? Number.MAX_SAFE_INTEGER) -
      (right.orderIndex ?? Number.MAX_SAFE_INTEGER);
    if (order !== 0) return order;
    const leftName = (
      left.coordinateName ??
      left.locationName ??
      left.markerName ??
      ""
    ).toLowerCase();
    const rightName = (
      right.coordinateName ??
      right.locationName ??
      right.markerName ??
      ""
    ).toLowerCase();
    return leftName.localeCompare(rightName) || left.id.localeCompare(right.id);
  });

const selectIndex = (index, length) => {
  if (length <= 1 || index === null) return 0;
  const normalizedIndex = Math.floor(index);
  if (!Number.isFinite(normalizedIndex) || normalizedIndex <= 1) return 0;
  return Math.min(normalizedIndex - 1, length - 1);
};

const groupByMarker = (locations) => {
  const groups = new Map();
  for (const location of locations) {
    const group = groups.get(location.markerId) ?? [];
    group.push(location);
    groups.set(location.markerId, group);
  }
  return [...groups.values()];
};

const pickGroupedLocation = (locations, index) => {
  if (!locations.length) return null;
  const targetIndex = index === null ? 0 : Math.max(0, Math.floor(index) - 1);
  const groups = groupByMarker(locations)
    .map(sortLocations)
    .sort((left, right) => {
      const leftHasIndex = targetIndex < left.length ? 0 : 1;
      const rightHasIndex = targetIndex < right.length ? 0 : 1;
      if (leftHasIndex !== rightHasIndex) return leftHasIndex - rightHasIndex;
      if (left.length !== right.length) return right.length - left.length;
      const nameOrder = (
        left[0]?.markerName ??
        left[0]?.locationName ??
        ""
      )
        .toLowerCase()
        .localeCompare(
          (right[0]?.markerName ?? right[0]?.locationName ?? "").toLowerCase(),
        );
      return nameOrder || (left[0]?.id ?? "").localeCompare(right[0]?.id ?? "");
    });
  const group = groups[0] ?? [];
  return group[selectIndex(index, group.length)] ?? null;
};

const pickUngroupedLocation = (locations, index) => {
  if (!locations.length) return null;
  const groups = groupByMarker(locations);
  if (groups.length === 1) {
    const group = sortLocations(groups[0]);
    return group[selectIndex(index, group.length)] ?? null;
  }
  const sorted = sortLocations(locations);
  return sorted[selectIndex(index, sorted.length)] ?? null;
};

const resolveSoulmapLocation = (mapUrl, locations) => {
  const url = new URL(mapUrl);
  const query = normalizedName(url.searchParams.get("loc"));
  const rawIndex = Number.parseInt(url.searchParams.get("index") ?? "", 10);
  const index = Number.isFinite(rawIndex) ? rawIndex : null;
  if (!query) return null;

  return (
    pickGroupedLocation(
      locations.filter(
        (location) => normalizedName(location.markerName) === query,
      ),
      index,
    ) ??
    pickUngroupedLocation(
      locations.filter(
        (location) =>
          normalizedName(location.locationName) === query ||
          normalizedName(location.coordinateName) === query,
      ),
      index,
    ) ??
    pickGroupedLocation(
      locations.filter((location) =>
        normalizedName(location.markerName).includes(query),
      ),
      index,
    ) ??
    pickUngroupedLocation(
      locations.filter(
        (location) =>
          normalizedName(location.locationName).includes(query) ||
          normalizedName(location.coordinateName).includes(query),
      ),
      index,
    )
  );
};

const buildBaseMap = async (mapVersion) => {
  const tileCount = Math.sqrt(mapVersion.tilecount);
  if (!Number.isInteger(tileCount)) {
    throw new Error(`Soulmap tile count ${mapVersion.tilecount} is not square.`);
  }
  const tileSize = 512;
  const mapSize = tileCount * tileSize;
  const archive = unzipSync(await fetchBytes(SOULMAP_BUNDLE_URL));
  const tiles = [];

  for (let column = 0; column < tileCount; column += 1) {
    for (let row = 0; row < tileCount; row += 1) {
      const index = column * tileCount + row;
      const tile = archive[`${index}.webp`];
      if (!tile) throw new Error(`Soulmap bundle is missing tile ${index}.`);
      tiles.push({
        input: Buffer.from(tile),
        left: column * tileSize,
        top: (tileCount - row - 1) * tileSize,
      });
    }
  }

  await mkdir(resolve("public/maps"), { recursive: true });
  const fullMap = await sharp({
    create: {
      width: mapSize,
      height: mapSize,
      channels: 3,
      background: "#000000",
    },
  })
    .composite(tiles)
    .webp({ quality: 90 })
    .toBuffer();

  await sharp(fullMap)
    .resize(MAP_ASSET_SIZE, MAP_ASSET_SIZE)
    .webp({ quality: 82, effort: 6 })
    .toFile(MAP_ASSET_PATH);

  return mapSize;
};

const markerFileName = (url) =>
  `${createHash("sha1").update(url).digest("hex").slice(0, 12)}.png`;

const buildMarkerAssets = async (locations) => {
  await mkdir(MARKER_ASSET_DIR, { recursive: true });
  const remoteUrls = [
    ...new Set(
      [
        ...locations.map((location) => location.icon),
        CURATED_MARKER_SOURCES.agari,
        CURATED_MARKER_SOURCES.dungeon,
      ].filter(Boolean),
    ),
  ];
  const assetByRemoteUrl = new Map();

  await Promise.all(
    remoteUrls.map(async (remoteUrl) => {
      const fileName = markerFileName(remoteUrl);
      await writeFile(
        resolve(MARKER_ASSET_DIR, fileName),
        await fetchBytes(remoteUrl),
      );
      assetByRemoteUrl.set(remoteUrl, `/maps/markers/${fileName}`);
    }),
  );

  const cogahBytes = await fetchBytes(CURATED_MARKER_SOURCES.cogah);
  const cogahAssetUrl = "/maps/markers/cogah.webp";
  await sharp(cogahBytes)
    .extract({ left: 512, top: 0, width: 456, height: 456 })
    .resize(128, 128)
    .webp({ quality: 84 })
    .toFile(resolve("public", cogahAssetUrl.slice(1)));

  return {
    assetByRemoteUrl,
    curated: {
      agari: assetByRemoteUrl.get(CURATED_MARKER_SOURCES.agari),
      dungeon: assetByRemoteUrl.get(CURATED_MARKER_SOURCES.dungeon),
      cogah: cogahAssetUrl,
    },
  };
};

const getPageSources = async (titles) => {
  const sources = new Map();

  for (const titlesBatch of chunk(titles, 40)) {
    const response = await fetchJson(
      apiUrl({
        action: "query",
        prop: "revisions",
        rvprop: "content",
        rvslots: "main",
        titles: titlesBatch.join("|"),
      }),
    );

    for (const page of response.query?.pages ?? []) {
      sources.set(
        page.title,
        page.revisions?.[0]?.slots?.main?.content ?? "",
      );
    }
  }

  return sources;
};

const extractMapLocations = (source) => {
  const locations = [];
  const capturedUrls = new Set();
  const filePattern = /\[\[File:([^|\]]+)([\s\S]*?)\]\]/gi;
  const mapUrlPattern =
    /https:\/\/soulmap\.avakot\.org\/[^\s\]|<}"]*/gi;

  for (const match of source.matchAll(filePattern)) {
    const mapUrl = match[0].match(mapUrlPattern)?.[0];
    if (!mapUrl) continue;
    const normalizedMapUrl = normalizeMapUrl(mapUrl);
    capturedUrls.add(normalizedMapUrl);
    locations.push({
      mapUrl: normalizedMapUrl,
      imageFile: match[1].trim(),
    });
  }

  for (const match of source.matchAll(mapUrlPattern)) {
    const mapUrl = normalizeMapUrl(match[0]);
    if (capturedUrls.has(mapUrl)) continue;
    capturedUrls.add(mapUrl);
    locations.push({ mapUrl, imageFile: "" });
  }

  return locations;
};

const getImageInfo = async (fileNames) => {
  const imageInfo = new Map();

  for (const fileBatch of chunk(fileNames, 40)) {
    const response = await fetchJson(
      apiUrl({
        action: "query",
        prop: "imageinfo",
        iiprop: "url|size|mime|sha1",
        iiurlwidth: "720",
        titles: fileBatch.map((fileName) => `File:${fileName}`).join("|"),
      }),
    );

    for (const page of response.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      imageInfo.set(page.title.replace(/^File:/, ""), {
        imageUrl: info.thumburl || info.url,
        width: info.thumbwidth || info.width,
        height: info.thumbheight || info.height,
      });
    }
  }

  return imageInfo;
};

const dropData = await Promise.all(
  DROP_DATA_PATHS.map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);
const sourcePageUrls = [
  ...new Set(
    dropData.flatMap((data) =>
      data.items.flatMap((item) =>
        item.sources.map((source) => source.sourceUrl),
      ),
    ),
  ),
].sort();
const titleByPageUrl = new Map(
  sourcePageUrls.map((pageUrl) => [pageUrl, titleFromPageUrl(pageUrl)]),
);
const pageSources = await getPageSources([...new Set(titleByPageUrl.values())]);
const soulmapData = await getSoulmapData();
const mapSize = await buildBaseMap(soulmapData.mapVersion);
const records = sourcePageUrls.map((sourcePageUrl) => {
  const sourcePageTitle = titleByPageUrl.get(sourcePageUrl);
  return {
    sourcePageUrl,
    sourcePageTitle,
    locations: extractMapLocations(pageSources.get(sourcePageTitle) ?? "").map(
      (location) => ({
        ...location,
        coordinate: resolveSoulmapLocation(
          location.mapUrl,
          soulmapData.locations,
        ),
      }),
    ),
  };
});
const imageFiles = [
  ...new Set(
    records.flatMap((record) =>
      record.locations
        .map((location) => location.imageFile)
        .filter(Boolean),
    ),
  ),
];
const imageInfo = await getImageInfo(imageFiles);
const markerAssets = await buildMarkerAssets(
  records.flatMap((record) =>
    record.locations.map((location) => location.coordinate).filter(Boolean),
  ),
);
const items = records.map((record) => ({
  sourcePageUrl: record.sourcePageUrl,
  sourcePageTitle: record.sourcePageTitle,
  locations: record.locations.map(({ coordinate, ...location }) => ({
    ...location,
    coordinateId: coordinate?.id ?? "",
    coordinateName:
      coordinate?.coordinateName ??
      coordinate?.locationName ??
      coordinate?.markerName ??
      "",
    markerName: coordinate?.markerName ?? "",
    categoryName: coordinate?.category?.categoryName ?? "",
    markerIconUrl:
      coordinate?.markerName === "Dungeon Agari"
        ? markerAssets.curated.dungeon
        : coordinate?.category?.categoryName === "Agari"
          ? markerAssets.curated.agari
          : markerAssets.assetByRemoteUrl.get(coordinate?.icon) ?? "",
    x: coordinate?.x ?? null,
    y: coordinate?.y ?? null,
    xPercent:
      typeof coordinate?.x === "number"
        ? Number(((coordinate.x / mapSize) * 100).toFixed(4))
        : null,
    yPercent:
      typeof coordinate?.y === "number"
        ? Number((((mapSize - coordinate.y) / mapSize) * 100).toFixed(4))
        : null,
    imageUrl: imageInfo.get(location.imageFile)?.imageUrl ?? "",
    width: imageInfo.get(location.imageFile)?.width ?? 0,
    height: imageInfo.get(location.imageFile)?.height ?? 0,
  })),
}));
const mappedItems = items.filter((item) => item.locations.length > 0);

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "Avakot source pages and Soulmap location links",
    publisher: "Avakot",
    apiUrl: API_URL,
    mapUrl: "https://soulmap.avakot.org/",
    mapVersion: soulmapData.mapVersion.version,
    mapHash: soulmapData.mapVersion.webp_hash,
    mapAssetUrl: MAP_ASSET_URL,
    markerAssets: markerAssets.curated,
    mapCoordinateSize: mapSize,
    contentLicense: "CC BY-SA 4.0 unless otherwise noted",
    attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
  },
  coverage: {
    sourcePages: items.length,
    pagesWithMapLocations: mappedItems.length,
    pagesWithoutMapLocations: items.length - mappedItems.length,
    totalMapLocations: mappedItems.reduce(
      (total, item) => total + item.locations.length,
      0,
    ),
    mapLocationsWithImages: mappedItems.reduce(
      (total, item) =>
        total + item.locations.filter((location) => location.imageUrl).length,
      0,
    ),
    mapLocationsWithCoordinates: mappedItems.reduce(
      (total, item) =>
        total +
        item.locations.filter(
          (location) =>
            typeof location.x === "number" && typeof location.y === "number",
        ).length,
      0,
    ),
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Imported ${output.coverage.totalMapLocations} Soulmap locations from ` +
    `${output.coverage.pagesWithMapLocations}/${output.coverage.sourcePages} Avakot source pages.`,
);
