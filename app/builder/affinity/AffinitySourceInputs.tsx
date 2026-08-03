"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MAX_ENVOY_RANK } from "@/src/domain/affinity";
import {
  VIRTUE_IDS,
  type AffinitySources,
  type VirtueId,
} from "@/src/domain/types";
import { AFFINITY_SOURCE_CLASS_NAMES } from "../components/affinityClassNames";
import { RopeFrame } from "../components/RopeFrame";
import { virtueMeta } from "../constants";

type SourcePanel = "rank" | "fables";

const FABLES = [
  ["shewolf", "Shewolf Snared"],
  ["wasteBear", "Waste Bear"],
] as const;

const FABLE_REWARDS: readonly (VirtueId | null)[] = [null, ...VIRTUE_IDS];

function clampEnvoyRank(value: number) {
  return Math.min(MAX_ENVOY_RANK, Math.max(0, Math.round(value)));
}

export function AffinitySourceInputs({
  sources,
  onChange,
}: {
  sources: AffinitySources;
  onChange: (sources: AffinitySources) => void;
}) {
  const [activePanel, setActivePanel] = useState<SourcePanel>();
  const sectionRef = useRef<HTMLElement>(null);
  const rankTriggerRef = useRef<HTMLButtonElement>(null);
  const fablesTriggerRef = useRef<HTMLButtonElement>(null);
  const selectedFableRewards = FABLES.flatMap(([fable]) => {
    const virtue = sources.fables[fable];
    return virtue ? [virtue] : [];
  });
  const fableSummary =
    selectedFableRewards
      .map((virtue) => virtueMeta[virtue].label)
      .join(", ") || "None";

  useEffect(() => {
    if (!activePanel) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !sectionRef.current?.contains(event.target)
      ) {
        setActivePanel(undefined);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      const activeTrigger =
        activePanel === "rank"
          ? rankTriggerRef.current
          : fablesTriggerRef.current;
      setActivePanel(undefined);
      window.requestAnimationFrame(() => activeTrigger?.focus());
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activePanel]);

  const togglePanel = (panel: SourcePanel) => {
    setActivePanel((current) => (current === panel ? undefined : panel));
  };

  const updateEnvoyRank = (value: number) => {
    if (!Number.isFinite(value)) return;
    onChange({
      ...sources,
      envoyRank: clampEnvoyRank(value),
    });
  };

  const updateFable = (
    fable: keyof AffinitySources["fables"],
    value: VirtueId | null,
  ) => {
    onChange({
      ...sources,
      fables: {
        ...sources.fables,
        [fable]: value,
      },
    });
  };

  return (
    <section
      className={AFFINITY_SOURCE_CLASS_NAMES.section}
      aria-labelledby="affinity-controls-title"
      ref={sectionRef}
    >
      <header className={AFFINITY_SOURCE_CLASS_NAMES.header}>
        <span
          className={AFFINITY_SOURCE_CLASS_NAMES.title}
          id="affinity-controls-title"
        >
          Affinity Controls
        </span>
      </header>

      <div className={AFFINITY_SOURCE_CLASS_NAMES.triggerRow}>
        <button
          type="button"
          className={AFFINITY_SOURCE_CLASS_NAMES.trigger}
          ref={rankTriggerRef}
          aria-label={`Envoy Rank, ${sources.envoyRank}`}
          aria-expanded={activePanel === "rank"}
          aria-controls="affinity-rank-panel"
          onClick={() => togglePanel("rank")}
        >
          <RopeFrame
            appearance={activePanel === "rank" ? "active" : "interactive"}
          />
          <span className={AFFINITY_SOURCE_CLASS_NAMES.triggerTitle}>
            Envoy Rank
          </span>
          <strong className={AFFINITY_SOURCE_CLASS_NAMES.summary}>
            {sources.envoyRank}
          </strong>
          <span
            className={AFFINITY_SOURCE_CLASS_NAMES.triggerArrow}
            aria-hidden="true"
          >
            <Image
              src="/icons/picker-select-arrow.svg"
              alt=""
              width={10}
              height={5}
              unoptimized
            />
          </span>
        </button>
        <button
          type="button"
          className={AFFINITY_SOURCE_CLASS_NAMES.trigger}
          ref={fablesTriggerRef}
          aria-label={`Fables, ${fableSummary}`}
          aria-expanded={activePanel === "fables"}
          aria-controls="affinity-fables-panel"
          onClick={() => togglePanel("fables")}
        >
          <RopeFrame
            appearance={activePanel === "fables" ? "active" : "interactive"}
          />
          <span className={AFFINITY_SOURCE_CLASS_NAMES.triggerTitle}>
            Fables
          </span>
          <strong className={AFFINITY_SOURCE_CLASS_NAMES.summary}>
            {selectedFableRewards.length > 0 ? (
              <span
                className={AFFINITY_SOURCE_CLASS_NAMES.summaryPips}
                aria-hidden="true"
              >
                {selectedFableRewards.map((virtue, index) => (
                  <Image
                    className={AFFINITY_SOURCE_CLASS_NAMES.summaryPip}
                    src={virtueMeta[virtue].icon}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    key={`${virtue}-${index}`}
                  />
                ))}
              </span>
            ) : (
              "None"
            )}
          </strong>
          <span
            className={AFFINITY_SOURCE_CLASS_NAMES.triggerArrow}
            aria-hidden="true"
          >
            <Image
              src="/icons/picker-select-arrow.svg"
              alt=""
              width={10}
              height={5}
              unoptimized
            />
          </span>
        </button>
      </div>

      {activePanel ? (
        <div
          className={AFFINITY_SOURCE_CLASS_NAMES.panel}
          id={
            activePanel === "rank"
              ? "affinity-rank-panel"
              : "affinity-fables-panel"
          }
          role="group"
          aria-label={
            activePanel === "rank"
              ? "Envoy Rank controls"
              : "Fable affinity rewards"
          }
        >
          {activePanel === "rank" ? (
            <div className={AFFINITY_SOURCE_CLASS_NAMES.rankControls}>
              <input
                className={AFFINITY_SOURCE_CLASS_NAMES.rankRange}
                type="range"
                min={0}
                max={MAX_ENVOY_RANK}
                step={1}
                value={sources.envoyRank}
                aria-label="Envoy Rank slider"
                aria-valuetext={`Envoy Rank ${sources.envoyRank}`}
                onChange={(event) =>
                  updateEnvoyRank(event.currentTarget.valueAsNumber)
                }
              />
              <input
                className={AFFINITY_SOURCE_CLASS_NAMES.rankNumber}
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_ENVOY_RANK}
                step={1}
                value={sources.envoyRank}
                aria-label="Envoy Rank numeric value"
                onChange={(event) =>
                  updateEnvoyRank(event.currentTarget.valueAsNumber)
                }
              />
            </div>
          ) : (
            <div className={AFFINITY_SOURCE_CLASS_NAMES.fables}>
              {FABLES.map(([fable, label]) => {
                const labelId = `affinity-${fable}-title`;
                return (
                  <div
                    className={AFFINITY_SOURCE_CLASS_NAMES.fable}
                    key={fable}
                  >
                    <span
                      className={AFFINITY_SOURCE_CLASS_NAMES.fableTitle}
                      id={labelId}
                    >
                      {label}
                    </span>
                    <span
                      className={AFFINITY_SOURCE_CLASS_NAMES.choiceGroup}
                      role="group"
                      aria-labelledby={labelId}
                    >
                      {FABLE_REWARDS.map((virtue) => {
                        const choiceLabel = virtue
                          ? virtueMeta[virtue].label
                          : "Not earned";
                        const selected = sources.fables[fable] === virtue;
                        return (
                          <button
                            type="button"
                            className={AFFINITY_SOURCE_CLASS_NAMES.choice}
                            aria-label={`${label}: ${choiceLabel}`}
                            aria-pressed={selected}
                            onClick={() => updateFable(fable, virtue)}
                            key={virtue ?? "not-earned"}
                          >
                            <RopeFrame
                              appearance={
                                selected ? "active" : "interactive"
                              }
                            />
                            {virtue ? (
                              <Image
                                className={
                                  AFFINITY_SOURCE_CLASS_NAMES.choiceIcon
                                }
                                src={virtueMeta[virtue].icon}
                                alt=""
                                width={20}
                                height={20}
                                unoptimized
                                aria-hidden="true"
                              />
                            ) : null}
                            <span
                              className={
                                AFFINITY_SOURCE_CLASS_NAMES.choiceText
                              }
                            >
                              {choiceLabel}
                            </span>
                          </button>
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
