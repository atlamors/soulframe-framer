import assert from "node:assert/strict";
import test from "node:test";
import { LuaTableParser } from "./lib/avakot.mjs";
import { normalizeJoineries, warningDiff } from "./import-joineries.mjs";

const image = { imageUrl: "https://example.test/a.png", thumbnailUrl: "https://example.test/a.png", descriptionUrl: "https://example.test/File:a.png", mimeType: "image/png", width: 1, height: 1, thumbnailWidth: 1, thumbnailHeight: 1, bytes: 1, sha1: "a".repeat(40) };
const source = `return { ["Verite"] = { Description = "[[Aurel|Aureli]] ore", ImgIcon = "Verite.png", Type = { "Greatsword" } }, ["Verite: Blessed by Mora"] = { Parent = "Verite", Tier = "Blessed", Stats = { "+1 Courage Attunement" }, Rarity = "Common", DropSource = "" }, ["Grey Gold"] = { Description = "Archive", ImgIcon = "Kintsugi.png", Type = { "Weapon" }, Stats = { "None" }, Tags = "Archive", Rarity = "Common" } }`;
const normalized = () => normalizeJoineries(new LuaTableParser(source, { rejectDuplicateKeys: true }).parse(), new Map([["Verite.png", image]]));
const parsed = () => new LuaTableParser(source, { rejectDuplicateKeys: true }).parse();
test("flattens parent metadata, preserves exact variant identity, and excludes archives", () => {
  const result = normalized(); assert.equal(result.items.length, 1); assert.equal(result.archives[0], "Grey Gold");
  assert.deepEqual(result.items[0].compatibility, { scope: "types", types: ["Heavy"] }); assert.equal(result.items[0].description, "Aureli ore");
});
test("rejects invalid source fields, stats, and DropSource", () => {
  const data = parsed(); data["Verite: Blessed by Mora"].DropSource = "Somewhere";
  assert.throws(() => normalizeJoineries(data, new Map([["Verite.png", image]])), /DropSource/);
  data["Verite: Blessed by Mora"].DropSource = ""; data.Verite.Unmodeled = true;
  assert.throws(() => normalizeJoineries(data, new Map([["Verite.png", image]])), /unknown discarded fields/);
});
test("rejects non-numeric keys in parent/archive Type and active/archive Stats lists", () => {
  const cases = [
    ["parent Type", (data) => { data.Verite.Type.unmodeled = "Magick"; }],
    ["archive Type", (data) => { data["Grey Gold"].Type.unmodeled = "Armour"; }],
    ["active Stats", (data) => { data["Verite: Blessed by Mora"].Stats.unmodeled = "+1 Courage Attunement"; }],
    ["archive Stats", (data) => { data["Grey Gold"].Stats.unmodeled = "None"; }],
  ];
  for (const [label, mutate] of cases) {
    const data = parsed(); mutate(data);
    assert.throws(() => normalizeJoineries(data, new Map([["Verite.png", image]])), /non-numeric list keys/, label);
  }
});
test("rejects malformed archive stat values and rarity", () => {
  const emptyStat = parsed(); emptyStat["Grey Gold"].Stats[1] = "";
  assert.throws(() => normalizeJoineries(emptyStat, new Map([["Verite.png", image]])), /archive Stats value/);
  const emptyType = parsed(); emptyType["Grey Gold"].Type[1] = "   ";
  assert.throws(() => normalizeJoineries(emptyType, new Map([["Verite.png", image]])), /archive Type must be a nonempty string list/);
  const badRarity = parsed(); badRarity["Grey Gold"].Rarity = "Mythic";
  assert.throws(() => normalizeJoineries(badRarity, new Map([["Verite.png", image]])), /unknown archive Rarity/);
});
test("escapes regex metacharacters in future parent names", () => {
  const exactName = "Fey[kin].+: Blessed by Mora";
  const future = {
    "Fey[kin].+": { Description: "Future ore", ImgIcon: "Future.png", Type: { 1: "Magick" } },
    [exactName]: { Parent: "Fey[kin].+", Tier: "Blessed", Stats: { 1: "+1 Courage Attunement" }, Rarity: "Common", DropSource: "" },
  };
  const images = new Map([["Future.png", image]]);
  assert.equal(normalizeJoineries(future, images).items[0].name, exactName);
  future["FeykinnX: Blessed by Mora"] = future[exactName]; delete future[exactName];
  assert.throws(() => normalizeJoineries(future, images), /exact active variant name format/);
});
test("reports valid catalogue expansion as warnings", () => {
  const next = normalized(); const warnings = warningDiff({ items: [] }, next);
  assert.ok(warnings.some((warning) => warning === "current catalogue count is 1, expected 30"));
});
test("warns on same-count matrix changes and complete icon metadata drift", () => {
  const combinations = {
    Verite: ["Blessed", "Twice Blessed"],
    Feybalt: ["Blessed", "Twice Blessed", "Thrice Blessed"],
    Quicksilver: ["Blessed", "Twice Blessed", "Thrice Blessed"],
    Gildaur: ["Blessed", "Thrice Blessed"],
  };
  const items = Object.entries(combinations).flatMap(([family, familyTiers]) => familyTiers.flatMap((tier) => ["Mora", "Saphene", "Iridis"].map((blessing) => ({ name: `${family}: ${tier} by ${blessing}`, family, tier, blessing, iconFile: `${family}.png`, icon: image }))));
  const previous = { items: items.map((item) => ({ ...item })) };
  const nextItems = items.map((item) => ({ ...item }));
  nextItems.find((item) => item.family === "Verite" && item.tier === "Twice Blessed" && item.blessing === "Mora").tier = "Thrice Blessed";
  nextItems.find((item) => item.family === "Feybalt").icon = { ...image, sha1: "b".repeat(40) };
  const warnings = warningDiff(previous, { items: nextItems, parents: Object.keys(combinations), archives: [] });
  assert.ok(warnings.some((warning) => warning.startsWith("current matrix changed: Verite;")));
  assert.ok(warnings.some((warning) => warning.startsWith("icon metadata changed: Feybalt:")));
});
