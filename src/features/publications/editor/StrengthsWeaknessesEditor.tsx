"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type {
  StrengthsWeaknessesRow,
  StrengthsWeaknessesSide,
} from "./soulframeBuildComposerModel";
import { SectionFrame } from "./SectionFrame";

function SideEditor({
  side,
  rows,
  onChange,
}: {
  side: StrengthsWeaknessesSide;
  rows: StrengthsWeaknessesRow[];
  onChange: (rows: StrengthsWeaknessesRow[]) => void;
}) {
  const label = side === "strengths" ? "Strengths" : "Weaknesses";
  const pendingFocusRef = useRef<string | "add" | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    pendingFocusRef.current = null;
    if (pending === "add") addButtonRef.current?.focus();
    else document.getElementById(`build-${side}-${pending}`)?.focus();
  }, [rows, side]);
  const addRow = (after = rows.length - 1) => {
    const row = { id: crypto.randomUUID(), content: "" };
    const next = [...rows];
    next.splice(after + 1, 0, row);
    pendingFocusRef.current = row.id;
    onChange(next);
  };
  return (
    <fieldset className={`min-w-0 border-l-2 pl-3 ${side === "strengths" ? "border-gold/65" : "border-red-300/45"}`}>
      <legend className="px-1 font-sans text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </legend>
      <div className="mt-2 grid gap-2">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_2.5rem] items-center gap-2"
          >
            <span aria-hidden="true" className="text-gold/70">•</span>
            <label className="sr-only" htmlFor={`build-${side}-${row.id}`}>
              {label} row {index + 1}
            </label>
            <input
              id={`build-${side}-${row.id}`}
              value={row.content}
              onChange={(event) =>
                onChange(
                  rows.map((candidate) =>
                    candidate.id === row.id
                      ? { ...candidate, content: event.target.value }
                      : candidate,
                  ),
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addRow(index);
                }
              }}
              className="min-h-10 min-w-0 flex-1 rounded-sm border border-line/60 bg-control/55 px-3 font-sans text-sm text-ink focus-visible:outline-none focus-visible:shadow-focus"
            />
            <button
              type="button"
              aria-label={`Remove ${label.toLowerCase()} row ${index + 1}`}
              onClick={() => {
                const next = rows.filter((candidate) => candidate.id !== row.id);
                pendingFocusRef.current =
                  next[index]?.id ?? next[index - 1]?.id ?? "add";
                onChange(next);
              }}
              className="size-10 flex-none rounded-sm border border-transparent font-sans text-lg text-ink-muted hover:border-red-300/40 hover:text-red-200"
            >
              ×
            </button>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="py-2 font-sans text-xs text-ink-faint">
            No {label.toLowerCase()} added yet.
          </p>
        ) : null}
        <button
          ref={addButtonRef}
          id={`build-${side}-add`}
          type="button"
          onClick={() => addRow()}
          className="min-h-9 justify-self-start rounded-sm px-1 font-sans text-2xs font-bold uppercase tracking-wider text-gold hover:text-gold-bright"
        >
          + Add {side === "strengths" ? "Strength" : "Weakness"}
        </button>
      </div>
    </fieldset>
  );
}

export function StrengthsWeaknessesEditor({
  strengths,
  weaknesses,
  onStrengthsChange,
  onWeaknessesChange,
  legacyContent,
  hasStructuredContent,
}: {
  strengths: StrengthsWeaknessesRow[];
  weaknesses: StrengthsWeaknessesRow[];
  onStrengthsChange: (rows: StrengthsWeaknessesRow[]) => void;
  onWeaknessesChange: (rows: StrengthsWeaknessesRow[]) => void;
  legacyContent?: ReactNode;
  hasStructuredContent: boolean;
}) {
  if (!hasStructuredContent && legacyContent) {
    return (
      <SectionFrame
        kicker="Build content"
        title="Strengths & Weaknesses"
        description="Legacy supporting content is preserved exactly until you choose to structure it."
      >
        <div>
          <p className="mb-3 font-sans text-2xs font-bold uppercase tracking-wider text-ink-muted">
            Legacy supporting content
          </p>
          {legacyContent}
        </div>
      </SectionFrame>
    );
  }
  return (
    <SectionFrame
      kicker="Build content"
      title="Strengths & Weaknesses"
      description="Keep each point short and useful for players comparing this Build."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SideEditor side="strengths" rows={strengths} onChange={onStrengthsChange} />
        <SideEditor side="weaknesses" rows={weaknesses} onChange={onWeaknessesChange} />
      </div>
      {legacyContent ? (
        <div className="mt-5 border-t border-line/55 pt-4">
          <p className="mb-3 font-sans text-2xs font-bold uppercase tracking-wider text-ink-muted">
            Legacy supporting content
          </p>
          {legacyContent}
        </div>
      ) : null}
    </SectionFrame>
  );
}
