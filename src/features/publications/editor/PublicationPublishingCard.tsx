"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { PublicationLifecycle } from "./publicationComposerModel";

type PublicationPublishingCardProps = {
  lifecycle: PublicationLifecycle;
  title: string;
  titleLabel?: string;
  titlePlaceholder?: string;
  onTitleChange(value: string): void;
  saveDisabled: boolean;
  publishDisabled: boolean;
  savePending?: boolean;
  publishPending?: boolean;
  preview: boolean;
  onPreview(): void;
  publishAction?: ButtonHTMLAttributes<HTMLButtonElement>["formAction"];
  prerequisite?: string | null;
  publicHref?: string;
  children?: ReactNode;
};

export function PublicationPublishingCard({
  lifecycle,
  title,
  titleLabel = "Title",
  titlePlaceholder,
  onTitleChange,
  saveDisabled,
  publishDisabled,
  savePending = false,
  publishPending = false,
  preview,
  onPreview,
  publishAction,
  prerequisite,
  publicHref,
  children,
}: PublicationPublishingCardProps) {
  const { pending: formPending } = useFormStatus();
  const saving = savePending || formPending;
  const publishing = publishPending || formPending;

  return (
    <section
      aria-labelledby="composer-publishing-title"
      className="rounded-md border border-line/40 bg-surface-raised/75"
    >
      <header className="flex items-start justify-between gap-3 border-b border-line/55 px-4 py-3">
        <h2
          id="composer-publishing-title"
          className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-ink"
        >
          Publishing
        </h2>
        <div className="text-right">
          <p className="font-sans text-xs font-bold uppercase tracking-wide text-gold-bright">
            {lifecycle.visibility}
          </p>
          <p className="mt-0.5 font-sans text-3xs text-ink-muted">
            {lifecycle.detail}
          </p>
        </div>
      </header>

      <div className="p-4">
        <label className="font-sans text-3xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          {titleLabel}
          <input
            placeholder={titlePlaceholder}
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={160}
            className="mt-1 min-h-11 w-full rounded-sm border border-line/60 bg-control/45 px-3 font-display text-lg tracking-wide text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {publicHref ? (
            <Link
              href={publicHref}
              className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-sm border border-gold/70 px-3 font-sans text-xs font-bold uppercase text-gold-bright no-underline hover:bg-control"
            >
              View published
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={saveDisabled || formPending}
            className="min-h-10 rounded-sm border border-gold bg-control-hover px-3 font-sans text-xs font-bold uppercase text-gold-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            aria-pressed={preview}
            onClick={onPreview}
            className="min-h-10 rounded-sm border border-line px-3 font-sans text-xs font-bold uppercase text-ink-soft"
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            type="submit"
            formAction={publishAction}
            formNoValidate
            disabled={publishDisabled || formPending}
            aria-describedby={prerequisite ? "composer-publish-prerequisite" : undefined}
            className="min-h-10 rounded-sm border border-gold bg-gold px-3 font-sans text-xs font-bold uppercase text-surface-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? "Publishing..." : lifecycle.publishLabel}
          </button>
          {children}
        </div>

        {prerequisite ? (
          <p
            id="composer-publish-prerequisite"
            className="mt-3 font-sans text-xs leading-5 text-ink-muted"
          >
            {prerequisite}
          </p>
        ) : null}
      </div>
    </section>
  );
}
