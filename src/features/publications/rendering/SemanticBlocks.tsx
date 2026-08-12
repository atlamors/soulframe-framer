import { createElement } from "react";
import type {
  BlockNoteCompatibleDocument,
  HeadingBlock,
  JsonValue,
  PublicationBlock,
  RichTextBlock,
} from "../../../domain/publications/blocks";
import { PUBLICATION_BLOCK_REGISTRY } from "../../../domain/publications/blocks";

function collectSafeText(value: JsonValue): string {
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(collectSafeText).join(" ");
  return Object.entries(value)
    .filter(([key]) => key === "text" || key === "content" || key === "children")
    .map(([, nested]) => collectSafeText(nested))
    .join(" ");
}

function blockText(value: JsonValue): string {
  return collectSafeText(value).replace(/\s+/g, " ").trim();
}

function RichDocumentBlock({
  block,
  index,
}: {
  block: BlockNoteCompatibleDocument[number];
  index: number;
}) {
  const type = typeof block.type === "string" ? block.type : "paragraph";
  const text = blockText(block);
  const key = typeof block.id === "string" ? block.id : `${type}-${index}`;
  if (!text) return null;

  if (type === "heading") {
    const level = (block.props as { level?: 2 | 3 | 4 } | undefined)?.level;
    return createElement(
      `h${level === 3 || level === 4 ? level : 2}`,
      { key, className: "font-display text-xl tracking-wide text-gold-bright" },
      text,
    );
  }

  if (type === "quote") {
    return (
      <blockquote key={key} className="border-l-2 border-gold pl-4 italic text-ink-soft">
        {text}
      </blockquote>
    );
  }
  if (type === "codeBlock") {
    return (
      <pre key={key} className="overflow-x-auto border border-line/60 bg-surface-deep p-3 text-sm">
        <code>{text}</code>
      </pre>
    );
  }
  if (type === "numberedListItem") {
    return (
      <ol key={key} className="list-decimal pl-6">
        <li>{text}</li>
      </ol>
    );
  }
  if (type === "bulletListItem" || type === "checkListItem") {
    return (
      <ul key={key} className="list-disc pl-6">
        <li>{text}</li>
      </ul>
    );
  }
  return <p key={key}>{text}</p>;
}

export function RichTextRenderer({ block }: { block: RichTextBlock }) {
  return (
    <div className="space-y-3 font-sans text-base leading-7 text-ink-soft">
      {block.data.document.map((documentBlock, index) => (
        <RichDocumentBlock
          key={typeof documentBlock.id === "string" ? documentBlock.id : index}
          block={documentBlock}
          index={index}
        />
      ))}
    </div>
  );
}

export function slugifyHeading(value: string): string {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

export function createHeadingAnchorMap(
  headings: readonly HeadingBlock[],
  prefix?: string,
): ReadonlyMap<HeadingBlock, string> {
  const occurrences = new Map<string, number>();
  return new Map(
    headings.map((heading) => {
      const base = slugifyHeading(heading.data.text);
      const occurrence = (occurrences.get(base) ?? 0) + 1;
      occurrences.set(base, occurrence);
      const suffix = occurrence === 1 ? "" : `-${occurrence}`;
      return [
        heading,
        `${prefix ? `${prefix}-` : ""}${base}${suffix}`,
      ] as const;
    }),
  );
}

export function HeadingRenderer({
  block,
  id,
}: {
  block: HeadingBlock;
  id: string;
}) {
  return createElement(
    `h${block.data.level}`,
    {
      id,
      className:
        "scroll-mt-24 font-display text-2xl uppercase tracking-wide text-gold-bright",
    },
    block.data.text,
  );
}

type SemanticPublicationBlock = HeadingBlock | RichTextBlock;

const PUBLIC_SEMANTIC_BLOCK_RENDERERS = {
  "nightfold.heading.v1": (
    block: SemanticPublicationBlock,
    id?: string,
  ) =>
    block.type === "nightfold.heading" ? (
      <HeadingRenderer block={block} id={id ?? slugifyHeading(block.data.text)} />
    ) : null,
  "nightfold.rich-text.v1": (
    block: SemanticPublicationBlock,
    id?: string,
  ) => {
    void id;
    return block.type === "nightfold.rich-text" ? (
      <RichTextRenderer block={block} />
    ) : null;
  },
} as const;

export function RegisteredSemanticBlockRenderer({
  block,
  id,
}: {
  block: SemanticPublicationBlock;
  id?: string;
  }) {
  const rendererKey = PUBLICATION_BLOCK_REGISTRY[block.type].publicRendererKey;
  const renderer =
    PUBLIC_SEMANTIC_BLOCK_RENDERERS[
      rendererKey as keyof typeof PUBLIC_SEMANTIC_BLOCK_RENDERERS
    ];
  return renderer(block, id);
}

export function isSemanticPublicationBlock(
  block: PublicationBlock,
): block is SemanticPublicationBlock {
  return (
    block.type === "nightfold.heading" ||
    block.type === "nightfold.rich-text"
  );
}
