"use client";

import dynamic from "next/dynamic";
import type { BlockNoteCompatibleDocument } from "@/src/domain/publications/blocks";
import type { PublicationRichTextCapabilities } from "./publicationRichTextEditorModel";

const PublicationRichTextEditorClient = dynamic(
  () => import("./PublicationRichTextEditorClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-44 border border-line/65 bg-surface-deep/70 p-4 font-sans text-sm text-ink-muted">
        Loading editor…
      </div>
    ),
  },
);

export function PublicationRichTextEditor({
  initialDocument,
  onChange,
  label,
  placeholder,
  capabilities,
}: {
  initialDocument: BlockNoteCompatibleDocument;
  onChange: (document: BlockNoteCompatibleDocument) => void;
  label: string;
  placeholder: string;
  capabilities: PublicationRichTextCapabilities;
}) {
  return (
    <PublicationRichTextEditorClient
      initialDocument={initialDocument}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      capabilities={capabilities}
    />
  );
}
