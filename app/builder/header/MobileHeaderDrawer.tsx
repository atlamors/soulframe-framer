"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Copy, ExternalLink } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMobileHistoryLayer } from "@/app/hooks/useMobileHistoryLayer";
import { MobileFullscreenOverlay } from "@/app/components/MobileFullscreenOverlay";
import { MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES } from "@/app/components/mobileFullscreenOverlayClassNames";
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
  MOBILE_DRAWER_TITLE_CLASS_NAME,
} from "../components/mobileHeaderClassNames";
import { BuildNameControl } from "./BuildNameControl";
import { IllustratedCloseButton } from "../components/IllustratedCloseButton";

export function MobileHeaderDrawer({
  buildName,
  isMenuAvailable,
  isDrawerOpen,
  isSuppressed,
  menuLayerElement,
  overlayTriggerRef,
  drawerPanelRef,
  drawerCloseRef,
  onCloseDrawer,
  onNameChange,
  onReset,
  onShare,
}: {
  buildName: string;
  isMenuAvailable: boolean;
  isDrawerOpen: boolean;
  isSuppressed: boolean;
  menuLayerElement: HTMLDivElement | null;
  overlayTriggerRef: RefObject<HTMLButtonElement | null>;
  drawerPanelRef: RefObject<HTMLElement | null>;
  drawerCloseRef: RefObject<HTMLButtonElement | null>;
  onCloseDrawer: () => void;
  onNameChange: (name: string) => void;
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
          Frame actions
        </Dialog.Title>
        <Dialog.Description
          className={MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME}
        >
          Frame identity, sharing, resources, and reset controls.
        </Dialog.Description>
        <Dialog.Close
          ref={drawerCloseRef}
          className={MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME}
          tabIndex={-1}
          aria-hidden="true"
        >
          Close Frame actions
        </Dialog.Close>
        <div className={MOBILE_DRAWER_DESKTOP_CLOSE_CLASS_NAME}>
          <span className={MOBILE_DRAWER_TITLE_CLASS_NAME}>Frame actions</span>
          <IllustratedCloseButton
            aria-label="Close Frame actions"
            onClick={closeDrawer}
          />
        </div>
        <div className={MOBILE_DRAWER_BODY_CLASS_NAME}>
          <section
            className={`${MOBILE_DRAWER_SECTION_CLASS_NAME} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.first}`}
            aria-labelledby="builder-menu-build-identity-heading"
          >
            <h2
              id="builder-menu-build-identity-heading"
              className={MOBILE_DRAWER_BUILD_HEADING_CLASS_NAME}
            >
              Frame
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
              Copy Frame Link
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
              Reset Frame
            </h3>
            {isResetPending ? (
              <div className={MOBILE_DRAWER_RESET_CONFIRM_CLASS_NAME}>
                <p className={MOBILE_DRAWER_RESET_COPY_CLASS_NAME}>
                  Restore the default Frame? This replaces the current Frame.
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
                Reset Frame
              </button>
            )}
          </section>
        </div>
      </MobileFullscreenOverlay>
    </>
  );
}
