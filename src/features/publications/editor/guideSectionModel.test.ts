import { describe, expect, it } from "vitest";
import type { PublicationBlock } from "@/src/domain/publications/blocks";
import {
  appendGuideSection,
  flattenGuideSections,
  guideSectionsFromBlocks,
  reorderGuideSections,
} from "./guideSectionModel";

const heading = (
  id: string,
  text = id,
  level: 2 | 3 | 4 = 2,
): PublicationBlock => ({
  id,
  type: "nightfold.heading",
  schemaVersion: 1,
  data: { level, text },
});

const body = (id: string, text: string): PublicationBlock => ({
  id,
  type: "nightfold.rich-text",
  schemaVersion: 1,
  data: { document: [{ type: "paragraph", content: text }] },
});

describe("guideSectionsFromBlocks", () => {
  it("pairs and round-trips an alternating sequence while retaining ids", () => {
    const source = [
      heading("h1"),
      body("b1", "one"),
      heading("h2"),
      body("b2", "two"),
    ];
    const sections = guideSectionsFromBlocks(source);
    expect(
      sections.map((section) => [section.heading.id, section.body.id]),
    ).toEqual([
      ["h1", "b1"],
      ["h2", "b2"],
    ]);
    expect(flattenGuideSections(sections)).toEqual(source);
  });

  it("normalizes orphan and consecutive bodies in document order without mutation", () => {
    const source = [
      body("before", "before"),
      heading("h", "Title"),
      body("b1", "one"),
      body("b2", "two"),
    ];
    const before = JSON.stringify(source);
    const sections = guideSectionsFromBlocks(source);
    expect(sections[0].heading.data.text).toBe("Introduction");
    expect(sections[0].body.id).toBe("before");
    expect(sections[1].body.id).toBe("b1");
    expect(sections[1].body.data.document).toHaveLength(2);
    expect(JSON.stringify(source)).toBe(before);
  });

  it("creates an empty body for a heading and reorders without breaking pairs", () => {
    const sections = guideSectionsFromBlocks([
      heading("h1"),
      heading("h2", "Legacy subsection", 3),
    ]);
    expect(sections[0].body.data.document[0]).toMatchObject({
      type: "paragraph",
    });
    expect(sections.every((section) => section.heading.data.level === 2)).toBe(
      true,
    );
    expect(
      reorderGuideSections(sections, "h2", "h1").map(
        (section) => section.id,
      ),
    ).toEqual(["h2", "h1"]);
  });

  it("allocates collision-free deterministic block and view ids", () => {
    const source = [
      body("orphan", "before"),
      heading("guide-heading-1", "First"),
      heading("guide-heading-1", "Second"),
      heading("", "Missing id"),
      body("guide-body-3", "after"),
    ];
    const first = guideSectionsFromBlocks(source);
    const second = guideSectionsFromBlocks(source);
    const flattened = flattenGuideSections(first);

    expect(first).toEqual(second);
    expect(new Set(first.map((section) => section.id)).size).toBe(first.length);
    expect(new Set(flattened.map((block) => block.id)).size).toBe(
      flattened.length,
    );
    expect(first.map((section) => section.heading.data.text)).toEqual([
      "Introduction",
      "First",
      "Second",
      "Missing id",
    ]);
    expect(first[1].heading.id).toBe("guide-heading-1");
  });

  it("avoids caller-supplied id collisions when appending", () => {
    const sections = guideSectionsFromBlocks([
      heading("same"),
      body("body", "one"),
    ]);
    const appended = appendGuideSection(sections, {
      headingId: "same",
      bodyId: "body",
    });
    const ids = flattenGuideSections(appended).map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(appended.at(-1)?.id).not.toBe("same");
  });
});
