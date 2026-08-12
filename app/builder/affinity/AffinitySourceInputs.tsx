"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { MAX_ENVOY_RANK } from "@/src/domain/affinity";
import {
  VIRTUE_IDS,
  type AffinitySources,
  type VirtueId,
} from "@/src/domain/types";
import {
  AFFINITY_SOURCE_CLASS_NAMES,
  AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES,
} from "../components/affinityClassNames";
import { RopeFrame } from "../components/RopeFrame";
import { virtueMeta } from "../constants";

type SourcePanel = "rank" | "fables";

type SourcePanelPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

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
  presentation = "default",
  showHeader = true,
  onChange,
}: {
  sources: AffinitySources;
  presentation?: "default" | "foundation";
  showHeader?: boolean;
  onChange: (sources: AffinitySources) => void;
}) {
  const [activePanel, setActivePanel] = useState<SourcePanel>();
  const sectionRef = useRef<HTMLElement>(null);
  const rankTriggerRef = useRef<HTMLButtonElement>(null);
  const fablesTriggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState<SourcePanelPosition>();
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

    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("input, button")
        ?.focus();
    });

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !sectionRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        setActivePanel(undefined);
        setPanelPosition(undefined);
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
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activePanel]);

  useLayoutEffect(() => {
    if (!activePanel) return;

    const updatePosition = () => {
      const trigger =
        activePanel === "rank"
          ? rankTriggerRef.current
          : fablesTriggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const margin = 12;
      const gap = 7;
      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const mobile = viewportWidth < 961;
      const width = mobile
        ? viewportWidth - margin * 2
        : Math.min(triggerRect.width, viewportWidth - margin * 2);
      const left = mobile
        ? margin
        : Math.min(
            Math.max(triggerRect.left, margin),
            Math.max(margin, viewportWidth - width - margin),
          );
      const desiredHeight = panel.scrollHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom - gap - margin;
      const spaceAbove = triggerRect.top - gap - margin;
      const placeBelow =
        spaceBelow >= Math.min(desiredHeight, mobile ? 220 : 120) ||
        spaceBelow >= spaceAbove;
      const maxHeight = Math.max(120, placeBelow ? spaceBelow : spaceAbove);
      const renderedHeight = Math.min(desiredHeight, maxHeight);
      const top = placeBelow
        ? triggerRect.bottom + gap
        : triggerRect.top - gap - renderedHeight;

      setPanelPosition({
        left,
        top: Math.max(margin, top),
        width,
        maxHeight,
      });
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    if (panelRef.current) resizeObserver.observe(panelRef.current);
    const trigger =
      activePanel === "rank"
        ? rankTriggerRef.current
        : fablesTriggerRef.current;
    if (trigger) resizeObserver.observe(trigger);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activePanel]);

  const togglePanel = (panel: SourcePanel) => {
    setPanelPosition(undefined);
    setActivePanel((current) => (current === panel ? undefined : panel));
  };
  const withFoundationClass = (base: string, foundation: string) =>
    presentation === "foundation" ? `${base} ${foundation}` : base;

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
      className={withFoundationClass(
        AFFINITY_SOURCE_CLASS_NAMES.section,
        AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.section,
      )}
      {...(showHeader
        ? { "aria-labelledby": "affinity-controls-title" }
        : { "aria-label": "Affinity controls" })}
      ref={sectionRef}
    >
      {showHeader ? (
        <header
          className={withFoundationClass(
            AFFINITY_SOURCE_CLASS_NAMES.header,
            AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.header,
          )}
        >
          <span
            className={AFFINITY_SOURCE_CLASS_NAMES.title}
            id="affinity-controls-title"
          >
            Affinity Controls
          </span>
        </header>
      ) : null}

      <div
        className={withFoundationClass(
          AFFINITY_SOURCE_CLASS_NAMES.triggerRow,
          AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.triggerRow,
        )}
      >
        <button
          type="button"
          className={withFoundationClass(
            AFFINITY_SOURCE_CLASS_NAMES.trigger,
            AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.trigger,
          )}
          ref={rankTriggerRef}
          aria-label={`Envoy Rank, ${sources.envoyRank}`}
          aria-expanded={activePanel === "rank"}
          aria-controls="affinity-rank-panel"
          onClick={() => togglePanel("rank")}
        >
          <RopeFrame appearance="context" />
          <span
            className={withFoundationClass(
              AFFINITY_SOURCE_CLASS_NAMES.triggerTitle,
              AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.triggerTitle,
            )}
          >
            Envoy Rank
          </span>
          <strong
            className={withFoundationClass(
              AFFINITY_SOURCE_CLASS_NAMES.summary,
              AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.summary,
            )}
          >
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
          className={withFoundationClass(
            AFFINITY_SOURCE_CLASS_NAMES.trigger,
            AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.trigger,
          )}
          ref={fablesTriggerRef}
          aria-label={`Fables, ${fableSummary}`}
          aria-expanded={activePanel === "fables"}
          aria-controls="affinity-fables-panel"
          onClick={() => togglePanel("fables")}
        >
          <RopeFrame appearance="context" />
          <span
            className={withFoundationClass(
              AFFINITY_SOURCE_CLASS_NAMES.triggerTitle,
              AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.triggerTitle,
            )}
          >
            Fables
          </span>
          <strong
            className={withFoundationClass(
              AFFINITY_SOURCE_CLASS_NAMES.summary,
              AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES.summary,
            )}
          >
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

      {activePanel && typeof document !== "undefined" ? createPortal(
        <div
          ref={panelRef}
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
          style={
            panelPosition
              ? ({
                  left: panelPosition.left,
                  top: panelPosition.top,
                  width: panelPosition.width,
                  maxHeight: panelPosition.maxHeight,
                } satisfies CSSProperties)
              : { left: 0, top: 0, visibility: "hidden" }
          }
        >
          <RopeFrame appearance="context" />
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
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
