"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode, type Ref, type RefObject } from "react";
import { MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES } from "./mobileFullscreenOverlayClassNames";

export function MobileFullscreenOverlay({
  open,
  onOpenChange,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  triggerRef,
  contentRef,
  children,
  className,
  overlayClassName,
  portalContainer,
  modal = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  triggerRef?: RefObject<HTMLElement | null>;
  contentRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  portalContainer?: HTMLElement | null;
  modal?: boolean;
}) {
  const contentClassName = className
    ? `${MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.contentBase} ${className}`
    : `${MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.contentBase} ${MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.content}`;

  const layers = (
    <>
        <Dialog.Overlay
          className={
            overlayClassName ?? MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.overlay
          }
        />
        <Dialog.Content
          ref={contentRef as Ref<HTMLDivElement> | undefined}
          id={id}
          className={contentClassName}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          onCloseAutoFocus={(event) => {
            if (!triggerRef?.current) return;
            event.preventDefault();
            window.requestAnimationFrame(() =>
              triggerRef.current?.focus({ preventScroll: true }),
            );
          }}
        >
          {children}
        </Dialog.Content>
    </>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        {layers}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
