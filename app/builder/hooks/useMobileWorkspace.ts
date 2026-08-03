"use client";

import {
  useCallback,
  useEffect,
} from "react";
import type { SoulframeBuild } from "@/src/domain/types";
import { useMobileHistoryLayer } from "@/app/hooks/useMobileHistoryLayer";
import { MOBILE_WORKSPACE_MEDIA_QUERY } from "./mobileWorkspaceConfig";
import { useMobileHeader } from "./useMobileHeader";
import { useMobileStatsMotion } from "./useMobileStatsMotion";

export function useMobileWorkspace(
  build: SoulframeBuild,
  isMobileShellSuppressed: boolean,
) {
  const {
    isMobileStatsExpanded,
    mobileStatsPresentationState,
    setIsMobileStatsExpanded,
    setMobileStatsExpandedWithMorph,
    cancelMobileStatsMotion,
    mobileStatsDockRef,
    mobileStatsTriggerRef,
    mobileStatsPanelRef,
    mobileStatsRailRef,
  } = useMobileStatsMotion(build);
  const {
    isMobileViewport,
    isMobileHeaderVisible,
    isMobileMenuAvailable,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    mobileTopMenuTriggerRef,
    mobileMenuLayerRef,
    mobileMenuLayerElement,
    mobileCompactMenuTriggerRef,
    activeMobileMenuTriggerRef,
    mobileMenuPanelRef,
    mobileMenuCloseRef,
  } = useMobileHeader(isMobileShellSuppressed);

  const isMobileWorkspaceOverlayOpen =
    isMobileMenuOpen || isMobileStatsExpanded;
  const mobileWorkspaceOverlay =
    isMobileMenuOpen
      ? "menu"
      : isMobileStatsExpanded
        ? "stats"
        : undefined;

  const dismissMobileWorkspaceOverlay = useCallback(() => {
    const dismissedOverlay = mobileWorkspaceOverlay;
    if (!dismissedOverlay) return;

    if (dismissedOverlay === "menu") {
      setIsMobileMenuOpen(false);
    } else {
      setMobileStatsExpandedWithMorph(false);
      const trigger = mobileStatsTriggerRef.current;
      window.requestAnimationFrame(() =>
        trigger?.focus({ preventScroll: true }),
      );
    }
  }, [
    mobileStatsTriggerRef,
    mobileWorkspaceOverlay,
    setIsMobileMenuOpen,
    setMobileStatsExpandedWithMorph,
  ]);

  const closeMobileWorkspaceOverlay = useMobileHistoryLayer({
    id: "builder-workspace-overlay",
    isOpen: isMobileWorkspaceOverlayOpen,
    onDismiss: dismissMobileWorkspaceOverlay,
  });

  const toggleMobileMenu = useCallback((opener: HTMLButtonElement) => {
    if (!isMobileMenuAvailable) return;
    if (isMobileMenuOpen) {
      closeMobileWorkspaceOverlay();
      return;
    }
    activeMobileMenuTriggerRef.current = opener;
    setMobileStatsExpandedWithMorph(false);
    setIsMobileMenuOpen(true);
  }, [
    activeMobileMenuTriggerRef,
    closeMobileWorkspaceOverlay,
    isMobileMenuAvailable,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setMobileStatsExpandedWithMorph,
  ]);

  const toggleMobileStats = useCallback(() => {
    if (isMobileStatsExpanded) {
      closeMobileWorkspaceOverlay();
      return;
    }
    setIsMobileMenuOpen(false);
    setMobileStatsExpandedWithMorph(true);
  }, [
    closeMobileWorkspaceOverlay,
    isMobileStatsExpanded,
    setIsMobileMenuOpen,
    setMobileStatsExpandedWithMorph,
  ]);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY);
    const resetDesktopMobileStats = () => {
      if (mobileQuery.matches) return;
      cancelMobileStatsMotion();
      const effectsDisclosure =
        mobileStatsRailRef.current?.querySelector<HTMLDetailsElement>(
          "[data-active-build-effects]",
        );
      if (effectsDisclosure) effectsDisclosure.open = false;
      setIsMobileStatsExpanded(false);
    };

    resetDesktopMobileStats();
    mobileQuery.addEventListener("change", resetDesktopMobileStats);

    return () => {
      mobileQuery.removeEventListener("change", resetDesktopMobileStats);
    };
  }, [
    cancelMobileStatsMotion,
    mobileStatsRailRef,
    setIsMobileStatsExpanded,
  ]);

  useEffect(() => {
    if (!isMobileShellSuppressed) return;
    const timer = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
      cancelMobileStatsMotion();
      setIsMobileStatsExpanded(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    cancelMobileStatsMotion,
    isMobileShellSuppressed,
    setIsMobileMenuOpen,
    setIsMobileStatsExpanded,
  ]);

  useEffect(() => {
    if (
      mobileWorkspaceOverlay !== "stats" ||
      isMobileShellSuppressed ||
      !window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY).matches
    ) {
      return;
    }

    const trigger = mobileStatsTriggerRef.current;
    const panel = mobileStatsPanelRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousInert = new Map<HTMLElement, boolean>();
    const main = panel?.closest("main");
    const scrim = main?.querySelector<HTMLElement>(
      "[data-mobile-workspace-scrim]",
    );

    const containsActiveElement = (element: HTMLElement) =>
      Boolean(
        (panel && (element === panel || element.contains(panel))) ||
          (trigger && (element === trigger || element.contains(trigger))) ||
          (scrim && (element === scrim || element.contains(scrim))),
      );

    const makeInert = (element: HTMLElement) => {
      if (previousInert.has(element)) return;
      previousInert.set(element, element.inert);
      element.inert = true;
    };

    const applyInertBackground = () => {
      if (!main || !panel) return;
      const protectedContainers: HTMLElement[] = [];
      for (const child of Array.from(main.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (containsActiveElement(child)) {
          protectedContainers.push(child);
        } else {
          makeInert(child);
        }
      }
      for (const container of protectedContainers) {
        if (container === panel || container === trigger || container === scrim) {
          continue;
        }
        for (const child of Array.from(container.children)) {
          if (
            child instanceof HTMLElement &&
            !containsActiveElement(child)
          ) {
            makeInert(child);
          }
        }
      }
    };

    applyInertBackground();
    const inertObserver =
      main && panel ? new MutationObserver(applyInertBackground) : undefined;
    if (inertObserver && main) {
      inertObserver.observe(main, { childList: true, subtree: true });
    }

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileWorkspaceOverlay();
        return;
      }
      if (event.key !== "Tab" || !trigger || !panel) return;

      const focusable = [
        trigger,
        ...Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
          ),
        ),
      ].filter(
        (element) =>
          !element.hasAttribute("hidden") &&
          !element.closest("[inert]") &&
          element.offsetParent !== null,
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      inertObserver?.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      for (const [element, wasInert] of previousInert) {
        element.inert = wasInert;
      }
    };
  }, [
    closeMobileWorkspaceOverlay,
    isMobileShellSuppressed,
    mobileStatsPanelRef,
    mobileStatsTriggerRef,
    mobileWorkspaceOverlay,
  ]);

  return {
    isMobileViewport,
    isMobileHeaderVisible,
    isMobileMenuAvailable,
    isMobileMenuOpen,
    toggleMobileMenu,
    isMobileStatsExpanded,
    mobileStatsPresentationState,
    toggleMobileStats,
    isMobileWorkspaceOverlayOpen,
    closeMobileWorkspaceOverlay,
    mobileTopMenuTriggerRef,
    mobileMenuLayerRef,
    mobileMenuLayerElement,
    mobileCompactMenuTriggerRef,
    activeMobileMenuTriggerRef,
    mobileMenuPanelRef,
    mobileMenuCloseRef,
    mobileStatsDockRef,
    mobileStatsTriggerRef,
    mobileStatsPanelRef,
    mobileStatsRailRef,
  };
}
