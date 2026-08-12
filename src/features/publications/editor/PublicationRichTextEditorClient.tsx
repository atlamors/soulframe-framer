"use client";

import {
  BlockNoteSchema,
  createHeadingBlockSpec,
  defaultBlockSpecs,
  SideMenuExtension,
  SuggestionMenu,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  useBlockNoteEditor,
  useComponentsContext,
  useCreateBlockNote,
  useExtension,
  useExtensionState,
} from "@blocknote/react";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Code2,
  Copy,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Plus,
  Quote,
  Trash2,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { BlockNoteCompatibleDocument } from "@/src/domain/publications/blocks";
import {
  normalizePublicationRichTextCapabilities,
  publicationBlockControls,
  type PublicationBlockControl,
  type PublicationRichTextCapabilities,
} from "./publicationRichTextEditorModel";
import styles from "./PublicationRichTextEditor.module.css";

const styleControls = [
  { style: "bold", label: "Bold", Icon: Bold },
  { style: "italic", label: "Italic", Icon: Italic },
  { style: "underline", label: "Underline", Icon: Underline },
] as const;

const blockIcons: Record<PublicationBlockControl["id"], LucideIcon> = {
  paragraph: Pilcrow,
  "heading-2": Heading2,
  "heading-3": Heading3,
  "heading-4": Heading4,
  bulletListItem: List,
  numberedListItem: ListOrdered,
  quote: Quote,
  codeBlock: Code2,
};

function createSchema(capabilities: PublicationRichTextCapabilities) {
  const normalized = normalizePublicationRichTextCapabilities(capabilities);
  return BlockNoteSchema.create({
    blockSpecs: {
      paragraph: defaultBlockSpecs.paragraph,
      ...(normalized.headings.length
        ? {
            heading: createHeadingBlockSpec({
              defaultLevel: normalized.headings[0],
              levels: normalized.headings,
              allowToggleHeadings: false,
            }),
          }
        : {}),
      ...(normalized.bulletList
        ? { bulletListItem: defaultBlockSpecs.bulletListItem }
        : {}),
      ...(normalized.numberedList
        ? { numberedListItem: defaultBlockSpecs.numberedListItem }
        : {}),
      ...(normalized.quote ? { quote: defaultBlockSpecs.quote } : {}),
      ...(normalized.code ? { codeBlock: defaultBlockSpecs.codeBlock } : {}),
    },
  });
}

function duplicateWithoutIds(block: unknown): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(block)) as Record<string, unknown>;
  const removeIds = (value: Record<string, unknown>) => {
    delete value.id;
    if (Array.isArray(value.children)) {
      value.children = value.children.map((child) => {
        const childCopy = { ...(child as Record<string, unknown>) };
        removeIds(childCopy);
        return childCopy;
      });
    }
  };
  removeIds(copy);
  return copy;
}

function EditorDragHandleMenu({ controls }: { controls: PublicationBlockControl[] }) {
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();
  const block = useExtensionState(SideMenuExtension, {
    editor,
    selector: (state) => state?.block,
  });
  if (!Components || !block) return null;

  const MenuItem = Components.Generic.Menu.Item;
  return (
    <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
      <MenuItem className="bn-menu-item" icon={<Plus aria-hidden="true" size={16} />} onClick={() => {
        const [inserted] = editor.insertBlocks([{ type: "paragraph" }], block, "after");
        editor.setTextCursorPosition(inserted, "start");
        editor.focus();
        editor.getExtension(SuggestionMenu)?.openSuggestionMenu("/");
      }}>
        Add block below
      </MenuItem>
      {controls.map((control) => {
        const Icon = blockIcons[control.id];
        return (
          <MenuItem key={control.id} className="bn-menu-item" icon={<Icon aria-hidden="true" size={16} />} onClick={() => {
            editor.updateBlock(block, (control.type === "heading"
              ? { type: "heading", props: { level: control.level } }
              : { type: control.type }) as never);
            editor.setTextCursorPosition(block, "end");
            editor.focus();
          }}>
            Turn into {control.label.toLowerCase()}
          </MenuItem>
        );
      })}
      <Components.Generic.Menu.Divider className="bn-menu-divider" />
      <MenuItem className="bn-menu-item" icon={<ArrowUp aria-hidden="true" size={16} />} onClick={() => editor.moveBlocksUp(block)}>Move up</MenuItem>
      <MenuItem className="bn-menu-item" icon={<ArrowDown aria-hidden="true" size={16} />} onClick={() => editor.moveBlocksDown(block)}>Move down</MenuItem>
      <MenuItem className="bn-menu-item" icon={<Copy aria-hidden="true" size={16} />} onClick={() => {
        const [inserted] = editor.insertBlocks([duplicateWithoutIds(block) as never], block, "after");
        editor.setTextCursorPosition(inserted, "end");
        editor.focus();
      }}>Duplicate</MenuItem>
      <MenuItem className="bn-menu-item" icon={<Trash2 aria-hidden="true" size={16} />} onClick={() => {
        const selected = editor.getSelection()?.blocks;
        editor.removeBlocks(selected?.some((item) => item.id === block.id) ? selected : [block]);
      }}>Delete</MenuItem>
    </Components.Generic.Menu.Dropdown>
  );
}

function EditorSideMenu({ controls }: { controls: PublicationBlockControl[] }) {
  const sideMenu = useExtension(SideMenuExtension);
  return (
    <SideMenu>
      <span
        className="contents"
        onKeyDownCapture={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          if (event.repeat) return;
          if (!(event.target instanceof HTMLButtonElement)) return;
          const trigger = event.target;
          const stopWatching = () => {
            document.removeEventListener("keydown", restoreOnEscape, true);
            document.removeEventListener("pointerdown", stopWatching, true);
            document.removeEventListener("click", stopWatching, true);
          };
          const restoreOnEscape = (keyboardEvent: KeyboardEvent) => {
            if (keyboardEvent.key === "Tab") stopWatching();
            if (keyboardEvent.key !== "Escape") return;
            stopWatching();
            window.setTimeout(() => {
              sideMenu.freezeMenu();
              window.requestAnimationFrame(() => {
                const restoredTrigger = Array.from(
                  document.querySelectorAll<HTMLButtonElement>('button[aria-label="Open block menu"]'),
                ).find((button) => button.getClientRects().length > 0);
                if (!restoredTrigger) {
                  sideMenu.unfreezeMenu();
                  return;
                }
                restoredTrigger.addEventListener("blur", () => {
                  window.setTimeout(() => {
                    if (restoredTrigger.getAttribute("aria-expanded") !== "true") sideMenu.unfreezeMenu();
                  });
                }, { once: true });
                restoredTrigger.focus();
              });
            });
          };
          event.preventDefault();
          event.stopPropagation();
          trigger.click();
          document.addEventListener("keydown", restoreOnEscape, true);
          document.addEventListener("pointerdown", stopWatching, true);
          document.addEventListener("click", stopWatching, true);
        }}
      >
        <DragHandleButton dragHandleMenu={() => <EditorDragHandleMenu controls={controls} />} />
      </span>
    </SideMenu>
  );
}

export default function PublicationRichTextEditorClient({
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
  const [, refreshToolbar] = useState(0);
  const controls = useMemo(() => publicationBlockControls(capabilities), [capabilities]);
  const schema = useMemo(() => createSchema(capabilities), [capabilities]);
  const editor = useCreateBlockNote({
    schema,
    initialContent: (initialDocument.length ? initialDocument : [{ type: "paragraph", content: "" }]) as never,
    placeholders: { emptyDocument: placeholder, default: "Continue writing, or type / for blocks…" },
  });
  let activeStyles: Record<string, unknown> = {};
  let activeBlockType = "paragraph";
  let activeHeadingLevel: number | undefined;
  try {
    activeStyles = editor.getActiveStyles();
    const block = editor.getTextCursorPosition().block;
    activeBlockType = block.type;
    activeHeadingLevel = block.type === "heading" ? (block.props as { level?: number }).level : undefined;
  } catch {
    // The compact toolbar defaults to an unpressed state before first focus.
  }
  const updateToolbar = () => refreshToolbar((value) => value + 1);

  return (
    <div role="group" aria-label={label} className={styles.editor}>
      <div className="flex min-w-0 flex-wrap items-center gap-1 border-b border-line/45 bg-surface/45 px-2 py-1.5" role="toolbar" aria-label={`${label} formatting`}>
        {styleControls.map(({ style, label: controlLabel, Icon }) => (
          <button key={style} type="button" title={controlLabel} aria-label={controlLabel} aria-pressed={Boolean(activeStyles[style])} onMouseDown={(event) => event.preventDefault()} onClick={() => {
            editor.focus(); editor.toggleStyles({ [style]: true }); updateToolbar();
          }} className="inline-flex size-11 flex-none items-center justify-center rounded-sm border border-transparent bg-transparent text-ink-faint transition-colors hover:bg-control hover:text-ink focus-visible:outline-none focus-visible:shadow-focus aria-pressed:border-line-bright/60 aria-pressed:bg-control aria-pressed:text-gold-bright xl:size-8">
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px flex-none bg-line/70" />
        {controls.map((control) => {
          const Icon = blockIcons[control.id];
          const active = control.type === "heading"
            ? activeBlockType === "heading" && activeHeadingLevel === control.level
            : activeBlockType === control.type;
          return (
            <button key={control.id} type="button" title={control.label} aria-label={`Use ${control.label.toLowerCase()}${control.label.endsWith("block") ? "" : " block"}`} aria-pressed={active} onMouseDown={(event) => event.preventDefault()} onClick={() => {
              editor.focus();
              const block = editor.getTextCursorPosition().block;
              editor.updateBlock(block, (control.type === "heading" ? { type: "heading", props: { level: control.level } } : { type: control.type }) as never);
              updateToolbar();
            }} className="inline-flex size-11 flex-none items-center justify-center rounded-sm border border-transparent bg-transparent text-ink-faint transition-colors hover:bg-control hover:text-ink focus-visible:outline-none focus-visible:shadow-focus aria-pressed:border-line-bright/60 aria-pressed:bg-control aria-pressed:text-gold-bright xl:size-8">
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
      <BlockNoteView editor={editor} theme="dark" filePanel={false} tableHandles={false} emojiPicker={false} formattingToolbar={false} sideMenu={false} onSelectionChange={updateToolbar} onChange={() => {
        onChange(editor.document as unknown as BlockNoteCompatibleDocument); updateToolbar();
      }}>
        <SideMenuController sideMenu={() => <EditorSideMenu controls={controls} />} />
      </BlockNoteView>
    </div>
  );
}
