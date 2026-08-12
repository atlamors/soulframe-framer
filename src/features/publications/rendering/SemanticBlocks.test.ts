import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RichTextBlock } from "../../../domain/publications/blocks";
import { RichTextRenderer } from "./SemanticBlocks";

describe("RichTextRenderer Guide headings", () => {
  it.each([2, 3, 4] as const)("renders a semantic H%i", (level) => {
    const block: RichTextBlock = {
      id: `body-${level}`,
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: {
        document: [
          {
            id: `heading-${level}`,
            type: "heading",
            props: { level },
            content: `Level ${level}`,
          },
        ],
      },
    };

    const html = renderToStaticMarkup(
      createElement(RichTextRenderer, { block }),
    );
    expect(html).toContain(`<h${level}`);
    expect(html).toContain(`Level ${level}</h${level}>`);
    expect(html).not.toContain("<p>");
  });
});
