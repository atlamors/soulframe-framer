"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type {
  BuildStageBlock,
  BuildSupportingBlock,
  BuildSupportingSection,
  HeadingBlock,
} from "../../../domain/publications/blocks";
import { serializeBuild } from "../../../domain/serialization";
import type { PublicPublication } from "../../../server/contracts/publications";
import { ReadingColumn } from "../../../ui/layout";
import {
  partitionBuildSupportingSections,
  readStrengthsWeaknesses,
  SOULFRAME_BUILD_SECTION_IDS,
} from "../editor/soulframeBuildComposerModel";
import { SectionFrame } from "../editor/SectionFrame";
import {
  createHeadingAnchorMap,
  RegisteredSemanticBlockRenderer,
  slugifyHeading,
} from "./SemanticBlocks";
import {
  PublicationHeader,
  PublicationStructuredData,
} from "./PublicationChrome";
import { PublicBuildStageModules } from "./PublicBuildStageModules";

function resolvedSections(
  stage: BuildStageBlock,
  home: BuildStageBlock,
): readonly BuildSupportingSection[] {
  if (stage.data.role === "home") return stage.data.sharedSections;
  if (stage.data.role !== "variant" || home.data.role !== "home") return [];
  const variantSections = stage.data.sections;
  return home.data.sharedSections.map((section) => {
    const choice = variantSections.find(
      (candidate) => candidate.sectionId === section.id,
    );
    return {
      id: section.id,
      blocks:
        choice?.mode === "override" ? choice.blocks : section.blocks,
    };
  });
}

function SupportingContent({
  sections,
  stageAnchor,
  showReservedHeading = true,
}: {
  sections: readonly BuildSupportingSection[];
  stageAnchor: string;
  showReservedHeading?: boolean;
}) {
  const headings = sections.flatMap((section) =>
    section.blocks.filter(
      (block): block is HeadingBlock => block.type === "nightfold.heading",
    ),
  );
  const anchors = createHeadingAnchorMap(headings, stageAnchor);
  return (
    <ReadingColumn className="space-y-5">
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {showReservedHeading &&
          section.id === SOULFRAME_BUILD_SECTION_IDS.variantDescription ? (
            <h3 className="font-display text-2xl uppercase tracking-wide text-gold-bright">
              Variant Description
            </h3>
          ) : null}
          {section.blocks.map((block: BuildSupportingBlock) =>
            <RegisteredSemanticBlockRenderer
              key={block.id}
              block={block}
              id={
                block.type === "nightfold.heading"
                  ? anchors.get(block) ?? `${stageAnchor}-section`
                  : undefined
              }
            />,
          )}
        </div>
      ))}
    </ReadingColumn>
  );
}

function stageAnchors(stages: readonly BuildStageBlock[]): readonly string[] {
  const occurrences = new Map<string, number>();
  return stages.map((stage) => {
    const base = slugifyHeading(stage.data.name);
    const occurrence = (occurrences.get(base) ?? 0) + 1;
    occurrences.set(base, occurrence);
    return `stage-${base}${occurrence === 1 ? "" : `-${occurrence}`}`;
  });
}

export function BuildPublication({
  publication,
  canonicalUrl,
  voteControl,
}: {
  publication: PublicPublication;
  canonicalUrl: string;
  voteControl: ReactNode;
}) {
  const stages = publication.release.state.blocks.filter(
    (block): block is BuildStageBlock => block.type === "soulframe.build.stage",
  );
  const home = stages.find((stage) => stage.data.role === "home");
  const anchors = stageAnchors(stages);
  const tabsId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [selectedStageId, setSelectedStageId] = useState(
    home?.id ?? stages[0]?.id ?? "",
  );
  if (!home) return null;
  const homeSections =
    home.data.role === "home"
      ? partitionBuildSupportingSections(home.data.sharedSections)
      : { global: [], stage: [] };
  const selectedIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === selectedStageId),
  );
  const selectedStage = stages[selectedIndex] ?? home;
  const tabId = (index: number) => `${tabsId}-tab-${index}`;
  const panelId = (index: number) => `${tabsId}-panel-${index}`;
  const selectedOpenInFramer = `/soulframe/framer?${new URLSearchParams({
    build: serializeBuild(selectedStage.data.planner),
  })}`;
  const selectFromKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (direction === 0) return;
    event.preventDefault();
    const nextIndex = (index + direction + stages.length) % stages.length;
    const nextStage = stages[nextIndex];
    setSelectedStageId(nextStage.id);
    document.getElementById(tabId(nextIndex))?.focus();
  };

  return (
    <>
      <PublicationStructuredData
        publication={publication}
        canonicalUrl={canonicalUrl}
      />
      <main className="min-h-[calc(100vh-5rem)] px-4 py-10 text-ink sm:px-6">
        <article className="border border-line/70 bg-surface p-5 shadow-panel sm:p-8">
          <PublicationHeader
            publication={publication}
            kind="Build"
            voteControl={voteControl}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3 font-sans text-xs text-ink-muted">
            <span>Game · Soulframe</span>
          </div>

          {homeSections.global.length > 0 ? (
            <div className="mt-8 space-y-5">
              {homeSections.global.map((section) => (
                <SectionFrame
                  key={section.id}
                  title={
                    section.id === SOULFRAME_BUILD_SECTION_IDS.overview
                      ? "Build Overview"
                      : "Strengths & Weaknesses"
                  }
                >
                  {section.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses ? (() => {
                    const structured = readStrengthsWeaknesses(section);
                    if (!structured.hasStructuredContent) {
                      return (
                        <SupportingContent
                          sections={[section]}
                          stageAnchor="build-strengths-legacy"
                        />
                      );
                    }
                    return (
                      <>
                        <div className="grid gap-5 md:grid-cols-2">
                          {(["strengths", "weaknesses"] as const).map((side) => (
                            <section key={side} className={`border-l-2 pl-4 ${side === "strengths" ? "border-gold/65" : "border-red-300/45"}`}>
                              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-ink">{side}</h3>
                              <ul className="mt-3 space-y-2 font-sans text-sm leading-6 text-ink-soft">
                                {structured[side].map((row) => <li key={row.id} className="flex gap-2"><span aria-hidden="true" className="text-gold">•</span><span>{row.content}</span></li>)}
                              </ul>
                            </section>
                          ))}
                        </div>
                        {structured.legacyBlocks.length ? (
                          <div className="border-t border-line/55 pt-4">
                            <p className="mb-3 font-sans text-2xs font-bold uppercase tracking-wider text-ink-muted">Legacy supporting content</p>
                            <SupportingContent sections={[{ ...section, blocks: structured.legacyBlocks }]} stageAnchor="build-strengths-legacy" />
                          </div>
                        ) : null}
                      </>
                    );
                  })() : (
                    <SupportingContent sections={[section]} stageAnchor="build" />
                  )}
                </SectionFrame>
              ))}
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            <div className="rounded-md border border-line/40 bg-surface-raised/55">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/55 px-4 py-2.5">
                <h2 className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-ink">
                  Build
                </h2>
                <Link
                  href={selectedOpenInFramer}
                  className="inline-flex min-h-11 items-center rounded-sm border border-gold/70 bg-control/45 px-4 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright no-underline focus-visible:outline-none focus-visible:shadow-focus"
                >
                  Open in Framer
                </Link>
              </div>
              <div
                role="tablist"
                aria-label="Build stages"
                className="flex min-w-0 overflow-x-auto px-2 pt-2"
              >
                {stages.map((stage, index) => {
                  const selected = stage.id === selectedStage.id;
                  return (
                    <button
                      key={stage.id}
                      id={tabId(index)}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={panelId(index)}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setSelectedStageId(stage.id)}
                      onKeyDown={(event) => selectFromKeyboard(event, index)}
                      className={`min-h-11 flex-none rounded-sm border-b-2 border-transparent px-4 font-sans text-xs font-bold uppercase tracking-wide ${selected ? "border-gold text-gold-bright" : "text-ink-soft"}`}
                    >
                      {stage.data.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {stages.map((stage, index) => {
              const selected = stage.id === selectedStage.id;
              const stageAnchor = anchors[index] ?? `stage-${index}`;
              const stageSections = partitionBuildSupportingSections(
                resolvedSections(stage, home),
              ).stage;
              return (
                <section
                  key={stage.id}
                  id={panelId(index)}
                  role="tabpanel"
                  aria-labelledby={tabId(index)}
                  tabIndex={selected ? 0 : -1}
                  hidden={!selected}
                  className="space-y-5"
                >
                  {selected ? (
                    <>
                      <PublicBuildStageModules build={stage.data.planner} />
                      {stageSections.length > 0 ? (
                        <SectionFrame title="Description">
                          <SupportingContent
                            sections={stageSections}
                            stageAnchor={stageAnchor}
                            showReservedHeading={false}
                          />
                        </SectionFrame>
                      ) : null}
                    </>
                  ) : null}
                </section>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}
