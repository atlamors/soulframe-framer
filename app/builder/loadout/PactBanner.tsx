"use client";

import Image from "next/image";
import { PactFrame } from "../components/PactFrame";
import {
  PACT_BANNER_ABILITIES_CLASS_NAME,
  PACT_BANNER_ABILITY_CLASS_NAMES,
  PACT_BANNER_ABILITY_FALLBACK_CLASS_NAME,
  PACT_BANNER_ABILITY_IMAGE_CLASS_NAME,
  PACT_BANNER_ART_CLASS_NAME,
  PACT_BANNER_ART_FALLBACK_CLASS_NAME,
  PACT_BANNER_ART_IMAGE_CLASS_NAME,
  PACT_BANNER_CLASS_NAMES,
  PACT_BANNER_COPY_CLASS_NAME,
  PACT_BANNER_KICKER_CLASS_NAME,
  PACT_BANNER_META_CLASS_NAME,
  PACT_BANNER_NAME_CLASS_NAME,
} from "./pactBannerClassNames";
import { pactAbilityById } from "@/src/data/pacts";
import { pactArtTreeByPactId } from "@/src/data/arts";
import { getArtPointsSpent } from "@/src/domain/arts";
import type { ArtAllocation, Pact } from "@/src/domain/types";

export function PactBanner({
  pact,
  artAllocation,
  isActive,
  onOpen,
}: {
  pact?: Pact;
  artAllocation: ArtAllocation;
  isActive: boolean;
  onOpen: () => void;
}) {
  const bannerState = isActive ? "active" : "default";
  const artPoints = pact
    ? getArtPointsSpent(
        pactArtTreeByPactId.get(pact.id)?.nodes ?? [],
        artAllocation,
      )
    : 0;

  return (
    <button
      type="button"
      className={PACT_BANNER_CLASS_NAMES[bannerState]}
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
    >
      <PactFrame appearance={isActive ? "active" : "interactive"} />
      <span className={PACT_BANNER_ART_CLASS_NAME} aria-hidden="true">
        {pact?.image ? (
          <Image
            className={PACT_BANNER_ART_IMAGE_CLASS_NAME}
            src={pact.image.thumbnailUrl}
            alt=""
            width={72}
            height={72}
            unoptimized
          />
        ) : (
          <span className={PACT_BANNER_ART_FALLBACK_CLASS_NAME}>✦</span>
        )}
      </span>
      <span className={PACT_BANNER_COPY_CLASS_NAME}>
        <small className={PACT_BANNER_KICKER_CLASS_NAME}>Envoy Pact</small>
        <strong className={PACT_BANNER_NAME_CLASS_NAME}>
          {pact?.name ?? "Choose a Pact"}
        </strong>
        <span className={PACT_BANNER_META_CLASS_NAME}>
          {pact
            ? `${pact.variant === "wyld" ? "Wyld Pact" : "Pact"} · ${artPoints} Arts`
            : "Frame your abilities"}
        </span>
      </span>
      <span className={PACT_BANNER_ABILITIES_CLASS_NAME} aria-hidden="true">
        {pact?.abilityIds.map((abilityId) => {
          const ability = pactAbilityById.get(abilityId);
          const abilityState = ability?.assignedVirtue ?? "passive";

          return (
            <span
              className={PACT_BANNER_ABILITY_CLASS_NAMES[abilityState]}
              key={abilityId}
            >
              {ability?.image ? (
                <Image
                  className={PACT_BANNER_ABILITY_IMAGE_CLASS_NAME}
                  src={ability.image.thumbnailUrl}
                  alt=""
                  width={30}
                  height={30}
                  unoptimized
                />
              ) : (
                <span className={PACT_BANNER_ABILITY_FALLBACK_CLASS_NAME}>
                  •
                </span>
              )}
            </span>
          );
        })}
      </span>
    </button>
  );
}
