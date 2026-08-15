import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getImageInfo,
  getModuleRevision,
  LuaTableParser,
  pageUrl,
  sourceMetadata,
} from "./lib/avakot.mjs";

export const TEMPER_MODULE = "Module:Data/Tempers";
export const TEMPER_OUTPUT_PATH = resolve("src/data/tempers.generated.json");
export const TEMPER_ORIGINS = new Set([
  "Universal",
  "Cassid",
  "Dendrit",
  "Feykin",
  "Mendicant",
  "Ode'n",
]);
export const TEMPER_COMPATIBILITIES = new Set([
  "All Weapons",
  "Melee",
  "Bow",
  "Magick",
]);
export const TEMPER_CONFIDENCE = new Set([
  "confirmed",
  "unknown",
  "partial",
  "approximate",
  "assumed",
]);

const itemFields = new Set([
  "InternalID",
  "Description",
  "Icon",
  "Origin",
  "Weapon",
  "Stats",
]);
const statFields = new Set(["Effect", "Ranks", "EffectID", "Confidence", "Notes"]);

const fail = (message) => {
  throw new Error(`Temper import validation failed: ${message}`);
};

const assertString = (value, context) => {
  if (typeof value !== "string" || !value.trim()) fail(`${context} must be a nonempty string`);
  return value;
};

const numericValues = (value) =>
  value && typeof value === "object"
    ? Object.entries(value)
        .filter(([key]) => /^\d+$/.test(key))
        .sort(([left], [right]) => Number(left) - Number(right))
        .map(([, item]) => item)
    : [];

export const provenanceByTemperName = (source) => {
  const result = new Map();
  const pattern =
    /^\s*\["([^"]+)"\]\s*=\s*\{\s*\n\s*--\s+(.+?)\s+pageid\s+(\d+)\s+revision\s+(\d+)\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    const [, name, commentName, pageId, revisionId] = match;
    if (name !== commentName) fail(`provenance comment name does not match entry ${name}`);
    if (result.has(name)) fail(`duplicate provenance comment for ${name}`);
    result.set(name, { pageId: Number(pageId), revisionId: Number(revisionId) });
  }
  return result;
};

export const normalizeTempers = (moduleData, provenance, pageRevisions, images) => {
  if (!moduleData || typeof moduleData !== "object" || Array.isArray(moduleData)) {
    fail("module root must be a Temper table");
  }
  const items = [];
  for (const [name, source] of Object.entries(moduleData)) {
    assertString(name, "Temper name");
    if (!source || typeof source !== "object" || Array.isArray(source)) fail(`${name} must be a table`);
    const unknownFields = Object.keys(source).filter((field) => !itemFields.has(field));
    if (unknownFields.length) fail(`${name} has unknown discarded fields: ${unknownFields.join(", ")}`);
    const sourceProvenance = provenance.get(name);
    if (!sourceProvenance) fail(`${name} has no structured source-page provenance`);
    const pageRevision = pageRevisions.get(name);
    if (!pageRevision || pageRevision.revisionId !== sourceProvenance.revisionId) {
      fail(`${name} source page revision is unavailable or does not match embedded provenance`);
    }
    if (source.InternalID !== null && typeof source.InternalID !== "string") {
      fail(`${name} InternalID must be a string or null`);
    }
    const origin = assertString(source.Origin, `${name} Origin`);
    if (!TEMPER_ORIGINS.has(origin)) fail(`${name} has unknown Origin ${origin}`);
    const compatibility = assertString(source.Weapon, `${name} Weapon`);
    if (!TEMPER_COMPATIBILITIES.has(compatibility)) fail(`${name} has unknown Weapon ${compatibility}`);
    const iconFile = assertString(source.Icon, `${name} Icon`);
    const icon = images.get(iconFile);
    if (!icon) fail(`${name} icon ${iconFile} could not be resolved`);
    if (
      !source.Stats ||
      typeof source.Stats !== "object" ||
      Array.isArray(source.Stats) ||
      Object.keys(source.Stats).some((key) => !/^\d+$/.test(key))
    ) {
      fail(`${name} Stats must contain only numeric row keys`);
    }
    const stats = numericValues(source.Stats).map((stat, index) => {
      if (!stat || typeof stat !== "object" || Array.isArray(stat)) fail(`${name} stats row ${index + 1} must be a table`);
      const unknownFields = Object.keys(stat).filter((field) => !statFields.has(field));
      if (unknownFields.length) fail(`${name} stats row ${index + 1} has unknown discarded fields: ${unknownFields.join(", ")}`);
      const ranksRaw = assertString(stat.Ranks, `${name} stats row ${index + 1} Ranks`);
      const ranks = ranksRaw.split("/");
      if (ranks.length !== 2 || ranks.some((rank) => !rank.trim())) {
        fail(`${name} stats row ${index + 1} Ranks must be exactly one nonempty single/double pair`);
      }
      const confidence = assertString(stat.Confidence, `${name} stats row ${index + 1} Confidence`);
      if (!TEMPER_CONFIDENCE.has(confidence)) fail(`${name} stats row ${index + 1} has invalid confidence ${confidence}`);
      return {
        effectId: assertString(stat.EffectID, `${name} stats row ${index + 1} EffectID`),
        effect: assertString(stat.Effect, `${name} stats row ${index + 1} Effect`),
        stacks: { single: ranks[0], double: ranks[1] },
        ranksRaw,
        confidence,
        notes: assertString(stat.Notes, `${name} stats row ${index + 1} Notes`),
      };
    });
    if (!stats.length) fail(`${name} must contain at least one stats row`);
    if (new Set(stats.map((stat) => stat.effectId)).size !== stats.length) {
      fail(`${name} contains duplicate effectId values`);
    }
    items.push({
      id: name,
      name,
      internalId: source.InternalID,
      description: assertString(source.Description, `${name} Description`),
      iconFile,
      icon,
      origin,
      compatibility,
      stats,
      isPlaceholder: name === "PH AspectCassidParryStaggerName",
      provenance: {
        pageId: sourceProvenance.pageId,
        pageRevisionId: sourceProvenance.revisionId,
        pageRevisionTimestamp: pageRevision.revisionTimestamp,
        pageUrl: pageUrl(name),
      },
    });
  }
  if (new Set(items.map((item) => item.name)).size !== items.length) fail("duplicate Temper name");
  if (!items.some((item) => item.isPlaceholder)) fail("approved placeholder is missing");
  return items.sort((left, right) => left.name.localeCompare(right.name));
};

export const warningDiff = (previous, next) => {
  const warnings = [];
  if (previous) {
    const previousByName = new Map(previous.items.map((item) => [item.name, item]));
    const nextByName = new Map(next.items.map((item) => [item.name, item]));
    const removed = [...previousByName.values()].filter((item) => !nextByName.has(item.name));
    const added = [...nextByName.values()].filter((item) => !previousByName.has(item.name));
    for (const item of removed) warnings.push(`removed catalogue item: ${item.name}`);
    for (const item of added) warnings.push(`added catalogue item: ${item.name}`);
    for (const old of removed) {
      const renamed = added.find((item) => item.provenance.pageId === old.provenance.pageId);
      if (renamed) warnings.push(`renamed catalogue item: ${old.name} -> ${renamed.name}`);
    }
    for (const [name, item] of nextByName) {
      const old = previousByName.get(name);
      if (!old) continue;
      if (old.description !== item.description) warnings.push(`prose drift: ${name}`);
      for (const field of ["origin", "compatibility", "internalId"]) if (old[field] !== item[field]) warnings.push(`${field} changed: ${name}`);
      if (old.isPlaceholder !== item.isPlaceholder) warnings.push(`placeholder changed: ${name}`);
      if (old.icon?.sha1 !== item.icon?.sha1 || old.icon?.width !== item.icon?.width || old.icon?.height !== item.icon?.height) warnings.push(`image hash/dimensions changed: ${name}`);
      const oldStats = new Map(old.stats.map((stat) => [stat.effectId, stat]));
      const nextStats = new Map(item.stats.map((stat) => [stat.effectId, stat]));
      if ([...oldStats.keys()].join("|") !== [...nextStats.keys()].join("|")) warnings.push(`effectId changes: ${name}`);
      for (const [effectId, stat] of nextStats) {
        const oldStat = oldStats.get(effectId);
        if (!oldStat) continue;
        if (
          oldStat.confidence !== stat.confidence ||
          oldStat.ranksRaw !== stat.ranksRaw
        ) warnings.push(`confidence/rank changed: ${name} / ${effectId}`);
        if (oldStat.effect !== stat.effect || oldStat.notes !== stat.notes) {
          warnings.push(`prose drift: ${name} / ${effectId}`);
        }
      }
    }
  }
  for (const item of next.items) {
    for (const stat of item.stats) if (stat.confidence !== "confirmed") warnings.push(`non-confirmed confidence: ${item.name} / ${stat.effectId}`);
    if (item.isPlaceholder) warnings.push(`placeholder: ${item.name}`);
  }
  const effectOwners = new Map();
  for (const item of next.items) for (const stat of item.stats) effectOwners.set(stat.effectId, [...(effectOwners.get(stat.effectId) ?? []), item.name]);
  for (const [effectId, owners] of effectOwners) if (owners.length > 1) warnings.push(`cross-Temper effectId reuse: ${effectId} (${owners.join(", ")})`);
  return warnings;
};

const readExisting = async () => {
  try { return JSON.parse(await readFile(TEMPER_OUTPUT_PATH, "utf8")); } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
};

export const buildTemperCatalogue = async () => {
  const moduleRevision = await getModuleRevision(TEMPER_MODULE);
  const { source } = moduleRevision;
  const moduleData = new LuaTableParser(source, { rejectDuplicateKeys: true }).parse();
  const provenance = provenanceByTemperName(source);
  if (provenance.size !== Object.keys(moduleData).length) fail("every Temper must have exactly one structured provenance comment");
  const names = Object.keys(moduleData);
  const pageRevisionResponse = await fetch(new URL(`https://wiki.avakot.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", action: "query", prop: "revisions", rvprop: "ids|timestamp", titles: names.join("|") })}`), { headers: { accept: "application/json", "user-agent": "Soulframe-Framer/0.1" } });
  if (!pageRevisionResponse.ok) throw new Error(`Avakot API returned ${pageRevisionResponse.status} for Temper source revisions`);
  const pageRevisionData = await pageRevisionResponse.json();
  const pageRevisions = new Map((pageRevisionData.query?.pages ?? []).map((page) => [page.title, page.revisions?.[0] ? { revisionId: page.revisions[0].revid, revisionTimestamp: page.revisions[0].timestamp } : null]));
  const images = await getImageInfo(names.map((name) => moduleData[name].Icon), 192);
  const items = normalizeTempers(moduleData, provenance, pageRevisions, images);
  return {
    schemaVersion: 1,
    generatedAt: moduleRevision.revisionTimestamp,
    source: {
      name: "Avakot Temper data module",
      ...sourceMetadata(TEMPER_MODULE, {
        revisionId: moduleRevision.revisionId,
        revisionTimestamp: moduleRevision.revisionTimestamp,
      }),
    },
    items,
  };
};

const writeAtomically = async (contents) => {
  const temporaryPath = `${TEMPER_OUTPUT_PATH}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(contents, null, 2)}\n`);
  await rename(temporaryPath, TEMPER_OUTPUT_PATH);
};

export const run = async (mode) => {
  if (!new Set(["audit", "import"]).has(mode)) throw new Error("Expected audit or import mode");
  const [previous, next] = await Promise.all([readExisting(), buildTemperCatalogue()]);
  const warnings = warningDiff(previous, next);
  for (const warning of warnings) console.warn(`WARN: ${warning}`);
  const stats = next.items.reduce((count, item) => count + item.stats.length, 0);
  if (mode === "import") await writeAtomically(next);
  console.log(`${mode === "audit" ? "Audited" : "Imported"} ${next.items.length} Tempers and ${stats} stats from Avakot revision ${next.source.revisionId}.`);
  return { next, warnings };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await run(process.argv[2] ?? "import");
}
