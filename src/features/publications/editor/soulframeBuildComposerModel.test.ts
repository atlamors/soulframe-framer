import { describe, expect, it } from "vitest";
import { updateArmorTalismanEquipment } from "../../../domain/armor-talisman-equipment";
import type { PublicationState } from "../../../domain/publications/types";
import type { SoulframeBuild } from "../../../domain/types";
import {
  addBuildVariant,
  buildHomeStage,
  buildStages,
  canonicalPublicationSlug,
  createBuildHomeStage,
  createInitialSoulframeBuildState,
  isValidPublicationSlug,
  partitionBuildSupportingSections,
  readStrengthsWeaknesses,
  replaceBuildStagePlanner,
  SOULFRAME_BUILD_SECTION_IDS,
  SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS,
  updateHomeReservedSection,
  updateStrengthsWeaknessesSide,
  updateVariantDescription,
} from "./soulframeBuildComposerModel";

describe("publication slug helpers", () => {
  it.each([
    ["My Pretty Build", "my-pretty-build"],
    ["  Atlas... Builds  ", "atlas-builds"],
    ["Déjà Vu / Courage", "deja-vu-courage"],
    ["---Already---Slugged---", "already-slugged"],
  ])("canonicalizes %s", (value, expected) => {
    expect(canonicalPublicationSlug(value)).toBe(expected);
  });

  it("caps slugs at 100 characters without leaving a terminal hyphen", () => {
    const value = `${"a".repeat(99)} -- trailing`;
    const slug = canonicalPublicationSlug(value);

    expect(slug).toHaveLength(99);
    expect(slug.endsWith("-")).toBe(false);
  });

  it.each([
    ["abc", true],
    ["atlas-builds", true],
    ["", false],
    ["ab", false],
    ["-atlas", false],
    ["atlas-", false],
    ["Atlas", false],
    ["a".repeat(101), false],
  ])("validates %s", (value, expected) => {
    expect(isValidPublicationSlug(value)).toBe(expected);
  });
});

const TEST_BUILD: SoulframeBuild = {
  schemaVersion: 6,
  name: "Test Frame",
  virtues: { courage: 1, spirit: 1, grace: 1 },
  affinitySources: {
    envoyRank: 0,
    pactArts: { courage: 0, spirit: 0, grace: 0 },
    fables: { shewolf: null, wasteBear: null },
  },
  equipment: {},
  pact: { itemId: null, artAllocation: {} },
  combatArts: {},
  weaponEnhancements: {
    mainHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
    offHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
  },
};

function idFactory(prefix = "id") {
  let index = 0;
  return () => `${prefix}-${++index}`;
}

function existingState(): PublicationState {
  return {
    schemaVersion: 1,
    metadata: { title: "Existing", classifications: [] },
    blocks: [
      {
        id: "home",
        type: "soulframe.build.stage",
        schemaVersion: 1,
        data: {
          role: "home",
          name: "Home",
          planner: structuredClone(TEST_BUILD),
          sharedSections: [
            {
              id: SOULFRAME_BUILD_SECTION_IDS.overview,
              blocks: [
                {
                  id: "overview-block",
                  type: "nightfold.rich-text",
                  schemaVersion: 1,
                  data: { document: [{ type: "paragraph", content: "Old" }] },
                },
              ],
            },
            {
              id: "legacy.unknown",
              blocks: [
                {
                  id: "legacy-block",
                  type: "nightfold.rich-text",
                  schemaVersion: 1,
                  data: {
                    document: [{ type: "paragraph", content: "Legacy" }],
                  },
                },
              ],
            },
            {
              id: SOULFRAME_BUILD_SECTION_IDS.variantDescription,
              blocks: [
                {
                  id: "home-description",
                  type: "nightfold.rich-text",
                  schemaVersion: 1,
                  data: { document: [{ type: "paragraph", content: "Home" }] },
                },
              ],
            },
          ],
        },
      },
      {
        id: "variant",
        type: "soulframe.build.stage",
        schemaVersion: 1,
        data: {
          role: "variant",
          name: "Variant",
          planner: structuredClone(TEST_BUILD),
          sections: [
            { sectionId: "legacy.unknown", mode: "inherit" },
            {
              sectionId: SOULFRAME_BUILD_SECTION_IDS.variantDescription,
              mode: "override",
              blocks: [
                {
                  id: "variant-description",
                  type: "nightfold.rich-text",
                  schemaVersion: 1,
                  data: {
                    document: [{ type: "paragraph", content: "Variant" }],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

describe("Soulframe Build composer model", () => {
  it("reads existing state without mutation", () => {
    const state = existingState();
    const before = structuredClone(state);
    buildStages(state);
    buildHomeStage(state);
    expect(state).toEqual(before);
  });

  it("edits a reserved Home field without changing unknown sections or Variant choices", () => {
    const state = existingState();
    const home = buildHomeStage(state)!;
    const unknownSection = home.data.role === "home" ? home.data.sharedSections[1] : null;
    const variant = buildStages(state)[1];
    const choices = variant.data.role === "variant" ? variant.data.sections : [];
    const next = updateHomeReservedSection(
      state,
      SOULFRAME_BUILD_SECTION_IDS.overview,
      [{ type: "paragraph", content: "New" }],
      idFactory(),
    );
    const nextHome = buildHomeStage(next)!;
    const nextVariant = buildStages(next)[1];
    expect(nextHome.data.role === "home" && nextHome.data.sharedSections[1]).toBe(
      unknownSection,
    );
    expect(nextVariant.data.role === "variant" && nextVariant.data.sections).toBe(
      choices,
    );
  });

  it("partitions only reserved global sections and leaves legacy sections stage-scoped", () => {
    const home = buildHomeStage(existingState())!;
    if (home.data.role !== "home") throw new Error("Expected Home");
    const partition = partitionBuildSupportingSections(home.data.sharedSections);
    expect(partition.global.map((section) => section.id)).toEqual([
      SOULFRAME_BUILD_SECTION_IDS.overview,
    ]);
    expect(partition.stage.map((section) => section.id)).toEqual([
      "legacy.unknown",
      SOULFRAME_BUILD_SECTION_IDS.variantDescription,
    ]);
  });

  it("changes only the reserved description choice on a Variant", () => {
    const state = existingState();
    const variant = buildStages(state)[1];
    if (variant.data.role !== "variant") throw new Error("Expected Variant");
    const unknownChoice = variant.data.sections[0];
    const next = updateVariantDescription(
      state,
      variant.id,
      [{ type: "paragraph", content: "Changed" }],
      idFactory(),
    );
    const nextVariant = buildStages(next)[1];
    if (nextVariant.data.role !== "variant") throw new Error("Expected Variant");
    expect(nextVariant.data.sections[0]).toBe(unknownChoice);
    expect(nextVariant.data.sections[1]).not.toBe(variant.data.sections[1]);
  });

  it("copies or starts an independent complete Variant without mutating its source", () => {
    const state = existingState();
    const before = structuredClone(state);
    const copied = addBuildVariant(
      state,
      "variant",
      "Copied",
      "copy-active",
      TEST_BUILD,
      idFactory("copy"),
    );
    const empty = addBuildVariant(
      state,
      "variant",
      "Empty",
      "start-empty",
      TEST_BUILD,
      idFactory("empty"),
    );
    const copiedStage = buildStages(copied).at(-1)!;
    const emptyStage = buildStages(empty).at(-1)!;
    const source = buildStages(state)[1];
    expect(state).toEqual(before);
    expect(copiedStage.id).not.toBe(source.id);
    expect(copiedStage.data.planner).toEqual(source.data.planner);
    expect(copiedStage.data.planner).not.toBe(source.data.planner);
    expect(emptyStage.data.planner).toEqual(TEST_BUILD);
    expect(emptyStage.data.planner).not.toBe(TEST_BUILD);
    expect(buildStages(copied).filter((stage) => stage.data.role === "home")).toHaveLength(1);
    expect(buildStages(empty).filter((stage) => stage.data.role === "home")).toHaveLength(1);
  });

  it("initializes new Builds with all approved reserved sections", () => {
    const state = createInitialSoulframeBuildState(
      { title: "New", classifications: [] },
      TEST_BUILD,
      idFactory(),
    );
    const home = buildHomeStage(state)!;
    if (home.data.role !== "home") throw new Error("Expected Home");
    expect(home.data.sharedSections.map((section) => section.id)).toEqual([
      SOULFRAME_BUILD_SECTION_IDS.overview,
      SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
      SOULFRAME_BUILD_SECTION_IDS.variantDescription,
    ]);
  });

  it("creates one explicit Home for a zero-Home legacy state without changing existing content", () => {
    const unrelatedBlock = {
      id: "legacy-heading",
      type: "nightfold.heading" as const,
      schemaVersion: 1 as const,
      data: { level: 2 as const, text: "Legacy" },
    };
    const state: PublicationState = {
      schemaVersion: 1,
      metadata: { title: "Legacy empty", classifications: [] },
      blocks: [unrelatedBlock],
    };
    const before = structuredClone(state);
    expect(buildHomeStage(state)).toBeUndefined();
    expect(state).toEqual(before);

    const created = createBuildHomeStage(state, TEST_BUILD, idFactory("home"));
    const home = buildHomeStage(created);
    expect(state).toEqual(before);
    expect(created.blocks[0]).toBe(unrelatedBlock);
    expect(home?.id).toBe("home-1");
    expect(home?.data.role).toBe("home");
    expect(home?.data.planner).toEqual(TEST_BUILD);
    expect(home?.data.planner).not.toBe(TEST_BUILD);
    expect(home?.data.role === "home" && home.data.sharedSections).toEqual([]);
    expect(buildStages(created).filter((stage) => stage.data.role === "home")).toHaveLength(1);
    expect(createBuildHomeStage(created, TEST_BUILD, idFactory("again"))).toBe(created);
  });

  it("reads structured strengths and weaknesses without mutating their section", () => {
    const state = createInitialSoulframeBuildState(
      { title: "Rows", classifications: [] },
      TEST_BUILD,
      idFactory(),
    );
    const before = structuredClone(state);
    const home = buildHomeStage(state)!;
    if (home.data.role !== "home") throw new Error("Expected Home");
    const section = home.data.sharedSections.find(
      (candidate) =>
        candidate.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    );
    expect(readStrengthsWeaknesses(section)).toEqual({
      strengths: [],
      weaknesses: [],
      legacyBlocks: [],
      hasStructuredContent: true,
    });
    expect(state).toEqual(before);
  });

  it("updates one structured side with deterministic bullet rows while preserving the other side and legacy blocks", () => {
    const state = existingState();
    const originalHome = buildHomeStage(state)!;
    if (originalHome.data.role !== "home") throw new Error("Expected Home");
    const legacyStrengthBlock = {
      id: "legacy-strength-copy",
      type: "nightfold.rich-text" as const,
      schemaVersion: 1 as const,
      data: { document: [{ type: "paragraph" as const, content: "Legacy copy" }] },
    };
    originalHome.data.sharedSections.splice(1, 0, {
      id: SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
      blocks: [legacyStrengthBlock],
    });
    const first = updateStrengthsWeaknessesSide(state, "weaknesses", [
      { id: "weak-1", content: "Needs setup" },
    ]);
    const homeAfterFirst = buildHomeStage(first)!;
    if (homeAfterFirst.data.role !== "home") throw new Error("Expected Home");
    const sectionAfterFirst = homeAfterFirst.data.sharedSections.find(
      (section) =>
        section.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    )!;
    const weaknessBlock = sectionAfterFirst.blocks.find(
      (block) => block.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.weaknesses,
    );
    const legacyBlock = sectionAfterFirst.blocks[0];
    expect(weaknessBlock?.type === "nightfold.rich-text" && weaknessBlock.data.document).toEqual([
      { id: "weak-1", type: "bulletListItem", content: "Needs setup" },
    ]);

    const second = updateStrengthsWeaknessesSide(first, "strengths", [
      { id: "strong-1", content: "Reliable" },
      { id: "strong-2", content: "Fast" },
    ]);
    const homeAfterSecond = buildHomeStage(second)!;
    if (homeAfterSecond.data.role !== "home") throw new Error("Expected Home");
    const sectionAfterSecond = homeAfterSecond.data.sharedSections.find(
      (section) =>
        section.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    )!;
    expect(sectionAfterSecond.blocks[0]).toBe(legacyBlock);
    expect(
      sectionAfterSecond.blocks.find(
        (block) => block.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.weaknesses,
      ),
    ).toBe(weaknessBlock);
    expect(readStrengthsWeaknesses(sectionAfterSecond).strengths).toEqual([
      { id: "strong-1", content: "Reliable" },
      { id: "strong-2", content: "Fast" },
    ]);
  });

  it("keeps a legacy-only strengths section exact until an explicit side edit", () => {
    const legacySection = {
      id: SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
      blocks: [
        {
          id: "legacy-strengths",
          type: "nightfold.rich-text" as const,
          schemaVersion: 1 as const,
          data: {
            document: [{ type: "paragraph" as const, content: "Legacy" }],
          },
        },
      ],
    };
    const read = readStrengthsWeaknesses(legacySection);
    expect(read.legacyBlocks).toEqual(legacySection.blocks);
    expect(read.legacyBlocks[0]).toBe(legacySection.blocks[0]);
    expect(read.strengths).toEqual([]);
    expect(read.weaknesses).toEqual([]);
    expect(read.hasStructuredContent).toBe(false);
  });

  it("preserves every non-bullet node in a structured side while reconciling only rows", () => {
    const state = createInitialSoulframeBuildState(
      { title: "Mixed", classifications: [] },
      TEST_BUILD,
      idFactory(),
    );
    const home = buildHomeStage(state)!;
    if (home.data.role !== "home") throw new Error("Expected Home");
    const section = home.data.sharedSections.find(
      (candidate) =>
        candidate.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    )!;
    const strengthBlock = section.blocks.find(
      (block) => block.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.strengths,
    );
    if (strengthBlock?.type !== "nightfold.rich-text") {
      throw new Error("Expected structured Strengths block");
    }
    const paragraph = {
      id: "paragraph",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: "Styled", styles: { bold: true } }],
      children: [{ id: "child", type: "quote" as const, content: "Child" }],
    };
    const quote = { id: "quote", type: "quote" as const, content: "Quote" };
    const numbered = {
      id: "numbered",
      type: "numberedListItem" as const,
      content: "Numbered",
    };
    const code = {
      id: "code",
      type: "codeBlock" as const,
      content: "code()",
      props: { language: "ts" },
    };
    strengthBlock.data.document = [
      paragraph,
      { id: "old-row", type: "bulletListItem", content: "Old" },
      quote,
      numbered,
      code,
    ];

    const next = updateStrengthsWeaknessesSide(state, "strengths", [
      { id: "new-row", content: "New" },
      { id: "second-row", content: "Second" },
    ]);
    const nextHome = buildHomeStage(next)!;
    if (nextHome.data.role !== "home") throw new Error("Expected Home");
    const nextSection = nextHome.data.sharedSections.find(
      (candidate) =>
        candidate.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    )!;
    const nextStrength = nextSection.blocks.find(
      (block) => block.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.strengths,
    );
    if (nextStrength?.type !== "nightfold.rich-text") {
      throw new Error("Expected structured Strengths block");
    }
    expect(nextStrength.data.document).toEqual([
      paragraph,
      { id: "new-row", type: "bulletListItem", content: "New" },
      quote,
      numbered,
      code,
      { id: "second-row", type: "bulletListItem", content: "Second" },
    ]);
    expect(nextStrength.data.document[0]).toBe(paragraph);
    expect(nextStrength.data.document[2]).toBe(quote);
    expect(nextStrength.data.document[3]).toBe(numbered);
    expect(nextStrength.data.document[4]).toBe(code);
  });

  it("removes structured Strength rows without restoring deleted entries", () => {
    const state = createInitialSoulframeBuildState(
      { title: "Deletion", classifications: [] },
      TEST_BUILD,
      idFactory(),
    );
    const withRows = updateStrengthsWeaknessesSide(state, "strengths", [
      { id: "strong-1", content: "Reliable" },
      { id: "strong-2", content: "Fast" },
    ]);
    const withOneRow = updateStrengthsWeaknessesSide(withRows, "strengths", [
      { id: "strong-2", content: "Fast" },
    ]);
    const oneRowHome = buildHomeStage(withOneRow)!;
    if (oneRowHome.data.role !== "home") throw new Error("Expected Home");
    const oneRowSection = oneRowHome.data.sharedSections.find(
      (candidate) =>
        candidate.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    );
    expect(readStrengthsWeaknesses(oneRowSection).strengths).toEqual([
      { id: "strong-2", content: "Fast" },
    ]);

    const withoutRows = updateStrengthsWeaknessesSide(
      withOneRow,
      "strengths",
      [],
    );
    const emptyHome = buildHomeStage(withoutRows)!;
    if (emptyHome.data.role !== "home") throw new Error("Expected Home");
    const emptySection = emptyHome.data.sharedSections.find(
      (candidate) =>
        candidate.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    );
    expect(readStrengthsWeaknesses(emptySection).strengths).toEqual([]);
  });

  it("recognizes structured sides only by exact ID and RichText type", () => {
    const section = {
      id: SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
      blocks: [
        {
          id: SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.strengths,
          type: "nightfold.heading" as const,
          schemaVersion: 1 as const,
          data: { level: 2 as const, text: "Legacy heading" },
        },
      ],
    };
    const read = readStrengthsWeaknesses(section);
    expect(read.hasStructuredContent).toBe(false);
    expect(read.legacyBlocks).toEqual(section.blocks);
    expect(read.legacyBlocks[0]).toBe(section.blocks[0]);
  });

  it("changes equipment only on the selected active stage and survives JSON round-trip", () => {
    const initial = existingState();
    const [initialHome, initialVariant] = buildStages(initial);
    const homePlanner: SoulframeBuild = {
      ...structuredClone(TEST_BUILD),
      name: "Home planner",
      equipment: {
        helm: "home-helm",
        talisman: "home-talisman",
        mainHand: "home-main-hand",
      },
    };
    const variantPlanner: SoulframeBuild = {
      ...structuredClone(TEST_BUILD),
      name: "Variant planner",
      equipment: {
        helm: "variant-helm",
        cuirass: "variant-cuirass",
        talisman: "variant-talisman",
        offHand: "variant-off-hand",
      },
    };
    const withHomePlanner = replaceBuildStagePlanner(
      initial,
      initialHome.id,
      homePlanner,
    );
    const state = replaceBuildStagePlanner(
      withHomePlanner,
      initialVariant.id,
      variantPlanner,
    );
    const [home, variant] = buildStages(state);
    const metadata = state.metadata;
    const homeContent =
      home.data.role === "home" ? home.data.sharedSections : undefined;
    const variantContent =
      variant.data.role === "variant" ? variant.data.sections : undefined;

    const next = replaceBuildStagePlanner(
      state,
      variant.id,
      updateArmorTalismanEquipment(
        variant.data.planner,
        "cuirass",
        "variant-cuirass-next",
      ),
    );
    const [nextHome, nextVariant] = buildStages(next);

    expect(next.metadata).toBe(metadata);
    expect(nextHome).toBe(home);
    expect(nextHome.data.planner).toEqual(homePlanner);
    expect(
      nextHome.data.role === "home" && nextHome.data.sharedSections,
    ).toBe(homeContent);
    expect(nextVariant).not.toBe(variant);
    expect(nextVariant.data.planner.equipment).toEqual({
      ...variantPlanner.equipment,
      cuirass: "variant-cuirass-next",
    });
    expect(
      nextVariant.data.role === "variant" && nextVariant.data.sections,
    ).toBe(variantContent);

    const roundTripped = JSON.parse(JSON.stringify(next)) as PublicationState;
    const [storedHome, storedVariant] = buildStages(roundTripped);
    expect(storedVariant.data.planner.equipment.cuirass).toBe(
      "variant-cuirass-next",
    );
    expect(storedVariant.data.planner.equipment.helm).toBe("variant-helm");
    expect(storedVariant.data.planner.equipment.talisman).toBe(
      "variant-talisman",
    );
    expect(storedVariant.data.planner.equipment.offHand).toBe(
      "variant-off-hand",
    );
    expect(storedHome.data.planner).toEqual(homePlanner);
    expect(roundTripped.metadata).toEqual(state.metadata);
    expect(
      storedHome.data.role === "home" && storedHome.data.sharedSections,
    ).toEqual(homeContent);
    expect(
      storedVariant.data.role === "variant" && storedVariant.data.sections,
    ).toEqual(variantContent);
  });
});
