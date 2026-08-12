"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { armorById } from "@/src/data/catalogue";
import { calculateItemContribution } from "@/src/domain/calculation";
import type {
  AffinityOptimization,
  ArmorOptimization,
} from "@/src/domain/optimization";
import { ARMOR_SLOTS, VIRTUE_IDS } from "@/src/domain/types";
import { MOBILE_WORKSPACE_MEDIA_QUERY } from "../hooks/mobileWorkspaceConfig";
import {
  ArmorArtwork,
  StatIcon,
} from "../components/primitives";
import { ACTION_BUTTON_CLASS_NAMES } from "../components/actionClassNames";
import { IllustratedCloseButton } from "../components/IllustratedCloseButton";
import { RopeFrame } from "../components/RopeFrame";
import { slotMeta, virtueMeta } from "../constants";
import { formatDelta } from "../lib/formatters";
import {
  OPTIMIZATION_COMPATIBILITY_CLASS_NAMES,
  OPTIMIZATION_DELTA_CLASS_NAMES,
  OPTIMIZATION_LIGHTBOX_CLASS_NAMES,
} from "./optimizationLightboxClassNames";

export type OptimizationResult =
  | AffinityOptimization
  | ArmorOptimization;

export type OptimizationStrategy = "affinity" | "armor";

export function OptimizationLightbox({
  result,
  onApply,
  onClose,
  onSelectStrategy,
  mobileCloseRef,
  portalContainer,
}: {
  result?: OptimizationResult;
  onApply?: () => void;
  onClose: () => void;
  onSelectStrategy?: (strategy: OptimizationStrategy) => void;
  mobileCloseRef?: RefObject<HTMLButtonElement | null>;
  portalContainer?: HTMLElement | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const applyRef = useRef<HTMLButtonElement>(null);
  const affinityStrategyRef = useRef<HTMLButtonElement>(null);
  const armorStrategyRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef(result);
  const isAffinity = result?.kind === "affinity";
  const title = result
    ? isAffinity
      ? "Optimize for Gear"
      : "Optimize Armor for Affinity"
    : "Choose Optimization";
  const currentMetRequirements = result
    ? result.currentCalculation.items.filter((item) => item.requirementMet).length
    : 0;
  const recommendedMetRequirements =
    result?.recommendedCalculation.items.filter(
      (item) => item.requirementMet,
    ).length ?? 0;
  const armorRows = result ? ARMOR_SLOTS.flatMap((slot) => {
    const currentItemId = result.currentBuild.equipment[slot];
    const recommendedItemId = result.recommendedBuild.equipment[slot];
    const recommendedItem = recommendedItemId
      ? armorById.get(recommendedItemId)
      : undefined;
    if (!recommendedItem) return [];
    const currentItem = currentItemId ? armorById.get(currentItemId) : undefined;
    const currentTotal = currentItem
      ? calculateItemContribution(
          currentItem,
          result.currentCalculation.effectiveVirtues,
        ).total
      : 0;
    const recommendedContribution = calculateItemContribution(
      recommendedItem,
      result.recommendedCalculation.effectiveVirtues,
    );

    return [
      {
        slot,
        currentItem,
        recommendedItem,
        currentTotal,
        recommendedTotal: recommendedContribution.total,
        requirementMet: recommendedContribution.requirementMet,
      },
    ];
  }) : [];

  const getCloseControl = useCallback(
    () =>
      window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY).matches
        ? mobileCloseRef?.current
        : closeRef.current,
    [mobileCloseRef],
  );

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getCloseControl()?.focus({ preventScroll: true });

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const currentResult = resultRef.current;
      const closeControl = getCloseControl();
      const focusStops = (
        currentResult
          ? [
              closeControl,
              cancelRef.current,
              currentResult.changed ? applyRef.current : undefined,
            ]
          : [
              closeControl,
              affinityStrategyRef.current,
              armorStrategyRef.current,
            ]
      ).filter((element): element is HTMLButtonElement => Boolean(element));
      if (!focusStops.length) return;

      const activeIndex = focusStops.findIndex(
        (element) => element === document.activeElement,
      );
      const nextIndex =
        activeIndex < 0
          ? event.shiftKey
            ? focusStops.length - 1
            : 0
          : event.shiftKey
            ? (activeIndex - 1 + focusStops.length) % focusStops.length
            : (activeIndex + 1) % focusStops.length;
      event.preventDefault();
      focusStops[nextIndex]?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [getCloseControl, onClose]);

  const selectStrategy = (strategy: OptimizationStrategy) => {
    onSelectStrategy?.(strategy);
    window.requestAnimationFrame(() =>
      getCloseControl()?.focus({ preventScroll: true }),
    );
  };

  const lightbox = (
    <div
      className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.backdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.dialog}
        role="dialog"
        id="builder-optimization"
        aria-modal="true"
        aria-labelledby="optimization-title"
        aria-describedby="optimization-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span
          className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.frame}
          aria-hidden="true"
        >
          <RopeFrame appearance="active" />
        </span>

        <header className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.header}>
          <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.headerCopy}>
            <span className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.eyebrow}>
              <Sparkles
                aria-hidden="true"
                className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.eyebrowIcon}
              />
              {result ? "Armor only" : "Optimization"}
            </span>
            <h2
              id="optimization-title"
              className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.title}
            >
              {title}
            </h2>
            <p
              className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.description}
              id="optimization-description"
            >
              {result
                ? isAffinity
                  ? "Recommended base affinity for your equipped armor."
                  : "Recommended armor for your current effective affinity."
                : "Choose which part of the build should be optimized."}
            </p>
          </div>
          <span className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.close}>
            <IllustratedCloseButton
              ref={closeRef}
              aria-label="Close optimization"
              onClick={onClose}
            />
          </span>
        </header>

        {result ? (
          <>
        <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.body}>
          <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.summary}>
            {isAffinity ? (
              <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.affinityGrid}>
                {VIRTUE_IDS.map((virtue) => (
                  <div
                    className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.affinityCard}
                    key={virtue}
                  >
                    <StatIcon
                      src={virtueMeta[virtue].icon}
                      label={virtueMeta[virtue].label}
                      size="small"
                    />
                    <span
                      className={
                        OPTIMIZATION_LIGHTBOX_CLASS_NAMES.affinityCopy
                      }
                    >
                      <small
                        className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.label}
                      >
                        {virtueMeta[virtue].label}
                      </small>
                      <strong
                        className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.value}
                      >
                        {result.currentBuild.virtues[virtue]}
                        <ArrowRight
                          aria-hidden="true"
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.valueArrow
                          }
                        />
                        <b
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.recommendedValue
                          }
                        >
                          {result.recommendedBuild.virtues[virtue]}
                        </b>
                      </strong>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metrics}>
              <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricCard}>
                <small
                  className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricLabel}
                >
                  Armor Defense
                </small>
                <strong className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.value}>
                  {result.currentCalculation.armorDefense}
                  <ArrowRight
                    aria-hidden="true"
                    className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.valueArrow}
                  />
                  <b
                    className={
                      OPTIMIZATION_LIGHTBOX_CLASS_NAMES.recommendedValue
                    }
                  >
                    {result.recommendedCalculation.armorDefense}
                  </b>
                </strong>
                <em className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricDelta}>
                  {formatDelta(
                    result.recommendedCalculation.armorDefense -
                      result.currentCalculation.armorDefense,
                  )}
                </em>
              </div>
              <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricCard}>
                <small
                  className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricLabel}
                >
                  Requirements Met
                </small>
                <strong className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.value}>
                  {currentMetRequirements}
                  <ArrowRight
                    aria-hidden="true"
                    className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.valueArrow}
                  />
                  <b
                    className={
                      OPTIMIZATION_LIGHTBOX_CLASS_NAMES.recommendedValue
                    }
                  >
                    {recommendedMetRequirements}
                  </b>
                </strong>
                <em className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.metricDelta}>
                  of {armorRows.length}
                </em>
              </div>
            </div>
          </div>

          <section
            className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorSection}
            aria-labelledby="optimization-armor-heading"
          >
            <header
              className={
                OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorSectionHeader
              }
            >
              <div>
                <h3
                  className={
                    OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorSectionHeading
                  }
                  id="optimization-armor-heading"
                >
                  {isAffinity ? "Equipped Armor" : "Recommended Armor"}
                </h3>
                <p
                  className={
                    OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorSectionIntro
                  }
                >
                  {isAffinity
                    ? "Defense at the recommended affinity allocation."
                    : "Best compatible defense for the current affinity."}
                </p>
              </div>
              <span className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorCount}>
                {armorRows.length} slots
              </span>
            </header>

            <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorGrid}>
              {armorRows.map((row) => {
                const changed =
                  row.currentItem?.id !== row.recommendedItem.id;
                const delta = row.recommendedTotal - row.currentTotal;
                return (
                  <article
                    className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorCard}
                    key={row.slot}
                  >
                    <div
                      className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorArt}
                    >
                      <span
                        className={
                          OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorArtIndex
                        }
                        aria-hidden="true"
                      >
                        {slotMeta[row.slot].index}
                      </span>
                      <span
                        className={
                          OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorArtwork
                        }
                      >
                        <ArmorArtwork
                          item={row.recommendedItem}
                          appearance="optimization"
                          fallback={slotMeta[row.slot].index}
                          sizes="120px"
                        />
                      </span>
                    </div>
                    <div
                      className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorCopy}
                    >
                      <small
                        className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorSlot}
                      >
                        {slotMeta[row.slot].label}
                      </small>
                      <strong
                        className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorName}
                      >
                        {row.recommendedItem.name}
                      </strong>
                      {changed && row.currentItem ? (
                        <span
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorChange
                          }
                        >
                          Replaces {row.currentItem.name}
                        </span>
                      ) : (
                        <span
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorChange
                          }
                        >
                          {changed ? "Fills empty slot" : "Keep equipped"}
                        </span>
                      )}
                      <div
                        className={
                          OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorStats
                        }
                        aria-label={`Defense contribution changes from ${row.currentTotal} to ${row.recommendedTotal}`}
                      >
                        <small
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorStatsLabel
                          }
                        >
                          Defense
                        </small>
                        <span
                          className={
                            OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorStatsValues
                          }
                        >
                          <span>{row.currentTotal}</span>
                          <ArrowRight
                            aria-hidden="true"
                            className={
                              OPTIMIZATION_LIGHTBOX_CLASS_NAMES.armorStatsArrow
                            }
                          />
                          <b
                            className={
                              OPTIMIZATION_LIGHTBOX_CLASS_NAMES.recommendedValue
                            }
                          >
                            {row.recommendedTotal}
                          </b>
                        </span>
                        <em
                          className={
                            OPTIMIZATION_DELTA_CLASS_NAMES[
                              delta > 0 ? "positive" : "neutral"
                            ]
                          }
                        >
                          {formatDelta(delta)}
                        </em>
                      </div>
                      <span
                        className={
                          OPTIMIZATION_COMPATIBILITY_CLASS_NAMES[
                            row.requirementMet
                              ? "compatible"
                              : "incompatible"
                          ]
                        }
                      >
                        {row.requirementMet
                          ? "Compatible"
                          : "Base defense only"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <footer className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.footer}>
          <p className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.footerCopy}>
            {result.changed
              ? isAffinity
                ? "Only base affinity allocation will change."
                : "Weapons and Talismans will not change."
              : "Your current build already matches this recommendation."}
          </p>
          <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.footerActions}>
            <button
              ref={cancelRef}
              type="button"
              className={ACTION_BUTTON_CLASS_NAMES.optimizationQuiet}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              ref={applyRef}
              type="button"
              className={ACTION_BUTTON_CLASS_NAMES.optimizationPrimary}
              disabled={!result.changed}
              onClick={onApply}
            >
              <Sparkles
                className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.actionIcon}
                aria-hidden="true"
              />
              {result.changed
                ? isAffinity
                  ? "Apply Affinity"
                  : "Equip Recommended Armor"
                : "Already Optimized"}
            </button>
          </div>
        </footer>
          </>
        ) : (
          <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.body}>
            <div className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.summary}>
              <div
                className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.footerActions}
                role="group"
                aria-label="Optimization strategies"
              >
                <button
                  ref={affinityStrategyRef}
                  type="button"
                  className={ACTION_BUTTON_CLASS_NAMES.optimizationPrimary}
                  onClick={() => selectStrategy("affinity")}
                >
                  <Sparkles
                    className={OPTIMIZATION_LIGHTBOX_CLASS_NAMES.actionIcon}
                    aria-hidden="true"
                  />
                  Optimize for Gear
                </button>
                <button
                  ref={armorStrategyRef}
                  type="button"
                  className={ACTION_BUTTON_CLASS_NAMES.optimizationQuiet}
                  onClick={() => selectStrategy("armor")}
                >
                  Optimize Armor for Affinity
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  return portalContainer ? createPortal(lightbox, portalContainer) : lightbox;
}
