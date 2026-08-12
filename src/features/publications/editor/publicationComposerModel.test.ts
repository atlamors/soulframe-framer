import { describe, expect, it } from "vitest";
import { publicationLifecycle } from "./publicationComposerModel";
const a = { schemaVersion: 1 as const, metadata: { title: "A", classifications: [] }, blocks: [] };
const b = { ...a, metadata: { ...a.metadata, title: "B" } };
describe("publicationLifecycle", () => {
  it("derives new, draft, published, and unpublished freshness", () => {
    expect(publicationLifecycle(null, a, null, null)).toMatchObject({ visibility: "Draft", detail: "Not saved", publishNeeded: true });
    expect(publicationLifecycle("draft", b, a, null)).toMatchObject({ visibility: "Draft", detail: "Unsaved changes", publishNeeded: true });
    expect(publicationLifecycle("draft", a, a, null)).toMatchObject({ visibility: "Draft", detail: "Saved", publishNeeded: true });
    expect(publicationLifecycle("published", a, a, a)).toMatchObject({ visibility: "Published", detail: "All changes live", publishNeeded: false });
    expect(publicationLifecycle("published", b, a, a)).toMatchObject({ visibility: "Published", detail: "Unsaved changes", publishNeeded: true });
    expect(publicationLifecycle("published", a, a, b)).toMatchObject({ visibility: "Published", detail: "Saved changes not live", publishNeeded: true });
    expect(publicationLifecycle("unpublished", a, a, a)).toMatchObject({ visibility: "Unpublished", publishLabel: "Republish", publishNeeded: true });
  });
});
