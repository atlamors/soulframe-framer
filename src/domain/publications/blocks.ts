import type { SoulframeBuild } from "../types";
import { BUILD_SCHEMA_VERSION } from "../serialization";
import type {
  PublicationProfileId,
  PublicationValidationIssue,
} from "./types";
import type { PublicationProfile } from "./profiles";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonObject
  | JsonValue[]
  | BlockNoteCompatibleBlock
  | BlockNoteInlineContent
  | BlockNoteInlineStyles;
export interface JsonObject {
  [key: string]: JsonValue;
}

export type PublicationBlockType =
  | "soulframe.build.stage"
  | "nightfold.heading"
  | "nightfold.rich-text";

export type BuildSupportingBlock = HeadingBlock | RichTextBlock;

export interface BuildSupportingSection {
  id: string;
  blocks: BuildSupportingBlock[];
}

export interface HomeBuildStageData {
  role: "home";
  name: string;
  /** Mechanical planner payload only; it intentionally has no publication data. */
  planner: SoulframeBuild;
  sharedSections: BuildSupportingSection[];
}

export type BuildStageSectionChoice =
  | { sectionId: string; mode: "inherit" }
  | {
      sectionId: string;
      mode: "override";
      blocks: BuildSupportingBlock[];
    };

export interface VariantBuildStageData {
  role: "variant";
  name: string;
  /** Mechanical planner payload only; it intentionally has no publication data. */
  planner: SoulframeBuild;
  /** Each section inherits directly from Home or supplies one replacement. */
  sections: BuildStageSectionChoice[];
}

export type BuildStageData = HomeBuildStageData | VariantBuildStageData;

export interface BuildStageBlock {
  id: string;
  type: "soulframe.build.stage";
  schemaVersion: 1;
  data: BuildStageData;
}

export interface HeadingBlock {
  id: string;
  type: "nightfold.heading";
  schemaVersion: 1;
  data: {
    level: 2 | 3 | 4;
    text: string;
  };
}

/**
 * BlockNote document JSON. Runtime validation must allow only Nightfold's
 * approved BlockNote schema and reject raw HTML and executable/styling fields.
 */
export interface BlockNoteInlineStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

export interface BlockNoteInlineText {
  type: "text";
  text: string;
  styles: BlockNoteInlineStyles;
}

export interface BlockNoteInlineLink {
  type: "link";
  href: string;
  content: BlockNoteInlineText[];
}

export type BlockNoteInlineContent = BlockNoteInlineText | BlockNoteInlineLink;

export type BlockNoteTextAlignment = "left" | "center" | "right" | "justify";

export interface BlockNoteCommonProps {
  backgroundColor?: string;
  textColor?: string;
  textAlignment?: BlockNoteTextAlignment;
}

interface BlockNoteCompatibleBlockBase {
  id?: string;
  content?: string | BlockNoteInlineContent[];
  children?: BlockNoteCompatibleBlock[];
}

export type BlockNoteCompatibleBlock = BlockNoteCompatibleBlockBase &
  (
    | {
        type: "paragraph" | "bulletListItem" | "quote";
        props?: BlockNoteCommonProps;
      }
    | {
        type: "numberedListItem";
        props?: BlockNoteCommonProps & { start?: number | string };
      }
    | {
        type: "checkListItem";
        props?: BlockNoteCommonProps & { checked?: boolean };
      }
    | {
        type: "codeBlock";
        props?: BlockNoteCommonProps & { language?: string };
      }
    | {
        type: "heading";
        props?: BlockNoteCommonProps & { level?: 2 | 3 | 4 };
      }
  );

export type BlockNoteCompatibleDocument = BlockNoteCompatibleBlock[];

export interface RichTextBlock {
  id: string;
  type: "nightfold.rich-text";
  schemaVersion: 1;
  data: {
    document: BlockNoteCompatibleDocument;
  };
}

export type PublicationBlock = BuildStageBlock | HeadingBlock | RichTextBlock;

export interface PublicationBlockDefinition<TBlock extends PublicationBlock> {
  type: TBlock["type"];
  schemaVersion: TBlock["schemaVersion"];
  eligibleProfiles: readonly PublicationProfileId[];
  inputControlKey: string;
  editorRepresentationKey: string;
  publicRendererKey: string;
  semanticElement: string;
  validate(block: TBlock): readonly PublicationValidationIssue[];
  extractSearchableText(block: TBlock): string;
}

const FORBIDDEN_RICH_TEXT_KEYS = new Set([
  "class",
  "classname",
  "css",
  "dangerouslysetinnerhtml",
  "html",
  "javascript",
  "onclick",
  "script",
  "style",
]);

const ALLOWED_BLOCKNOTE_BLOCK_TYPES = new Set([
  "paragraph",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "codeBlock",
  "quote",
  "heading",
]);

const ALLOWED_BLOCKNOTE_BLOCK_KEYS = new Set([
  "id",
  "type",
  "props",
  "content",
  "children",
]);
const ALLOWED_COMMON_BLOCK_PROPS = new Set([
  "backgroundColor",
  "textColor",
  "textAlignment",
]);
const ALLOWED_INLINE_STYLE_KEYS = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "textColor",
  "backgroundColor",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function inlineStylesAreValid(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, ALLOWED_INLINE_STYLE_KEYS)) {
    return false;
  }
  return Object.entries(value).every(([key, style]) =>
    key === "textColor" || key === "backgroundColor"
      ? typeof style === "string"
      : typeof style === "boolean",
  );
}

function inlineTextIsValid(value: unknown): value is BlockNoteInlineText {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, new Set(["type", "text", "styles"])) &&
    value.type === "text" &&
    typeof value.text === "string" &&
    inlineStylesAreValid(value.styles)
  );
}

function inlineContentIsValid(value: unknown): value is BlockNoteInlineContent {
  if (inlineTextIsValid(value)) return true;
  return (
    isRecord(value) &&
    hasOnlyKeys(value, new Set(["type", "href", "content"])) &&
    value.type === "link" &&
    typeof value.href === "string" &&
    Array.isArray(value.content) &&
    value.content.every(inlineTextIsValid)
  );
}

function blockPropsAreValid(type: string, value: unknown): boolean {
  if (value === undefined) return type !== "heading";
  if (!isRecord(value)) return false;
  const allowed = new Set(ALLOWED_COMMON_BLOCK_PROPS);
  if (type === "checkListItem") allowed.add("checked");
  if (type === "codeBlock") allowed.add("language");
  if (type === "numberedListItem") allowed.add("start");
  if (type === "heading") allowed.add("level");
  if (!hasOnlyKeys(value, allowed)) return false;
  if (type === "heading" && value.level === undefined) return false;
  return Object.entries(value).every(([key, property]) => {
    if (key === "checked") return typeof property === "boolean";
    if (key === "start") {
      return (
        (typeof property === "number" &&
          Number.isSafeInteger(property) &&
          property >= 1) ||
        (typeof property === "string" && /^[1-9][0-9]*$/.test(property))
      );
    }
    if (key === "level") return property === 2 || property === 3 || property === 4;
    if (key === "textAlignment") {
      return (
        property === "left" ||
        property === "center" ||
        property === "right" ||
        property === "justify"
      );
    }
    return typeof property === "string";
  });
}

function blockNoteBlockIsValid(value: unknown): value is BlockNoteCompatibleBlock {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ALLOWED_BLOCKNOTE_BLOCK_KEYS) ||
    typeof value.type !== "string" ||
    !ALLOWED_BLOCKNOTE_BLOCK_TYPES.has(value.type) ||
    (value.id !== undefined &&
      (typeof value.id !== "string" || !value.id.trim())) ||
    !blockPropsAreValid(value.type, value.props)
  ) {
    return false;
  }
  if (
    value.content !== undefined &&
    typeof value.content !== "string" &&
    (!Array.isArray(value.content) || !value.content.every(inlineContentIsValid))
  ) {
    return false;
  }
  return (
    value.children === undefined ||
    (Array.isArray(value.children) && value.children.every(blockNoteBlockIsValid))
  );
}

function collectJsonText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectJsonText);
  return Object.entries(value).flatMap(([key, nested]) =>
    key === "text" ? (typeof nested === "string" ? [nested] : []) : collectJsonText(nested),
  );
}

function containsForbiddenRichTextKey(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsForbiddenRichTextKey);
  return Object.entries(value).some(([key, nested]) => {
    const normalizedKey = key.toLowerCase();
    return (
      FORBIDDEN_RICH_TEXT_KEYS.has(normalizedKey) ||
      normalizedKey.startsWith("on") ||
      containsForbiddenRichTextKey(nested)
    );
  });
}

function usesOnlyApprovedBlockNoteBlocks(
  document: unknown,
): boolean {
  return Array.isArray(document) && document.every(blockNoteBlockIsValid);
}

function documentContainsBlockType(document: unknown, type: string): boolean {
  return Array.isArray(document) && document.some((block) =>
    isRecord(block) && (block.type === type || documentContainsBlockType(block.children, type)),
  );
}

function validateHeadingHierarchy(
  blocks: readonly unknown[],
  path: PublicationValidationIssue["path"],
  parentLevel: number,
  firstMinimum: number,
  firstMaximum: number,
  code: string,
  context: string,
): PublicationValidationIssue[] {
  let previousLevel = parentLevel;
  let seenHeading = false;
  const issues: PublicationValidationIssue[] = [];
  blocks.forEach((block) => {
    if (!isRecord(block) || block.type !== "nightfold.heading") return;
    const data = block.data;
    if (!isRecord(data) ||
      (data.level !== 2 && data.level !== 3 && data.level !== 4)) return;
    const level = data.level;
    if (
      (!seenHeading && (level < firstMinimum || level > firstMaximum)) ||
      level > previousLevel + 1
    ) {
      issues.push({
        code,
        message: `Heading level H${level} skips the ordered ${context} heading hierarchy.`,
        path,
      });
    }
    previousLevel = level;
    seenHeading = true;
  });
  return issues;
}

function validateSupportingBlocks(
  blocks: unknown,
  path: PublicationValidationIssue["path"],
): PublicationValidationIssue[] {
  if (!Array.isArray(blocks)) {
    return [{ code: "supporting-blocks-invalid", message: "Supporting blocks must be an ordered list.", path }];
  }

  const supportingBlocks: readonly unknown[] = blocks;
  const issues = supportingBlocks.flatMap((block) => {
    const type = (block as { type?: unknown } | null)?.type;
    const id = (block as { id?: unknown } | null)?.id;
    if (typeof id !== "string" || !id.trim()) {
      return [{ code: "supporting-block-id-required", message: "Every supporting block requires a stable identifier.", path }];
    }
    if (type !== "nightfold.heading" && type !== "nightfold.rich-text") {
      return [{ code: "supporting-block-not-allowed", message: "Build supporting sections allow only Heading and Rich Text blocks.", path }];
    }
    if ((block as { schemaVersion?: unknown }).schemaVersion !== 1) {
      return [{ code: "supporting-block-schema-unsupported", message: "A supporting block uses an unsupported schema version.", path }];
    }
    const validationIssues = PUBLICATION_BLOCK_REGISTRY[type]
      .validate(block as never)
      .map((issue) => ({ ...issue, path }));
    if (
      type === "nightfold.rich-text" &&
      documentContainsBlockType(
        (block as RichTextBlock).data?.document,
        "heading",
      )
    ) {
      validationIssues.push({
        code: "build-rich-text-heading-disallowed",
        message: "Build rich text does not allow nested headings.",
        path,
      });
    }
    return validationIssues;
  });
  return [
    ...issues,
    ...validateHeadingHierarchy(
      supportingBlocks,
      path,
      2,
      2,
      3,
      "build-heading-level-skipped",
      "Build section",
    ),
  ];
}

function duplicateValues(values: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

const stageDefinition: PublicationBlockDefinition<BuildStageBlock> = {
  type: "soulframe.build.stage",
  schemaVersion: 1,
  eligibleProfiles: ["soulframe.build"],
  inputControlKey: "soulframe.build-stage.v1",
  editorRepresentationKey: "soulframe.build-stage.v1",
  publicRendererKey: "soulframe.build-stage.v1",
  semanticElement: "section",
  validate: (block) => {
    const issues: PublicationValidationIssue[] = [];
    if (typeof block.data?.name !== "string" || !block.data.name.trim()) {
      issues.push({ code: "stage-name-required", message: "A stage name is required.", path: "blocks" });
    }
    if (block.data?.planner?.schemaVersion !== BUILD_SCHEMA_VERSION) {
      issues.push({ code: "planner-schema-unsupported", message: `The stage planner payload must use schema version ${BUILD_SCHEMA_VERSION}.`, path: "blocks" });
    }

    if (block.data?.role === "home") {
      if (!Array.isArray(block.data.sharedSections)) {
        issues.push({ code: "home-sections-invalid", message: "Home supporting sections must be an ordered list.", path: "blocks" });
        return issues;
      }
      const sectionIds = block.data.sharedSections.map((section) => section?.id);
      if (sectionIds.some((id) => typeof id !== "string" || !id.trim())) {
        issues.push({ code: "home-section-id-required", message: "Every Home supporting section requires an identifier.", path: "blocks" });
      }
      if (duplicateValues(sectionIds.filter((id): id is string => typeof id === "string")).size > 0) {
        issues.push({ code: "home-section-id-duplicate", message: "Home supporting section identifiers must be unique.", path: "blocks" });
      }
      block.data.sharedSections.forEach((section, index) => {
        issues.push(...validateSupportingBlocks(section?.blocks, `blocks.${index}.data`));
      });
      return issues;
    }

    if (block.data?.role === "variant") {
      if (!Array.isArray(block.data.sections)) {
        issues.push({ code: "variant-sections-invalid", message: "Variant section choices must be an ordered list.", path: "blocks" });
        return issues;
      }
      const sectionIds = block.data.sections.map((section) => section?.sectionId);
      if (sectionIds.some((id) => typeof id !== "string" || !id.trim())) {
        issues.push({ code: "variant-section-id-required", message: "Every Variant section choice requires a Home section identifier.", path: "blocks" });
      }
      if (duplicateValues(sectionIds.filter((id): id is string => typeof id === "string")).size > 0) {
        issues.push({ code: "variant-section-id-duplicate", message: "A Variant may reference each Home section only once.", path: "blocks" });
      }
      block.data.sections.forEach((section, index) => {
        if (section?.mode !== "inherit" && section?.mode !== "override") {
          issues.push({ code: "variant-section-mode-invalid", message: "A Variant section must inherit or override its Home section.", path: `blocks.${index}.data` });
        } else if (section.mode === "override") {
          issues.push(...validateSupportingBlocks(section.blocks, `blocks.${index}.data`));
        }
      });
      return issues;
    }

    issues.push({ code: "stage-role-invalid", message: "A Build stage must be Home or Variant.", path: "blocks" });
    return issues;
  },
  extractSearchableText: (block) => {
    const sections =
      block.data.role === "home"
        ? block.data.sharedSections
        : block.data.sections.flatMap((section) =>
            section.mode === "override"
              ? [{ id: section.sectionId, blocks: section.blocks }]
              : [],
          );
    return [
      block.data.name,
      ...sections.flatMap((section) =>
        section.blocks.map((child) =>
          PUBLICATION_BLOCK_REGISTRY[child.type].extractSearchableText(child as never),
        ),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  },
};

const headingDefinition: PublicationBlockDefinition<HeadingBlock> = {
  type: "nightfold.heading",
  schemaVersion: 1,
  eligibleProfiles: ["soulframe.build", "soulframe.guide"],
  inputControlKey: "nightfold.heading.v1",
  editorRepresentationKey: "nightfold.heading.v1",
  publicRendererKey: "nightfold.heading.v1",
  semanticElement: "heading",
  validate: (block) =>
    typeof block.data?.text === "string" &&
    block.data.text.trim() &&
    (block.data.level === 2 || block.data.level === 3 || block.data.level === 4)
      ? []
      : [{ code: "heading-invalid", message: "A Heading requires text and a supported semantic level.", path: "blocks" }],
  extractSearchableText: (block) => block.data?.text?.trim() ?? "",
};

const richTextDefinition: PublicationBlockDefinition<RichTextBlock> = {
  type: "nightfold.rich-text",
  schemaVersion: 1,
  eligibleProfiles: ["soulframe.build", "soulframe.guide"],
  inputControlKey: "nightfold.blocknote-restricted.v1",
  editorRepresentationKey: "nightfold.rich-text.v1",
  publicRendererKey: "nightfold.rich-text.v1",
  semanticElement: "div",
  validate: (block) =>
    !usesOnlyApprovedBlockNoteBlocks(block.data?.document)
      ? [{ code: "rich-text-block-type-disallowed", message: "Rich text contains a BlockNote block type outside the approved Nightfold schema.", path: "blocks" }]
      : containsForbiddenRichTextKey(block.data.document)
        ? [{ code: "rich-text-forbidden-content", message: "Rich text cannot contain CSS, JavaScript, event handlers, or raw HTML.", path: "blocks" }]
        : [],
  extractSearchableText: (block) =>
    collectJsonText(block.data.document).join(" ").replace(/\s+/g, " ").trim(),
};

export const PUBLICATION_BLOCK_REGISTRY = {
  "soulframe.build.stage": stageDefinition,
  "nightfold.heading": headingDefinition,
  "nightfold.rich-text": richTextDefinition,
} as const;

export function extractPublicationSearchableText(
  blocks: readonly PublicationBlock[],
): string {
  return blocks
    .map((block) =>
      PUBLICATION_BLOCK_REGISTRY[block.type].extractSearchableText(block as never),
    )
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function validatePublicationBlocks(
  profile: PublicationProfile,
  blocks: readonly PublicationBlock[],
): PublicationValidationIssue[] {
  const issues: PublicationValidationIssue[] = [];

  blocks.forEach((block, index) => {
    const type = (block as { type?: unknown } | null)?.type;
    const id = (block as { id?: unknown } | null)?.id;
    const path = `blocks.${index}` as const;
    if (typeof id !== "string" || !id.trim()) {
      issues.push({
        code: "block-id-required",
        message: "Every Publication block requires a stable identifier.",
        path,
      });
    }
    if (
      type !== "soulframe.build.stage" &&
      type !== "nightfold.heading" &&
      type !== "nightfold.rich-text"
    ) {
      issues.push({
        code: "block-type-unknown",
        message: "The Publication contains an unregistered root block type.",
        path,
      });
      return;
    }

    if ((block as { schemaVersion?: unknown }).schemaVersion !== 1) {
      issues.push({
        code: "block-schema-unsupported",
        message: `${type} uses an unsupported schema version.`,
        path,
      });
      return;
    }

    const definition = PUBLICATION_BLOCK_REGISTRY[type];
    const eligibleProfiles =
      definition.eligibleProfiles as readonly PublicationProfileId[];
    const rootRule = profile.blockRules.find(
      (rule) => rule.type === type && rule.placements.includes("root"),
    );
    if (
      !profile.allowedBlocks.includes(type) ||
      !eligibleProfiles.includes(profile.id) ||
      !rootRule
    ) {
      issues.push({
        code: "profile-root-block-not-allowed",
        message: `${type} is not allowed at the root of ${profile.id}.`,
        path,
      });
      return;
    }

    issues.push(
      ...definition
        .validate(block as never)
        .map((issue) => ({ ...issue, path })),
    );
  });

  for (const rule of profile.blockRules.filter((candidate) =>
    candidate.placements.includes("root"),
  )) {
    const count = blocks.filter((block) => block.type === rule.type).length;
    if (count < rule.minimum) {
      issues.push({
        code: `${rule.type}-minimum`,
        message: `${profile.id} requires at least ${rule.minimum} ${rule.type} block${rule.minimum === 1 ? "" : "s"}.`,
        path: "blocks",
      });
    }
    if (rule.maximum !== null && count > rule.maximum) {
      issues.push({
        code: `${rule.type}-maximum`,
        message: `${profile.id} allows at most ${rule.maximum} ${rule.type} block${rule.maximum === 1 ? "" : "s"}.`,
        path: "blocks",
      });
    }
  }

  if (profile.contentKind === "build") {
    const stages = blocks.filter(
      (block): block is BuildStageBlock =>
        (block as { type?: unknown } | null)?.type === "soulframe.build.stage",
    );
    const homes = stages.filter(
      (
        stage,
      ): stage is BuildStageBlock & { data: HomeBuildStageData } =>
        stage.data?.role === "home",
    );
    if (homes.length !== 1) {
      issues.push({
        code: "build-home-stage-count",
        message: "A Build must contain exactly one Home stage.",
        path: "blocks",
      });
    }

    if (homes.length === 1 && Array.isArray(homes[0].data.sharedSections)) {
      const homeSectionIds = new Set(
        homes[0].data.sharedSections
          .map((section) => section?.id)
          .filter((id): id is string => typeof id === "string"),
      );
      stages.forEach((stage, stageIndex) => {
        if (stage.data?.role !== "variant" || !Array.isArray(stage.data.sections)) return;
        stage.data.sections.forEach((section) => {
          if (
            typeof section?.sectionId === "string" &&
            !homeSectionIds.has(section.sectionId)
          ) {
            issues.push({
              code: "variant-home-section-unknown",
              message: `Variant section ${section.sectionId} does not reference a Home supporting section.`,
              path: `blocks.${stageIndex}.data`,
            });
          }
        });
      });
    }
  }

  if (profile.contentKind === "guide") {
    issues.push(
      ...validateHeadingHierarchy(
        blocks,
        "blocks",
        1,
        2,
        2,
        "guide-heading-level-skipped",
        "Guide",
      ),
    );
  }

  return issues;
}
