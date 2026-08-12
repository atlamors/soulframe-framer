"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createElement,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  BlockNoteCompatibleDocument,
  JsonValue,
} from "../../../domain/publications/blocks";
import type {
  PublicationState,
  PublicationStatus,
} from "../../../domain/publications/types";
import {
  checkpointPublicationDraftAction,
  createAndPublishPublicationFromStateAction,
  createPublicationFromStateAction,
  saveAndPublishPublicationAction,
  savePublicationDraftAction,
  unpublishPublicationAction,
  type CreatePublicationActionState,
} from "../actions";
import { PublicationRichTextEditor } from "./PublicationRichTextEditor";
import { publicationRichTextProfiles } from "./publicationRichTextEditorModel";
import { PublicationPublishingCard } from "./PublicationPublishingCard";
import {
  appendGuideSection,
  flattenGuideSections,
  guideSectionsFromBlocks,
  removeGuideSection,
  reorderGuideSections,
  type GuideSection,
} from "./guideSectionModel";
import {
  canonicalPublicationSlug,
  isValidPublicationSlug,
  publicationLifecycle,
} from "./publicationComposerModel";

type SoulframeGuideComposerProps = {
  initialState: PublicationState;
  initialSlug: string;
  canPublish: boolean;
  message?: { tone: "success" | "error"; text: string };
} &
  (
    | { mode: "new" }
    | {
        mode: "persisted";
        publicationId: string;
        status: PublicationStatus;
        currentRelease: PublicationState | null;
      }
  );

type SortableBindings = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners" | "setActivatorNodeRef"
>;

function collectText(value: JsonValue): string {
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  return Object.entries(value)
    .filter(([key]) => key === "text" || key === "content" || key === "children")
    .map(([, nested]) => collectText(nested))
    .join(" ");
}

function RichTextPreview({
  document,
}: {
  document: BlockNoteCompatibleDocument;
}) {
  return (
    <div className="space-y-3 font-sans text-sm leading-6 text-ink-soft">
      {document.map((block, index) => {
        const type = typeof block.type === "string" ? block.type : "paragraph";
        const text = collectText(block).replace(/\s+/g, " ").trim();
        const key = typeof block.id === "string" ? block.id : `${type}-${index}`;
        if (type === "heading") {
          const level = (block.props as { level?: 2 | 3 | 4 } | undefined)
            ?.level;
          const Tag = `h${level === 3 || level === 4 ? level : 2}` as
            | "h2"
            | "h3"
            | "h4";
          return (
            <Tag key={key} className="font-display text-xl text-gold">
              {text}
            </Tag>
          );
        }
        if (type === "quote") {
          return (
            <blockquote key={key} className="border-l-2 border-gold pl-4 italic">
              {text}
            </blockquote>
          );
        }
        if (type === "codeBlock") {
          return (
            <pre
              key={key}
              className="overflow-x-auto border border-line/60 bg-surface-deep p-3"
            >
              <code>{text}</code>
            </pre>
          );
        }
        return <p key={key}>{text || " "}</p>;
      })}
    </div>
  );
}

function GuidePreview({ state }: { state: PublicationState }) {
  return (
    <article className="rounded-md border border-line/70 bg-surface p-5 shadow-panel sm:p-7">
      <h1 className="font-display text-3xl tracking-wide text-gold-bright">
        {state.metadata.title || "Untitled Guide"}
      </h1>
      {state.metadata.summary ? (
        <p className="mt-3 font-sans text-sm leading-6 text-ink-soft">
          {state.metadata.summary}
        </p>
      ) : null}
      <div className="mt-7 space-y-6">
        {state.blocks.map((block) => {
          if (block.type === "nightfold.heading") {
            return createElement(
              `h${block.data.level}` as "h2" | "h3" | "h4",
              {
                key: block.id,
                className:
                  "font-display text-2xl tracking-wide text-gold-bright",
              },
              block.data.text || "Untitled section",
            );
          }
          if (block.type === "nightfold.rich-text") {
            return (
              <RichTextPreview key={block.id} document={block.data.document} />
            );
          }
          return null;
        })}
      </div>
    </article>
  );
}

function SortableHandle({
  sortableId,
  label,
  bindings,
  onHandleRef,
}: {
  sortableId: string;
  label: string;
  bindings: SortableBindings;
  onHandleRef(id: string, element: HTMLButtonElement | null): void;
}) {
  return (
    <button
      ref={(element) => {
        bindings.setActivatorNodeRef(element);
        onHandleRef(sortableId, element);
      }}
      type="button"
      aria-label={label}
      data-sortable-handle={sortableId}
      className="flex size-11 touch-none select-none items-center justify-center rounded-sm border border-line text-ink-muted hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
      {...bindings.attributes}
      {...bindings.listeners}
    >
      <span aria-hidden="true">⠿</span>
    </button>
  );
}

function GuideSectionCard({
  section,
  onChange,
  onRemove,
  removeDisabled,
  titleRef,
  onTitleFocus,
  dragHandle,
  nodeRef,
  style,
  dragging = false,
}: {
  section: GuideSection;
  onChange(section: GuideSection): void;
  onRemove(): void;
  removeDisabled: boolean;
  titleRef(id: string, element: HTMLInputElement | null): void;
  onTitleFocus(id: string): void;
  dragHandle?: ReactNode;
  nodeRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragging?: boolean;
}) {
  return (
    <section
      ref={nodeRef}
      id={`guide-section-${section.id}`}
      data-guide-section={section.id}
      style={style}
      className={`scroll-mt-24 rounded-md border border-line/70 bg-surface p-4 ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="mb-4 flex items-start gap-3">
        {dragHandle}
        <label className="min-w-0 flex-1 font-sans text-xs font-bold uppercase tracking-wide text-ink-muted">
          Section title
          <input
            ref={(element) => titleRef(section.id, element)}
            value={section.heading.data.text}
            onFocus={() => onTitleFocus(section.id)}
            onChange={(event) =>
              onChange({
                ...section,
                heading: {
                  ...section.heading,
                  data: {
                    ...section.heading.data,
                    text: event.target.value,
                  },
                },
              })
            }
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-control px-3 font-sans text-base normal-case tracking-normal text-ink"
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          title={
            removeDisabled
              ? "A Guide must keep at least one section."
              : "Remove section"
          }
          className="min-h-11 rounded-sm border border-red-400/50 px-3 font-sans text-xs text-red-200 disabled:cursor-not-allowed disabled:border-line disabled:text-ink-faint"
        >
          Remove
        </button>
      </div>
      <PublicationRichTextEditor
        initialDocument={section.body.data.document}
        label={`${section.heading.data.text || "Section"} content`}
        placeholder="Write this section, or type / for H2, H3, H4 and supporting blocks…"
        capabilities={publicationRichTextProfiles.guideSection}
        onChange={(document) =>
          onChange({
            ...section,
            body: { ...section.body, data: { document } },
          })
        }
      />
    </section>
  );
}

function SortableCard({
  section,
  onChange,
  onRemove,
  removeDisabled,
  titleRef,
  onTitleFocus,
  onHandleRef,
  reduceMotion,
}: {
  section: GuideSection;
  onChange(section: GuideSection): void;
  onRemove(): void;
  removeDisabled: boolean;
  titleRef(id: string, element: HTMLInputElement | null): void;
  onTitleFocus(id: string): void;
  onHandleRef(id: string, element: HTMLButtonElement | null): void;
  reduceMotion: boolean;
}) {
  const sortableId = `card:${section.id}`;
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  return (
    <GuideSectionCard
      section={section}
      onChange={onChange}
      onRemove={onRemove}
      removeDisabled={removeDisabled}
      titleRef={titleRef}
      onTitleFocus={onTitleFocus}
      nodeRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reduceMotion ? "none" : transition,
      }}
      dragging={isDragging}
      dragHandle={
        <SortableHandle
          sortableId={sortableId}
          label={`Reorder ${section.heading.data.text || "section"}`}
          bindings={{ attributes, listeners, setActivatorNodeRef }}
          onHandleRef={onHandleRef}
        />
      }
    />
  );
}

function SortableIndexRow({
  section,
  active,
  onFocus,
  onHandleRef,
  reduceMotion,
}: {
  section: GuideSection;
  active: boolean;
  onFocus(): void;
  onHandleRef(id: string, element: HTMLButtonElement | null): void;
  reduceMotion: boolean;
}) {
  const sortableId = `index:${section.id}`;
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reduceMotion ? "none" : transition,
      }}
      data-guide-index-row={section.id}
      className={`flex min-w-0 items-center gap-2 border-b py-2 ${
        active ? "border-gold/60 bg-gold/5" : "border-line/50"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <SortableHandle
        sortableId={sortableId}
        label={`Reorder ${section.heading.data.text || "section"}`}
        bindings={{ attributes, listeners, setActivatorNodeRef }}
        onHandleRef={onHandleRef}
      />
      <button
        type="button"
        aria-current={active ? "location" : undefined}
        onClick={onFocus}
        className={`min-h-11 min-w-0 flex-1 truncate text-left font-sans text-sm hover:text-gold-bright ${
          active ? "text-gold-bright" : "text-ink-soft"
        }`}
      >
        {section.heading.data.text || "Untitled section"}
      </button>
    </div>
  );
}

function DragPreview({ section }: { section: GuideSection | undefined }) {
  return (
    <div className="border border-gold bg-surface-raised px-4 py-3 font-sans text-sm text-gold-bright shadow-overlay">
      {section?.heading.data.text || "Untitled section"}
    </div>
  );
}

function MoreMenu({ children }: { children: ReactNode }) {
  return (
    <details className="relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center rounded-sm border border-line px-3 font-sans text-xs font-bold uppercase text-ink-soft">
        More
      </summary>
      <div className="absolute top-full right-0 z-30 mt-1 grid min-w-64 gap-2 rounded-md border border-line-bright bg-overlay p-3 shadow-overlay">
        {children}
      </div>
    </details>
  );
}

export function SoulframeGuideComposer(props: SoulframeGuideComposerProps) {
  const dndContextId = useId();
  const [draft, setDraft] = useState(props.initialState);
  const [desktop, setDesktop] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeSortableId, setActiveSortableId] = useState<string | null>(null);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const titles = useRef(new Map<string, HTMLInputElement>());
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const pendingHeadingFocus = useRef<string | null>(null);
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
  const [preview, setPreview] = useState(false);
  const [initialSerialized] = useState(() => JSON.stringify(props.initialState));

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateDesktop = () => setDesktop(desktopQuery.matches);
    const updateMotion = () => setReduceMotion(motionQuery.matches);
    updateDesktop();
    updateMotion();
    desktopQuery.addEventListener("change", updateDesktop);
    motionQuery.addEventListener("change", updateMotion);
    return () => {
      desktopQuery.removeEventListener("change", updateDesktop);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  const idle: CreatePublicationActionState = { status: "idle", message: "" };
  const [createState, createAction, createPending] = useActionState(
    createPublicationFromStateAction,
    idle,
  );
  const [publishState, publishAction, publishPending] = useActionState(
    createAndPublishPublicationFromStateAction,
    idle,
  );

  const sections = guideSectionsFromBlocks(draft.blocks);
  const normalizedDraft: PublicationState = {
    ...draft,
    blocks: flattenGuideSections(sections),
  };

  useEffect(() => {
    const sectionId = pendingHeadingFocus.current;
    if (!sectionId) return;
    const input = titles.current.get(sectionId);
    if (!input) return;
    pendingHeadingFocus.current = null;
    input.focus();
    setFocusedSectionId(sectionId);
  }, [sections]);

  const setSections = (next: GuideSection[]) =>
    setDraft((current) => ({
      ...current,
      blocks: flattenGuideSections(next),
    }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const serialized = JSON.stringify(normalizedDraft);
  const lifecycle = publicationLifecycle(
    props.mode === "new" ? null : props.status,
    normalizedDraft,
    props.mode === "new" ? null : props.initialState,
    props.mode === "persisted" ? props.currentRelease : null,
  );
  const dirty = props.mode === "new" || serialized !== initialSerialized;
  const slugValid = props.mode === "persisted" || isValidPublicationSlug(slug);
  const pending = createPending || publishPending;
  const actionError =
    publishState.status === "error"
      ? publishState.message
      : createState.status === "error"
        ? createState.message
        : null;
  const prerequisite = !slugValid
    ? "Add a title or edit the route slug before saving or publishing."
    : !props.canPublish
      ? "Publishing is unavailable for this Creator Profile."
      : null;

  const activeSectionId = activeSortableId?.replace(/^(card|index):/, "");
  const activeSection = sections.find(
    (section) => section.id === activeSectionId,
  );

  const updateTitle = (title: string) => {
    setDraft((current) => ({
      ...current,
      metadata: { ...current.metadata, title },
    }));
    if (props.mode === "new" && !slugManuallyEditedRef.current) {
      setSlug(canonicalPublicationSlug(title));
    }
  };

  const updateSection = (next: GuideSection) =>
    setSections(
      sections.map((section) => (section.id === next.id ? next : section)),
    );

  const registerTitle = (id: string, element: HTMLInputElement | null) => {
    if (element) titles.current.set(id, element);
    else titles.current.delete(id);
  };

  const registerHandle = (id: string, element: HTMLButtonElement | null) => {
    if (element) handles.current.set(id, element);
    else handles.current.delete(id);
  };

  const restoreHandleFocus = (sortableId: string | null) => {
    if (!sortableId) return;
    requestAnimationFrame(() => handles.current.get(sortableId)?.focus());
  };

  const onDragEnd = (event: DragEndEvent) => {
    const sortableId = String(event.active.id);
    const active = sortableId.replace(/^(card|index):/, "");
    const over = event.over
      ? String(event.over.id).replace(/^(card|index):/, "")
      : active;
    setActiveSortableId(null);
    setFocusedSectionId(active);
    setSections(reorderGuideSections(sections, active, over));
    restoreHandleFocus(sortableId);
  };

  const onDragCancel = () => {
    const sortableId = activeSortableId;
    setActiveSortableId(null);
    restoreHandleFocus(sortableId);
  };

  const cardProps = (section: GuideSection) => ({
    section,
    onChange: updateSection,
    onRemove: () =>
      setSections(removeGuideSection(sections, section.id)),
    removeDisabled: sections.length <= 1,
    titleRef: registerTitle,
    onTitleFocus: setFocusedSectionId,
  });

  const desktopCards = (
    <div className="space-y-5">
      {sections.map((section) => (
        <GuideSectionCard key={section.id} {...cardProps(section)} />
      ))}
    </div>
  );

  const mobileCards = (
    <DndContext
      id={`${dndContextId}-cards`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveSortableId(String(event.active.id))}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sections.map((section) => `card:${section.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-5">
          {sections.map((section) => (
            <SortableCard
              key={section.id}
              {...cardProps(section)}
              onHandleRef={registerHandle}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={reduceMotion ? null : undefined}>
        {activeSection ? <DragPreview section={activeSection} /> : null}
      </DragOverlay>
    </DndContext>
  );

  return (
    <form
      action={props.mode === "new" ? createAction : savePublicationDraftAction}
      className="min-h-[calc(100vh-3.5rem)] bg-surface-deep px-4 py-6 text-ink sm:px-6"
    >
      <input type="hidden" name="state" value={serialized} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="profileId" value="soulframe.guide" />
      {props.mode === "persisted" ? (
        <input type="hidden" name="publicationId" value={props.publicationId} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <main className="min-w-0 space-y-5">
          {actionError || props.message ? (
            <p
              role={
                actionError || props.message?.tone === "error"
                  ? "alert"
                  : "status"
              }
              className={`rounded-sm border p-3 font-sans text-sm ${
                actionError || props.message?.tone === "error"
                  ? "border-red-400/50 text-red-200"
                  : "border-gold/50 text-ink-soft"
              }`}
            >
              {actionError ?? props.message?.text}
            </p>
          ) : null}

          {preview ? (
            <GuidePreview state={normalizedDraft} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-sans text-sm font-bold uppercase tracking-wide text-ink">
                  Guide
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    const next = appendGuideSection(sections, {
                      headingId: crypto.randomUUID(),
                      bodyId: crypto.randomUUID(),
                    });
                    const added = next.at(-1);
                    if (added) pendingHeadingFocus.current = added.id;
                    setSections(next);
                  }}
                  className="min-h-11 rounded-sm border border-line px-3 font-sans text-xs font-bold uppercase text-ink"
                >
                  Add section
                </button>
              </div>
              {desktop ? desktopCards : mobileCards}
            </>
          )}
        </main>

        <aside className="xl:sticky xl:top-20 xl:h-fit">
          <PublicationPublishingCard
            lifecycle={lifecycle}
            title={draft.metadata.title}
            titleLabel="Guide title"
            titlePlaceholder="Untitled Soulframe Guide"
            onTitleChange={updateTitle}
            preview={preview}
            onPreview={() => setPreview((value) => !value)}
            saveDisabled={!dirty || !slugValid || pending}
            publishDisabled={
              !slugValid ||
              !props.canPublish ||
              pending ||
              (props.mode === "persisted" && !lifecycle.publishNeeded)
            }
            savePending={createPending}
            publishPending={publishPending}
            publishAction={
              props.mode === "new"
                ? publishAction
                : saveAndPublishPublicationAction
            }
            prerequisite={prerequisite}
          >
            <MoreMenu>
              <label className="font-sans text-3xs font-bold uppercase tracking-wide text-ink-muted">
                Route slug
                <input
                  value={slug}
                  readOnly={props.mode === "persisted"}
                  onChange={(event) => {
                    slugManuallyEditedRef.current = true;
                    setSlug(canonicalPublicationSlug(event.target.value));
                  }}
                  className="mt-1 min-h-10 w-full rounded-sm border border-line bg-control px-3 text-ink read-only:text-ink-muted"
                />
              </label>
              <label className="font-sans text-3xs font-bold uppercase tracking-wide text-ink-muted">
                Summary
                <textarea
                  value={draft.metadata.summary ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      metadata: {
                        ...current.metadata,
                        summary: event.target.value || undefined,
                      },
                    }))
                  }
                  rows={3}
                  maxLength={320}
                  className="mt-1 w-full rounded-sm border border-line bg-control p-3 text-ink"
                />
              </label>
              <label className="font-sans text-3xs font-bold uppercase tracking-wide text-ink-muted">
                Classifications
                <input
                  value={draft.metadata.classifications.join(", ")}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      metadata: {
                        ...current.metadata,
                        classifications: event.target.value
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  className="mt-1 min-h-11 w-full rounded-sm border border-line bg-control px-3 text-ink"
                />
              </label>
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
            </MoreMenu>
          </PublicationPublishingCard>

          {desktop ? (
            <DndContext
              id={`${dndContextId}-index`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) =>
                setActiveSortableId(String(event.active.id))
              }
              onDragCancel={onDragCancel}
              onDragEnd={onDragEnd}
            >
              <section
                aria-label="Guide index"
                className="mt-5 border border-line/70 bg-surface p-3"
              >
                <h2 className="font-sans text-xs font-bold uppercase tracking-wide text-gold">
                  Guide index
                </h2>
                <SortableContext
                  items={sections.map((section) => `index:${section.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => (
                    <SortableIndexRow
                      key={section.id}
                      section={section}
                      active={focusedSectionId === section.id}
                      reduceMotion={reduceMotion}
                      onHandleRef={registerHandle}
                      onFocus={() => {
                        setFocusedSectionId(section.id);
                        document
                          .getElementById(`guide-section-${section.id}`)
                          ?.scrollIntoView({
                            behavior: reduceMotion ? "auto" : "smooth",
                            block: "center",
                          });
                        titles.current
                          .get(section.id)
                          ?.focus({ preventScroll: true });
                      }}
                    />
                  ))}
                </SortableContext>
              </section>
              <DragOverlay dropAnimation={reduceMotion ? null : undefined}>
                {activeSection ? <DragPreview section={activeSection} /> : null}
              </DragOverlay>
            </DndContext>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
