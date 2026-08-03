"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOBILE_WORKSPACE_MEDIA_QUERY } from "./mobileWorkspaceConfig";

export function useMobileHeader(isSuppressed: boolean) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileTopMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuLayerElement, setMobileMenuLayerElement] =
    useState<HTMLDivElement | null>(null);
  const mobileMenuLayerRef = useCallback((node: HTMLDivElement | null) => {
    setMobileMenuLayerElement(node);
  }, []);
  const mobileCompactMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const activeMobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLElement>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement>(null);
  const isMobileMenuAvailable = !isSuppressed;
  const isMobileHeaderVisible = false;

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_WORKSPACE_MEDIA_QUERY);
    const updateAvailability = () => {
      setIsMobileViewport(mobileQuery.matches);
    };

    updateAvailability();
    mobileQuery.addEventListener("change", updateAvailability);

    return () => {
      mobileQuery.removeEventListener("change", updateAvailability);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuAvailable) return;
    const timer = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [isMobileMenuAvailable]);

  return {
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
  };
}
