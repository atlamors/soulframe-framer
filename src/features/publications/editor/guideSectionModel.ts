import type {
  BlockNoteCompatibleDocument,
  HeadingBlock,
  PublicationBlock,
  RichTextBlock,
} from "@/src/domain/publications/blocks";

export type GuideSection = {
  id: string;
  heading: HeadingBlock;
  body: RichTextBlock;
};

const emptyDocument = (): BlockNoteCompatibleDocument => [
  { type: "paragraph", content: "" },
];

const generatedId = (kind: "heading" | "body", index: number) =>
  `guide-${kind}-${index + 1}`;

function uniqueId(preferred: string, unavailable: ReadonlySet<string>): string {
  const base = preferred.trim() || "guide-section";
  if (!unavailable.has(base)) return base;

  let suffix = 2;
  while (unavailable.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function mergedBody(
  first: RichTextBlock | undefined,
  rest: readonly RichTextBlock[],
  index: number,
  allocateGeneratedId: (preferred: string) => string,
): RichTextBlock {
  const body =
    first ??
    ({
      id: allocateGeneratedId(generatedId("body", index)),
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: { document: emptyDocument() },
    } satisfies RichTextBlock);

  return {
    ...body,
    data: {
      document: rest.reduce<BlockNoteCompatibleDocument>(
        (document, candidate) => [...document, ...candidate.data.document],
        [...body.data.document],
      ),
    },
  };
}

/** Converts the legacy root sequence into stable title/body editor units. */
export function guideSectionsFromBlocks(
  blocks: readonly PublicationBlock[],
): GuideSection[] {
  const originalIds = new Set(
    blocks.map((block) => block.id.trim()).filter(Boolean),
  );
  const assignedBlockIds = new Set<string>();
  const assignedSectionIds = new Set<string>();

  const normalizeBlockId = <TBlock extends HeadingBlock | RichTextBlock>(
    block: TBlock,
    kind: "heading" | "body",
    index: number,
  ): TBlock => {
    const preferred = block.id.trim() || generatedId(kind, index);
    const unavailable = new Set([...originalIds, ...assignedBlockIds]);
    const id =
      block.id.trim() && !assignedBlockIds.has(preferred)
        ? preferred
        : uniqueId(preferred, unavailable);
    assignedBlockIds.add(id);
    return id === block.id ? block : { ...block, id };
  };

  const allocateGeneratedBlockId = (preferred: string) => {
    const id = uniqueId(
      preferred,
      new Set([...originalIds, ...assignedBlockIds]),
    );
    assignedBlockIds.add(id);
    return id;
  };

  const allocateSectionId = (preferred: string) => {
    const id = uniqueId(preferred, assignedSectionIds);
    assignedSectionIds.add(id);
    return id;
  };

  const sections: GuideSection[] = [];
  let current: { heading: HeadingBlock; bodies: RichTextBlock[] } | null = null;
  const orphanBodies: RichTextBlock[] = [];

  const finish = () => {
    if (!current) return;
    const [first, ...rest] = current.bodies;
    const body = mergedBody(
      first,
      rest,
      sections.length,
      allocateGeneratedBlockId,
    );
    sections.push({
      id: allocateSectionId(current.heading.id),
      heading: current.heading,
      body,
    });
    current = null;
  };

  blocks.forEach((block, index) => {
    if (block.type === "nightfold.heading") {
      finish();
      const normalizedHeading = normalizeBlockId(block, "heading", index);
      current = {
        heading:
          normalizedHeading.data.level === 2
            ? normalizedHeading
            : {
                ...normalizedHeading,
                data: { ...normalizedHeading.data, level: 2 },
              },
        bodies: [],
      };
    } else if (block.type === "nightfold.rich-text") {
      const body = normalizeBlockId(block, "body", index);
      (current ? current.bodies : orphanBodies).push(body);
    }
  });
  finish();

  if (orphanBodies.length) {
    const [first, ...rest] = orphanBodies;
    const headingId = allocateGeneratedBlockId(generatedId("heading", 0));
    sections.unshift({
      id: allocateSectionId(headingId),
      heading: {
        id: headingId,
        type: "nightfold.heading",
        schemaVersion: 1,
        data: { level: 2, text: "Introduction" },
      },
      body: mergedBody(first, rest, 0, allocateGeneratedBlockId),
    });
  }

  return sections.length ? sections : [createGuideSection(0)];
}

export function flattenGuideSections(
  sections: readonly GuideSection[],
): PublicationBlock[] {
  return sections.flatMap((section) => [section.heading, section.body]);
}

export function createGuideSection(
  index: number,
  ids: { headingId?: string; bodyId?: string } = {},
): GuideSection {
  const headingId = ids.headingId ?? generatedId("heading", index);
  return {
    id: headingId,
    heading: {
      id: headingId,
      type: "nightfold.heading",
      schemaVersion: 1,
      data: { level: 2, text: index === 0 ? "Introduction" : "New section" },
    },
    body: {
      id: ids.bodyId ?? generatedId("body", index),
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: { document: emptyDocument() },
    },
  };
}

export function appendGuideSection(
  sections: readonly GuideSection[],
  ids: { headingId?: string; bodyId?: string } = {},
): GuideSection[] {
  const blockIds = new Set(
    sections.flatMap((section) => [section.heading.id, section.body.id]),
  );
  const sectionIds = new Set(sections.map((section) => section.id));
  const headingId = uniqueId(
    ids.headingId ?? generatedId("heading", sections.length),
    new Set([...blockIds, ...sectionIds]),
  );
  blockIds.add(headingId);
  const bodyId = uniqueId(
    ids.bodyId ?? generatedId("body", sections.length),
    blockIds,
  );
  return [
    ...sections,
    createGuideSection(sections.length, { headingId, bodyId }),
  ];
}

export const removeGuideSection = (
  sections: readonly GuideSection[],
  id: string,
) =>
  sections.length <= 1
    ? [...sections]
    : sections.filter((section) => section.id !== id);

export function reorderGuideSections(
  sections: readonly GuideSection[],
  activeId: string,
  overId: string,
): GuideSection[] {
  const from = sections.findIndex((section) => section.id === activeId);
  const to = sections.findIndex((section) => section.id === overId);
  if (from < 0 || to < 0 || from === to) return [...sections];
  const next = [...sections];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
