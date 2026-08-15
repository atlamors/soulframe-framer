import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeTempers,
  provenanceByTemperName,
  warningDiff,
} from "./import-tempers.mjs";
import { LuaTableParser, moduleRevisionFromResponse } from "./lib/avakot.mjs";

const image = {
  imageUrl: "https://example.test/temper.png",
  thumbnailUrl: "https://example.test/temper.png",
  descriptionUrl: "https://example.test/File:temper.png",
  mimeType: "image/png",
  width: 512,
  height: 512,
  thumbnailWidth: 192,
  thumbnailHeight: 192,
  bytes: 1,
  sha1: "a".repeat(40),
};

const source = `return {
  ["Test Temper"] = {
    -- Test Temper pageid 1 revision 10
  },
  ["PH AspectCassidParryStaggerName"] = {
    -- PH AspectCassidParryStaggerName pageid 2 revision 20
  },
}`;

const fixture = () => ({
  "Test Temper": {
    InternalID: null,
    Description: "Test description.",
    Icon: "Test.png",
    Origin: "Universal",
    Weapon: "All Weapons",
    Stats: {
      1: {
        Effect: "$1 Test",
        Ranks: "1/2",
        EffectID: "test_effect",
        Confidence: "confirmed",
        Notes: "Test notes.",
      },
    },
  },
  "PH AspectCassidParryStaggerName": {
    InternalID: null,
    Description: "Placeholder.",
    Icon: "Placeholder.png",
    Origin: "Cassid",
    Weapon: "Melee",
    Stats: {
      1: {
        Effect: "$1 Placeholder",
        Ranks: "Unknown/Unknown",
        EffectID: "placeholder_effect",
        Confidence: "unknown",
        Notes: "Placeholder notes.",
      },
    },
  },
});

const normalizeFixture = (moduleData = fixture()) =>
  normalizeTempers(
    moduleData,
    provenanceByTemperName(source),
    new Map([
      ["Test Temper", { revisionId: 10, revisionTimestamp: "2026-01-01T00:00:00Z" }],
      ["PH AspectCassidParryStaggerName", { revisionId: 20, revisionTimestamp: "2026-01-01T00:00:00Z" }],
    ]),
    new Map([["Test.png", image], ["Placeholder.png", image]]),
  );

test("normalizes canonical Temper identities, nullable internal IDs, and stack pairs", () => {
  const items = normalizeFixture();
  assert.equal(items[1].id, "Test Temper");
  assert.equal(items[1].internalId, null);
  assert.deepEqual(items[1].stats[0].stacks, { single: "1", double: "2" });
  assert.equal(items[0].isPlaceholder, true);
});

test("accepts Avakot's literal null InternalID metadata", () => {
  assert.equal(new LuaTableParser("return { InternalID = null }").parse().InternalID, null);
});

test("rejects duplicate Temper entries when strict parsing is enabled", () => {
  assert.throws(
    () => new LuaTableParser('return { ["Same"] = {}, ["Same"] = {} }', { rejectDuplicateKeys: true }).parse(),
    /Duplicate Lua table key/,
  );
});

test("binds a module source and revision from one API response", () => {
  assert.deepEqual(
    moduleRevisionFromResponse({ query: { pages: [{ revisions: [{ revid: 42, timestamp: "2026-01-01T00:00:00Z", slots: { main: { content: "return {}" } } }] }] } }, "Module:Data/Test"),
    { source: "return {}", revisionId: 42, revisionTimestamp: "2026-01-01T00:00:00Z" },
  );
});

test("rejects invalid ranks and discarded source fields", () => {
  const invalidRanks = fixture();
  invalidRanks["Test Temper"].Stats[1].Ranks = "1/2/3";
  assert.throws(() => normalizeFixture(invalidRanks), /exactly one nonempty single\/double pair/);
  const extraField = fixture();
  extraField["Test Temper"].Unexpected = "discard me";
  assert.throws(() => normalizeFixture(extraField), /unknown discarded fields/);
  const nonnumericStats = fixture();
  nonnumericStats["Test Temper"].Stats.unmodeled = {};
  assert.throws(() => normalizeFixture(nonnumericStats), /only numeric row keys/);
});

test("surfaces the required drift warnings", () => {
  const previous = { items: normalizeFixture() };
  const nextItems = normalizeFixture();
  nextItems[1] = { ...nextItems[1], description: "Changed.", stats: [{ ...nextItems[1].stats[0], ranksRaw: "2/4" }] };
  const warnings = warningDiff(previous, { items: nextItems });
  assert.ok(warnings.some((warning) => warning.startsWith("prose drift: Test Temper")));
  assert.ok(warnings.some((warning) => warning.startsWith("confidence/rank changed: Test Temper")));
  const renamed = warningDiff(
    previous,
    { items: [{ ...nextItems[1], name: "Renamed Temper", id: "Renamed Temper" }, nextItems[0]] },
  );
  assert.ok(renamed.some((warning) => warning === "renamed catalogue item: Test Temper -> Renamed Temper"));
  const baseline = warningDiff(null, { items: nextItems });
  assert.ok(baseline.some((warning) => warning.startsWith("non-confirmed confidence: PH Aspect")));
  assert.ok(baseline.some((warning) => warning.startsWith("placeholder: PH Aspect")));
  const prose = warningDiff(previous, { items: [{ ...nextItems[1], stats: [{ ...nextItems[1].stats[0], effect: "$1 Changed", notes: "Changed notes." }] }, nextItems[0]] });
  assert.ok(prose.some((warning) => warning === "prose drift: Test Temper / test_effect"));
});
