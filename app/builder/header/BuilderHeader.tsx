"use client";

import { type RefCallback, type RefObject } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { AlertCenterTrigger } from "../../alerts/AlertsProvider";
import { HEADER_CLASS_NAMES } from "../components/headerClassNames";
import {
  MOBILE_TOP_HEADER_MENU_GLYPH_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_ICON_FRAME_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME,
  MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES,
  MOBILE_TOP_HEADER_MENU_TRIGGER_CLASS_NAME,
} from "../components/mobileHeaderClassNames";
import { BuildNameControl } from "./BuildNameControl";

export function BuilderHeader({
  buildName,
  isAlertCenterOpen,
  isMobileMenuAvailable,
  isMobileMenuOpen,
  isMobileSuppressed,
  isOptimizationOpen,
  mobileMenuTriggerRef,
  mobileMenuLayerRef,
  onCloseOptimization,
  onNameChange,
  onOpenOptimization,
  onToggleMobileMenu,
}: {
  buildName: string;
  isAlertCenterOpen: boolean;
  isMobileMenuAvailable: boolean;
  isMobileMenuOpen: boolean;
  isMobileSuppressed: boolean;
  isOptimizationOpen: boolean;
  mobileMenuTriggerRef: RefObject<HTMLButtonElement | null>;
  mobileMenuLayerRef: RefCallback<HTMLDivElement>;
  onCloseOptimization: () => void;
  onNameChange: (name: string) => void;
  onOpenOptimization: () => void;
  onToggleMobileMenu: (opener: HTMLButtonElement) => void;
}) {
  return (
      <header
        className={`${HEADER_CLASS_NAMES.topbar} ${
          isMobileSuppressed
            ? HEADER_CLASS_NAMES.topbarMobileSuppressed
            : ""
        }`}
      >
        <div
          ref={mobileMenuLayerRef}
          className={HEADER_CLASS_NAMES.mobileMenuLayer}
        />
        <a
          className={HEADER_CLASS_NAMES.brand}
          href="#"
          aria-label="Nightfold home"
          inert={isOptimizationOpen ? true : undefined}
          tabIndex={isOptimizationOpen ? -1 : undefined}
        >
          <h1 className={HEADER_CLASS_NAMES.brandHeading}>
            <Image
              className={HEADER_CLASS_NAMES.brandWordmark}
              src="/brand/nightfold-wordmark.png"
              alt="Nightfold"
              width={2035}
              height={773}
              priority
              unoptimized
            />
          </h1>
          <p className={HEADER_CLASS_NAMES.brandTagline}>
            The Soulframe build planner
          </p>
        </a>
          <BuildNameControl
            appearance="header"
            buildName={buildName}
            controlId="build-name-value"
            isActive={!isOptimizationOpen}
            onNameChange={onNameChange}
          />
        <div
          className={HEADER_CLASS_NAMES.actions}
        >
          <span
            className={HEADER_CLASS_NAMES.nonMenuActions}
            inert={isMobileMenuOpen ? true : undefined}
          >
            <span
              className={HEADER_CLASS_NAMES.nonAlertActions}
              inert={
                isAlertCenterOpen || isOptimizationOpen ? true : undefined
              }
            >
              <button
                type="button"
                className={HEADER_CLASS_NAMES.alertTrigger}
                aria-label={
                  isOptimizationOpen
                    ? "Close optimization"
                    : "Open optimization"
                }
                aria-expanded={isOptimizationOpen}
                aria-controls="builder-optimization"
                tabIndex={isOptimizationOpen ? -1 : undefined}
                onClick={
                  isOptimizationOpen
                    ? onCloseOptimization
                    : onOpenOptimization
                }
              >
                <Sparkles
                  className={HEADER_CLASS_NAMES.alertIcon}
                  aria-hidden="true"
                />
              </button>
            </span>
            <span
              className={HEADER_CLASS_NAMES.nonAlertActions}
              inert={isOptimizationOpen ? true : undefined}
            >
              <AlertCenterTrigger
                classNames={{
                  root: HEADER_CLASS_NAMES.alertTrigger,
                  activeRoot: HEADER_CLASS_NAMES.alertTriggerActive,
                  icon: HEADER_CLASS_NAMES.alertIcon,
                  badge: HEADER_CLASS_NAMES.alertBadge,
                }}
                tabIndex={
                  isMobileMenuOpen || isOptimizationOpen ? -1 : undefined
                }
              />
            </span>
          </span>
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            className={
              isMobileMenuAvailable
                ? MOBILE_TOP_HEADER_MENU_TRIGGER_CLASS_NAME
                : "hidden"
            }
            aria-label={
              isMobileMenuOpen ? "Close builder menu" : "Open builder menu"
            }
            aria-haspopup="dialog"
            aria-expanded={isMobileMenuOpen}
            aria-controls="builder-menu-drawer"
            aria-hidden={!isMobileMenuAvailable}
            tabIndex={isMobileMenuAvailable ? undefined : -1}
            onClick={(event) => onToggleMobileMenu(event.currentTarget)}
          >
            <span
              className={MOBILE_TOP_HEADER_MENU_ICON_FRAME_CLASS_NAME}
              aria-hidden="true"
            >
              <Image
                className={MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME}
                src="/icons/game-ui/burger-menu-shell.svg"
                alt=""
                width={40}
                height={40}
                unoptimized
              />
              <span className={MOBILE_TOP_HEADER_MENU_GLYPH_CLASS_NAME}>
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isMobileMenuOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.topOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.topClosed
                  }`}
                />
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isMobileMenuOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.middleOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.middleClosed
                  }`}
                />
                <span
                  className={`${MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME} ${
                    isMobileMenuOpen
                      ? MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.bottomOpen
                      : MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES.bottomClosed
                  }`}
                />
              </span>
            </span>
          </button>
        </div>
      </header>
  );
}
