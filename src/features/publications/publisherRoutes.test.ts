import { describe, expect, it } from "vitest";
import {
  newBuildPublisherReturnPath,
  publicPublicationPath,
  publisherActionLocation,
  publisherActionMessage,
} from "./publisherRoutes";

describe("newBuildPublisherReturnPath", () => {
  it("preserves a bounded Frame handoff and Build prefills", () => {
    const path = newBuildPublisherReturnPath({
      frame: "frame+payload/=",
      title: "Atlas Build",
      slug: "atlas-build",
      summary: "A local publication test.",
      classifications: "Solo,Bow",
    });

    const url = new URL(path, "https://nightfold.invalid");
    expect(url.pathname).toBe("/soulframe/publisher/builds/new");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      frame: "frame+payload/=",
      title: "Atlas Build",
      slug: "atlas-build",
      summary: "A local publication test.",
      classifications: "Solo,Bow",
    });
  });

  it("uses only the first repeated value and omits oversized or unknown fields", () => {
    const path = newBuildPublisherReturnPath({
      frame: ["first-frame", "second-frame"],
      title: "x".repeat(161),
      unknown: "discard-me",
    } as Parameters<typeof newBuildPublisherReturnPath>[0]);

    expect(path).toBe(
      "/soulframe/publisher/builds/new?frame=first-frame",
    );
  });
});

describe("publisherActionLocation", () => {
  it("returns directly to the typed Build or Guide editor", () => {
    expect(
      publisherActionLocation("soulframe.build", "build-id", "notice", "saved"),
    ).toBe("/soulframe/publisher/builds/build-id?notice=saved");
    expect(
      publisherActionLocation("soulframe.guide", "guide-id", "notice", "published"),
    ).toBe("/soulframe/publisher/guides/guide-id?notice=published");
  });

  it("retains the compatibility route when a profile is unavailable", () => {
    expect(publisherActionLocation(null, "legacy-id", "error", "unavailable"))
      .toBe("/soulframe/publisher/legacy-id?error=unavailable");
  });
});

describe("publicPublicationPath", () => {
  it("maps each publication profile to its canonical public route", () => {
    expect(publicPublicationPath("soulframe.build", "atlas-build")).toBe(
      "/soulframe/builds/atlas-build",
    );
    expect(publicPublicationPath("soulframe.guide", "getting started")).toBe(
      "/soulframe/guides/getting%20started",
    );
  });
});

describe("publisherActionMessage archive notices", () => {
  it("explains archive recovery and successful restoration", () => {
    expect(publisherActionMessage("archived", undefined)?.text).toContain(
      "restore",
    );
    expect(publisherActionMessage("restored", undefined)?.text).toContain(
      "Restored",
    );
  });
});
