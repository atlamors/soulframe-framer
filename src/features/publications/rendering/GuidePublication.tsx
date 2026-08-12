import type {
  HeadingBlock,
  PublicationBlock,
} from "../../../domain/publications/blocks";
import type { ReactNode } from "react";
import type { PublicPublication } from "../../../server/contracts/publications";
import { ReadingColumn } from "../../../ui/layout";
import {
  createHeadingAnchorMap,
  RegisteredSemanticBlockRenderer,
} from "./SemanticBlocks";
import {
  PublicationHeader,
  PublicationStructuredData,
} from "./PublicationChrome";

export function GuidePublication({
  publication,
  canonicalUrl,
  voteControl,
}: {
  publication: PublicPublication;
  canonicalUrl: string;
  voteControl: ReactNode;
}) {
  const blocks: readonly PublicationBlock[] = publication.release.state.blocks;
  const headings = blocks.filter(
    (block): block is HeadingBlock => block.type === "nightfold.heading",
  );
  const anchors = createHeadingAnchorMap(headings);
  const sections = headings.map((heading) => ({
    name: heading.data.text,
    anchor: anchors.get(heading) ?? "section",
  }));

  return (
    <>
      <PublicationStructuredData
        publication={publication}
        canonicalUrl={canonicalUrl}
        guideSections={sections}
      />
      <main className="min-h-[calc(100vh-5rem)] px-4 py-10 text-ink sm:px-6">
        <article className="border border-line/70 bg-surface p-5 shadow-panel sm:p-8">
          <PublicationHeader
            publication={publication}
            kind="Guide"
            voteControl={voteControl}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <nav
              aria-label="Guide table of contents"
              className="h-fit border border-line/60 bg-surface-deep p-4 lg:sticky lg:top-24"
            >
              <h2 className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
                In this Guide
              </h2>
              <ol className="mt-3 space-y-1">
                {sections.map((section) => (
                  <li key={section.anchor}>
                    <a
                      href={`#${section.anchor}`}
                      className="inline-flex min-h-11 items-center font-sans text-sm text-ink-soft no-underline hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
                    >
                      {section.name}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <ReadingColumn className="min-w-0 space-y-5">
              {blocks.map((block) =>
                block.type === "nightfold.heading" ||
                block.type === "nightfold.rich-text" ? (
                  <RegisteredSemanticBlockRenderer
                    key={block.id}
                    block={block}
                    id={
                      block.type === "nightfold.heading"
                        ? anchors.get(block) ?? "section"
                        : undefined
                    }
                  />
                ) : null,
              )}
            </ReadingColumn>
          </div>
        </article>
      </main>
    </>
  );
}
