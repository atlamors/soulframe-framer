"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { DEFAULT_BUILD } from "@/app/builder/constants";
import {
  useActionState,
  useRef,
  useState,
} from "react";
import type { BlockNoteCompatibleDocument } from "@/src/domain/publications/blocks";
import type { SoulframeBuild } from "@/src/domain/types";
import type {
  PublicationState,
  PublicationStatus,
} from "@/src/domain/publications/types";
import {
  checkpointPublicationDraftAction,
  type CreateSoulframeBuildActionState,
  createAndPublishSoulframeBuildFromStateAction,
  createSoulframeBuildFromStateAction,
  saveAndPublishPublicationAction,
  savePublicationDraftAction,
  unpublishPublicationAction,
} from "../actions";
import { SoulframeFrameDisplay } from "../rendering/SoulframeFrameSnapshot";
import { RegisteredSemanticBlockRenderer } from "../rendering/SemanticBlocks";
import { PublicationRichTextEditor } from "./PublicationRichTextEditor";
import { publicationRichTextProfiles } from "./publicationRichTextEditorModel";
import { SectionFrame } from "./SectionFrame";
import { StrengthsWeaknessesEditor } from "./StrengthsWeaknessesEditor";
import {
  ActiveStageFoundationCard,
  VariantWorkspace,
} from "./VariantWorkspace";
import {
  addBuildVariant,
  buildHomeStage,
  buildStages,
  canonicalPublicationSlug,
  createBuildHomeStage,
  isValidPublicationSlug,
  partitionBuildSupportingSections,
  readStrengthsWeaknesses,
  removeBuildVariant,
  renameBuildStage,
  replaceBuildStagePlanner,
  resolvedSection,
  sectionDocument,
  SOULFRAME_BUILD_SECTION_IDS,
  updateHomeReservedSection,
  updateStrengthsWeaknessesSide,
  updateVariantDescription,
} from "./soulframeBuildComposerModel";
import { publicationLifecycle } from "./publicationComposerModel";
import { PublicationPublishingCard } from "./PublicationPublishingCard";

type ComposerMessage = { tone: "success" | "error"; text: string };

type SoulframeBuildComposerProps = {
  initialState: PublicationState;
  initialSlug: string;
  canPublish: boolean;
  message?: ComposerMessage;
} & (
  | { mode: "new" }
  | {
      mode: "persisted";
      publicationId: string;
      status: PublicationStatus;
      currentRelease: PublicationState | null;
    }
);

function RichTextPreview({
  document,
  id,
}: {
  document: BlockNoteCompatibleDocument;
  id: string;
}) {
  return (
    <RegisteredSemanticBlockRenderer
      block={{
        id,
        type: "nightfold.rich-text",
        schemaVersion: 1,
        data: { document },
      }}
    />
  );
}

function dialogContentClassName() {
  return "fixed top-1/2 left-1/2 z-100 max-h-[calc(100dvh-3rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-line-bright bg-overlay p-5 text-ink shadow-overlay";
}

function DialogFrame({
  title,
  children,
  onCloseAutoFocus,
}: {
  title: string;
  children: React.ReactNode;
  onCloseAutoFocus?: React.ComponentProps<typeof Dialog.Content>["onCloseAutoFocus"];
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-90 bg-scrim backdrop-blur-sm" />
      <Dialog.Content
        className={dialogContentClassName()}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <Dialog.Title className="font-display text-2xl uppercase tracking-wide text-gold-bright">
          {title}
        </Dialog.Title>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SoulframeBuildComposer(props: SoulframeBuildComposerProps) {
  const [draft, setDraft] = useState(props.initialState);
  const [initialSerialized] = useState(() => JSON.stringify(props.initialState));
  const [slug, setSlug] = useState(() =>
    props.mode === "new"
      ? canonicalPublicationSlug(
          props.initialSlug || props.initialState.metadata.title,
        )
      : props.initialSlug,
  );
  const slugManuallyEditedRef = useRef(
    props.mode === "new" && Boolean(props.initialSlug.trim()),
  );
  const [activeStageId, setActiveStageId] = useState(
    buildHomeStage(props.initialState)?.id ?? "",
  );
  const [preview, setPreview] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantMode, setVariantMode] = useState<
    "copy-active" | "start-empty"
  >("copy-active");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const variantTriggerRef = useRef<HTMLButtonElement>(null);
  const initialCreateState: CreateSoulframeBuildActionState = {
    status: "idle",
    message: "",
  };
  const [createState, createAction, createPending] = useActionState(
    createSoulframeBuildFromStateAction,
    initialCreateState,
  );
  const [createAndPublishState, createAndPublishAction, createAndPublishPending] =
    useActionState(
      createAndPublishSoulframeBuildFromStateAction,
      initialCreateState,
    );

  const serialized = JSON.stringify(draft);
  const stages = buildStages(draft);
  const home = buildHomeStage(draft);
  const activeStage =
    stages.find((stage) => stage.id === activeStageId) ?? home ?? stages[0];
  const lifecycle = publicationLifecycle(
    props.mode === "new" ? null : props.status,
    draft,
    props.mode === "new" ? null : props.initialState,
    props.mode === "persisted" ? props.currentRelease : null,
  );
  const slugValid =
    props.mode === "persisted" || isValidPublicationSlug(slug);
  const publishPrerequisite =
    !slugValid
      ? "Add a title or edit the route slug in Settings before saving."
      : !props.canPublish
        ? "Publishing is unavailable for this Creator Profile."
        : null;
  const newActionPending = createPending || createAndPublishPending;
  const newActionError =
    createAndPublishState.status === "error"
      ? createAndPublishState.message
      : createState.status === "error"
        ? createState.message
        : null;
  const homeSections =
    home?.data.role === "home"
      ? partitionBuildSupportingSections(home.data.sharedSections)
      : { global: [], stage: [] };
  const overviewDocument = sectionDocument(
    homeSections.global.find(
      (section) => section.id === SOULFRAME_BUILD_SECTION_IDS.overview,
    ),
  );
  const strengthsSection = homeSections.global.find(
    (section) =>
      section.id === SOULFRAME_BUILD_SECTION_IDS.strengthsWeaknesses,
  );
  const structuredSides = readStrengthsWeaknesses(strengthsSection);
  const strengthsRowsDocument: BlockNoteCompatibleDocument =
    structuredSides.strengths.map((row) => ({
      id: row.id,
      type: "bulletListItem",
      content: row.content,
    }));
  const weaknessesRowsDocument: BlockNoteCompatibleDocument =
    structuredSides.weaknesses.map((row) => ({
      id: row.id,
      type: "bulletListItem",
      content: row.content,
    }));
  const descriptionDocument =
    home && activeStage
      ? sectionDocument(
          resolvedSection(
            home,
            activeStage,
            SOULFRAME_BUILD_SECTION_IDS.variantDescription,
          ),
        )
      : [{ type: "paragraph" as const, content: "" }];

  const updateActiveStagePlanner = (planner: SoulframeBuild) => {
    if (!activeStage) return;
    setDraft((current) =>
      replaceBuildStagePlanner(current, activeStage.id, planner),
    );
  };

  const updateMetadata = (
    values: Partial<PublicationState["metadata"]>,
  ) => {
    setDraft((current) => ({
      ...current,
      metadata: { ...current.metadata, ...values },
    }));
  };

  const updateTitle = (title: string) => {
    updateMetadata({ title });
    if (props.mode === "new" && !slugManuallyEditedRef.current) {
      setSlug(canonicalPublicationSlug(title));
    }
  };

  const addVariant = () => {
    if (!variantName.trim()) return;
    const next = addBuildVariant(
      draft,
      activeStage?.id ?? home?.id ?? "",
      variantName,
      variantMode,
      DEFAULT_BUILD,
    );
    const nextStage = buildStages(next).at(-1);
    setDraft(next);
    if (nextStage) setActiveStageId(nextStage.id);
    setVariantName("");
    setVariantMode("copy-active");
    setVariantOpen(false);
  };

  const formAction =
    props.mode === "new" ? createAction : savePublicationDraftAction;

  return (
    <form
      action={formAction}
      className="min-h-[calc(100vh-3.5rem)] bg-surface-deep text-ink"
    >
      <input type="hidden" name="state" value={serialized} />
      <input type="hidden" name="slug" value={slug} />
      {props.mode === "persisted" ? (
        <input type="hidden" name="publicationId" value={props.publicationId} />
      ) : null}

      <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <aside
          aria-label="Publishing tools and reserved placements"
          className="grid gap-4 xl:sticky xl:top-20 xl:col-start-2 xl:row-start-1"
        >
          <section
            aria-label="Advertisement reserved placement"
            className="order-1 flex min-h-24 items-center justify-center rounded-md border border-dashed border-line/55 bg-surface/30 p-4 text-center xl:order-2"
          >
            <div>
              <p className="font-sans text-3xs font-bold uppercase tracking-[0.18em] text-ink-muted">
                Advertisement
              </p>
              <p className="mt-1 font-sans text-xs text-ink-faint">
                Reserved placement
              </p>
            </div>
          </section>

          <div className="order-2 xl:order-1">
            <PublicationPublishingCard
              lifecycle={lifecycle}
              title={draft.metadata.title}
              titleLabel="Build title"
              titlePlaceholder="Untitled Soulframe Build"
              onTitleChange={updateTitle}
              preview={preview}
              onPreview={() => setPreview((value) => !value)}
              saveDisabled={
                !slugValid ||
                (props.mode === "new"
                  ? newActionPending
                  : serialized === initialSerialized)
              }
              publishDisabled={
                !slugValid ||
                !props.canPublish ||
                (props.mode === "new"
                  ? newActionPending
                  : !lifecycle.publishNeeded)
              }
              savePending={createPending}
              publishPending={createAndPublishPending}
              publishAction={
                props.mode === "persisted"
                  ? saveAndPublishPublicationAction
                  : createAndPublishAction
              }
              prerequisite={publishPrerequisite}
            >
                <details
                  ref={detailsRef}
                  onKeyDown={(event) => {
                    if (event.key === "Escape")
                      detailsRef.current?.removeAttribute("open");
                  }}
                  className="relative"
                >
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center rounded-sm border border-line px-3 font-sans text-xs font-bold uppercase text-ink-soft">
                    More
                  </summary>
                  <div className="absolute top-full right-0 z-30 mt-1 grid min-w-56 rounded-md border border-line-bright bg-overlay p-2 shadow-overlay">
                    {props.mode === "persisted" ? (
                      <>
                        <button
                          type="submit"
                          formAction={checkpointPublicationDraftAction}
                          formNoValidate
                          className="min-h-10 rounded-sm px-3 text-left font-sans text-xs text-ink-soft hover:bg-control"
                        >
                          Checkpoint saved draft
                        </button>
                        {props.status === "published" ? (
                          <button
                            type="submit"
                            formAction={unpublishPublicationAction}
                            formNoValidate
                            className="min-h-10 rounded-sm px-3 text-left font-sans text-xs text-red-200 hover:bg-control"
                          >
                            Unpublish
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    {activeStage?.data.role === "variant" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((current) =>
                            removeBuildVariant(current, activeStage.id),
                          );
                          setActiveStageId(home?.id ?? "");
                          detailsRef.current?.removeAttribute("open");
                        }}
                        className="min-h-10 rounded-sm px-3 text-left font-sans text-xs text-red-200 hover:bg-control"
                      >
                        Remove active variant
                      </button>
                    ) : null}
                  </div>
                </details>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="col-span-2 min-h-10 rounded-sm border border-line px-3 font-sans text-xs font-bold uppercase text-ink-soft"
                >
                  Settings
                </button>
            </PublicationPublishingCard>

            {props.message ? (
              <p
                role="status"
                className={`mt-3 font-sans text-xs ${props.message.tone === "error" ? "text-red-200" : "text-gold-bright"}`}
              >
                {props.message.text}
              </p>
            ) : null}
            {newActionError ? (
              <p role="alert" className="mt-3 font-sans text-xs text-red-200">
                {newActionError}
              </p>
            ) : null}
          </div>

          <section
            aria-label="Advertisement reserved placement"
            className="order-3 hidden min-h-24 items-center justify-center rounded-md border border-dashed border-line/55 bg-surface/30 p-4 text-center xl:flex"
          >
            <div>
              <p className="font-sans text-3xs font-bold uppercase tracking-[0.18em] text-ink-muted">
                Advertisement
              </p>
              <p className="mt-1 font-sans text-xs text-ink-faint">
                Reserved placement
              </p>
            </div>
          </section>
        </aside>

        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          {!home ? (
            <section>
              <div className="rounded-md border border-gold/50 bg-surface p-6 shadow-panel">
                <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
                  Legacy Build recovery
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-wide text-gold-bright">
                  Home Frame required
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-ink-soft">
                  This saved Build has no Home Frame. Create one explicitly
                  before editing Build content or Variants. Nothing is persisted
                  until you choose Save Draft.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const next = createBuildHomeStage(draft, DEFAULT_BUILD);
                    const nextHome = buildHomeStage(next);
                    setDraft(next);
                    if (nextHome) setActiveStageId(nextHome.id);
                  }}
                  className="mt-5 min-h-11 rounded-sm border border-gold bg-control-hover px-4 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright"
                >
                  Create Home Frame
                </button>
              </div>
            </section>
          ) : preview ? (
            <div className="space-y-6">
              <SectionFrame
                kicker="Draft preview"
                title={draft.metadata.title || "Untitled Build"}
                description={draft.metadata.summary}
              >
                <RichTextPreview
                  id="preview-overview"
                  document={overviewDocument}
                />
              </SectionFrame>
              <div className="grid gap-5 md:grid-cols-2">
                <SectionFrame title="Strengths">
                  <RichTextPreview
                    id="preview-strengths"
                    document={strengthsRowsDocument}
                  />
                </SectionFrame>
                <SectionFrame title="Weaknesses">
                  <RichTextPreview
                    id="preview-weaknesses"
                    document={weaknessesRowsDocument}
                  />
                </SectionFrame>
              </div>
              {structuredSides.legacyBlocks.length ? (
                <SectionFrame title="Legacy supporting content">
                  {structuredSides.legacyBlocks.map((block) => (
                    <RegisteredSemanticBlockRenderer
                      key={block.id}
                      block={block}
                    />
                  ))}
                </SectionFrame>
              ) : null}
              {activeStage ? (
                <section className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
                  <div className="overflow-hidden rounded-md">
                    <SoulframeFrameDisplay planner={activeStage.data.planner} />
                  </div>
                  <SectionFrame title={activeStage.data.name}>
                    <RichTextPreview
                      id={`preview-${activeStage.id}`}
                      document={descriptionDocument}
                    />
                  </SectionFrame>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="min-w-0 space-y-6">
                {activeStage ? (
                  <ActiveStageFoundationCard
                    key={activeStage.id}
                    planner={activeStage.data.planner}
                    onPlannerChange={updateActiveStagePlanner}
                  />
                ) : null}
                <SectionFrame
                  kicker="Build content"
                  title="Build Overview"
                  description="Explain the purpose, playstyle, and progression path."
                >
                  <PublicationRichTextEditor
                    key="build-overview"
                    label="Build overview"
                    placeholder="Describe how the build plays, what it solves, and how to progress it…"
                    capabilities={publicationRichTextProfiles.buildOverview}
                    initialDocument={overviewDocument}
                    onChange={(document) =>
                      setDraft((current) =>
                        updateHomeReservedSection(
                          current,
                          SOULFRAME_BUILD_SECTION_IDS.overview,
                          document,
                        ),
                      )
                    }
                  />
                </SectionFrame>
                <StrengthsWeaknessesEditor
                  strengths={structuredSides.strengths}
                  weaknesses={structuredSides.weaknesses}
                  onStrengthsChange={(rows) =>
                    setDraft((current) =>
                      updateStrengthsWeaknessesSide(
                        current,
                        "strengths",
                        rows,
                      ),
                    )
                  }
                  onWeaknessesChange={(rows) =>
                    setDraft((current) =>
                      updateStrengthsWeaknessesSide(
                        current,
                        "weaknesses",
                        rows,
                      ),
                    )
                  }
                  hasStructuredContent={structuredSides.hasStructuredContent}
                  legacyContent={
                    structuredSides.legacyBlocks.length
                      ? structuredSides.legacyBlocks.map((block) => (
                          <RegisteredSemanticBlockRenderer
                            key={block.id}
                            block={block}
                          />
                        ))
                      : undefined
                  }
                />
              </div>
              <div className="min-w-0">
                {activeStage ? (
                  <VariantWorkspace
                    stages={stages}
                    activeStage={activeStage}
                    descriptionDocument={descriptionDocument}
                    onSelect={setActiveStageId}
                    onAdd={(trigger) => {
                      variantTriggerRef.current = trigger;
                      setVariantOpen(true);
                    }}
                    onNameChange={(stageId, name) =>
                      setDraft((current) =>
                        renameBuildStage(current, stageId, name),
                      )
                    }
                    onPlannerChange={updateActiveStagePlanner}
                    onDescriptionChange={(document) =>
                      setDraft((current) =>
                        updateVariantDescription(
                          current,
                          activeStage.id,
                          document,
                        ),
                      )
                    }
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog.Root open={variantOpen} onOpenChange={setVariantOpen}><DialogFrame title="Add Variant" onCloseAutoFocus={(event) => { event.preventDefault(); variantTriggerRef.current?.focus(); }}><div className="mt-5 grid gap-4"><label className="font-sans text-xs font-bold uppercase text-ink-muted">Variant name<input autoFocus value={variantName} onChange={(event) => setVariantName(event.target.value)} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-control px-3 text-ink" /></label><fieldset className="grid gap-2"><legend className="font-sans text-xs font-bold uppercase text-ink-muted">Starting point</legend><label className="flex min-h-11 items-center gap-3 rounded-sm border border-line px-3 font-sans text-sm"><input type="radio" checked={variantMode === "copy-active"} onChange={() => setVariantMode("copy-active")} />Copy Active</label><label className="flex min-h-11 items-center gap-3 rounded-sm border border-line px-3 font-sans text-sm"><input type="radio" checked={variantMode === "start-empty"} onChange={() => setVariantMode("start-empty")} />Start Empty</label></fieldset><div className="flex justify-end gap-2"><Dialog.Close className="min-h-11 rounded-sm border border-line px-4 font-sans text-xs font-bold uppercase text-ink-soft">Cancel</Dialog.Close><button type="button" disabled={!variantName.trim()} onClick={addVariant} className="min-h-11 rounded-sm border border-gold bg-control-hover px-4 font-sans text-xs font-bold uppercase text-gold-bright disabled:opacity-40">Add Variant</button></div></div></DialogFrame></Dialog.Root>

      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}><DialogFrame title="Build Settings"><div className="mt-5 grid gap-4"><label className="font-sans text-xs font-bold uppercase text-ink-muted">Route slug<input value={slug} readOnly={props.mode === "persisted"} onChange={(event) => { slugManuallyEditedRef.current = true; setSlug(canonicalPublicationSlug(event.target.value)); }} minLength={3} maxLength={100} aria-invalid={!slugValid} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-control px-3 text-ink read-only:text-ink-muted" /></label><label className="font-sans text-xs font-bold uppercase text-ink-muted">Summary / SEO text<textarea value={draft.metadata.summary ?? ""} onChange={(event) => updateMetadata({ summary: event.target.value || undefined })} maxLength={320} rows={4} className="mt-1 w-full rounded-sm border border-line bg-control p-3 text-ink" /></label><label className="font-sans text-xs font-bold uppercase text-ink-muted">Classifications<input value={draft.metadata.classifications.join(", ")} onChange={(event) => updateMetadata({ classifications: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-control px-3 text-ink" /></label><div className="flex justify-end"><Dialog.Close className="min-h-11 rounded-sm border border-gold bg-control-hover px-4 font-sans text-xs font-bold uppercase text-gold-bright">Done</Dialog.Close></div></div></DialogFrame></Dialog.Root>
    </form>
  );
}
