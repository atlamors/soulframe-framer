import type { PublicationBlockType } from "./blocks";
import type { PublicationProfileId } from "./types";

export type PublicationContentKind = "build" | "guide";
export type PublicationRouteSegment = "builds" | "guides";
export type BlockPlacement = "root" | "build-stage-section";
export type PublicationLayoutKey = "soulframe.build.v1" | "soulframe.guide.v1";
export type PublicationBlockSchemaKey = "soulframe.build.v1" | "soulframe.guide.v1";

export interface PublicationBlockRule {
  type: PublicationBlockType;
  placements: readonly BlockPlacement[];
  minimum: number;
  /** `null` means the profile does not impose a finite maximum. */
  maximum: number | null;
  repeatable: boolean;
}

export interface PublicationOrderingRule {
  placement: BlockPlacement;
  mode: "fixed" | "free";
  /** Required order for fixed layouts; omitted for free editorial ordering. */
  sequence?: readonly PublicationBlockType[];
}

export interface PublicationProfile {
  id: PublicationProfileId;
  gameId: string;
  contentKind: PublicationContentKind;
  routeSegment: PublicationRouteSegment;
  allowedBlocks: readonly PublicationBlockType[];
  requiredBlocks: readonly PublicationBlockType[];
  blockRules: readonly PublicationBlockRule[];
  orderingRules: readonly PublicationOrderingRule[];
  layoutKey: PublicationLayoutKey;
  blockSchemaKey: PublicationBlockSchemaKey;
  mediaPolicyKey: string;
  validationPolicyKey: string;
  seoStrategyKey: string;
}

const SOULFRAME_BUILD_PROFILE = {
  id: "soulframe.build",
  gameId: "soulframe",
  contentKind: "build",
  routeSegment: "builds",
  allowedBlocks: [
    "soulframe.build.stage",
    "nightfold.heading",
    "nightfold.rich-text",
  ],
  requiredBlocks: ["soulframe.build.stage"],
  blockRules: [
    {
      type: "soulframe.build.stage",
      placements: ["root"],
      minimum: 1,
      maximum: null,
      repeatable: true,
    },
    {
      type: "nightfold.heading",
      placements: ["build-stage-section"],
      minimum: 0,
      maximum: null,
      repeatable: true,
    },
    {
      type: "nightfold.rich-text",
      placements: ["build-stage-section"],
      minimum: 0,
      maximum: null,
      repeatable: true,
    },
  ],
  orderingRules: [
    {
      placement: "root",
      mode: "fixed",
      sequence: ["soulframe.build.stage"],
    },
    { placement: "build-stage-section", mode: "free" },
  ],
  layoutKey: "soulframe.build.v1",
  blockSchemaKey: "soulframe.build.v1",
  mediaPolicyKey: "soulframe.build.no-uploaded-block-media.v1",
  validationPolicyKey: "soulframe.build.publishable.v1",
  seoStrategyKey: "soulframe.build.v1",
} as const satisfies PublicationProfile;

const SOULFRAME_GUIDE_PROFILE = {
  id: "soulframe.guide",
  gameId: "soulframe",
  contentKind: "guide",
  routeSegment: "guides",
  allowedBlocks: ["nightfold.heading", "nightfold.rich-text"],
  requiredBlocks: ["nightfold.heading"],
  blockRules: [
    {
      type: "nightfold.heading",
      placements: ["root"],
      minimum: 1,
      maximum: null,
      repeatable: true,
    },
    {
      type: "nightfold.rich-text",
      placements: ["root"],
      minimum: 0,
      maximum: null,
      repeatable: true,
    },
  ],
  orderingRules: [{ placement: "root", mode: "free" }],
  layoutKey: "soulframe.guide.v1",
  blockSchemaKey: "soulframe.guide.v1",
  mediaPolicyKey: "soulframe.guide.restricted-editorial.v1",
  validationPolicyKey: "soulframe.guide.publishable.v1",
  seoStrategyKey: "soulframe.guide.v1",
} as const satisfies PublicationProfile;

export const PUBLICATION_PROFILES = {
  "soulframe.build": SOULFRAME_BUILD_PROFILE,
  "soulframe.guide": SOULFRAME_GUIDE_PROFILE,
} as const satisfies Record<PublicationProfileId, PublicationProfile>;

export class UnknownPublicationProfileError extends Error {
  readonly name = "UnknownPublicationProfileError";
}

export function isPublicationProfileId(
  value: unknown,
): value is PublicationProfileId {
  return typeof value === "string" && value in PUBLICATION_PROFILES;
}

export function resolvePublicationProfile(
  profileId: string,
): PublicationProfile {
  if (!isPublicationProfileId(profileId)) {
    throw new UnknownPublicationProfileError(
      `Unknown Publication Profile: ${profileId}.`,
    );
  }
  return PUBLICATION_PROFILES[profileId];
}

export function publicationProfilesForGame(
  gameId: string,
): readonly PublicationProfile[] {
  return Object.values(PUBLICATION_PROFILES).filter(
    (profile) => profile.gameId === gameId,
  );
}
