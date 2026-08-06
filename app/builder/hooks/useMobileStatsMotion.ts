"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { SoulframeBuild } from "@/src/domain/types";
import {
  MOBILE_STATS_DETAIL_OPTIONS,
  MOBILE_STATS_MORPH_OPTIONS,
  MOBILE_WORKSPACE_MEDIA_QUERY,
} from "./mobileWorkspaceConfig";

export type MobileStatsPresentationState =
  | "collapsed"
  | "opening"
  | "expanded"
  | "closing";

type MobileStatsLayoutSnapshot = {
  arrowRotation: string;
  blocks: Map<HTMLElement, DOMRect>;
  dockRect: DOMRect;
};

function snapshotLayout(dock: HTMLElement): MobileStatsLayoutSnapshot {
  const arrow = dock.querySelector<HTMLElement>("[data-mobile-stats-arrow]");
  return {
    arrowRotation: arrow ? window.getComputedStyle(arrow).rotate : "none",
    blocks: new Map(
      Array.from(
        dock.querySelectorAll<HTMLElement>(
          "[data-mobile-stats-block], [data-mobile-stats-shield]",
        ),
      ).map((element) => [element, element.getBoundingClientRect()]),
    ),
    dockRect: dock.getBoundingClientRect(),
  };
}

function snapshotDetailOpacity(dock: HTMLElement) {
  return new Map(
    Array.from(
      dock.querySelectorAll<HTMLElement>(
        "[data-mobile-stats-detail], [data-mobile-stats-filigree]",
      ),
    ).map((element) => [
      element,
      Number.parseFloat(window.getComputedStyle(element).opacity),
    ]),
  );
}

function measureMobileStatsNaturalHeight(rail: HTMLElement) {
  const content = rail.firstElementChild;
  if (!(content instanceof HTMLElement)) {
    return Math.ceil(rail.scrollHeight);
  }

  const railRect = rail.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const paddingBottom =
    Number.parseFloat(window.getComputedStyle(rail).paddingBottom) || 0;
  const contentExtent =
    contentRect.top -
    railRect.top +
    Math.max(contentRect.height, content.scrollHeight);
  return Math.ceil(contentExtent + paddingBottom);
}

export function useMobileStatsMotion(build: SoulframeBuild) {
  const [isMobileStatsExpandedState, setIsMobileStatsExpandedState] =
    useState(false);
  const [mobileStatsPresentationState, setMobileStatsPresentationState] =
    useState<MobileStatsPresentationState>("collapsed");
  const mobileStatsPresentationStateRef =
    useRef<MobileStatsPresentationState>("collapsed");
  const mobileStatsDockRef = useRef<HTMLElement>(null);
  const mobileStatsTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileStatsPanelRef = useRef<HTMLDivElement>(null);
  const mobileStatsRailRef = useRef<HTMLElement>(null);
  const mobileStatsAnimationsRef = useRef<Animation[]>([]);
  const mobileStatsMotionGenerationRef = useRef(0);

  const updateMobileStatsHeight = useCallback(() => {
    const dock = mobileStatsDockRef.current;
    const rail = mobileStatsRailRef.current;
    if (
      !dock ||
      !rail ||
      !window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY).matches
    ) {
      return;
    }

    const contentHeight = measureMobileStatsNaturalHeight(rail);
    const computedMaxHeight = Number.parseFloat(
      window.getComputedStyle(dock).maxHeight,
    );
    const expandedHeight = Number.isFinite(computedMaxHeight)
      ? Math.min(contentHeight, computedMaxHeight)
      : contentHeight;
    const expandedHeightValue = `${expandedHeight}px`;
    if (
      dock.style.getPropertyValue("--mobile-stats-expanded-height") !==
      expandedHeightValue
    ) {
      dock.style.setProperty(
        "--mobile-stats-expanded-height",
        expandedHeightValue,
      );
    }
  }, []);

  const clearMobileStatsMotion = useCallback(() => {
    mobileStatsAnimationsRef.current.forEach((animation) =>
      animation.cancel(),
    );
    mobileStatsAnimationsRef.current = [];
    mobileStatsDockRef.current?.style.removeProperty("height");
    mobileStatsDockRef.current?.style.removeProperty("clip-path");
  }, []);

  const commitPresentationState = useCallback(
    (nextState: MobileStatsPresentationState) => {
      mobileStatsPresentationStateRef.current = nextState;
      flushSync(() => setMobileStatsPresentationState(nextState));
    },
    [],
  );

  const setIsMobileStatsExpanded = useCallback(
    (expanded: boolean) => {
      mobileStatsMotionGenerationRef.current += 1;
      clearMobileStatsMotion();
      const presentationState = expanded ? "expanded" : "collapsed";
      mobileStatsPresentationStateRef.current = presentationState;
      setIsMobileStatsExpandedState(expanded);
      setMobileStatsPresentationState(presentationState);
    },
    [clearMobileStatsMotion],
  );

  const setMobileStatsExpandedWithMorph = useCallback(
    (expanded: boolean) => {
      const dock = mobileStatsDockRef.current;
      const rail = mobileStatsRailRef.current;
      const currentLayout = dock ? snapshotLayout(dock) : undefined;
      const currentDetailOpacity = dock
        ? snapshotDetailOpacity(dock)
        : new Map<HTMLElement, number>();
      const previousPresentationState =
        mobileStatsPresentationStateRef.current;
      const motionGeneration = mobileStatsMotionGenerationRef.current + 1;
      mobileStatsMotionGenerationRef.current = motionGeneration;
      clearMobileStatsMotion();

      const shouldAnimate =
        Boolean(dock && rail && currentLayout) &&
        window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY).matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!shouldAnimate || !dock || !rail || !currentLayout) {
        const presentationState = expanded ? "expanded" : "collapsed";
        mobileStatsPresentationStateRef.current = presentationState;
        flushSync(() => {
          setIsMobileStatsExpandedState(expanded);
          setMobileStatsPresentationState(presentationState);
        });
        updateMobileStatsHeight();
        dock?.style.removeProperty("height");
        return;
      }

      const commitLogicalAndPresentationState = (
        logicalExpanded: boolean,
        presentationState: MobileStatsPresentationState,
      ) => {
        mobileStatsPresentationStateRef.current = presentationState;
        flushSync(() => {
          setIsMobileStatsExpandedState(logicalExpanded);
          setMobileStatsPresentationState(presentationState);
        });
      };

      const waitForAnimations = async (animations: Animation[]) => {
        mobileStatsAnimationsRef.current = animations;
        await Promise.allSettled(
          animations.map((animation) => animation.finished),
        );
        return (
          mobileStatsMotionGenerationRef.current === motionGeneration &&
          mobileStatsAnimationsRef.current === animations
        );
      };

      const animateDetails = (
        firstOpacity: Map<HTMLElement, number>,
        targetOpacity: number | "computed",
        heldAnimations: Animation[] = [],
      ) => {
        const animations = [...heldAnimations];
        firstOpacity.forEach((first, element) => {
          if (!element.isConnected) return;
          const last =
            targetOpacity === "computed"
              ? Number.parseFloat(window.getComputedStyle(element).opacity)
              : targetOpacity;
          if (Math.abs(first - last) < 0.001) return;
          const opacityKeyframes: Keyframe[] =
            targetOpacity === "computed"
              ? [
                  { opacity: first, offset: 0 },
                  { opacity: first, offset: 0.65 },
                  { opacity: last, offset: 1 },
                ]
              : [
                  { opacity: first, offset: 0 },
                  { opacity: last, offset: 0.4 },
                  { opacity: last, offset: 1 },
                ];
          animations.push(
            element.animate(
              opacityKeyframes,
              {
                ...MOBILE_STATS_DETAIL_OPTIONS,
                easing: "linear",
              },
            ),
          );
        });
        return animations;
      };

      const animateGeometry = async ({
        finalPresentationState,
        heldAnimations = [],
        workingPresentationState,
      }: {
        finalPresentationState: "collapsed" | "expanded";
        heldAnimations?: Animation[];
        workingPresentationState: "opening" | "closing";
      }) => {
        commitPresentationState(finalPresentationState);
        if (finalPresentationState === "expanded") {
          updateMobileStatsHeight();
        }
        dock.style.removeProperty("height");
        const targetLayout = snapshotLayout(dock);

        commitPresentationState(workingPresentationState);
        dock.style.height = `${targetLayout.dockRect.height}px`;
        const baseLayout = snapshotLayout(dock);
        const geometryAnimations = [...heldAnimations];
        geometryAnimations.push(
          dock.animate(
            [
              { height: `${currentLayout.dockRect.height}px` },
              { height: `${targetLayout.dockRect.height}px` },
            ],
            MOBILE_STATS_MORPH_OPTIONS,
          ),
        );

        currentLayout.blocks.forEach((currentRect, element) => {
          const baseRect = baseLayout.blocks.get(element);
          const targetRect = targetLayout.blocks.get(element);
          if (!baseRect || !targetRect || !element.isConnected) return;
          if (
            currentRect.width === 0 ||
            currentRect.height === 0 ||
            baseRect.width === 0 ||
            baseRect.height === 0 ||
            targetRect.width === 0 ||
            targetRect.height === 0
          ) {
            return;
          }
          let startTranslateX =
            currentRect.left - currentLayout.dockRect.left -
            (baseRect.left - baseLayout.dockRect.left);
          let startTranslateY =
            currentRect.top - currentLayout.dockRect.top -
            (baseRect.top - baseLayout.dockRect.top);
          let endTranslateX =
            targetRect.left - targetLayout.dockRect.left -
            (baseRect.left - baseLayout.dockRect.left);
          let endTranslateY =
            targetRect.top - targetLayout.dockRect.top -
            (baseRect.top - baseLayout.dockRect.top);
          const isShield = element.hasAttribute("data-mobile-stats-shield");
          const trackedAncestor = isShield
            ? element.closest<HTMLElement>("[data-mobile-stats-block]")
            : null;
          const currentAncestorRect = trackedAncestor
            ? currentLayout.blocks.get(trackedAncestor)
            : undefined;
          const baseAncestorRect = trackedAncestor
            ? baseLayout.blocks.get(trackedAncestor)
            : undefined;
          const targetAncestorRect = trackedAncestor
            ? targetLayout.blocks.get(trackedAncestor)
            : undefined;
          if (
            currentAncestorRect &&
            baseAncestorRect &&
            targetAncestorRect
          ) {
            startTranslateX =
              currentRect.left -
              currentAncestorRect.left -
              (baseRect.left - baseAncestorRect.left);
            startTranslateY =
              currentRect.top -
              currentAncestorRect.top -
              (baseRect.top - baseAncestorRect.top);
            endTranslateX =
              targetRect.left -
              targetAncestorRect.left -
              (baseRect.left - baseAncestorRect.left);
            endTranslateY =
              targetRect.top -
              targetAncestorRect.top -
              (baseRect.top - baseAncestorRect.top);
          }
          const startKeyframe: Keyframe = {
            translate: `${startTranslateX}px ${startTranslateY}px`,
          };
          const endKeyframe: Keyframe = {
            translate: `${endTranslateX}px ${endTranslateY}px`,
          };
          if (
            isShield &&
            baseRect.width > 0 &&
            baseRect.height > 0
          ) {
            startKeyframe.scale = `${currentRect.width / baseRect.width} ${
              currentRect.height / baseRect.height
            }`;
            endKeyframe.scale = `${targetRect.width / baseRect.width} ${
              targetRect.height / baseRect.height
            }`;
            startKeyframe.transformOrigin = "top left";
            endKeyframe.transformOrigin = "top left";
          }
          geometryAnimations.push(
            element.animate(
              [startKeyframe, endKeyframe],
              MOBILE_STATS_MORPH_OPTIONS,
            ),
          );
        });

        const arrow = dock.querySelector<HTMLElement>(
          "[data-mobile-stats-arrow]",
        );
        if (
          arrow &&
          currentLayout.arrowRotation !== targetLayout.arrowRotation
        ) {
          geometryAnimations.push(
            arrow.animate(
              [
                { rotate: currentLayout.arrowRotation },
                { rotate: targetLayout.arrowRotation },
              ],
              MOBILE_STATS_MORPH_OPTIONS,
            ),
          );
        }

        if (!(await waitForAnimations(geometryAnimations))) return false;
        commitPresentationState(finalPresentationState);
        dock.style.removeProperty("height");
        geometryAnimations.forEach((animation) => animation.cancel());
        mobileStatsAnimationsRef.current = [];
        return true;
      };

      if (expanded) {
        commitLogicalAndPresentationState(true, "opening");
        const revealAnimations = animateDetails(
          currentDetailOpacity,
          "computed",
        );
        void (async () => {
          await animateGeometry({
            finalPresentationState: "expanded",
            heldAnimations: revealAnimations,
            workingPresentationState: "opening",
          });
        })();
        return;
      }

      const usesCompactHierarchy =
        previousPresentationState === "collapsed";
      commitLogicalAndPresentationState(
        false,
        usesCompactHierarchy ? "opening" : "closing",
      );
      if (!usesCompactHierarchy) {
        const effectsDisclosure =
          rail.querySelector<HTMLDetailsElement>(
            "[data-active-build-effects]",
          );
        if (effectsDisclosure) effectsDisclosure.open = false;
      }
      void (async () => {
        const heldAnimations = usesCompactHierarchy
          ? []
          : animateDetails(currentDetailOpacity, 0);
        await animateGeometry({
          finalPresentationState: "collapsed",
          heldAnimations,
          workingPresentationState: usesCompactHierarchy
            ? "opening"
            : "closing",
        });
      })();
    },
    [
      clearMobileStatsMotion,
      commitPresentationState,
      updateMobileStatsHeight,
    ],
  );

  const cancelMobileStatsMotion = useCallback(() => {
    mobileStatsMotionGenerationRef.current += 1;
    clearMobileStatsMotion();
  }, [clearMobileStatsMotion]);

  useLayoutEffect(() => {
    if (!isMobileStatsExpandedState) return;
    updateMobileStatsHeight();
  }, [isMobileStatsExpandedState, build, updateMobileStatsHeight]);

  useLayoutEffect(() => {
    if (!isMobileStatsExpandedState) return;
    const rail = mobileStatsRailRef.current;
    if (!rail) return;

    let updateFrame: number | undefined;
    const scheduleHeightUpdate = () => {
      if (updateFrame !== undefined) return;
      updateFrame = window.requestAnimationFrame(() => {
        updateFrame = undefined;
        updateMobileStatsHeight();
      });
    };
    const railObserver = new ResizeObserver(scheduleHeightUpdate);
    railObserver.observe(rail);
    const content = rail.firstElementChild;
    if (content) railObserver.observe(content);
    window.addEventListener("resize", scheduleHeightUpdate);
    window.visualViewport?.addEventListener("resize", scheduleHeightUpdate);
    window.screen.orientation?.addEventListener(
      "change",
      scheduleHeightUpdate,
    );
    document.fonts?.addEventListener("loadingdone", scheduleHeightUpdate);

    return () => {
      railObserver.disconnect();
      window.removeEventListener("resize", scheduleHeightUpdate);
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleHeightUpdate,
      );
      window.screen.orientation?.removeEventListener(
        "change",
        scheduleHeightUpdate,
      );
      document.fonts?.removeEventListener("loadingdone", scheduleHeightUpdate);
      if (updateFrame !== undefined) {
        window.cancelAnimationFrame(updateFrame);
      }
    };
  }, [isMobileStatsExpandedState, updateMobileStatsHeight]);

  useEffect(() => {
    const panel = mobileStatsPanelRef.current;
    if (!panel) return;

    const mobileQuery = window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY);
    const updatePanelAccessibility = () => {
      const concealCompactBlocks =
        mobileQuery.matches && mobileStatsPresentationState !== "expanded";
      panel
        .querySelectorAll<HTMLElement>("[data-mobile-stats-block]")
        .forEach((block) => {
          if (concealCompactBlocks) {
            block.setAttribute("aria-hidden", "true");
          } else {
            block.removeAttribute("aria-hidden");
          }
        });
    };

    updatePanelAccessibility();
    mobileQuery.addEventListener("change", updatePanelAccessibility);
    return () => {
      mobileQuery.removeEventListener("change", updatePanelAccessibility);
      panel
        .querySelectorAll<HTMLElement>("[data-mobile-stats-block]")
        .forEach((block) => block.removeAttribute("aria-hidden"));
    };
  }, [mobileStatsPresentationState]);

  useEffect(
    () => () => {
      cancelMobileStatsMotion();
    },
    [cancelMobileStatsMotion],
  );

  return {
    isMobileStatsExpanded: isMobileStatsExpandedState,
    mobileStatsPresentationState,
    setIsMobileStatsExpanded,
    setMobileStatsExpandedWithMorph,
    cancelMobileStatsMotion,
    mobileStatsDockRef,
    mobileStatsTriggerRef,
    mobileStatsPanelRef,
    mobileStatsRailRef,
  };
}
