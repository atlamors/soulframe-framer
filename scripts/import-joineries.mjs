import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import {
  arrayValues,
  getImageInfo,
  getModuleRevision,
  getRevision,
  LuaTableParser,
  pageUrl,
  sourceMetadata,
  stripWikiMarkup,
} from "./lib/avakot.mjs";

export const JOINERY_MODULE = "Module:Data/Joineries";
export const JOINERY_OUTPUT_PATH = resolve("src/data/joineries.generated.json");
const parentFields = new Set(["Description", "ImgIcon", "Type"]);
const variantFields = new Set(["Parent", "Tier", "Stats", "Rarity", "DropSource"]);
const archiveFields = new Set(["Description", "ImgIcon", "Type", "Stats", "Tags", "Rarity"]);
const tiers = new Map([["Blessed", ["Common", 1]], ["Twice Blessed", ["Uncommon", 2]], ["Thrice Blessed", ["Rare", 3]]]);
const blessings = new Map([["Mora", "courage"], ["Saphene", "grace"], ["Iridis", "spirit"]]);
const rarities = new Set(["Common", "Uncommon", "Rare"]);
const weaponTypes = new Map([["Short Blade", "Short Blade"], ["Long Blade", "Long Blade"], ["Polearm", "Polearm"], ["Shield", "Shield"], ["Greatsword", "Heavy"], ["Magick", "Magick"], ["Bow", "Bow"], ["Flyblade", "Flyblade"]]);
const approvedParents = new Set(["Verite", "Feybalt", "Quicksilver", "Gildaur"]);
const approvedMatrix = new Map([
  ["Verite", new Set(["Blessed|Mora", "Blessed|Saphene", "Blessed|Iridis", "Twice Blessed|Mora", "Twice Blessed|Saphene", "Twice Blessed|Iridis"])],
  ["Feybalt", new Set(["Blessed|Mora", "Blessed|Saphene", "Blessed|Iridis", "Twice Blessed|Mora", "Twice Blessed|Saphene", "Twice Blessed|Iridis", "Thrice Blessed|Mora", "Thrice Blessed|Saphene", "Thrice Blessed|Iridis"])],
  ["Quicksilver", new Set(["Blessed|Mora", "Blessed|Saphene", "Blessed|Iridis", "Twice Blessed|Mora", "Twice Blessed|Saphene", "Twice Blessed|Iridis", "Thrice Blessed|Mora", "Thrice Blessed|Saphene", "Thrice Blessed|Iridis"])],
  ["Gildaur", new Set(["Blessed|Mora", "Blessed|Saphene", "Blessed|Iridis", "Thrice Blessed|Mora", "Thrice Blessed|Saphene", "Thrice Blessed|Iridis"])],
]);
const fail = (message) => { throw new Error(`Joinery import validation failed: ${message}`); };
const assertString = (value, context) => {
  if (typeof value !== "string" || !value.trim()) fail(`${context} must be a nonempty string`);
  return value;
};
const checkFields = (value, allowed, context) => {
  const unknown = Object.keys(value).filter((field) => !allowed.has(field));
  if (unknown.length) fail(`${context} has unknown discarded fields: ${unknown.join(", ")}`);
};
const listValues = (value, context) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${context} must be a Lua list table`);
  const unknownKeys = Object.keys(value).filter((key) => !/^\d+$/.test(key));
  if (unknownKeys.length) fail(`${context} has non-numeric list keys: ${unknownKeys.join(", ")}`);
  return arrayValues(value);
};
const sourceTypesAndCompatibility = (source, name) => {
  const sourceTypes = listValues(source.Type, `${name} Type`);
  if (!sourceTypes.length || sourceTypes.some((type) => typeof type !== "string" || !type.trim())) fail(`${name} Type must be a nonempty string list`);
  if (sourceTypes.includes("All Weapons")) {
    if (sourceTypes.length !== 1) fail(`${name} All Weapons must not be combined with specific types`);
    return { sourceTypes, compatibility: { scope: "all" } };
  }
  const normalized = sourceTypes.map((type) => weaponTypes.get(type));
  if (normalized.some((type) => !type)) fail(`${name} has unknown source weapon type ${sourceTypes[normalized.findIndex((type) => !type)]}`);
  return { sourceTypes, compatibility: { scope: "types", types: [...new Set(normalized)] } };
};

export const normalizeJoineries = (moduleData, images) => {
  if (!moduleData || typeof moduleData !== "object" || Array.isArray(moduleData)) fail("module root must be a Joinery table");
  const parents = new Map();
  const variants = [];
  const archives = [];
  for (const [name, source] of Object.entries(moduleData)) {
    assertString(name, "Joinery name");
    if (!source || typeof source !== "object" || Array.isArray(source)) fail(`${name} must be a table`);
    if (source.Tags === "Archive") {
      checkFields(source, archiveFields, name);
      assertString(source.Description, `${name} Description`);
      assertString(source.ImgIcon, `${name} ImgIcon`);
      const archiveTypes = listValues(source.Type, `${name} archive Type`);
      if (!archiveTypes.length || archiveTypes.some((type) => typeof type !== "string" || !type.trim())) fail(`${name} archive Type must be a nonempty string list`);
      const archiveStats = listValues(source.Stats, `${name} archive Stats`);
      if (archiveStats.length !== 1) fail(`${name} archive Stats must have exactly one value`);
      assertString(archiveStats[0], `${name} archive Stats value`);
      const archiveRarity = assertString(source.Rarity, `${name} Rarity`);
      if (!rarities.has(archiveRarity)) fail(`${name} has unknown archive Rarity ${archiveRarity}`);
      archives.push(name);
      continue;
    }
    if ("Tags" in source) fail(`${name} has unsupported Tags value`);
    if ("Parent" in source) {
      checkFields(source, variantFields, name);
      variants.push([name, source]);
      continue;
    }
    checkFields(source, parentFields, name);
    const description = stripWikiMarkup(assertString(source.Description, `${name} Description`));
    const iconFile = assertString(source.ImgIcon, `${name} ImgIcon`);
    const icon = images.get(iconFile);
    if (!icon) fail(`${name} active icon ${iconFile} could not be resolved`);
    parents.set(name, { family: name, description, iconFile, icon, parentPageUrl: pageUrl(name), ...sourceTypesAndCompatibility(source, name) });
  }
  const items = variants.map(([name, source]) => {
    checkFields(source, variantFields, name);
    const family = assertString(source.Parent, `${name} Parent`);
    const parent = parents.get(family);
    if (!parent) fail(`${name} has missing or archived parent ${family}`);
    if (approvedParents.has(name)) fail(`expected parent incorrectly equippable: ${name}`);
    const exact = new RegExp(`^${family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: (Blessed|Twice Blessed|Thrice Blessed) by (Mora|Saphene|Iridis)$`).exec(name);
    if (!exact) fail(`${name} does not match the exact active variant name format`);
    const [, namedTier, blessing] = exact;
    const tier = assertString(source.Tier, `${name} Tier`);
    if (tier !== namedTier || !tiers.has(tier)) fail(`${name} has invalid or name-disagreeing Tier ${tier}`);
    const [requiredRarity, pips] = tiers.get(tier);
    const rarity = assertString(source.Rarity, `${name} Rarity`);
    if (rarity !== requiredRarity) fail(`${name} rarity ${rarity} disagrees with tier ${tier}`);
    const stats = listValues(source.Stats, `${name} Stats`);
    if (stats.length !== 1) fail(`${name} Stats must contain exactly one attunement string`);
    const attunementText = assertString(stats[0], `${name} attunement stat`);
    const stat = /^\+(\d+) (Courage|Grace|Spirit) Attunement$/.exec(attunementText);
    if (!stat || Number(stat[1]) !== pips || stat[2].toLowerCase() !== blessings.get(blessing)) fail(`${name} attunement stat disagrees with blessing or tier`);
    if (source.DropSource !== "") fail(`${name} DropSource must be empty pending schema review`);
    return { id: name, name, family, tier, rarity, blessing, virtue: blessings.get(blessing), attunementPips: pips, attunementText, description: parent.description, sourceTypes: parent.sourceTypes, compatibility: parent.compatibility, iconFile: parent.iconFile, icon: parent.icon, parentPageUrl: parent.parentPageUrl };
  });
  if (new Set(items.map((item) => item.name)).size !== items.length) fail("duplicate active Joinery name");
  return { items: items.sort((left, right) => left.name.localeCompare(right.name)), parents: [...parents.keys()].sort(), archives: archives.sort() };
};

export const warningDiff = (previous, next) => {
  const warnings = [];
  if (previous) {
    const oldItems = new Map(previous.items.map((item) => [item.name, item]));
    const newItems = new Map(next.items.map((item) => [item.name, item]));
    for (const name of oldItems.keys()) if (!newItems.has(name)) warnings.push(`removed variant: ${name}`);
    for (const name of newItems.keys()) if (!oldItems.has(name)) warnings.push(`added variant: ${name}`);
    for (const [name, item] of newItems) {
      const old = oldItems.get(name); if (!old) continue;
      for (const field of ["description", "rarity", "attunementText", "iconFile"]) if (old[field] !== item[field]) warnings.push(`${field} changed: ${name}`);
      if (!isDeepStrictEqual(old.icon, item.icon)) warnings.push(`icon metadata changed: ${name}`);
      if (JSON.stringify(old.compatibility) !== JSON.stringify(item.compatibility) || JSON.stringify(old.sourceTypes) !== JSON.stringify(item.sourceTypes)) warnings.push(`compatibility changed: ${name}`);
    }
  }
  if (next.items.length !== 30) warnings.push(`current catalogue count is ${next.items.length}, expected 30`);
  for (const [parent, expected] of approvedMatrix) {
    const actual = new Set(next.items.filter((item) => item.family === parent).map((item) => `${item.tier}|${item.blessing}`));
    const missing = [...expected].filter((pair) => !actual.has(pair));
    const unexpected = [...actual].filter((pair) => !expected.has(pair));
    if (missing.length || unexpected.length) warnings.push(`current matrix changed: ${parent}; missing ${missing.join(", ") || "none"}; unexpected ${unexpected.join(", ") || "none"}`);
  }
  for (const parent of next.parents) if (!approvedParents.has(parent)) warnings.push(`added parent: ${parent}`);
  for (const parent of approvedParents) if (!next.parents.includes(parent)) warnings.push(`removed parent: ${parent}`);
  if (previous && JSON.stringify(previous.archives ?? []) !== JSON.stringify(next.archives ?? [])) warnings.push("archive status changed");
  for (const parent of next.parentPagesNewerThanModule ?? []) warnings.push(`parent page newer than module: ${parent}`);
  return warnings;
};

const readExisting = async () => { try { return JSON.parse(await readFile(JOINERY_OUTPUT_PATH, "utf8")); } catch (error) { if (error?.code === "ENOENT") return null; throw error; } };
export const buildJoineryCatalogue = async () => {
  const revision = await getModuleRevision(JOINERY_MODULE);
  const moduleData = new LuaTableParser(revision.source, { rejectDuplicateKeys: true }).parse();
  const activeIconFiles = Object.values(moduleData).filter((item) => item && typeof item === "object" && item.Tags !== "Archive" && !("Parent" in item)).map((item) => item.ImgIcon);
  const normalized = normalizeJoineries(moduleData, await getImageInfo(activeIconFiles, 192));
  const pageRevisions = await Promise.all(normalized.parents.map(async (parent) => [parent, await getRevision(parent)]));
  const catalogue = { schemaVersion: 1, generatedAt: revision.revisionTimestamp, source: { name: "Avakot Joinery data module", ...sourceMetadata(JOINERY_MODULE, { revisionId: revision.revisionId, revisionTimestamp: revision.revisionTimestamp }) }, ...normalized };
  Object.defineProperty(catalogue, "parentPagesNewerThanModule", { enumerable: false, value: pageRevisions.filter(([, parentRevision]) => parentRevision.revisionTimestamp > revision.revisionTimestamp).map(([parent]) => parent) });
  return catalogue;
};
const writeAtomically = async (contents) => { const temporaryPath = `${JOINERY_OUTPUT_PATH}.${process.pid}.tmp`; await writeFile(temporaryPath, `${JSON.stringify(contents, null, 2)}\n`); await rename(temporaryPath, JOINERY_OUTPUT_PATH); };
export const run = async (mode) => {
  if (!new Set(["audit", "import"]).has(mode)) throw new Error("Expected audit or import mode");
  const [previous, next] = await Promise.all([readExisting(), buildJoineryCatalogue()]);
  const warnings = warningDiff(previous, next); for (const warning of warnings) console.warn(`WARN: ${warning}`);
  if (mode === "import") await writeAtomically(next);
  console.log(`${mode === "audit" ? "Audited" : "Imported"} ${next.items.length} active Joineries from Avakot revision ${next.source.revisionId}.`);
  return { next, warnings };
};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await run(process.argv[2] ?? "import");
