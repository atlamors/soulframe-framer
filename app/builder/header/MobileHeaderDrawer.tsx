"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import Image from "next/image";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMobileHistoryLayer } from "@/app/hooks/useMobileHistoryLayer";
import { MobileFullscreenOverlay } from "@/app/components/MobileFullscreenOverlay";
import { MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES } from "@/app/components/mobileFullscreenOverlayClassNames";
import { AlertCenterTrigger } from "../../alerts/AlertsProvider";
import {
  MOBILE_DRAWER_ACTION_ROW_CLASS_NAME,
  MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME,
  MOBILE_DRAWER_BODY_CLASS_NAME,
  MOBILE_DRAWER_BUILD_HEADING_CLASS_NAME,
  MOBILE_DRAWER_BUILD_ROW_CLASS_NAME,
  MOBILE_DRAWER_BUTTON_ICON_CLASS_NAME,
  MOBILE_DRAWER_CONTENT_CLASS_NAME,
  MOBILE_DRAWER_DANGER_BUTTON_CLASS_NAME,
  MOBILE_DRAWER_DESKTOP_CLOSE_CLASS_NAME,
  MOBILE_DRAWER_OVERLAY_CLASS_NAME,
  MOBILE_DRAWER_PRIMARY_BUTTON_CLASS_NAME,
  MOBILE_DRAWER_QUIET_BUTTON_CLASS_NAME,
  MOBILE_DRAWER_RESET_CONFIRM_CLASS_NAME,
  MOBILE_DRAWER_RESET_COPY_CLASS_NAME,
  MOBILE_DRAWER_RESOURCE_LINK_CLASS_NAME,
  MOBILE_DRAWER_RESOURCE_LIST_CLASS_NAME,
  MOBILE_DRAWER_SECTION_CLASS_NAME,
  MOBILE_DRAWER_SECTION_HEADING_CLASS_NAME,
  MOBILE_HEADER_BRAND_CLASS_NAME,
  MOBILE_HEADER_ALERT_BADGE_CLASS_NAME,
  MOBILE_HEADER_ALERT_ICON_CLASS_NAME,
  MOBILE_HEADER_ALERT_TRIGGER_CLASS_NAME,
  MOBILE_HEADER_BUILD_NAME_CLASS_NAME,
  MOBILE_HEADER_CLASS_NAMES,
  MOBILE_HEADER_INNER_CLASS_NAME,
  MOBILE_HEADER_MENU_TRIGGER_CLASS_NAME,
  MOBILE_HEADER_WORDMARK_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_GLYPH_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_ICON_FRAME_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES,
  type MobileHeaderVisibilityState,
} from "../components/mobileHeaderClassNames";
import { BuildNameControl } from "./BuildNameControl";
import { IllustratedCloseButton } from "../components/IllustratedCloseButton";

export function MobileHeaderDrawer({
  buildName,
  isHeaderVisible,
  isMenuAvailable,
  isDrawerOpen,
  isSuppressed,
  menuTriggerRef,
  menuLayerElement,
  overlayTriggerRef,
  drawerPanelRef,
  drawerCloseRef,
  onToggleDrawer,
  onCloseDrawer,
  onNameChange,
  onOpenOptimization,
  onReset,
  onShare,
}: {
  buildName: string;
  isHeaderVisible: boolean;
  isMenuAvailable: boolean;
  isDrawerOpen: boolean;
  isSuppressed: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  menuLayerElement: HTMLDivElement | null;
  overlayTriggerRef: RefObject<HTMLButtonElement | null>;
  drawerPanelRef: RefObject<HTMLElement | null>;
  drawerCloseRef: RefObject<HTMLButtonElement | null>;
  onToggleDrawer: (opener: HTMLButtonElement) => void;
  onCloseDrawer: () => void;
  onNameChange: (name: string) => void;
  onOpenOptimization: () => void;
  onReset: () => void;
  onShare: () => void;
}) {
  const [isResetPending, setIsResetPending] = useState(false);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const resetConfirmRef = useRef<HTMLButtonElement>(null);
  const dismissResetConfirmation = useCallback(() => {
    setIsResetPending(false);
    window.requestAnimationFrame(() =>
      resetTriggerRef.current?.focus({ preventScroll: true }),
    );
  }, []);
  const closeResetConfirmation = useMobileHistoryLayer({
    id: "builder-reset-confirmation",
    isOpen: isResetPending,
    onDismiss: dismissResetConfirmation,
  });
  const isDrawerInteractive =
    isMenuAvailable && isDrawerOpen && !isSuppressed;
  const headerState: MobileHeaderVisibilityState = isSuppressed
    ? "suppressed"
    : isHeaderVisible
      ? isDrawerInteractive
        ? "drawerOpen"
        : "visible"
      : "hidden";
  const isHeaderInteractive = headerState === "visible";
  const isHeaderRepresented = isHeaderInteractive || isDrawerInteractive;

  const closeDrawer = () => {
    if (isResetPending) closeResetConfirmation();
    onCloseDrawer();
  };

  useEffect(() => {
    if (!isResetPending) return;
    resetConfirmRef.current?.focus({ preventScroll: true });
  }, [isResetPending]);

  useEffect(() => {
    if (isDrawerOpen && !isSuppressed) return;
    const timer = window.setTimeout(() => {
      setIsResetPending(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isDrawerOpen, isSuppressed]);

  return (
    <>
      <header
        className={MOBILE_HEADER_CLASS_NAMES[headerState]}
        data-mobile-header-state={headerState}
        aria-hidden={!isHeaderRepresented}
        inert={!isHeaderRepresented ? true : undefined}
      >
        <div className={MOBILE_HEADER_INNER_CLASS_NAME}>
          <a
            className={MOBILE_HEADER_BRAND_CLASS_NAME}
            href="#"
            aria-label="Nightfold home"
            inert={!isHeaderInteractive ? true : undefined}
            tabIndex={isHeaderInteractive ? undefined : -1}
          >
            <Image
              className={MOBILE_HEADER_WORDMARK_CLASS_NAME}
              src="/brand/nightfold-wordmark.png"
              alt="Nightfold"
              width={2035}
              height={773}
              unoptimized
            />
          </a>
          <strong
            className={MOBILE_HEADER_BUILD_NAME_CLASS_NAME}
            title={buildName}
            aria-hidden={!isHeaderInteractive}
          >
            {buildName}
          </strong>
          <button
            type="button"
            className={MOBILE_HEADER_ALERT_TRIGGER_CLASS_NAME}
            aria-label="Open optimization"
            inert={!isHeaderInteractive ? true : undefined}
            tabIndex={isHeaderInteractive ? undefined : -1}
            onClick={onOpenOptimization}
          >
            <Sparkles
              className={MOBILE_HEADER_ALERT_ICON_CLASS_NAME}
              aria-hidden="true"
            />
          </button>
          <span
            className="contents"
            inert={!isHeaderInteractive ? true : undefined}
          >
            <AlertCenterTrigger
              classNames={{
                root: MOBILE_HEADER_ALERT_TRIGGER_CLASS_NAME,
                icon: MOBILE_HEADER_ALERT_ICON_CLASS_NAME,
                badge: MOBILE_HEADER_ALERT_BADGE_CLASS_NAME,
              }}
              tabIndex={isHeaderInteractive ? undefined : -1}
            />
          </span>
          <button
            ref={menuTriggerRef}
            type="button"
            className={MOBILE_HEADER_MENU_TRIGGER_CLASS_NAME}
            aria-label={isDrawerOpen ? "Close builder menu" : "Open builder menu"}
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            aria-controls="builder-menu-drawer"
            tabIndex={isHeaderRepresented ? undefined : -1}
            onClick={(event) => onToggleDrawer(event.currentTarget)}
          >
            <span
              className={MOBILE_TOP_HEADER_MENU_ICON_FRAME_CLASS_NAME}
              aria-hidden="true"
            >
              <span className={MOBILE_TOP_HEADER_MENU_GLYPH_CLASS_NAME}>
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isDrawerOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.topOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.topClosed
                  }`}
                />
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isDrawerOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.middleOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.middleClosed
                  }`}
                />
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isDrawerOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.bottomOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.bottomClosed
                  }`}
                />
              </span>
            </span>
          </button>
        </div>
      </header>

      <MobileFullscreenOverlay
        open={isDrawerInteractive}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
        id="builder-menu-drawer"
        triggerRef={overlayTriggerRef}
        contentRef={drawerPanelRef}
        className={MOBILE_DRAWER_CONTENT_CLASS_NAME}
        overlayClassName={MOBILE_DRAWER_OVERLAY_CLASS_NAME}
        portalContainer={menuLayerElement}
      >
        <Dialog.Title className={MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME}>
          Builder menu
        </Dialog.Title>
        <Dialog.Description
          className={MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME}
        >
          Build identity, sharing, resources, and reset controls.
        </Dialog.Description>
        <Dialog.Close
          ref={drawerCloseRef}
          className={MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME}
          tabIndex={-1}
          aria-hidden="true"
        >
          Close builder menu
        </Dialog.Close>
        <span className={MOBILE_DRAWER_DESKTOP_CLOSE_CLASS_NAME}>
          <IllustratedCloseButton
            aria-label="Close builder menu"
            onClick={closeDrawer}
          />
        </span>
        <div className={MOBILE_DRAWER_BODY_CLASS_NAME}>
          <section
            className={`${MOBILE_DRAWER_SECTION_CLASS_NAME} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.first}`}
            aria-labelledby="builder-menu-build-identity-heading"
          >
            <h2
              id="builder-menu-build-identity-heading"
              className={MOBILE_DRAWER_BUILD_HEADING_CLASS_NAME}
            >
              Build
            </h2>
            <div className={MOBILE_DRAWER_BUILD_ROW_CLASS_NAME}>
              <BuildNameControl
                appearance="drawer"
                buildName={buildName}
                controlId="builder-menu-build-name-value"
                isActive={isDrawerOpen && !isSuppressed}
                onNameChange={onNameChange}
              />
            </div>
          </section>

          <section
            className={`${MOBILE_DRAWER_SECTION_CLASS_NAME} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.second}`}
            aria-labelledby="builder-menu-build-share-heading"
          >
            <h3
              id="builder-menu-build-share-heading"
              className={MOBILE_DRAWER_SECTION_HEADING_CLASS_NAME}
            >
              Share
            </h3>
            <button
              type="button"
              className={MOBILE_DRAWER_PRIMARY_BUTTON_CLASS_NAME}
              onClick={onShare}
            >
              <Copy
                className={MOBILE_DRAWER_BUTTON_ICON_CLASS_NAME}
                aria-hidden="true"
              />
              Copy Build Link
            </button>
          </section>

          <nav
            className={`${MOBILE_DRAWER_SECTION_CLASS_NAME} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.third}`}
            aria-labelledby="builder-menu-build-resources-heading"
          >
            <h3
              id="builder-menu-build-resources-heading"
              className={MOBILE_DRAWER_SECTION_HEADING_CLASS_NAME}
            >
              Resources
            </h3>
            <div className={MOBILE_DRAWER_RESOURCE_LIST_CLASS_NAME}>
              <a
                className={MOBILE_DRAWER_RESOURCE_LINK_CLASS_NAME}
                href="https://wiki.avakot.org/Armour"
                target="_blank"
                rel="noreferrer"
              >
                Armour
                <ExternalLink
                  className={MOBILE_DRAWER_BUTTON_ICON_CLASS_NAME}
                  aria-hidden="true"
                />
              </a>
              <a
                className={MOBILE_DRAWER_RESOURCE_LINK_CLASS_NAME}
                href="https://wiki.avakot.org/Weapons"
                target="_blank"
                rel="noreferrer"
              >
                Weapons
                <ExternalLink
                  className={MOBILE_DRAWER_BUTTON_ICON_CLASS_NAME}
                  aria-hidden="true"
                />
              </a>
            </div>
          </nav>

          <section
            className={`${MOBILE_DRAWER_SECTION_CLASS_NAME} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.fourth}`}
            aria-labelledby="builder-menu-build-reset-heading"
          >
            <h3
              id="builder-menu-build-reset-heading"
              className={MOBILE_DRAWER_SECTION_HEADING_CLASS_NAME}
            >
              Reset Build
            </h3>
            {isResetPending ? (
              <div className={MOBILE_DRAWER_RESET_CONFIRM_CLASS_NAME}>
                <p className={MOBILE_DRAWER_RESET_COPY_CLASS_NAME}>
                  Restore the default build? This replaces the current loadout.
                </p>
                <div className={MOBILE_DRAWER_ACTION_ROW_CLASS_NAME}>
                  <button
                    ref={resetConfirmRef}
                    type="button"
                    className={MOBILE_DRAWER_DANGER_BUTTON_CLASS_NAME}
                    onClick={() => {
                      onReset();
                      closeResetConfirmation();
                    }}
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    className={MOBILE_DRAWER_QUIET_BUTTON_CLASS_NAME}
                    onClick={() => {
                      closeResetConfirmation();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                ref={resetTriggerRef}
                type="button"
                className={MOBILE_DRAWER_DANGER_BUTTON_CLASS_NAME}
                onClick={() => setIsResetPending(true)}
              >
                Reset Build
              </button>
            )}
          </section>
        </div>
      </MobileFullscreenOverlay>
    </>
  );
}
