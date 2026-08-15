"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, type RefCallback, type RefObject } from "react";
import { HEADER_CLASS_NAMES } from "../components/headerClassNames";
import { BuildNameControl } from "./BuildNameControl";

export function BuilderHeader({
  buildName,
  isMobileMenuAvailable,
  isMobileMenuOpen,
  isMobileSuppressed,
  mobileMenuTriggerRef,
  mobileMenuLayerRef,
  trailingAction,
  onNameChange,
  onToggleMobileMenu,
}: {
  buildName: string;
  isMobileMenuAvailable: boolean;
  isMobileMenuOpen: boolean;
  isMobileSuppressed: boolean;
  mobileMenuTriggerRef: RefObject<HTMLButtonElement | null>;
  mobileMenuLayerRef: RefCallback<HTMLDivElement>;
  trailingAction?: ReactNode;
  onNameChange: (name: string) => void;
  onToggleMobileMenu: (opener: HTMLButtonElement) => void;
}) {
  return (
    <section
      className={`${HEADER_CLASS_NAMES.contextBar} ${
        isMobileSuppressed ? HEADER_CLASS_NAMES.contextBarMobileSuppressed : ""
      }`}
      aria-label="Frame controls"
    >
      <div ref={mobileMenuLayerRef} className={HEADER_CLASS_NAMES.mobileMenuLayer} />
      <BuildNameControl
        appearance="header"
        buildName={buildName}
        controlId="build-name-value"
        isActive={!isMobileMenuOpen}
        onNameChange={onNameChange}
      />
      {isMobileMenuAvailable ? (
        <div className={HEADER_CLASS_NAMES.frameActionsGroup}>
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            className={HEADER_CLASS_NAMES.frameActions}
            aria-label={
              isMobileMenuOpen
                ? `Close Frame actions for ${buildName}`
                : `Open Frame actions for ${buildName}`
            }
            aria-haspopup="dialog"
            aria-expanded={isMobileMenuOpen}
            aria-controls="builder-menu-drawer"
            onClick={(event) => onToggleMobileMenu(event.currentTarget)}
          >
            <span className={HEADER_CLASS_NAMES.frameActionsLabel}>Frame</span>
            <strong
              className={HEADER_CLASS_NAMES.frameActionsName}
              title={buildName}
            >
              {buildName}
            </strong>
            <ChevronDown
              className={`${HEADER_CLASS_NAMES.frameActionsChevron} ${
                isMobileMenuOpen
                  ? HEADER_CLASS_NAMES.frameActionsChevronOpen
                  : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {trailingAction}
        </div>
      ) : null}
    </section>
  );
}
