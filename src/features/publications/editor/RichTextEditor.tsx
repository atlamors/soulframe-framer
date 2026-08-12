"use client";

import {
  BlockNoteSchema,
  defaultBlockSpecs,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteCompatibleDocument } from "../../../domain/publications/blocks";

const restrictedSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    codeBlock: defaultBlockSpecs.codeBlock,
    quote: defaultBlockSpecs.quote,
  },
});

export default function RichTextEditor({
  initialDocument,
  onChange,
}: {
  initialDocument: BlockNoteCompatibleDocument;
  onChange: (document: BlockNoteCompatibleDocument) => void;
}) {
  const initialContent =
    initialDocument.length > 0
      ? initialDocument
      : [{ type: "paragraph", content: "" }];
  const editor = useCreateBlockNote({
    schema: restrictedSchema,
    initialContent: initialContent as typeof restrictedSchema.PartialBlock[],
  });

  return (
    <div
      role="group"
      aria-label="Restricted rich-text content"
      className="min-h-36 border border-line/70 bg-surface-deep text-ink"
    >
      <BlockNoteView
        editor={editor}
        theme="dark"
        filePanel={false}
        tableHandles={false}
        emojiPicker={false}
        onChange={() =>
          onChange(
            editor.document as unknown as BlockNoteCompatibleDocument,
          )
        }
      />
    </div>
  );
}
