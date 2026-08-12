import { describe, expect, it } from "vitest";
import type { PublicationBlock } from "./blocks";
import { validatePublicationBlocks } from "./blocks";
import { resolvePublicationProfile } from "./profiles";

const rootHeading: PublicationBlock = {
  id: "root-heading",
  type: "nightfold.heading",
  schemaVersion: 1,
  data: { level: 2, text: "Introduction" },
};

function richTextWithHeading(level: number): PublicationBlock {
  return {
    id: `rich-${level}`,
    type: "nightfold.rich-text",
    schemaVersion: 1,
    data: {
      document: [
        {
          type: "heading",
          props: {
            level,
            backgroundColor: "default",
            textColor: "default",
            textAlignment: "left",
          },
          content: "Subsection",
        },
      ],
    },
  } as unknown as PublicationBlock;
}

describe("Guide BlockNote heading validation", () => {
  const guide = resolvePublicationProfile("soulframe.guide");

  it.each([2, 3, 4])("allows Guide H%i body headings", (level) => {
    const issues = validatePublicationBlocks(guide, [
      rootHeading,
      richTextWithHeading(level),
    ]);
    expect(issues).toEqual([]);
  });

  it.each([1, 5, 6])("rejects Guide H%i body headings", (level) => {
    const issues = validatePublicationBlocks(guide, [
      rootHeading,
      richTextWithHeading(level),
    ]);
    expect(issues.map((issue) => issue.code)).toContain(
      "rich-text-block-type-disallowed",
    );
  });

  it("rejects nested headings in Build supporting rich text", () => {
    const build = resolvePublicationProfile("soulframe.build");
    const stage = {
      id: "home-stage",
      type: "soulframe.build.stage",
      schemaVersion: 1,
      data: {
        role: "home",
        name: "Home",
        planner: { schemaVersion: 5 },
        sharedSections: [
          {
            id: "overview",
            blocks: [richTextWithHeading(2)],
          },
        ],
      },
    } as unknown as PublicationBlock;

    const issues = validatePublicationBlocks(build, [stage]);
    expect(issues.map((issue) => issue.code)).toContain(
      "build-rich-text-heading-disallowed",
    );
  });
});
