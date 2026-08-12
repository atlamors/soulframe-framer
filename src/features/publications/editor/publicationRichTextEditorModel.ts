export type PublicationHeadingLevel = 2 | 3 | 4;

export type PublicationRichTextCapabilities = {
  headings?: readonly PublicationHeadingLevel[];
  bulletList?: boolean;
  numberedList?: boolean;
  quote?: boolean;
  code?: boolean;
};

export type PublicationBlockControl =
  | { id: "paragraph"; type: "paragraph"; label: "Paragraph" }
  | {
      id: "heading-2" | "heading-3" | "heading-4";
      type: "heading";
      level: PublicationHeadingLevel;
      label: "Heading 2" | "Heading 3" | "Heading 4";
    }
  | {
      id: "bulletListItem";
      type: "bulletListItem";
      label: "Bulleted list";
    }
  | {
      id: "numberedListItem";
      type: "numberedListItem";
      label: "Numbered list";
    }
  | { id: "quote"; type: "quote"; label: "Quote" }
  | { id: "codeBlock"; type: "codeBlock"; label: "Code block" };

export type NormalizedPublicationRichTextCapabilities = Required<
  Omit<PublicationRichTextCapabilities, "headings">
> & {
  headings: PublicationHeadingLevel[];
};

export const publicationRichTextProfiles = {
  buildOverview: {
    bulletList: true,
    numberedList: true,
    quote: true,
    code: true,
  },
  guideSection: {
    headings: [2, 3, 4],
    bulletList: true,
    numberedList: true,
    quote: true,
    code: true,
  },
} as const satisfies Record<string, PublicationRichTextCapabilities>;

const allowedHeadingLevels: readonly PublicationHeadingLevel[] = [2, 3, 4];

export function normalizePublicationRichTextCapabilities(
  capabilities: PublicationRichTextCapabilities,
): NormalizedPublicationRichTextCapabilities {
  const headings = [...new Set(capabilities.headings ?? [])]
    .filter((level): level is PublicationHeadingLevel =>
      allowedHeadingLevels.includes(level),
    )
    .sort((left, right) => left - right);

  return {
    headings,
    bulletList: capabilities.bulletList === true,
    numberedList: capabilities.numberedList === true,
    quote: capabilities.quote === true,
    code: capabilities.code === true,
  };
}

export function publicationBlockControls(
  capabilities: PublicationRichTextCapabilities,
): PublicationBlockControl[] {
  const normalized = normalizePublicationRichTextCapabilities(capabilities);
  const controls: PublicationBlockControl[] = [
    { id: "paragraph", type: "paragraph", label: "Paragraph" },
  ];

  for (const level of normalized.headings) {
    controls.push({
      id: `heading-${level}` as "heading-2" | "heading-3" | "heading-4",
      type: "heading",
      level,
      label: `Heading ${level}` as "Heading 2" | "Heading 3" | "Heading 4",
    });
  }
  if (normalized.bulletList) {
    controls.push({ id: "bulletListItem", type: "bulletListItem", label: "Bulleted list" });
  }
  if (normalized.numberedList) {
    controls.push({ id: "numberedListItem", type: "numberedListItem", label: "Numbered list" });
  }
  if (normalized.quote) controls.push({ id: "quote", type: "quote", label: "Quote" });
  if (normalized.code) controls.push({ id: "codeBlock", type: "codeBlock", label: "Code block" });

  return controls;
}
