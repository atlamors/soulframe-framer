import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  arrayValues,
  getImageInfo,
  getModule,
  getRevision,
  pageUrl,
  slugify,
  sourceMetadata,
  stripWikiMarkup,
} from "./lib/avakot.mjs";

const MODULES = {
  pacts: "Module:Data/Pacts",
  abilities: "Module:Data/PactAbilities",
  runes: "Module:Data/Runes",
  totems: "Module:Data/Totems",
};

const normalizeVirtue = (value) => {
  const normalized = String(value ?? "").toLowerCase();
  return ["courage", "spirit", "grace"].includes(normalized)
    ? normalized
    : null;
};

const parseRankValues = (value) =>
  String(value ?? "")
    .split(",")
    .filter(Boolean)
    .map((series) =>
      series.split("/").map((entry) => {
        const parsed = Number(entry);
        return Number.isFinite(parsed) ? parsed : null;
      }),
    );

const [pactData, abilityData, runeData, totemData, revisions] =
  await Promise.all([
    getModule(MODULES.pacts),
    getModule(MODULES.abilities),
    getModule(MODULES.runes),
    getModule(MODULES.totems),
    Promise.all(Object.values(MODULES).map(getRevision)),
  ]);

const pactNames = Object.keys(pactData).filter((name) => name !== "Vadagar");
const abilities = Object.entries(abilityData)
  .filter(([, source]) => source.Pact !== "Vadagar")
  .map(([name, source]) => ({
    id: slugify("pact-ability", name),
    name,
    pact: source.Pact || "",
    assignedVirtue: normalizeVirtue(source.AssignedVirtue),
    description: stripWikiMarkup(source.Description),
    effect: stripWikiMarkup(source.Effect),
    iconFile: source.Icon || "",
    imageFile: source.Image || "",
    unlockLevel:
      typeof source.UnlockLevel === "number" ? source.UnlockLevel : null,
    cooldown: typeof source.Cooldown === "number" ? source.Cooldown : null,
    cooldownType: source.CooldownType || "",
    types: Array.isArray(source.Type)
      ? source.Type
      : arrayValues(source.Type).length
        ? arrayValues(source.Type)
        : source.Type
          ? [source.Type]
          : [],
  }));
const abilityByName = new Map(abilities.map((ability) => [ability.name, ability]));

const pacts = pactNames.map((name) => {
  const source = pactData[name];
  const abilityNames = String(source.Abilities ?? "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return {
    id: slugify("pact", name),
    name,
    basePact: name.startsWith("Wyld ") ? name.slice(5) : name,
    variant: name.startsWith("Wyld ") ? "wyld" : "normal",
    description: stripWikiMarkup(source.Description),
    iconFile: source.Icon || "",
    abilityIds: abilityNames
      .map((abilityName) => abilityByName.get(abilityName)?.id)
      .filter(Boolean),
    virtueOrder: String(source.VirtueOrder ?? "")
      .split(";")
      .map((entry) => normalizeVirtue(entry.split(",").at(-1)))
      .filter(Boolean),
    introduced: source.Introduced || "",
    pageUrl: pageUrl(name),
  };
});

const runes = Object.entries(runeData).map(([name, source]) => ({
  id: slugify("rune", name),
  name,
  description: stripWikiMarkup(source.Description),
  functionality: stripWikiMarkup(source.Functionality),
  maxRankDescription: stripWikiMarkup(source.MaxRank),
  weaponArt: source.WeaponArt || "Unknown",
  addedSlot: normalizeVirtue(source.AddedSlot),
  iconFile: source.ImgIcon || "",
  internalId: source.InternalID || "",
  rarity: source.Rarity || "Unknown",
  introduced: source.Introduced || "",
  tags: String(source.Tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  stats: arrayValues(source.Stats).map((stat) => ({
    effect: stripWikiMarkup(stat.Effect),
    ranks: String(stat.Ranks ?? "").split("/"),
  })),
  pageUrl: pageUrl(name),
}));

const totems = Object.entries(totemData).map(([name, source]) => ({
  id: slugify("totem", name),
  name,
  animal: source.Animal || "Unknown",
  enhances: source.Enhances || "Unknown",
  description: stripWikiMarkup(source.description),
  effect: stripWikiMarkup(source.bonuses?.effect),
  iconFile: source.Icon || "",
  rankValues: parseRankValues(source.stats?.base),
  gripRankValues: parseRankValues(source.stats?.gripBonusBase),
  hasUnknownGripValues: String(source.stats?.gripBonusBase ?? "").includes("X"),
  pageUrl: pageUrl(name),
}));

const imageInfo = await getImageInfo([
  ...pacts.map((item) => item.iconFile),
  ...abilities.flatMap((item) => [item.iconFile, item.imageFile]),
  ...runes.map((item) => item.iconFile),
  ...totems.map((item) => item.iconFile),
]);
const withImage = (item, fileName = item.iconFile) => ({
  ...item,
  image: imageInfo.get(fileName) ?? null,
});

const abilityOutput = abilities.map((ability) => ({
  ...withImage(ability),
  artImage: imageInfo.get(ability.imageFile) ?? null,
}));
const revisionByModule = Object.fromEntries(
  Object.keys(MODULES).map((key, index) => [key, revisions[index]]),
);
const envelope = (moduleKey, items) => ({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: sourceMetadata(MODULES[moduleKey], revisionByModule[moduleKey]),
  items,
});

await Promise.all([
  writeFile(
    resolve("src/data/pacts.generated.json"),
    `${JSON.stringify(
      {
        ...envelope("pacts", pacts.map((item) => withImage(item))),
        abilities: abilityOutput,
        abilitySource: sourceMetadata(
          MODULES.abilities,
          revisionByModule.abilities,
        ),
      },
      null,
      2,
    )}\n`,
  ),
  writeFile(
    resolve("src/data/runes.generated.json"),
    `${JSON.stringify(envelope("runes", runes.map((item) => withImage(item))), null, 2)}\n`,
  ),
  writeFile(
    resolve("src/data/totems.generated.json"),
    `${JSON.stringify(envelope("totems", totems.map((item) => withImage(item))), null, 2)}\n`,
  ),
]);

console.log(
  `Imported ${pacts.length} Pacts, ${abilities.length} Pact abilities, ${runes.length} Runes, and ${totems.length} Totems.`,
);
