"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  CopyPlus,
  Ellipsis,
  FolderOpen,
  Link2,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { BuildPlannerArtifact } from "../../domain/artifacts/types";
import type { SoulframeBuild } from "../../domain/types";
import { useAlerts } from "../../../app/alerts/AlertsProvider";
import {
  deleteBuildPlannerArtifactAction,
  listBuildPlannerArtifactsAction,
  loadBuildPlannerArtifactAction,
  renameBuildPlannerArtifactAction,
  saveAsBuildPlannerArtifactAction,
  saveBuildPlannerArtifactAction,
} from "./actions";

type ActiveArtifact = Pick<BuildPlannerArtifact, "id" | "name">;

type ArtifactDialogState =
  | { kind: "load" }
  | { kind: "load-guard"; targetId: string; targetName: string }
  | {
      kind: "name";
      mode: "create" | "save-as";
      pendingLoadId?: string;
    }
  | { kind: "rename" }
  | { kind: "reset" }
  | { kind: "delete" };

const toolbarButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 border border-line-bright/45 bg-control px-3 font-sans text-2xs font-bold uppercase tracking-wide text-ink-soft shadow-control transition-colors hover:border-gold hover:bg-control-hover hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-default disabled:opacity-45 motion-reduce:transition-none";
const toolbarPrimaryButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 border border-gold/80 bg-control-hover px-3 font-sans text-2xs font-bold uppercase tracking-wide text-gold-bright shadow-control-active transition-colors hover:border-gold-bright focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-default disabled:opacity-45 motion-reduce:transition-none";
const primaryButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center border border-gold bg-control-hover px-4 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-wait disabled:opacity-60";
const quietButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center border border-line-bright/50 bg-control px-4 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft hover:border-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-wait disabled:opacity-60";
const dangerButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center border border-danger/70 bg-danger/10 px-4 font-sans text-xs font-bold uppercase tracking-wide text-ink hover:bg-danger/20 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-wait disabled:opacity-60";

function buildFingerprint(build: SoulframeBuild): string {
  return JSON.stringify(build);
}

function sortArtifacts(
  artifacts: readonly BuildPlannerArtifact[],
): BuildPlannerArtifact[] {
  return [...artifacts].sort(
    (left, right) =>
      right.updatedAt.localeCompare(left.updatedAt) ||
      left.id.localeCompare(right.id),
  );
}

function mergeArtifact(
  artifacts: readonly BuildPlannerArtifact[],
  artifact: BuildPlannerArtifact,
): BuildPlannerArtifact[] {
  return sortArtifacts([
    artifact,
    ...artifacts.filter((candidate) => candidate.id !== artifact.id),
  ]);
}

export function ArtifactControls({
  ownerId,
  build,
  isMobileSuppressed,
  publishHref,
  onNameChange,
  onReplaceBuild,
  onReset,
  onShare,
}: {
  ownerId: string;
  build: SoulframeBuild;
  isMobileSuppressed: boolean;
  publishHref: string;
  onNameChange: (name: string) => void;
  onReplaceBuild: (build: SoulframeBuild) => void;
  onReset: () => void;
  onShare: () => void;
}) {
  const { closeAlertCenter, notifyAlert } = useAlerts();
  const [activeArtifact, setActiveArtifact] = useState<ActiveArtifact | null>(
    null,
  );
  const [persistedBaseline, setPersistedBaseline] = useState<string | null>(
    null,
  );
  const [artifacts, setArtifacts] = useState<readonly BuildPlannerArtifact[]>(
    [],
  );
  const [dialog, setDialog] = useState<ArtifactDialogState | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const actionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const currentFingerprint = useMemo(() => buildFingerprint(build), [build]);
  const isDirty =
    activeArtifact === null ||
    persistedBaseline === null ||
    persistedBaseline !== currentFingerprint;

  useEffect(() => {
    if (!isActionsOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (actionsTriggerRef.current?.contains(event.target)) return;
      if (actionsMenuRef.current?.contains(event.target)) return;
      setIsActionsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsActionsOpen(false);
      actionsTriggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isActionsOpen]);

  const announceFailure = (message: string) => {
    notifyAlert({
      id: "builder.cloud-frame-error",
      title: "Cloud Frame action failed",
      description: message,
      severity: "danger",
    });
  };

  const announceSuccess = (title: string, description: string) => {
    notifyAlert({
      id: "builder.cloud-frame",
      title,
      description,
      severity: "info",
    });
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError(null);
  };

  const rememberTrigger = (trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    closeAlertCenter();
    setDialogError(null);
  };

  const applyArtifact = (artifact: BuildPlannerArtifact) => {
    onReplaceBuild(artifact.payload);
    setActiveArtifact({ id: artifact.id, name: artifact.name });
    setPersistedBaseline(buildFingerprint(artifact.payload));
    setArtifacts((current) => mergeArtifact(current, artifact));
  };

  const saveExisting = async (): Promise<boolean> => {
    if (!activeArtifact) return false;
    setIsBusy(true);
    setDialogError(null);
    try {
      const result = await saveBuildPlannerArtifactAction({
        mode: "update",
        ownerId,
        gameId: "soulframe",
        artifactId: activeArtifact.id,
        payload: build,
      });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return false;
      }
      applyArtifact(result.value);
      announceSuccess(
        "Cloud Frame saved",
        `${result.value.name} is up to date.`,
      );
      return true;
    } finally {
      setIsBusy(false);
    }
  };

  const loadArtifact = async (artifactId: string) => {
    setIsBusy(true);
    setDialogError(null);
    try {
      const result = await loadBuildPlannerArtifactAction({
        ownerId,
        gameId: "soulframe",
        artifactId,
      });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return;
      }
      if (!result.value) {
        const message = "That cloud Frame is no longer available.";
        setDialogError(message);
        announceFailure(message);
        return;
      }
      applyArtifact(result.value);
      closeDialog();
      announceSuccess(
        "Cloud Frame loaded",
        `${result.value.name} replaced the planner workspace.`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const refreshArtifacts = async () => {
    setIsListLoading(true);
    setDialogError(null);
    try {
      const result = await listBuildPlannerArtifactsAction({
        ownerId,
        gameId: "soulframe",
      });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return;
      }
      setArtifacts(result.value);
    } finally {
      setIsListLoading(false);
    }
  };

  const openLoadDialog = (trigger: HTMLButtonElement) => {
    rememberTrigger(trigger);
    setDialog({ kind: "load" });
    void refreshArtifacts();
  };

  const openNameDialog = (
    trigger: HTMLButtonElement,
    mode: "create" | "save-as",
    pendingLoadId?: string,
    preserveOuterTrigger = false,
  ) => {
    if (!preserveOuterTrigger) rememberTrigger(trigger);
    setNameValue(
      mode === "save-as"
        ? `${(activeArtifact?.name ?? build.name).slice(0, 115)} Copy`
        : build.name,
    );
    setDialog({ kind: "name", mode, pendingLoadId });
  };

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dialog?.kind !== "name") return;
    const name = nameValue.trim();
    if (!name) {
      setDialogError("Enter a name for this cloud Frame.");
      return;
    }

    setIsBusy(true);
    setDialogError(null);
    try {
      const result =
        dialog.mode === "create"
          ? await saveBuildPlannerArtifactAction({
              mode: "create",
              ownerId,
              gameId: "soulframe",
              name,
              payload: build,
            })
          : await saveAsBuildPlannerArtifactAction({
              ownerId,
              gameId: "soulframe",
              name,
              payload: build,
            });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return;
      }
      applyArtifact(result.value);
      announceSuccess(
        dialog.mode === "create" ? "Cloud Frame saved" : "Cloud copy created",
        `${result.value.name} is now the active cloud Frame.`,
      );
      const pendingLoadId = dialog.pendingLoadId;
      if (pendingLoadId) {
        setDialog({ kind: "load" });
        await loadArtifact(pendingLoadId);
      } else {
        closeDialog();
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleRenameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = nameValue.trim();
    if (!name) {
      setDialogError("Enter a name for this cloud Frame.");
      return;
    }

    if (!activeArtifact) {
      onNameChange(name);
      closeDialog();
      announceSuccess("Frame renamed", `The current Frame is now ${name}.`);
      return;
    }

    setIsBusy(true);
    setDialogError(null);
    try {
      const result = await renameBuildPlannerArtifactAction({
        ownerId,
        gameId: "soulframe",
        artifactId: activeArtifact.id,
        name,
      });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return;
      }
      setActiveArtifact({ id: result.value.id, name: result.value.name });
      setArtifacts((current) => mergeArtifact(current, result.value));
      closeDialog();
      announceSuccess(
        "Cloud Frame renamed",
        `The active cloud Frame is now ${result.value.name}.`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!activeArtifact) return;
    const deleted = activeArtifact;
    setIsBusy(true);
    setDialogError(null);
    try {
      const result = await deleteBuildPlannerArtifactAction({
        ownerId,
        gameId: "soulframe",
        artifactId: deleted.id,
      });
      if (!result.ok) {
        setDialogError(result.error.message);
        announceFailure(result.error.message);
        return;
      }
      setArtifacts((current) =>
        current.filter((artifact) => artifact.id !== deleted.id),
      );
      setActiveArtifact(null);
      setPersistedBaseline(null);
      closeDialog();
      announceSuccess(
        "Cloud Frame deleted",
        `${deleted.name} was deleted. Its planner data remains open as unsaved work.`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const beginLoad = (artifact: BuildPlannerArtifact) => {
    const targetMatchesWorkspace =
      buildFingerprint(artifact.payload) === currentFingerprint;
    if (isDirty && !targetMatchesWorkspace) {
      setDialog({
        kind: "load-guard",
        targetId: artifact.id,
        targetName: artifact.name,
      });
      setDialogError(null);
      return;
    }
    void loadArtifact(artifact.id);
  };

  const handleGuardSave = async (
    event: MouseEvent<HTMLButtonElement>,
    targetId: string,
  ) => {
    if (!activeArtifact) {
      openNameDialog(event.currentTarget, "create", targetId, true);
      return;
    }
    if (await saveExisting()) await loadArtifact(targetId);
  };

  const dialogTitle =
    dialog?.kind === "load"
      ? "Load cloud Frame"
      : dialog?.kind === "load-guard"
        ? "Unsaved planner changes"
        : dialog?.kind === "rename"
          ? "Rename Frame"
          : dialog?.kind === "reset"
            ? "Reset Frame"
            : dialog?.kind === "delete"
              ? "Delete cloud Frame"
              : dialog?.kind === "name" && dialog.mode === "save-as"
                ? "Save cloud Frame as"
                : "Save cloud Frame";

  return (
    <>
      <section
        className={`relative z-30 mt-2 flex min-h-12 items-center gap-1.5 border-y border-line/45 px-1.5 py-2 max-tablet:flex-wrap ${isMobileSuppressed ? "max-tablet:hidden" : ""}`}
        aria-label="Cloud Frame controls"
      >
        <div className="mr-auto flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2 font-sans text-xs text-ink max-tablet:mr-0 max-tablet:w-full max-tablet:flex-none max-tablet:basis-full">
          <span className="flex-none text-3xs font-bold uppercase tracking-wider text-gold">
            Frame
          </span>
          <span aria-hidden="true" className="text-ink-faint">
            ·
          </span>
          <span className="min-w-0 truncate font-bold">
            {activeArtifact?.name ?? build.name}
          </span>
          <span aria-hidden="true" className="text-ink-faint">
            ·
          </span>
          <span
            className={`flex-none text-3xs font-bold uppercase tracking-wider ${isDirty ? "text-gold" : "text-ink-faint"}`}
          >
            {activeArtifact
              ? isDirty
                ? "Unsaved changes"
                : "Saved"
              : "Local · Unsaved"}
          </span>
        </div>
        <button
          type="button"
          className={
            isDirty ? toolbarPrimaryButtonClassName : toolbarButtonClassName
          }
          disabled={isBusy}
          onClick={(event) => {
            if (activeArtifact) {
              void saveExisting();
            } else {
              openNameDialog(event.currentTarget, "create");
            }
          }}
        >
          <Save className="size-4" aria-hidden="true" />
          {activeArtifact ? "Save" : "Save Frame"}
        </button>
        <div className="relative">
          <button
            ref={actionsTriggerRef}
            type="button"
            className={toolbarButtonClassName}
            aria-label="More cloud Frame actions"
            aria-expanded={isActionsOpen}
            aria-controls="cloud-frame-actions-menu"
            onClick={() => setIsActionsOpen((open) => !open)}
          >
            <Ellipsis className="size-4" aria-hidden="true" />
            More
          </button>
          {isActionsOpen ? (
            <div
              ref={actionsMenuRef}
              id="cloud-frame-actions-menu"
              className="absolute top-[calc(100%+0.375rem)] right-0 z-60 flex w-48 flex-col gap-1 border border-line-bright/55 bg-surface-overlay p-1.5 shadow-popover"
              role="group"
              aria-label="Cloud Frame actions"
            >
              <button
                type="button"
                className={`${toolbarButtonClassName} w-full justify-start`}
                disabled={isBusy}
                onClick={(event) => {
                  const trigger =
                    actionsTriggerRef.current ?? event.currentTarget;
                  setIsActionsOpen(false);
                  openLoadDialog(trigger);
                }}
              >
                <FolderOpen className="size-4" aria-hidden="true" />
                Open another Frame
              </button>
              <button
                type="button"
                className={`${toolbarButtonClassName} w-full justify-start`}
                disabled={isBusy}
                onClick={(event) => {
                  const trigger =
                    actionsTriggerRef.current ?? event.currentTarget;
                  setIsActionsOpen(false);
                  openNameDialog(trigger, "save-as");
                }}
              >
                <CopyPlus className="size-4" aria-hidden="true" />
                Save As
              </button>
              <button
                type="button"
                className={`${toolbarButtonClassName} w-full justify-start`}
                disabled={isBusy}
                onClick={(event) => {
                  setIsActionsOpen(false);
                  rememberTrigger(
                    actionsTriggerRef.current ?? event.currentTarget,
                  );
                  setNameValue(activeArtifact?.name ?? build.name);
                  setDialog({ kind: "rename" });
                }}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Rename
              </button>
              <button
                type="button"
                className={`${toolbarButtonClassName} w-full justify-start`}
                disabled={isBusy}
                onClick={() => {
                  setIsActionsOpen(false);
                  onShare();
                }}
              >
                <Link2 className="size-4" aria-hidden="true" />
                Copy Frame Link
              </button>
              <button
                type="button"
                className={`${toolbarButtonClassName} w-full justify-start`}
                disabled={isBusy}
                onClick={(event) => {
                  setIsActionsOpen(false);
                  rememberTrigger(
                    actionsTriggerRef.current ?? event.currentTarget,
                  );
                  setDialog({ kind: "reset" });
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset Frame
              </button>
              {activeArtifact ? (
                <button
                  type="button"
                  className={`${toolbarButtonClassName} w-full justify-start text-danger`}
                  disabled={isBusy}
                  onClick={(event) => {
                    setIsActionsOpen(false);
                    rememberTrigger(
                      actionsTriggerRef.current ?? event.currentTarget,
                    );
                    setDialog({ kind: "delete" });
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <Link
          href={publishHref}
          className="inline-flex min-h-11 items-center justify-center border border-gold bg-control-hover px-4 font-sans text-2xs font-bold uppercase tracking-wide text-gold-bright no-underline shadow-control-active focus-visible:outline-none focus-visible:shadow-focus"
          aria-label="Publish the active Frame as a Build"
        >
          Publish Build
        </Link>
      </section>

      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !isBusy) closeDialog();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-scrim backdrop-blur-sm data-[state=open]:animate-fade-up motion-reduce:animate-none" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 z-[120] flex max-h-[min(80dvh,42rem)] w-[min(calc(100vw-2rem),36rem)] -translate-x-1/2 -translate-y-1/2 flex-col border border-line-bright/65 bg-surface-overlay text-ink shadow-overlay focus:outline-none"
            aria-describedby="cloud-frame-dialog-description"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              lastTriggerRef.current?.focus({ preventScroll: true });
            }}
          >
            <header className="flex min-h-14 items-center gap-3 border-b border-line/60 px-4">
              <Dialog.Title className="min-w-0 flex-1 font-display text-xl uppercase tracking-wide text-gold-bright">
                {dialogTitle}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent text-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
                  aria-label="Close cloud Frame dialog"
                  disabled={isBusy}
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </header>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-4">
              <Dialog.Description
                id="cloud-frame-dialog-description"
                className="font-sans text-sm leading-6 text-ink-soft"
              >
                {dialog?.kind === "load"
                  ? "Choose one of your Frames. Loading replaces the planner workspace."
                  : dialog?.kind === "load-guard"
                    ? `Save the current planner before loading ${dialog.targetName}, discard the current changes, or cancel.`
                    : dialog?.kind === "reset"
                      ? "Restore the default Frame? This replaces the current Frame."
                      : dialog?.kind === "delete"
                        ? `${activeArtifact?.name ?? "The active cloud Frame"} will be removed. The current planner payload will remain open as unsaved work.`
                        : "Cloud names identify your saved Frames and do not change publication data."}
              </Dialog.Description>

              {dialogError ? (
                <p
                  className="mt-3 border border-danger/60 bg-danger/10 px-3 py-2 font-sans text-sm text-ink"
                  role="alert"
                >
                  {dialogError}
                </p>
              ) : null}

              {dialog?.kind === "load" ? (
                <div className="mt-4 grid gap-2">
                  {isListLoading ? (
                    <p
                      className="py-4 font-sans text-sm text-ink-faint"
                      role="status"
                    >
                      Loading cloud Frames…
                    </p>
                  ) : artifacts.length === 0 ? (
                    <p className="py-4 font-sans text-sm text-ink-faint">
                      No cloud Frames yet.
                    </p>
                  ) : (
                    artifacts.map((artifact) => (
                      <button
                        type="button"
                        className="flex min-h-11 w-full cursor-pointer items-center gap-3 border border-line/50 bg-surface-deep px-3 text-left hover:border-gold hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-wait disabled:opacity-60"
                        key={artifact.id}
                        disabled={isBusy}
                        onClick={() => beginLoad(artifact)}
                      >
                        <span className="min-w-0 flex-1 truncate font-sans text-sm font-bold text-ink">
                          {artifact.name}
                        </span>
                        {artifact.id === activeArtifact?.id ? (
                          <span className="flex-none font-sans text-3xs font-bold uppercase tracking-wider text-gold">
                            Active
                          </span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              ) : null}

              {dialog?.kind === "name" ? (
                <form className="mt-4 grid gap-4" onSubmit={handleNameSubmit}>
                  <label className="grid gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-gold">
                    Cloud Frame name
                    <input
                      className="min-h-11 w-full border border-line-bright/50 bg-surface-deep px-3 font-sans text-sm text-ink outline-none focus:border-gold focus:shadow-focus"
                      value={nameValue}
                      onChange={(event) => setNameValue(event.target.value)}
                      required
                      maxLength={120}
                      autoFocus
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className={quietButtonClassName}
                      disabled={isBusy}
                      onClick={closeDialog}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={primaryButtonClassName}
                      disabled={isBusy}
                    >
                      {dialog.mode === "save-as" ? "Save As" : "Save"}
                    </button>
                  </div>
                </form>
              ) : null}

              {dialog?.kind === "rename" ? (
                <form className="mt-4 grid gap-4" onSubmit={handleRenameSubmit}>
                  <label className="grid gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-gold">
                    Cloud Frame name
                    <input
                      className="min-h-11 w-full border border-line-bright/50 bg-surface-deep px-3 font-sans text-sm text-ink outline-none focus:border-gold focus:shadow-focus"
                      value={nameValue}
                      onChange={(event) => setNameValue(event.target.value)}
                      required
                      maxLength={120}
                      autoFocus
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className={quietButtonClassName}
                      disabled={isBusy}
                      onClick={closeDialog}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={primaryButtonClassName}
                      disabled={isBusy}
                    >
                      Rename
                    </button>
                  </div>
                </form>
              ) : null}

              {dialog?.kind === "load-guard" ? (
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={primaryButtonClassName}
                    disabled={isBusy}
                    onClick={(event) =>
                      void handleGuardSave(event, dialog.targetId)
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={dangerButtonClassName}
                    disabled={isBusy}
                    onClick={() => void loadArtifact(dialog.targetId)}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className={quietButtonClassName}
                    disabled={isBusy}
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>
                </div>
              ) : null}

              {dialog?.kind === "delete" && activeArtifact ? (
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={quietButtonClassName}
                    disabled={isBusy}
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={dangerButtonClassName}
                    disabled={isBusy}
                    onClick={() => void handleDelete()}
                  >
                    Delete
                  </button>
                </div>
              ) : null}

              {dialog?.kind === "reset" ? (
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={quietButtonClassName}
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={dangerButtonClassName}
                    onClick={() => {
                      onReset();
                      closeDialog();
                    }}
                  >
                    Reset Frame
                  </button>
                </div>
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
