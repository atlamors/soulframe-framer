import type {
  BlockNoteCompatibleDocument,
  BuildStageBlock,
  BuildStageSectionChoice,
  BuildSupportingBlock,
  BuildSupportingSection,
  RichTextBlock,
} from "../../../domain/publications/blocks";
import type {
  PublicationMetadata,
  PublicationState,
} from "../../../domain/publications/types";
import type { SoulframeBuild } from "../../../domain/types";
export { canonicalPublicationSlug, isValidPublicationSlug } from "./publicationComposerModel";

export const SOULFRAME_BUILD_SECTION_IDS = {
  overview: "nightfold.soulframe.build.overview.v1",
  strengthsWeaknesses: "nightfold.soulframe.build.strengths-weaknesses.v1",
  variantDescription: "nightfold.soulframe.build.variant-description.v1",
} as const;

export const SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS = {
  strengths: "nightfold.soulframe.build.strengths.v1",
  weaknesses: "nightfold.soulframe.build.weaknesses.v1",
} as const;

export type StrengthsWeaknessesSide =
  keyof typeof SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS;

export type StrengthsWeaknessesRow = {
  id: string;
  content: string;
};

export type SoulframeBuildReservedSectionId =
  (typeof SOULFRAME_BUILD_SECTION_IDS)[keyof typeof SOULFRAME_BUILD_SECTION_IDS];

const GLOBAL_SECTION_IDS = [
  SOULFRAME_BUILD_SECTION_IDS.overview,
  SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
] as const;

const EMPTY_DOCUMENT: BlockNoteCompatibleDocument = [
  { type: "paragraph", content: "" },
];

type IdFactory = () => string;

const makeRandomId: IdFactory = () => crypto.randomUUID();

function clone<T>(value: T): T {
  return structuredClone(value);
}

function richTextBlock(
  document: BlockNoteCompatibleDocument,
  makeId: IdFactory,
): RichTextBlock {
  return {
    id: makeId(),
    type: "nightfold.rich-text",
    schemaVersion: 1,
    data: { document: clone(document) },
  };
}

function supportingSection(
  id: SoulframeBuildReservedSectionId,
  makeId: IdFactory,
): BuildSupportingSection {
  return { id, blocks: [richTextBlock(EMPTY_DOCUMENT, makeId)] };
}

function strengthsWeaknessesSection(): BuildSupportingSection {
  return {
    id: SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    blocks: (["strengths", "weaknesses"] as const).map((side) => ({
      id: SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS[side],
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: { document: [] },
    })),
  };
}

function updateSectionDocument(
  section: BuildSupportingSection,
  document: BlockNoteCompatibleDocument,
  makeId: IdFactory,
): BuildSupportingSection {
  const richTextIndex = section.blocks.findIndex(
    (block) => block.type === "nightfold.rich-text",
  );
  if (richTextIndex < 0) {
    return {
      ...section,
      blocks: [...section.blocks, richTextBlock(document, makeId)],
    };
  }
  return {
    ...section,
    blocks: section.blocks.map((block, index) =>
      index === richTextIndex && block.type === "nightfold.rich-text"
        ? { ...block, data: { document: clone(document) } }
        : block,
    ),
  };
}

function cloneSupportingBlocks(
  blocks: readonly BuildSupportingBlock[],
  makeId: IdFactory,
): BuildSupportingBlock[] {
  return blocks.map((block) => ({ ...clone(block), id: makeId() }));
}

export function buildStages(state: PublicationState): BuildStageBlock[] {
  return state.blocks.filter(
    (block): block is BuildStageBlock => block.type === "soulframe.build.stage",
  );
}

export function buildHomeStage(
  state: PublicationState,
): BuildStageBlock | undefined {
  return buildStages(state).find((stage) => stage.data.role === "home");
}

function updateStage(
  state: PublicationState,
  stageId: string,
  update: (stage: BuildStageBlock) => BuildStageBlock,
): PublicationState {
  return {
    ...state,
    blocks: state.blocks.map((block) =>
      block.type === "soulframe.build.stage" && block.id === stageId
        ? update(block)
        : block,
    ),
  };
}

export function createInitialSoulframeBuildState(
  metadata: PublicationMetadata,
  planner: SoulframeBuild,
  makeId: IdFactory = makeRandomId,
): PublicationState {
  return {
    schemaVersion: 1,
    metadata: clone(metadata),
    blocks: [
      {
        id: makeId(),
        type: "soulframe.build.stage",
        schemaVersion: 1,
        data: {
          role: "home",
          name: "Home",
          planner: clone(planner),
          sharedSections: [
            supportingSection(SOULFRAME_BUILD_SECTION_IDS.overview, makeId),
            strengthsWeaknessesSection(),
            supportingSection(
              SOULFRAME_BUILD_SECTION_IDS.variantDescription,
              makeId,
            ),
          ],
        },
      },
    ],
  };
}

export function createBuildHomeStage(
  state: PublicationState,
  planner: SoulframeBuild,
  makeId: IdFactory = makeRandomId,
): PublicationState {
  if (buildHomeStage(state)) return state;
  return {
    ...state,
    blocks: [
      ...state.blocks,
      {
        id: makeId(),
        type: "soulframe.build.stage",
        schemaVersion: 1,
        data: {
          role: "home",
          name: "Home",
          planner: clone(planner),
          sharedSections: [],
        },
      },
    ],
  };
}

export function partitionBuildSupportingSections(
  sections: readonly BuildSupportingSection[],
): {
  global: BuildSupportingSection[];
  stage: BuildSupportingSection[];
} {
  return {
    global: GLOBAL_SECTION_IDS.flatMap((id) => {
      const section = sections.find((candidate) => candidate.id === id);
      return section ? [section] : [];
    }),
    stage: sections.filter(
      (section) =>
        !GLOBAL_SECTION_IDS.includes(
          section.id as (typeof GLOBAL_SECTION_IDS)[number],
        ),
    ),
  };
}

export function resolvedSection(
  home: BuildStageBlock,
  stage: BuildStageBlock,
  sectionId: string,
): BuildSupportingSection | undefined {
  if (home.data.role !== "home") return undefined;
  const homeSection = home.data.sharedSections.find(
    (section) => section.id === sectionId,
  );
  if (!homeSection || stage.data.role === "home") return homeSection;
  const choice = stage.data.sections.find(
    (candidate) => candidate.sectionId === sectionId,
  );
  return choice?.mode === "override"
    ? { id: sectionId, blocks: choice.blocks }
    : homeSection;
}

export function sectionDocument(
  section: BuildSupportingSection | undefined,
): BlockNoteCompatibleDocument {
  const block = section?.blocks.find(
    (candidate): candidate is RichTextBlock =>
      candidate.type === "nightfold.rich-text",
  );
  return block ? clone(block.data.document) : clone(EMPTY_DOCUMENT);
}

function rowContent(block: BlockNoteCompatibleDocument[number]): string {
  if (typeof block.content === "string") return block.content;
  return (block.content ?? [])
    .map((content) => (content.type === "text" ? content.text : content.content.map((item) => item.text).join("")))
    .join("");
}

export function readStrengthsWeaknesses(
  section: BuildSupportingSection | undefined,
): {
  strengths: StrengthsWeaknessesRow[];
  weaknesses: StrengthsWeaknessesRow[];
  legacyBlocks: BuildSupportingBlock[];
  hasStructuredContent: boolean;
} {
  const recognizedBlocks = {
    strengths: section?.blocks.find(
      (candidate): candidate is RichTextBlock =>
        candidate.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.strengths &&
        candidate.type === "nightfold.rich-text",
    ),
    weaknesses: section?.blocks.find(
      (candidate): candidate is RichTextBlock =>
        candidate.id === SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS.weaknesses &&
        candidate.type === "nightfold.rich-text",
    ),
  };
  const readSide = (side: StrengthsWeaknessesSide) => {
    const block = recognizedBlocks[side];
    return (block?.data.document ?? [])
      .filter((item) => item.type === "bulletListItem")
      .map((item, index) => ({
        id: item.id ?? `${SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS[side]}.row-${index}`,
        content: rowContent(item),
      }));
  };
  const recognized = new Set(
    Object.values(recognizedBlocks).filter(
      (block): block is RichTextBlock => block !== undefined,
    ),
  );
  return {
    strengths: readSide("strengths"),
    weaknesses: readSide("weaknesses"),
    legacyBlocks: (section?.blocks ?? []).filter(
      (block) => !recognized.has(block as RichTextBlock),
    ),
    hasStructuredContent:
      recognizedBlocks.strengths !== undefined ||
      recognizedBlocks.weaknesses !== undefined,
  };
}

function reconcileBulletRows(
  document: BlockNoteCompatibleDocument,
  rows: readonly StrengthsWeaknessesRow[],
): BlockNoteCompatibleDocument {
  let rowIndex = 0;
  const reconciled = document.flatMap((block) => {
    if (block.type !== "bulletListItem") return [block];
    const row = rows[rowIndex++];
    return row
      ? [{ id: row.id, type: "bulletListItem" as const, content: row.content }]
      : [];
  });
  return [
    ...reconciled,
    ...rows.slice(rowIndex).map((row) => ({
      id: row.id,
      type: "bulletListItem" as const,
      content: row.content,
    })),
  ];
}

export function updateStrengthsWeaknessesSide(
  state: PublicationState,
  side: StrengthsWeaknessesSide,
  rows: readonly StrengthsWeaknessesRow[],
): PublicationState {
  const home = buildHomeStage(state);
  if (!home || home.data.role !== "home") return state;
  const targetId = SOULFRAME_BUILD_STRENGTHS_BLOCK_IDS[side];
  return updateStage(state, home.id, (stage) => {
    if (stage.data.role !== "home") return stage;
    const sectionIndex = stage.data.sharedSections.findIndex(
      (section) =>
        section.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
    );
    const nextSections = [...stage.data.sharedSections];
    const targetBlock: RichTextBlock = {
      id: targetId,
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: {
        document: rows.map((row) => ({
          id: row.id,
          type: "bulletListItem",
          content: row.content,
        })),
      },
    };
    if (sectionIndex < 0) {
      nextSections.push({
        id: SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
        blocks: [targetBlock],
      });
    } else {
      const section = nextSections[sectionIndex];
      const blockIndex = section.blocks.findIndex(
        (block) => block.id === targetId && block.type === "nightfold.rich-text",
      );
      const blocks = [...section.blocks];
      if (blockIndex < 0) blocks.push(targetBlock);
      else {
        const current = blocks[blockIndex] as RichTextBlock;
        blocks[blockIndex] = {
          ...current,
          data: {
            document: reconcileBulletRows(current.data.document, rows),
          },
        };
      }
      nextSections[sectionIndex] = { ...section, blocks };
    }
    return { ...stage, data: { ...stage.data, sharedSections: nextSections } };
  });
}

export function updateHomeReservedSection(
  state: PublicationState,
  sectionId: SoulframeBuildReservedSectionId,
  document: BlockNoteCompatibleDocument,
  makeId: IdFactory = makeRandomId,
): PublicationState {
  const home = buildHomeStage(state);
  if (!home || home.data.role !== "home") return state;
  return updateStage(state, home.id, (stage) => {
    if (stage.data.role !== "home") return stage;
    const sectionIndex = stage.data.sharedSections.findIndex(
      (section) => section.id === sectionId,
    );
    const nextSections = [...stage.data.sharedSections];
    if (sectionIndex < 0) {
      nextSections.push({
        id: sectionId,
        blocks: [richTextBlock(document, makeId)],
      });
    } else {
      nextSections[sectionIndex] = updateSectionDocument(
        nextSections[sectionIndex],
        document,
        makeId,
      );
    }
    return { ...stage, data: { ...stage.data, sharedSections: nextSections } };
  });
}

export function updateVariantDescription(
  state: PublicationState,
  stageId: string,
  document: BlockNoteCompatibleDocument,
  makeId: IdFactory = makeRandomId,
): PublicationState {
  const stage = buildStages(state).find((candidate) => candidate.id === stageId);
  if (!stage) return state;
  if (stage.data.role === "home") {
    return updateHomeReservedSection(
      state,
      SOULFRAME_BUILD_SECTION_IDS.variantDescription,
      document,
      makeId,
    );
  }

  let withDescription = state;
  const home = buildHomeStage(state);
  if (
    home?.data.role === "home" &&
    !home.data.sharedSections.some(
      (section) =>
        section.id === SOULFRAME_BUILD_SECTION_IDS.variantDescription,
    )
  ) {
    withDescription = updateHomeReservedSection(
      state,
      SOULFRAME_BUILD_SECTION_IDS.variantDescription,
      EMPTY_DOCUMENT,
      makeId,
    );
  }

  return updateStage(withDescription, stageId, (candidate) => {
    if (candidate.data.role !== "variant") return candidate;
    const choiceIndex = candidate.data.sections.findIndex(
      (choice) =>
        choice.sectionId === SOULFRAME_BUILD_SECTION_IDS.variantDescription,
    );
    const nextChoice: BuildStageSectionChoice = {
      sectionId: SOULFRAME_BUILD_SECTION_IDS.variantDescription,
      mode: "override",
      blocks: [richTextBlock(document, makeId)],
    };
    const sections = [...candidate.data.sections];
    if (choiceIndex < 0) sections.push(nextChoice);
    else {
      const current = sections[choiceIndex];
      sections[choiceIndex] =
        current.mode === "override"
          ? {
              ...current,
              blocks: updateSectionDocument(
                { id: current.sectionId, blocks: current.blocks },
                document,
                makeId,
              ).blocks,
            }
          : nextChoice;
    }
    return { ...candidate, data: { ...candidate.data, sections } };
  });
}

export function renameBuildStage(
  state: PublicationState,
  stageId: string,
  name: string,
): PublicationState {
  return updateStage(state, stageId, (stage) => ({
    ...stage,
    data: { ...stage.data, name },
  }));
}

export function replaceBuildStagePlanner(
  state: PublicationState,
  stageId: string,
  planner: SoulframeBuild,
): PublicationState {
  return updateStage(state, stageId, (stage) => ({
    ...stage,
    data: { ...stage.data, planner: clone(planner) },
  }));
}

export function addBuildVariant(
  state: PublicationState,
  activeStageId: string,
  name: string,
  mode: "copy-active" | "start-empty",
  emptyPlanner: SoulframeBuild,
  makeId: IdFactory = makeRandomId,
): PublicationState {
  const stages = buildStages(state);
  const home = stages.find((stage) => stage.data.role === "home");
  const active = stages.find((stage) => stage.id === activeStageId) ?? home;
  if (!home || home.data.role !== "home" || !active) return state;
  const homeIds = new Set(home.data.sharedSections.map((section) => section.id));
  let sections: BuildStageSectionChoice[];
  if (mode === "copy-active" && active.data.role === "variant") {
    sections = active.data.sections
      .filter((choice) => homeIds.has(choice.sectionId))
      .map((choice) =>
        choice.mode === "override"
          ? {
              ...choice,
              blocks: cloneSupportingBlocks(choice.blocks, makeId),
            }
          : { ...choice },
      );
  } else {
    sections = home.data.sharedSections.map((section) => ({
      sectionId: section.id,
      mode: "inherit" as const,
    }));
  }
  const planner =
    mode === "copy-active" ? clone(active.data.planner) : clone(emptyPlanner);
  return {
    ...state,
    blocks: [
      ...state.blocks,
      {
        id: makeId(),
        type: "soulframe.build.stage",
        schemaVersion: 1,
        data: {
          role: "variant",
          name: name.trim() || "Variant",
          planner,
          sections,
        },
      },
    ],
  };
}

export function removeBuildVariant(
  state: PublicationState,
  stageId: string,
): PublicationState {
  return {
    ...state,
    blocks: state.blocks.filter(
      (block) =>
        !(
          block.type === "soulframe.build.stage" &&
          block.id === stageId &&
          block.data.role === "variant"
        ),
    ),
  };
}
