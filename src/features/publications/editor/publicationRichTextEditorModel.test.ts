import { describe, expect, it } from "vitest";
import {
  normalizePublicationRichTextCapabilities,
  publicationBlockControls,
  publicationRichTextProfiles,
} from "./publicationRichTextEditorModel";

describe("publication rich-text capability controls", () => {
  it("keeps the Build Overview control set heading-free", () => {
    expect(
      publicationBlockControls(
        publicationRichTextProfiles.buildOverview,
      ).map((control) => control.id),
    ).toEqual([
      "paragraph",
      "bulletListItem",
      "numberedListItem",
      "quote",
      "codeBlock",
    ]);
  });

  it("adds only H2, H3, and H4 for Guide sections", () => {
    expect(
      publicationBlockControls(publicationRichTextProfiles.guideSection).map(
        (control) => control.id,
      ),
    ).toEqual([
      "paragraph",
      "heading-2",
      "heading-3",
      "heading-4",
      "bulletListItem",
      "numberedListItem",
      "quote",
      "codeBlock",
    ]);
  });

  it("normalizes duplicate and unsupported heading levels", () => {
    expect(
      normalizePublicationRichTextCapabilities({
        headings: [4, 2, 4, 3, 99 as 2],
      }).headings,
    ).toEqual([2, 3, 4]);
  });
});
