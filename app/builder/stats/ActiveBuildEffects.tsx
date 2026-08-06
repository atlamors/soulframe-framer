import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { SoulframeBuild } from "@/src/domain/types";
import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";
import {
  ACTIVE_EFFECTS_AVAILABILITY_CLASS_NAMES,
  ACTIVE_EFFECTS_CLASS_NAMES,
  ACTIVE_EFFECTS_CONTENT_CLASS_NAMES,
  ACTIVE_EFFECTS_COUNT_CLASS_NAMES,
  ACTIVE_EFFECTS_DISCLOSURE_CLASS_NAMES,
  ACTIVE_EFFECTS_EMPTY_CLASS_NAMES,
  ACTIVE_EFFECTS_LABEL_CLASS_NAMES,
  ACTIVE_EFFECTS_ROW_CLASS_NAMES,
  ACTIVE_EFFECTS_SOURCE_CLASS_NAMES,
  ACTIVE_EFFECTS_SUMMARY_CLASS_NAMES,
  ACTIVE_EFFECTS_TEXT_CLASS_NAMES,
} from "./activeBuildEffectsClassNames";
import { getActiveBuildEffects } from "../lib/build-effects";

type ActiveBuildEffectsProps = {
  build: SoulframeBuild;
  mobileStatsState: MobileStatsState;
  onOpenChange?: (isOpen: boolean) => void;
};

export function ActiveBuildEffects({
  build,
  mobileStatsState,
  onOpenChange,
}: ActiveBuildEffectsProps) {
  const effects = getActiveBuildEffects(build);
  const isOpenRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(
    () => () => {
      if (isOpenRef.current) onOpenChangeRef.current?.(false);
    },
    [],
  );

  return (
    <details
      className={`${ACTIVE_EFFECTS_CLASS_NAMES[mobileStatsState]} ${
        ACTIVE_EFFECTS_AVAILABILITY_CLASS_NAMES[
          effects.length ? "populated" : "empty"
        ]
      }`}
      data-active-build-effects=""
      onToggle={(event) => {
        isOpenRef.current = event.currentTarget.open;
        onOpenChange?.(event.currentTarget.open);
      }}
    >
      <summary
        className={
          ACTIVE_EFFECTS_SUMMARY_CLASS_NAMES[mobileStatsState]
        }
      >
        <span
          className={
            ACTIVE_EFFECTS_LABEL_CLASS_NAMES[mobileStatsState]
          }
        >
          Build Effects
        </span>
        <strong
          className={
            ACTIVE_EFFECTS_COUNT_CLASS_NAMES[mobileStatsState]
          }
        >
          {effects.length}
        </strong>
        <ChevronDown
          className={
            ACTIVE_EFFECTS_DISCLOSURE_CLASS_NAMES[mobileStatsState]
          }
          aria-hidden="true"
        />
      </summary>
      {effects.length ? (
        <div
          className={
            ACTIVE_EFFECTS_CONTENT_CLASS_NAMES[mobileStatsState]
          }
        >
          {effects.map((effect) => (
            <p
              className={
                ACTIVE_EFFECTS_ROW_CLASS_NAMES[mobileStatsState]
              }
              key={effect.id}
            >
              <small
                className={
                  ACTIVE_EFFECTS_SOURCE_CLASS_NAMES[mobileStatsState]
                }
              >
                {effect.source}
              </small>
              <span
                className={
                  ACTIVE_EFFECTS_TEXT_CLASS_NAMES[mobileStatsState]
                }
              >
                {effect.text}
              </span>
            </p>
          ))}
        </div>
      ) : (
        <p
          className={
            ACTIVE_EFFECTS_EMPTY_CLASS_NAMES[mobileStatsState]
          }
        >
          Allocate Arts or equip Runes and Totems to frame active effects.
        </p>
      )}
    </details>
  );
}
