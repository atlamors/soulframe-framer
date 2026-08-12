import { describe, expect, it } from "vitest";
import {
  publicPublicationPath,
  publisherActionMessage,
} from "./publisherRoutes";

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
